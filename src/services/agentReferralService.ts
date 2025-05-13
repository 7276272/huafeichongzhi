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
export const generateQRCodeURL = (text: string, options: { size?: number, logo?: string } = {}) => {
  const size = options.size || 250;
  
  // 使用QR Server API生成更高质量的二维码
  let url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&margin=10&format=png`;
  
  // 如果有logo，使用更高级的QRCode生成服务
  if (options.logo) {
    // 注意：实际应用中可能需要集成付费API或自定义解决方案
    url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&margin=10&format=png`;
  }
  
  return url;
};

// 生成短链接
export const generateShortLink = async (longUrl: string, agentId: string) => {
  try {
    // 在实际应用中，你可能会使用短链接服务如Bitly或TinyURL
    // 这里我们将在数据库中创建一个短链接记录
    
    // 生成短链接代码
    const shortCode = Math.random().toString(36).substring(2, 8);
    
    try {
      // 存储短链接映射
      const { error } = await supabase
        .from('agent_short_links')
        .insert({
          short_code: shortCode,
          original_url: longUrl,
          agent_id: agentId,
          created_at: new Date().toISOString(),
          clicks: 0
        });
      
      if (error) {
        // 如果是表不存在的错误，提供更友好的错误信息
        if (error.message && error.message.includes('does not exist')) {
          console.error('数据库表 agent_short_links 不存在，请先运行数据库迁移脚本');
          // 在表不存在的情况下，返回原始链接
          return longUrl;
        }
        throw error;
      }
      
      // 返回短链接URL
      const baseUrl = window.location.origin;
      return `${baseUrl}/l/${shortCode}`;
    } catch (dbError) {
      // 处理数据库操作错误
      console.error('数据库操作失败:', dbError);
      // 如果失败，返回原始链接
      return longUrl;
    }
  } catch (error) {
    console.error('生成短链接失败:', error);
    // 如果失败，返回原始链接
    return longUrl;
  }
};

// 记录推广链接点击
export const recordReferralLinkClick = async (shortCode: string, clickInfo: { ip?: string, userAgent?: string, referrer?: string } = {}) => {
  try {
    // 首先获取短链接记录
    const { data, error } = await supabase
      .from('agent_short_links')
      .select('*')
      .eq('short_code', shortCode)
      .single();
    
    if (error) throw error;
    
    // 更新点击次数
    const { error: updateError } = await supabase
      .from('agent_short_links')
      .update({ 
        clicks: (data.clicks || 0) + 1,
        last_clicked_at: new Date().toISOString()
      })
      .eq('short_code', shortCode);
    
    if (updateError) throw updateError;
    
    // 记录详细的点击信息
    const { error: clickError } = await supabase
      .from('agent_link_clicks')
      .insert({
        short_link_id: data.id,
        agent_id: data.agent_id,
        ip_address: clickInfo.ip || null,
        user_agent: clickInfo.userAgent || null,
        referrer: clickInfo.referrer || null,
        clicked_at: new Date().toISOString()
      });
    
    if (clickError) throw clickError;
    
    return data.original_url;
  } catch (error) {
    console.error('记录链接点击失败:', error);
    return null;
  }
};

// 定义推广链接统计返回类型
export interface ReferralLinkStats {
  totalLinks: number;
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDate: Record<string, number>;
  clicksByLink: Record<string, number>;
  conversionRate: number;
  shortLink?: string;
  clicks?: number;
  conversions?: number;
}

// 获取推广链接点击统计
export const getReferralLinkStats = async (agentId: string): Promise<ReferralLinkStats> => {
  try {
    // 获取代理的所有短链接
    const { data: links, error } = await supabase
      .from('agent_short_links')
      .select('id, short_code, original_url, clicks, created_at')
      .eq('agent_id', agentId);
    
    if (error) throw error;
    
    // 获取所有点击记录
    const { data: clicks, error: clicksError } = await supabase
      .from('agent_link_clicks')
      .select('id, short_link_id, ip_address, clicked_at')
      .eq('agent_id', agentId);
    
    if (clicksError) throw clicksError;
    
    // 汇总统计数据
    const totalClicks = clicks?.length || 0;
    const uniqueIPs = new Set(clicks?.map(click => click.ip_address).filter(Boolean)).size;
    
    // 按日期分组的点击数
    const clicksByDate: Record<string, number> = {};
    clicks?.forEach(click => {
      const date = new Date(click.clicked_at).toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });
    
    // 按短链接分组的点击数
    const clicksByLink: Record<string, number> = {};
    links?.forEach(link => {
      clicksByLink[link.short_code] = link.clicks || 0;
    });
    
    // 获取转化数据 (从点击到注册的转化)
    const { data: conversions, error: convError } = await supabase
      .from('agent_referrals')
      .select('id')
      .eq('agent_id', agentId);
      
    if (convError) throw convError;
    
    const conversionCount = conversions?.length || 0;
    const conversionRate = totalClicks > 0 ? (conversionCount / totalClicks) * 100 : 0;
    
    // 找到最新的短链接
    let shortLink = '';
    if (links && links.length > 0) {
      // 按创建时间排序，获取最新的
      const sortedLinks = [...links].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestLink = sortedLinks[0];
      const baseUrl = window.location.origin;
      shortLink = `${baseUrl}/l/${latestLink.short_code}`;
    }
    
    return {
      totalLinks: links?.length || 0,
      totalClicks,
      uniqueVisitors: uniqueIPs,
      clicksByDate,
      clicksByLink,
      conversionRate,
      shortLink,
      clicks: totalClicks,
      conversions: conversionCount
    };
  } catch (error) {
    console.error('获取推广链接统计失败:', error);
    // 出错时返回默认值
    return {
      totalLinks: 0,
      totalClicks: 0,
      uniqueVisitors: 0,
      clicksByDate: {},
      clicksByLink: {},
      conversionRate: 0,
      clicks: 0,
      conversions: 0
    };
  }
};

// 记录推广注册信息
export const recordReferralRegistration = async (referralCode: string, userId: string) => {
  try {
    console.log('记录推广注册:', { referralCode, userId });
    
    // 首先查询代理ID
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('referral_code', referralCode)
      .single();
    
    if (agentError || !agentData) {
      console.error('查询代理信息失败:', agentError);
      throw new Error('无效的推广码');
    }
    
    const agentId = agentData.id;
    
    // 1. 记录推广转化
    const { data: conversionData, error: conversionError } = await supabase
      .from('agent_referral_conversions')
      .insert({
        agent_id: agentId,
        user_id: userId,
        referral_code: referralCode,
        conversion_type: 'registration',
        created_at: new Date().toISOString()
      });
    
    if (conversionError) {
      console.error('记录推广转化失败:', conversionError);
      throw conversionError;
    }
    
    // 2. 同时更新 agent_referrals 表，这样数据才会显示在推广统计中
    const { data: referralData, error: referralError } = await supabase
      .from('agent_referrals')
      .insert({
        agent_id: agentId,
        referred_user_id: userId,
        referral_code: referralCode,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (referralError) {
      console.error('记录推广关系失败:', referralError);
      // 即使这里失败，我们也不抛出错误，因为转化记录已经成功
      console.warn('推广转化记录成功，但推广关系记录失败');
    }
    
    return { success: true, data: { conversion: conversionData, referral: referralData } };
  } catch (error) {
    console.error('记录推广注册失败:', error);
    return { success: false, error };
  }
}
