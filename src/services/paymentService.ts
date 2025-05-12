
import { PaymentAddress, PaymentAddressType } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Payment Addresses
export const getPaymentAddresses = async (): Promise<PaymentAddress[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_addresses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching payment addresses:', error);
      return [];
    }
    
    return data as PaymentAddress[];
  } catch (error) {
    console.error('Exception fetching payment addresses:', error);
    return [];
  }
};

export const createPaymentAddress = async (
  address: Omit<PaymentAddress, 'id' | 'created_at' | 'updated_at'>
): Promise<PaymentAddress> => {
  try {
    const { data, error } = await supabase
      .from('payment_addresses')
      .insert(address)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating payment address:', error);
      throw new Error(error.message || "创建支付地址失败");
    }
    
    return data as PaymentAddress;
  } catch (error) {
    console.error('Exception creating payment address:', error);
    throw new Error(typeof error === 'object' && error !== null && 'message' in error 
      ? (error.message as string) 
      : "创建支付地址失败");
  }
};

export const updatePaymentAddress = async (
  id: string,
  updates: Partial<PaymentAddress>
): Promise<PaymentAddress> => {
  try {
    const { data, error } = await supabase
      .from('payment_addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating payment address:', error);
      throw new Error(error.message || "更新支付地址失败");
    }
    
    return data as PaymentAddress;
  } catch (error) {
    console.error('Exception updating payment address:', error);
    throw new Error(typeof error === 'object' && error !== null && 'message' in error 
      ? (error.message as string) 
      : "更新支付地址失败");
  }
};

export const deletePaymentAddress = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('payment_addresses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting payment address:', error);
      throw new Error(error.message || "删除支付地址失败");
    }
  } catch (error) {
    console.error('Exception deleting payment address:', error);
    throw new Error(typeof error === 'object' && error !== null && 'message' in error 
      ? (error.message as string) 
      : "删除支付地址失败");
  }
};
