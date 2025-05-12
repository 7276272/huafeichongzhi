import { supabase } from "@/integrations/supabase/client";
import { Agent, ReferralStats, SubAgentStats, User } from "@/types";
import type { Database } from "@/integrations/supabase/types";

// 定义数据库表类型别名，增强类型安全性
type AgentTable = Database['public']['Tables']['agents']['Row'];

// 生成唯一推广代码
export const generateReferralCode = (agentId: string) => {
  // 生成6位随机字母数字组合
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  // 使用代理ID的一部分和随机字符组合
  return `${agentId.substring(0, 4)}${randomChars}`;
};

// 获取代理推广链接
export const getAgentReferralLink = (referralCode: string) => {
  // 构建完整的推广链接 - 使用当前域名
  const baseUrl = window.location.origin;
  return `${baseUrl}/register?ref=${referralCode}`;
};

// 创建代理推广码和链接
export const createAgentReferral = async (agentId: string) => {
  try {
    // 检查代理是否已有推广码
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('referral_code')
      .eq('id', agentId)
      .single<Pick<AgentTable, 'referral_code'>>();
    
    // 如果已有推广码，直接返回
    if (existingAgent?.referral_code) {
      return {
        referralCode: existingAgent.referral_code,
        referralLink: getAgentReferralLink(existingAgent.referral_code)
      };
    }
    
    // 生成新的推广码
    const referralCode = generateReferralCode(agentId);
    const referralLink = getAgentReferralLink(referralCode);
    
    // 更新代理信息，添加推广码
    const { error } = await supabase
      .from('agents')
      .update({ 
        referral_code: referralCode,
        referral_link: referralLink
      })
      .eq('id', agentId);
    
    if (error) throw error;
    
    return { referralCode, referralLink };
  } catch (error) {
    console.error("创建代理推广码失败:", error);
    throw error;
  }
};

// 通过推广码获取代理信息
export const getAgentByReferralCode = async (referralCode: string): Promise<Agent | null> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('referral_code', referralCode)
      .single<AgentTable>();
    
    if (error) throw error;
    
    // 将Supabase数据库类型转换为应用程序类型
    const agent: Agent = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      commission_rate: data.commission_rate,
      status: data.status as 'active' | 'inactive',
      balance: data.balance,
      total_commission: data.total_commission,
      created_at: data.created_at,
      updated_at: data.updated_at,
      referral_code: data.referral_code || undefined,
      referral_link: data.referral_link || undefined
    };
    
    return agent;
  } catch (error) {
    console.error("查询代理失败:", error);
    return null;
  }
};

// 使用推广码注册新用户
// 扫展User类型以包含注册时所需的密码字段
interface UserRegistrationData extends Partial<User> {
  password: string;
}

export const registerUserWithReferral = async (userData: UserRegistrationData, referralCode: string) => {
  try {
    // 获取代理信息
    const agent = await getAgentByReferralCode(referralCode);
    if (!agent) {
      throw new Error("无效的推广码");
    }
    
    // 创建用户，并记录推荐代理ID
    const { data: user, error } = await supabase.auth.signUp({
      email: userData.email!,
      password: userData.password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          referred_by: agent.id
        }
      }
    });
    
    if (error) throw error;
    
    // 创建推荐关系记录
    if (user.user) {
      const { error: refError } = await supabase
        .from('agent_referrals')
        .insert({
          agent_id: agent.id,
          referral_code: referralCode,
          referred_user_id: user.user.id,
          status: 'active',
          // 允许自动生成这些字段
          id: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (refError) throw refError;
    }
    
    return user;
  } catch (error) {
    console.error("使用推广码注册用户失败:", error);
    throw error;
  }
};

