import { supabase } from "@/integrations/supabase/client";

// 代理订单统计数据接口
export interface AgentOrderStats {
  // 今日数据 - 总计
  todayOrderCount: number;
  todayOrderAmount: number;
  
  // 今日数据 - 已完成
  todayCompletedCount: number;
  todayCompletedAmount: number;
  
  // 今日数据 - 已取消
  todayCanceledCount: number;
  todayCanceledAmount: number;
  
  // 本周数据
  weekOrderCount: number;
  weekOrderAmount: number;
  
  // 本月数据
  monthOrderAmount: number;
  
  // 上月数据
  lastMonthOrderAmount: number;
}

/**
 * 获取代理的订单统计数据
 * @param agentId 代理ID
 * @returns 订单统计数据
 */
export const getAgentOrderStats = async (agentId: string): Promise<AgentOrderStats> => {
  try {
    if (!agentId) throw new Error("代理ID不能为空");
    
    // 获取当前日期数据
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    
    // 计算本周开始日期（周一为起始日）
    const currentDay = now.getDay() || 7; // 0是周日，转换为7
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (currentDay - 1)).toISOString();
    
    // 计算本月开始日期
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    // 计算上月开始和结束日期
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
    
    // 获取今日所有订单数据（不筛选状态）
    const { data: todayOrders, error: todayError } = await supabase
      .from('recharge_orders')
      .select('id, amount, status')
      .eq('processed_by', agentId)
      .gte('created_at', today)
      .lt('created_at', tomorrow);
      
    if (todayError) throw new Error(`获取今日订单数据失败: ${todayError.message}`);
    
    // 筛选出今日已完成的订单
    const todayCompletedOrders = todayOrders.filter(order => order.status === 'completed');
    
    // 筛选出今日已取消的订单
    const todayCanceledOrders = todayOrders.filter(order => order.status === 'canceled');
    
    // 获取本周订单数据
    const { data: weekOrders, error: weekError } = await supabase
      .from('recharge_orders')
      .select('id, amount')
      .eq('processed_by', agentId)
      .eq('status', 'completed')
      .gte('completed_at', weekStart)
      .lt('completed_at', tomorrow);
      
    if (weekError) throw new Error(`获取本周订单数据失败: ${weekError.message}`);
    
    // 获取本月订单数据
    const { data: monthOrders, error: monthError } = await supabase
      .from('recharge_orders')
      .select('id, amount')
      .eq('processed_by', agentId)
      .eq('status', 'completed')
      .gte('completed_at', monthStart)
      .lt('completed_at', tomorrow);
      
    if (monthError) throw new Error(`获取本月订单数据失败: ${monthError.message}`);
    
    // 获取上月订单数据
    const { data: lastMonthOrders, error: lastMonthError } = await supabase
      .from('recharge_orders')
      .select('id, amount')
      .eq('processed_by', agentId)
      .eq('status', 'completed')
      .gte('completed_at', lastMonthStart)
      .lt('completed_at', lastMonthEnd);
      
    if (lastMonthError) throw new Error(`获取上月订单数据失败: ${lastMonthError.message}`);
    
    // 计算今日订单总额和数量
    const todayOrderAmount = todayOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // 计算今日已完成订单总额和数量
    const todayCompletedAmount = todayCompletedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const todayCompletedCount = todayCompletedOrders.length;
    
    // 计算今日已取消订单总额和数量
    const todayCanceledAmount = todayCanceledOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const todayCanceledCount = todayCanceledOrders.length;
    
    // 计算本周订单总额
    const weekOrderAmount = weekOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // 计算本月订单总额
    const monthOrderAmount = monthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // 计算上月订单总额
    const lastMonthOrderAmount = lastMonthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    return {
      todayOrderCount: todayOrders.length,
      todayOrderAmount,
      todayCompletedCount,
      todayCompletedAmount,
      todayCanceledCount,
      todayCanceledAmount,
      weekOrderCount: weekOrders.length,
      weekOrderAmount,
      monthOrderAmount,
      lastMonthOrderAmount
    };
  } catch (error) {
    console.error("获取代理订单统计失败:", error);
    throw error;
  }
};
