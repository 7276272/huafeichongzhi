import { supabase } from "@/integrations/supabase/client";
import { PaymentAddress, PaymentAddressType } from "@/types";

// 获取系统钱包充值地址（管理员设置的充值地址）
export const getSystemWalletAddresses = async (): Promise<PaymentAddress[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_addresses')
      .select('*')
      .eq('active', true)
      .order('type', { ascending: true });
    
    if (error) {
      console.error('Error fetching payment addresses:', error);
      throw new Error(error.message);
    }
    
    return data as PaymentAddress[];
  } catch (error) {
    console.error('Exception fetching payment addresses:', error);
    throw error;
  }
};

// 创建新的钱包充值地址
export const createPaymentAddress = async (
  address: string, 
  type: PaymentAddressType,
  description?: string
): Promise<PaymentAddress> => {
  try {
    const { data, error } = await supabase
      .from('payment_addresses')
      .insert({
        address,
        type,
        description: description || '',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating payment address:', error);
      throw new Error(error.message);
    }
    
    return data as PaymentAddress;
  } catch (error) {
    console.error('Exception creating payment address:', error);
    throw error;
  }
};

// 更新钱包充值地址
export const updatePaymentAddress = async (
  id: string,
  updates: Partial<PaymentAddress>
): Promise<PaymentAddress> => {
  try {
    const { data, error } = await supabase
      .from('payment_addresses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating payment address:', error);
      throw new Error(error.message);
    }
    
    return data as PaymentAddress;
  } catch (error) {
    console.error('Exception updating payment address:', error);
    throw error;
  }
};

// 删除钱包充值地址
export const deletePaymentAddress = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('payment_addresses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting payment address:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Exception deleting payment address:', error);
    throw error;
  }
};
