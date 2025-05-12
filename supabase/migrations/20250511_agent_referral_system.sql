-- Add referral system fields to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS referral_link TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS referral_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS referral_commission DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS parent_agent_id UUID REFERENCES agents(id);

-- Create agent_referrals table to track referral relationships
CREATE TABLE IF NOT EXISTS agent_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  referral_code TEXT NOT NULL,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, referred_user_id)
);

-- Add referred_by field to profiles to track which agent referred a user
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES agents(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_referrals_agent_id ON agent_referrals(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_referrals_referred_user_id ON agent_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_agent_referrals_referral_code ON agent_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Create trigger to update agents referral counts and updated_at timestamps
CREATE OR REPLACE FUNCTION update_agent_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update referral count for the agent
  UPDATE agents 
  SET 
    referral_count = (SELECT COUNT(*) FROM agent_referrals WHERE agent_id = NEW.agent_id AND status = 'active'),
    updated_at = NOW()
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for when new referrals are added
DROP TRIGGER IF EXISTS on_agent_referral_change ON agent_referrals;
CREATE TRIGGER on_agent_referral_change
  AFTER INSERT OR UPDATE OR DELETE ON agent_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_referral_stats();

-- Function to update agent commission when a referred user makes a payment
CREATE OR REPLACE FUNCTION update_agent_commission_on_order()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_id UUID;
  v_commission_rate DECIMAL(10, 2);
BEGIN
  -- Only process for completed orders
  IF NEW.status = 'completed' THEN
    -- Find the agent who referred this user
    SELECT a.id, a.commission_rate INTO v_agent_id, v_commission_rate
    FROM profiles p
    JOIN agents a ON p.referred_by = a.id
    WHERE p.id = NEW.user_id;
    
    IF v_agent_id IS NOT NULL THEN
      -- Calculate commission
      DECLARE v_commission DECIMAL(10, 2);
      BEGIN
        v_commission := NEW.amount * v_commission_rate;
        
        -- Update agent referral stats
        UPDATE agents
        SET 
          referral_amount = referral_amount + NEW.amount,
          referral_commission = referral_commission + v_commission,
          updated_at = NOW()
        WHERE id = v_agent_id;
        
        -- Create commission transaction record
        INSERT INTO agent_transactions (
          agent_id,
          amount,
          type,
          status,
          reference_id,
          description
        ) VALUES (
          v_agent_id,
          v_commission,
          'commission',
          'completed',
          NEW.id,
          '订单佣金: ' || NEW.phone_number || ' ¥' || NEW.amount
        );
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for when orders are updated
DROP TRIGGER IF EXISTS on_order_update_for_commission ON recharge_orders;
CREATE TRIGGER on_order_update_for_commission
  AFTER UPDATE ON recharge_orders
  FOR EACH ROW
  WHEN (OLD.status <> 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION update_agent_commission_on_order();
