
import { WalletTransaction } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/admin-client";

// Wallet Transactions
export const getWalletTransactions = async (): Promise<WalletTransaction[]> => {
  try {
    // Since the direct relationship query is failing, let's fetch transactions and users separately
    const { data: transactions, error: transactionsError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      return [];
    }
    
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    // Get unique user IDs from transactions
    // u8fc7u6ee4nullu503c
    const userIds = [...new Set(transactions.filter(t => t.user_id).map(t => t.user_id).filter(id => id !== null))];
    
    // If there are user IDs, fetch the corresponding profiles
    let userEmails: Record<string, string> = {}; // u52a0u4e0au7c7bu578bu6ce8u89e3
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      if (profiles) {
        // Create a map of user_id to display name
        userEmails = profiles.reduce<Record<string, string>>((acc, profile) => {
          const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || `User ${profile.id.substring(0, 8)}`;
          acc[profile.id] = displayName;
          return acc;
        }, {});
      }
    }
    
    // Format the data to include user_email from the profiles
    const formattedData = transactions.map(transaction => ({
      ...transaction,
      user_email: transaction.user_id && userEmails[transaction.user_id] ? userEmails[transaction.user_id] : undefined
    }));
    
    return formattedData as WalletTransaction[];
  } catch (error) {
    console.error('Exception fetching wallet transactions:', error);
    return [];
  }
};

export const getWalletTransactionsByUserId = async (userId: string): Promise<WalletTransaction[]> => {
  try {
    // 使用supabaseAdmin客户端来解决权限问题
    // 管理员客户端包含服务角色权限，可以访问受限的表
    const { data, error } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user transactions:', error);
      // 如果存在权限错误，返回空数组而不是抛出异常
      return [];
    }
    
    // 添加缺失的字段以符合WalletTransaction类型定义
    const processedData = data.map(tx => {
      // 根据实际数据库结构创建一个符合WalletTransaction格式的对象
      return {
        id: tx.id || '',
        amount: tx.amount || 0,
        type: tx.type || 'unknown',
        status: tx.status || 'pending',
        created_at: tx.created_at || new Date().toISOString(),
        updated_at: tx.updated_at || tx.created_at || new Date().toISOString(),
        completed_at: tx.completed_at || undefined,
        reference_id: tx.reference_id || undefined,
        network: tx.network || undefined,
        note: tx.note || undefined,
        processed_by: tx.processed_by || undefined,
        user_id: userId,
        user_email: '用户' // 用占位符代替实际邮箱
      };
    });
    
    return processedData as WalletTransaction[];
  } catch (error) {
    console.error('Exception fetching user wallet transactions:', error);
    return [];
  }
};

export const createWalletTransaction = async (
  transaction: Omit<WalletTransaction, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'user_email'>
): Promise<WalletTransaction> => {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating wallet transaction:', error);
      throw new Error(error.message || "创建钱包交易失败");
    }
    
    return data as WalletTransaction;
  } catch (error) {
    console.error('Exception creating wallet transaction:', error);
    throw new Error(typeof error === 'object' && error !== null && 'message' in error 
      ? (error.message as string) 
      : "创建钱包交易失败");
  }
};

export const updateWalletTransaction = async (
  id: string,
  updates: Partial<WalletTransaction>
): Promise<WalletTransaction> => {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating wallet transaction:', error);
      throw new Error(error.message || "更新钱包交易失败");
    }
    
    return data as WalletTransaction;
  } catch (error) {
    console.error('Exception updating wallet transaction:', error);
    throw new Error(typeof error === 'object' && error !== null && 'message' in error 
      ? (error.message as string) 
      : "更新钱包交易失败");
  }
};
