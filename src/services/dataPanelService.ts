import { supabase } from "@/integrations/supabase/client";
import { 
  DataPanelStats, 
  DateRangeParams,
  TimeRangeType 
} from "@/types/dataModels";

/**
 * u83b7u53d6u6570u636eu9762u677fu7edfu8ba1u6570u636e
 * @param timeRange u65f6u95f4u8303u56f4u7c7bu578b
 * @param customRange u81eau5b9au4e49u65f6u95f4u8303u56f4uff08u5f53timeRangeu4e3a'custom'u65f6u4f7fu7528uff09
 * @returns u6570u636eu9762u677fu7edfu8ba1u6570u636e
 */
export const getDataPanelStats = async (
  timeRange: TimeRangeType = 'today',
  customRange?: DateRangeParams
): Promise<DataPanelStats> => {
  try {
    // u8ba1u7b97u65f6u95f4u8303u56f4
    const { startDate, endDate } = calculateDateRange(timeRange, customRange);
    
    // u540cu65f6u8bf7u6c42u591au4e2au6570u636eu6e90
    const [
      usersData,
      ordersData,
      financialData,
      agentsData,
      productsData,
      salesTrendData
    ] = await Promise.all([
      fetchUsersStats(startDate, endDate),
      fetchOrdersStats(startDate, endDate),
      fetchFinancialStats(startDate, endDate),
      fetchAgentsStats(startDate, endDate),
      fetchProductsStats(startDate, endDate),
      fetchSalesTrend(startDate, endDate)
    ]);
    
    return {
      // u7528u6237u7edfu8ba1
      totalUsers: usersData.totalUsers,
      newUsers: usersData.newUsers,
      activeUsers: usersData.activeUsers,
      
      // u8ba2u5355u7edfu8ba1
      totalOrders: ordersData.totalOrders,
      completedOrders: ordersData.completedOrders,
      failedOrders: ordersData.failedOrders,
      pendingOrders: ordersData.pendingOrders,
      
      // u8d22u52a1u7edfu8ba1
      totalSales: financialData.totalSales,
      totalRefunds: financialData.totalRefunds,
      netRevenue: financialData.netRevenue,
      grossProfit: financialData.grossProfit,
      
      // u4ee3u7406u7edfu8ba1
      totalAgents: agentsData.totalAgents,
      activeAgents: agentsData.activeAgents,
      agentRevenue: agentsData.agentRevenue,
      agentCommission: agentsData.agentCommission,
      
      // u4ea7u54c1u7edfu8ba1
      topProducts: productsData.topProducts,
      
      // u652fu4ed8u65b9u5f0fu7edfu8ba1
      paymentMethodStats: ordersData.paymentMethodStats,
      
      // u8fd0u8425u5546u7edfu8ba1
      carrierStats: ordersData.carrierStats,
      
      // u65f6u95f4u8d8bu52bf
      salesTrend: salesTrendData
    };
  } catch (error) {
    console.error("u83b7u53d6u6570u636eu9762u677fu7edfu8ba1u6570u636eu5931u8d25:", error);
    throw error;
  }
};

/**
 * u8ba1u7b97u65f6u95f4u8303u56f4
 * @param timeRange u65f6u95f4u8303u56f4u7c7bu578b
 * @param customRange u81eau5b9au4e49u65f6u95f4u8303u56f4
 * @returns u5f00u59cbu548cu7ed3u675fu65e5u671f
 */
