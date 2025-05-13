
import { WalletRechargeRequest, UserWallet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Wallet recharge requests
export const getWalletRechargeRequests = async (): Promise<WalletRechargeRequest[]> => {
  try {
    console.log('开始获取充值请求...');
    // 首先获取所有充值请求
    const { data: requests, error: requestsError } = await supabase
      .from('wallet_recharge_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (requestsError) {
      console.error('Error fetching recharge requests:', requestsError);
      throw new Error(`获取充值请求失败: ${requestsError.message}`);
    }
    
    console.log(`获取到 ${requests?.length || 0} 条充值请求记录`);
    
    if (!requests || requests.length === 0) {
      return [];
    }
    
    // 获取所有用户ID
    const userIds = [...new Set(requests.map(r => r.user_id))];
    console.log(`找到 ${userIds.length} 个独立用户ID`);
    
    // 准备用户信息映射
    let userEmails = {};
    
    try {
      // 尝试从 admin_users 表获取用户邮箱
      if (userIds.length > 0) {
        console.log('从 admin_users 表获取用户信息...');
        const { data: adminUsers, error: adminUsersError } = await supabase
          .from('admin_users')
          .select('id, email')
          .in('id', userIds);
          
        if (adminUsersError) {
          console.error('Error fetching admin users:', adminUsersError);
        } else if (adminUsers && adminUsers.length > 0) {
          console.log(`在 admin_users 表中找到 ${adminUsers.length} 个用户`);
          adminUsers.forEach(user => {
            userEmails[user.id] = user.email;
          });
        }
      }
    } catch (profileError) {
      console.error('获取用户信息时出错:', profileError);
      // 继续执行，不要因为用户信息获取失败而导致整个函数失败
    }
    
    // 格式化数据，添加用户邮箱
    const formattedData = requests.map(request => ({
      ...request,
      user_email: userEmails[request.user_id] || `用户 ${request.user_id.substring(0, 8)}`
    }));
    
    console.log('成功格式化充值请求数据');
    return formattedData as WalletRechargeRequest[];
  } catch (error) {
    console.error('Error fetching wallet recharge requests:', error);
    // 返回空数组而不是抛出错误，这样页面至少能显示出来
    return [];
  }
};

export const getWalletRechargeRequestsByUserId = async (userId: string): Promise<WalletRechargeRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('wallet_recharge_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user recharge requests:', error);
      return [];
    }
    
    return data as WalletRechargeRequest[];
  } catch (error) {
    console.error('Error fetching user wallet recharge requests:', error);
    return [];
  }
};

export const createWalletRechargeRequest = async (
  request: { user_id: string; amount: number; }
): Promise<WalletRechargeRequest> => {
  try {
    const { data, error } = await supabase
      .from('wallet_recharge_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating wallet recharge request:', error);
      throw new Error(error.message || "创建充值申请失败");
    }
    
    return data as WalletRechargeRequest;
  } catch (error) {
    console.error('Exception creating wallet recharge request:', error);
    throw new Error(typeof error === 'object' && error !== null && 'message' in error 
      ? (error.message as string) 
      : "创建充值申请失败");
  }
};

// Fixed function to avoid accessing auth.users table and properly handle wallet balance update
export const updateWalletRechargeRequest = async (
  id: string,
  updates: Partial<WalletRechargeRequest>
): Promise<WalletRechargeRequest> => {
  try {
    // First get the request data to access user_id and amount
    const { data: requestData, error: fetchError } = await supabase
      .from('wallet_recharge_requests')
      .select('user_id, amount')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching wallet recharge request:', fetchError);
      throw new Error(fetchError.message || "获取充值申请失败");
    }

    if (!requestData) {
      throw new Error("获取充值申请失败");
    }
    
    // Set completed_at time if status is being updated to "completed"
    if (updates.status === "completed" && !updates.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    // Now update the recharge request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('wallet_recharge_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating wallet recharge request:', updateError);
      throw new Error(updateError.message || "更新充值申请失败");
    }

    // If the status is being updated to "completed", update the user's wallet balance
    if (updates.status === "completed") {
      // Check if user wallet exists
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', requestData.user_id)
        .maybeSingle();

      if (walletError) {
        console.error('Error getting user wallet:', walletError);
        throw new Error(walletError.message || "获取用户钱包失败");
      }

      if (wallet) {
        // Update existing wallet balance
        const { error: updateWalletError } = await supabase
          .from('user_wallets')
          .update({
            balance: wallet.balance + requestData.amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', requestData.user_id);

        if (updateWalletError) {
          console.error('Error updating user wallet balance:', updateWalletError);
          throw new Error(updateWalletError.message || "更新用户钱包余额失败");
        }
      } else {
        // Create new wallet for the user
        const { error: insertWalletError } = await supabase
          .from('user_wallets')
          .insert({
            user_id: requestData.user_id,
            balance: requestData.amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertWalletError) {
          console.error('Error creating user wallet:', insertWalletError);
          throw new Error(insertWalletError.message || "创建用户钱包失败");
        }
      }
      
      // Create a wallet transaction record for this recharge
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: requestData.user_id,
          type: 'deposit',
          amount: requestData.amount,
          status: 'completed',
          note: `充值金额：${requestData.amount}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          transaction_hash: updates.transaction_hash || null
        });
        
      if (transactionError) {
        console.error('Error creating transaction record:', transactionError);
        // We don't throw here since the balance was already updated
      }
    }
    
    return updatedRequest as WalletRechargeRequest;
  } catch (error) {
    console.error('Exception updating wallet recharge request:', error);
    throw new Error(typeof error === 'object' && error !== null && 'message' in error 
      ? (error.message as string) 
      : "更新充值申请失败");
  }
};
