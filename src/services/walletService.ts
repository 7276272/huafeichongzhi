
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Re-export all wallet service functions from this central file
export * from './walletTransactionService';
export * from './userWalletService';
export * from './walletRechargeService';
export * from './walletAddressService';

// Add a utility function to ensure user has a wallet
export const ensureUserWallet = async (userId: string): Promise<boolean> => {
  try {
    console.log("Ensuring wallet for user:", userId);
    
    // Check if wallet exists
    const { data, error } = await supabase
      .from('user_wallets')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking user wallet:', error);
      return false;
    }
    
    // If wallet doesn't exist, create it
    if (!data) {
      console.log("No wallet found, creating one with balance 0");
      const { error: createError } = await supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (createError) {
        console.error('Error creating user wallet:', createError);
        return false;
      }
      
      console.log("Wallet created successfully");
    } else {
      console.log("Wallet already exists");
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring user wallet:', error);
    return false;
  }
};

// Function to update user wallet balance (for admin)
export const updateUserWalletBalance = async (userId: string, newBalance: number): Promise<boolean> => {
  try {
    console.log(`Updating wallet balance for user: ${userId} to ${newBalance}`);
    
    // Make sure the wallet exists first
    const walletExists = await ensureUserWallet(userId);
    
    if (!walletExists) {
      throw new Error('Could not ensure user wallet exists');
    }
    
    // Get current wallet balance for transaction record
    const { data: currentWallet } = await supabase
      .from('user_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    const oldBalance = currentWallet?.balance || 0;
    const balanceDifference = newBalance - oldBalance;
    
    console.log(`Current balance: ${oldBalance}, new balance: ${newBalance}, difference: ${balanceDifference}`);
    
    // Update the wallet balance directly
    const { error: updateError } = await supabase
      .from('user_wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error updating user wallet balance:', updateError);
      return false;
    }
    
    console.log("Wallet balance updated successfully");
    
    // Create a transaction record for this admin adjustment
    // We'll insert an adjustment transaction that reflects the actual change in balance
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'adjustment',
        amount: balanceDifference, // Record the actual change
        status: 'completed',
        note: `管理员调整余额，从 ${oldBalance} 到 ${newBalance}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });
      
    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // We don't return false here because the balance update was successful
      console.log("Warning: Transaction record failed but balance was updated");
    } else {
      console.log("Transaction record created successfully");
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user wallet balance:', error);
    return false;
  }
};
