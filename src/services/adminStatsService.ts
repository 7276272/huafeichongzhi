import { supabase } from "@/integrations/supabase/client";

// 管理员统计数据接口
export interface AdminStatsData {
  // 今日数据
  todaySalesAmount: number;   // 今日销售额
  todayCompletedAmount: number; // 今日已完成
  todayCommission: number;    // 今日佣金
  todayTotalAmount: number;   // 今日交易总额
  
  // 本周数据
  weekSalesAmount: number;    // 本周销售额
  weekCompletedAmount: number;  // 本周已完成
  weekCommission: number;     // 本周佣金
  weekTotalAmount: number;    // 本周交易总额
  
  // 本月数据
  monthSalesAmount: number;   // 本月销售额
  monthCompletedAmount: number; // 本月已完成
  monthCommission: number;    // 本月佣金
  monthTotalAmount: number;   // 本月交易总额
  
  // 上月数据
  lastMonthSalesAmount: number; // 上月销售额
  lastMonthTotalAmount: number; // 上月交易总额
  
  // 订单数量
  todayOrderCount: number;    // 今日订单数量
  weekOrderCount: number;     // 本周订单数量
  totalOrderCount: number;    // 总订单数量
}

/**
 * 获取管理员统计数据
 * @returns 管理员统计数据
 */
export const getAdminStats = async (): Promise<AdminStatsData> => {
  try {
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
    
    // 获取今日订单数据
    const { data: todayOrders, error: todayError } = await supabase
      .from('recharge_orders')
      .select('id, amount, status')
      .gte('created_at', today)
      .lt('created_at', tomorrow);
      
    if (todayError) throw new Error(`获取今日订单数据失败: ${todayError.message}`);
    
    // 获取本周订单数据
    const { data: weekOrders, error: weekError } = await supabase
      .from('recharge_orders')
      .select('id, amount, status')
      .gte('created_at', weekStart)
      .lt('created_at', tomorrow);
      
    if (weekError) throw new Error(`获取本周订单数据失败: ${weekError.message}`);
    
    // 获取本月订单数据
    const { data: monthOrders, error: monthError } = await supabase
      .from('recharge_orders')
      .select('id, amount, status')
      .gte('created_at', monthStart)
      .lt('created_at', tomorrow);
      
    if (monthError) throw new Error(`获取本月订单数据失败: ${monthError.message}`);
    
    // 获取上月订单数据
    const { data: lastMonthOrders, error: lastMonthError } = await supabase
      .from('recharge_orders')
      .select('id, amount, status')
      .gte('created_at', lastMonthStart)
      .lt('created_at', lastMonthEnd);
      
    if (lastMonthError) throw new Error(`获取上月订单数据失败: ${lastMonthError.message}`);
    
    // 获取总订单数量
    const { count: totalOrderCount, error: totalOrderError } = await supabase
      .from('recharge_orders')
      .select('id', { count: 'exact', head: true });
      
    if (totalOrderError) throw new Error(`获取总订单数量失败: ${totalOrderError.message}`);
    
    // 过滤已完成的订单
    const todayCompletedOrders = todayOrders ? todayOrders.filter(order => order.status === 'completed') : [];
    const weekCompletedOrders = weekOrders ? weekOrders.filter(order => order.status === 'completed') : [];
    const monthCompletedOrders = monthOrders ? monthOrders.filter(order => order.status === 'completed') : [];
    
    // 使用固定比例计算佣金（订单金额的5%）
    const calculateCommission = (amount: number) => amount * 0.05;
    
    // 计算各种统计数据
    const todaySalesAmount = todayOrders ? todayOrders.reduce((sum, order) => sum + (order.amount || 0), 0) : 0;
    const todayCompletedAmount = todayCompletedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    // 使用计算的佣金
    const todayCommission = todayOrders ? todayOrders.reduce((sum, order) => sum + calculateCommission(order.amount || 0), 0) : 0;
    
    const weekSalesAmount = weekOrders ? weekOrders.reduce((sum, order) => sum + (order.amount || 0), 0) : 0;
    const weekCompletedAmount = weekCompletedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const weekCommission = weekOrders ? weekOrders.reduce((sum, order) => sum + calculateCommission(order.amount || 0), 0) : 0;
    
    const monthSalesAmount = monthOrders ? monthOrders.reduce((sum, order) => sum + (order.amount || 0), 0) : 0;
    const monthCompletedAmount = monthCompletedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const monthCommission = monthOrders ? monthOrders.reduce((sum, order) => sum + calculateCommission(order.amount || 0), 0) : 0;
    
    const lastMonthSalesAmount = lastMonthOrders ? lastMonthOrders.reduce((sum, order) => sum + (order.amount || 0), 0) : 0;
    
    return {
      todaySalesAmount,
      todayCompletedAmount,
      todayCommission,
      todayTotalAmount: todaySalesAmount,
      
      weekSalesAmount,
      weekCompletedAmount,
      weekCommission,
      weekTotalAmount: weekSalesAmount,
      
      monthSalesAmount,
      monthCompletedAmount,
      monthCommission,
      monthTotalAmount: monthSalesAmount,
      
      lastMonthSalesAmount,
      lastMonthTotalAmount: lastMonthSalesAmount,
      
      todayOrderCount: todayOrders.length,
      weekOrderCount: weekOrders.length,
      totalOrderCount: totalOrderCount || 0
    };
  } catch (error) {
    console.error("获取管理员统计数据失败:", error);
    throw error;
  }
};
