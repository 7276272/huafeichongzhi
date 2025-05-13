import { supabase } from "@/integrations/supabase/client";

// 获取用户提现地址
export const getUserWithdrawalAddress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_withdrawal_addresses')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error code
      console.error('Error fetching user withdrawal address:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching user withdrawal address:', error);
    throw error;
  }
};

// 添加或更新用户提现地址
export const saveUserWithdrawalAddress = async (
  userId: string, 
  address: string, 
  addressType: string,
  transactionPassword: string
) => {
  try {
    // 检查是否已存在
    const { data: existingAddress } = await supabase
      .from('user_withdrawal_addresses')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingAddress) {
      // 更新现有地址
      const { data, error } = await supabase
        .from('user_withdrawal_addresses')
        .update({
          address,
          address_type: addressType,
          transaction_password: transactionPassword, // 实际应用中应使用加密后的密码
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAddress.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user withdrawal address:', error);
        throw new Error(error.message);
      }
      
      return { data, isNew: false };
    } else {
      // 创建新地址
      const { data, error } = await supabase
        .from('user_withdrawal_addresses')
        .insert({
          user_id: userId,
          address,
          address_type: addressType,
          transaction_password: transactionPassword, // 实际应用中应使用加密后的密码
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user withdrawal address:', error);
        throw new Error(error.message);
      }
      
      return { data, isNew: true };
    }
  } catch (error) {
    console.error('Exception saving user withdrawal address:', error);
    throw error;
  }
};

// 请求提现
export const requestWithdrawal = async (
  userId: string,
  amount: number,
  withdrawalAddress: string,
  transactionPassword: string
) => {
  try {
    // 验证交易密码（实际应用中应该与数据库中存储的加密密码进行比较）
    const { data: addressData, error: addressError } = await supabase
      .from('user_withdrawal_addresses')
      .select('transaction_password')
      .eq('user_id', userId)
      .single();
      
    if (addressError) {
      console.error('Error fetching withdrawal address for password check:', addressError);
      throw new Error('提现地址未找到，请先添加提现地址');
    }
    
    // 实际应用中应该比较加密后的密码，这里仅作示例
    if (addressData.transaction_password !== transactionPassword) {
      throw new Error('交易密码不正确');
    }
    
    // 检查用户余额是否足够
    const { data: walletData, error: walletError } = await supabase
      .from('user_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (walletError) {
      console.error('Error fetching user wallet:', walletError);
      throw new Error('未找到用户钱包');
    }
    
    if (walletData.balance < amount) {
      throw new Error('余额不足');
    }
    
    // 创建提现申请
    const { data: withdrawalData, error: withdrawalError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'withdrawal',
        amount: amount,
        status: 'pending',
        created_at: new Date().toISOString(),
        withdrawal_address: withdrawalAddress
      })
      .select()
      .single();
      
    if (withdrawalError) {
      console.error('Error creating withdrawal request:', withdrawalError);
      throw new Error('创建提现申请失败');
    }
    
    // 更新用户余额（减去提现金额）
    const { error: updateError } = await supabase
      .from('user_wallets')
      .update({
        balance: walletData.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error updating user balance after withdrawal:', updateError);
      // 如果更新余额失败，应回滚交易记录
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', withdrawalData.id);
      throw new Error('更新用户余额失败');
    }
    
    return withdrawalData;
  } catch (error) {
    console.error('Exception during withdrawal request:', error);
    throw error;
  }
};