// 获取代理的推广统计数据
export const getAgentReferralStats = async (agentId: string): Promise<ReferralStats> => {
  try {
    // 初始化统计数据
    const stats: ReferralStats = {
      total_referrals: 0,
      active_referrals: 0,
      total_recharge_amount: 0,
      total_commission_earned: 0,
      total_commission_withdrawn: 0,
      pending_commission: 0,
      referral_user_count: 0
    };
    
    // 获取所有推广用户
    const { data: referrals, error } = await supabase
      .from('agent_referrals')
      .select('*')
      .eq('agent_id', agentId);
    
    if (error) throw error;
    
    if (!referrals || referrals.length === 0) {
      return stats;
    }
    
    stats.total_referrals = referrals.length;
    stats.active_referrals = referrals.filter(ref => ref.status === 'active').length;
    stats.referral_user_count = new Set(referrals.map(ref => ref.referred_user_id)).size;
    
    // 获取推广用户的充值总额
    const userIds = referrals.map(ref => ref.referred_user_id);
    if (userIds.length > 0) {
      const { data: orders, error: orderError } = await supabase
        .from('recharge_orders')
        .select('amount, status')
        .in('user_id', userIds)
        .eq('status', 'completed');
      
      if (orderError) throw orderError;
      
      if (orders && orders.length > 0) {
        stats.total_recharge_amount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
      }
    }
    
    // 获取代理的佣金数据
    const { data: transactions, error: txError } = await supabase
      .from('agent_transactions')
      .select('amount, type, status')
      .eq('agent_id', agentId);
    
    if (txError) throw txError;
    
    if (transactions && transactions.length > 0) {
      // 计算已赚取的总佣金
      stats.total_commission_earned = transactions
        .filter(tx => tx.type === 'commission')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      
      // 计算已提现的佣金
      stats.total_commission_withdrawn = transactions
        .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      
      // 计算待处理的佣金
      stats.pending_commission = transactions
        .filter(tx => tx.type === 'commission' && tx.status === 'pending')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    }
    
    return stats;
  } catch (error) {
    console.error("获取推广统计数据失败:", error);
    throw error;
  }
};

// 获取下级用户的详细统计数据
export const getSubAgentStats = async (agentId: string): Promise<SubAgentStats[]> => {
  try {
    // 获取所有推广用户
    const { data: referrals, error } = await supabase
      .from('agent_referrals')
      .select('*')
      .eq('agent_id', agentId);
    
    if (error) throw error;
    
    if (!referrals || referrals.length === 0) {
      return [];
    }
    
    // 得到被推广用户ID列表
    const userIds = referrals.map(ref => ref.referred_user_id);
    
    // 获取用户信息
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select('id, user_id, created_at')
      .in('user_id', userIds);
    
    if (userError) throw userError;
    
    if (!users || users.length === 0) {
      return [];
    }
    
    // 获取用户充值订单
    const { data: orders, error: orderError } = await supabase
      .from('recharge_orders')
      .select('user_id, amount, status')
      .in('user_id', userIds);
    
    if (orderError) throw orderError;
    
    // 整合数据
    const stats: SubAgentStats[] = users.map(user => {
      // 安全地过滤订单
      const completedOrders = orders ? orders.filter(o => o.status === 'completed' && o.user_id === user.user_id) : []; 
      
      // 计算统计数据
      const rechargeCount = completedOrders.length;
      const rechargeAmount = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      
      // 默认佣金率 5%
      const commissionRate = 0.05;
      const commissionGenerated = rechargeAmount * commissionRate;
      
      // 确保日期字段始终有值
      const createdAt = user.created_at || new Date().toISOString();
      
      return {
        user_id: user.user_id,
        user_email: 'Unknown', // 用户资料中没有email字段，可以在其他地方获取
        recharge_count: rechargeCount,
        recharge_amount: rechargeAmount,
        commission_generated: commissionGenerated,
        created_at: createdAt,
        last_activity: createdAt // 使用创建时间作为最后活动时间
      };
    });
    
    // 按充值金额排序
    return stats.sort((a, b) => b.recharge_amount - a.recharge_amount);
  } catch (error) {
    console.error("获取下级用户统计数据失败:", error);
    throw error;
  }
};

// 生成二维码图片URL
export const generateQRCodeURL = (text: string) => {
  // 使用Google Charts API生成QR码
  return `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(text)}`;
};
