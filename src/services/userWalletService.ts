
import { UserWallet } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// User Wallets
export const getUserWallets = async (): Promise<UserWallet[]> => {
  try {
    // Similar approach - fetch wallets and profiles separately
    const { data: wallets, error: walletsError } = await supabase
      .from('user_wallets')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (walletsError) {
      console.error('Error fetching user wallets:', walletsError);
      return [];
    }
    
    if (!wallets || wallets.length === 0) {
      return [];
    }
    
    // Get unique user IDs from wallets
    const userIds = [...new Set(wallets.map(w => w.user_id))];
    
    // Fetch profiles for these users
    let userEmails = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      if (profiles) {
        // Create a map of user_id to display name
        userEmails = profiles.reduce((acc, profile) => {
          const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || `User ${profile.id.substring(0, 8)}`;
          acc[profile.id] = displayName;
          return acc;
        }, {});
      }
    }
    
    // Format the data to include user_email
    const formattedData = wallets.map(wallet => ({
      ...wallet,
      user_email: userEmails[wallet.user_id] || `User ${wallet.user_id.substring(0, 8)}`
    }));
    
    return formattedData as UserWallet[];
  } catch (error) {
    console.error('Error fetching user wallets:', error);
    return [];
  }
};

// 使用upsert方式优化直接查询获取或创建钱包，避免多次数据库访问
export const getUserWalletByUserId = async (userId: string): Promise<UserWallet | null> => {
  // 定义带缓存时间戳的钱包类型
  interface CachedWallet extends UserWallet {
    cacheTimestamp: number;
  }
  
  // 加入缓存机制，使用sessionStorage缓存短期内的钱包数据
  const cacheKey = `wallet_${userId}`;
  const cachedWalletStr = sessionStorage.getItem(cacheKey);
  
  // 检查是否有有效缓存 (小于30秒)
  if (cachedWalletStr) {
    try {
      const parsed = JSON.parse(cachedWalletStr) as CachedWallet;
      const cacheTime = parsed.cacheTimestamp;
      const currentTime = new Date().getTime();
      
      // 如果缓存时间小于30秒，直接返回缓存数据
      if (currentTime - cacheTime < 30000) {
        // 创建一个新对象并排除缓存时间戳属性
        const { cacheTimestamp, ...walletData } = parsed;
        return walletData as UserWallet;
      }
    } catch (e) {
      // 解析错误，忽略缓存
      console.warn('Failed to parse wallet cache:', e);
    }
  }
  
  try {
    // 直接查询钱包数据
    const { data, error } = await supabase
      .from('user_wallets')
      .select('id, user_id, balance, created_at, updated_at')  // 显式指定字段提高效率
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      return null;
    }
    
    if (data) {
      // 缓存钱包数据
      const cacheData: CachedWallet = { 
        ...data as unknown as UserWallet, 
        cacheTimestamp: new Date().getTime() 
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return data as UserWallet;
    }
    
    // 如果没有找到钱包，创建新钱包
    const { data: newWallet, error: createError } = await supabase
      .from('user_wallets')
      .insert({
        user_id: userId,
        balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, user_id, balance, created_at, updated_at')  // 显式指定需要返回的字段
      .single();
      
    if (createError) {
      return null;
    }
    
    // 缓存新创建的钱包数据
    const cacheData: CachedWallet = { 
      ...newWallet as unknown as UserWallet, 
      cacheTimestamp: new Date().getTime() 
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    return newWallet as UserWallet;
  } catch (error) {
    return null;
  }
};