const calculateDateRange = (
  timeRange: TimeRangeType,
  customRange?: DateRangeParams
): { startDate: string; endDate: string } => {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  switch (timeRange) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      // u83b7u53d6u672cu5468u7684u5468u4e00
      const dayOfWeek = now.getDay() || 7; // u5c06u5468u65e5u76840u8f6cu4e3a7
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case 'custom':
      if (!customRange) {
        throw new Error('u81eau5b9au4e49u65f6u95f4u8303u56f4u7f3au5931');
      }
      startDate = new Date(customRange.startDate);
      endDate = new Date(customRange.endDate);
      endDate.setHours(23, 59, 59);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

/**
 * u83b7u53d6u7528u6237u7edfu8ba1u6570u636e
 */
const fetchUsersStats = async (startDate: string, endDate: string) => {
  // u83b7u53d6u603bu7528u6237u6570
  const { count: totalUsers } = await supabase
    .from('user_accounts')
    .select('id', { count: 'exact', head: true });
  
  // u83b7u53d6u65b0u6ce8u518cu7528u6237u6570
  const { count: newUsers } = await supabase
    .from('user_accounts')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lte('created_at', endDate);
  
  // u83b7u53d6u6d3bu8dc3u7528u6237u6570uff08u6709u767bu5f55u8bb0u5f55u7684u7528u6237uff09
  const { count: activeUsers } = await supabase
    .from('user_accounts')
    .select('id', { count: 'exact', head: true })
    .gte('last_login', startDate)
    .lte('last_login', endDate);
  
  return {
    totalUsers: totalUsers || 0,
    newUsers: newUsers || 0,
    activeUsers: activeUsers || 0
  };
};

/**
 * u83b7u53d6u8ba2u5355u7edfu8ba1u6570u636e
 */
const fetchOrdersStats = async (startDate: string, endDate: string) => {
  // u83b7u53d6u8ba2u5355u6570u636e
  const { data: orders, error } = await supabase
    .from('recharge_orders')
    .select('order_id, amount, order_status, payment_method, phone_number')
    .gte('create_time', startDate)
    .lte('create_time', endDate);
  
  if (error) throw error;
  
  // u8ba1u7b97u8ba2u5355u72b6u6001u7edfu8ba1
  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter(order => order.order_status === 'completed').length || 0;
  const failedOrders = orders?.filter(order => order.order_status === 'failed').length || 0;
  const pendingOrders = orders?.filter(order => ['pending', 'processing'].includes(order.order_status)).length || 0;
  
  // u8ba1u7b97u652fu4ed8u65b9u5f0fu7edfu8ba1
  const paymentMethods = new Map<string, { count: number, amount: number }>();
  
  orders?.forEach(order => {
    const method = order.payment_method;
    if (!paymentMethods.has(method)) {
      paymentMethods.set(method, { count: 0, amount: 0 });
    }
    const current = paymentMethods.get(method)!;
    paymentMethods.set(method, {
      count: current.count + 1,
      amount: current.amount + (order.amount || 0)
    });
  });
  
  // u6839u636eu624bu673au53f7u524du4e09u4f4du5224u65adu8fd0u8425u5546
  const carrierMap = new Map<string, { count: number, amount: number }>();
  
  orders?.forEach(order => {
    let carrier = 'u5176u4ed6';
    const phone = order.phone_number;
    if (phone && phone.length >= 3) {
      const prefix = phone.substring(0, 3);
      // u7b80u5316u7248u8fd0u8425u5546u5224u65aduff0cu5b9eu9645u9879u76eeu5e94u4f7fu7528u66f4u5b8cu6574u7684u5224u65adu903bu8f91
      if (['134', '135', '136', '137', '138', '139', '150', '151', '152', '157', '158', '159', '187', '188'].includes(prefix)) {
        carrier = 'u79fbu52a8';
      } else if (['130', '131', '132', '155', '156', '185', '186'].includes(prefix)) {
        carrier = 'u8054u901a';
      } else if (['133', '153', '180', '181', '189'].includes(prefix)) {
        carrier = 'u7535u4fe1';
      }
    }
    
    if (!carrierMap.has(carrier)) {
      carrierMap.set(carrier, { count: 0, amount: 0 });
    }
    const current = carrierMap.get(carrier)!;
    carrierMap.set(carrier, {
      count: current.count + 1,
      amount: current.amount + (order.amount || 0)
    });
  });
  
  return {
    totalOrders,
    completedOrders,
    failedOrders,
    pendingOrders,
    paymentMethodStats: Array.from(paymentMethods.entries()).map(([method, stats]) => ({
      method,
      count: stats.count,
      amount: stats.amount
    })),
    carrierStats: Array.from(carrierMap.entries()).map(([carrier, stats]) => ({
      carrier,
      count: stats.count,
      amount: stats.amount
    }))
  };
};

/**
 * u83b7u53d6u8d22u52a1u7edfu8ba1u6570u636e
 */
const fetchFinancialStats = async (startDate: string, endDate: string) => {
  // u83b7u53d6u8d22u52a1u6570u636e
  const { data: transactions, error } = await supabase
    .from('financial_transactions')
    .select('transaction_id, amount, transaction_type')
    .gte('create_time', startDate)
    .lte('create_time', endDate);
  
  if (error) throw error;
  
  // u8ba1u7b97u8d22u52a1u7edfu8ba1
  const totalSales = transactions
    ?.filter(t => t.transaction_type === 'consumption')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  
  const totalRefunds = transactions
    ?.filter(t => t.transaction_type === 'refund')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  
  // u6211u4eecu9700u8981u83b7u53d6u4ea7u54c1u6210u672cu4fe1u606fu6765u8ba1u7b97u6bdbu5229u7387
  // u8fd9u91ccu4f7fu7528u4e00u4e2au5047u8bbeu7684u6bdbu5229u7387u8fdbu884cu8ba1u7b97
  const grossProfitMargin = 0.3; // 30%u7684u6bdbu5229
  
  return {
    totalSales,
    totalRefunds,
    netRevenue: totalSales - totalRefunds,
    grossProfit: (totalSales - totalRefunds) * grossProfitMargin
  };
};

/**
 * u83b7u53d6u4ee3u7406u7edfu8ba1u6570u636e
 */
const fetchAgentsStats = async (startDate: string, endDate: string) => {
  // u83b7u53d6u4ee3u7406u603bu6570
  const { count: totalAgents } = await supabase
    .from('agents')
    .select('agent_id', { count: 'exact', head: true });
  
  // u83b7u53d6u6d3bu8dc3u4ee3u7406u6570uff08u6709u8ba2u5355u7684u4ee3u7406uff09
  const { data: activeAgentsData } = await supabase
    .from('recharge_orders')
    .select('processed_by')
    .gte('create_time', startDate)
    .lte('create_time', endDate)
    .not('processed_by', 'is', null);
  
  // u62bdu53d6u552fu4e00u7684u6d3bu8dc3u4ee3u7406ID
  const activeAgentIds = new Set<string>();
  activeAgentsData?.forEach(order => {
    if (order.processed_by) {
      activeAgentIds.add(order.processed_by);
    }
  });
  
  // u83b7u53d6u4ee3u7406u8ba2u5355u7684u603bu91d1u989d
  const { data: agentOrders } = await supabase
    .from('recharge_orders')
    .select('amount')
    .gte('create_time', startDate)
    .lte('create_time', endDate)
    .not('processed_by', 'is', null);
  
  const agentRevenue = agentOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
  
  // u4ee3u7406u4f63u91d1u8ba1u7b97uff08u5047u8bbeu4f63u91d1u7387u4e3a5%uff09
  const commissionRate = 0.05;
  const agentCommission = agentRevenue * commissionRate;
  
  return {
    totalAgents: totalAgents || 0,
    activeAgents: activeAgentIds.size,
    agentRevenue,
    agentCommission
  };
};

/**
 * u83b7u53d6u4ea7u54c1u7edfu8ba1u6570u636e
 */
const fetchProductsStats = async (startDate: string, endDate: string) => {
  // u83b7u53d6u4ea7u54c1u8ba2u5355u6570u636e
  const { data: productOrders } = await supabase
    .from('recharge_orders')
    .select(`
      product_id,
      amount,
      recharge_products:product_id (face_value)
    `)
    .gte('create_time', startDate)
    .lte('create_time', endDate);
  
  // u6309u4ea7u54c1u5206u7ec4u7edfu8ba1
  const productStats = new Map<string, { sales: number, orders: number, product_name: string }>();
  
  productOrders?.forEach(order => {
    const product_id = order.product_id;
    if (!product_id) return;
    
    if (!productStats.has(product_id)) {
      productStats.set(product_id, {
        sales: 0,
        orders: 0,
        // @ts-ignore - Supabase u53efu80fdu8fd4u56deu7684u5d4cu5957u7ed3u6784
        product_name: `${order.recharge_products?.face_value || ''}u5143u5145u503c`
      });
    }
    
    const current = productStats.get(product_id)!;
    productStats.set(product_id, {
      ...current,
      sales: current.sales + (order.amount || 0),
      orders: current.orders + 1
    });
  });
  
  // u8f6cu6362u4e3au6570u7ec4u5e76u6309u9500u552eu989du6392u5e8f
  const topProducts = Array.from(productStats.entries())
    .map(([product_id, stats]) => ({
      product_id,
      product_name: stats.product_name,
      sales: stats.sales,
      orders: stats.orders
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
  
  return { topProducts };
};

/**
 * u83b7u53d6u9500u552eu8d8bu52bfu6570u636e
 */
const fetchSalesTrend = async (startDate: string, endDate: string) => {
  // u83b7u53d6u65f6u95f4u8303u56f4u5185u7684u6240u6709u8ba2u5355
  const { data: orders } = await supabase
    .from('recharge_orders')
    .select('amount, create_time')
    .gte('create_time', startDate)
    .lte('create_time', endDate)
    .order('create_time', { ascending: true });
  
  if (!orders || orders.length === 0) {
    return [];
  }
  
  // u8ba1u7b97u65e5u671fu95f4u9694u548cu66f4u65b0u9891u7387
  const startDateTime = new Date(startDate).getTime();
  const endDateTime = new Date(endDate).getTime();
  const timeRange = endDateTime - startDateTime;
  
  let interval = 'day';
  // u8d85u8fc7u4e00u4e2au6708u4f7fu7528u5468u6c47u603buff0cu8d85u8fc7u4e09u4e2au6708u4f7fu7528u6708u6c47u603b
  if (timeRange > 7776000000) { // 90 u5929
    interval = 'month';
  } else if (timeRange > 2592000000) { // 30 u5929
    interval = 'week';
  }
  
  // u6309u65e5u671fu5206u7ec4
  const salesByDate = new Map<string, { sales: number, orders: number }>();
  
  orders.forEach(order => {
    if (!order.create_time) return;
    
    let dateKey = '';
    const orderDate = new Date(order.create_time);
    
    if (interval === 'day') {
      dateKey = orderDate.toISOString().split('T')[0];
    } else if (interval === 'week') {
      // u83b7u53d6u6240u5c5eu5468u7684u5468u4e00u65e5u671f
      const day = orderDate.getDay() || 7;
      const mondayDate = new Date(orderDate.getTime() - (day - 1) * 86400000);
      dateKey = mondayDate.toISOString().split('T')[0];
    } else { // month
      dateKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!salesByDate.has(dateKey)) {
      salesByDate.set(dateKey, { sales: 0, orders: 0 });
    }
    
    const current = salesByDate.get(dateKey)!;
    salesByDate.set(dateKey, {
      sales: current.sales + (order.amount || 0),
      orders: current.orders + 1
    });
  });
  
  // u5c06Mapu8f6cu6362u4e3au6570u7ec4u5e76u6309u65e5u671fu6392u5e8f
  return Array.from(salesByDate.entries())
    .map(([date, data]) => ({
      date,
      sales: data.sales,
      orders: data.orders
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
