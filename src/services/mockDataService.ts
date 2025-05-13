import { 
  DataPanelStats, 
  TimeRangeType
} from "@/types/dataModels";

/**
 * 提供模拟数据，用于API调用失败时作为备用
 */
export const getMockDataPanelStats = (timeRange: TimeRangeType): DataPanelStats => {
  // 根据不同的时间范围提供不同的模拟数据
  const baseData: DataPanelStats = {
    // 用户统计
    totalUsers: 5280,
    newUsers: 124,
    activeUsers: 1350,
    
    // 订单统计
    totalOrders: 3250,
    completedOrders: 2940,
    failedOrders: 85,
    pendingOrders: 225,
    
    // 财务统计
    totalSales: 158600,
    totalRefunds: 3200,
    netRevenue: 155400,
    grossProfit: 42800,
    
    // 代理统计
    totalAgents: 180,
    activeAgents: 120,
    agentRevenue: 68500,
    agentCommission: 3425,
    
    // 产品统计
    topProducts: [
      { product_id: "1", product_name: "100元充值", sales: 65000, orders: 650 },
      { product_id: "2", product_name: "50元充值", sales: 42500, orders: 850 },
      { product_id: "3", product_name: "200元充值", sales: 24000, orders: 120 },
      { product_id: "4", product_name: "20元充值", sales: 12000, orders: 600 },
      { product_id: "5", product_name: "500元充值", sales: 10000, orders: 20 }
    ],
    
    // 支付方式统计
    paymentMethodStats: [
      { method: "alipay", amount: 85600, count: 1280 },
      { method: "wechat", amount: 65200, count: 980 },
      { method: "bank_transfer", amount: 6800, count: 22 },
      { method: "credit_card", amount: 1000, count: 10 }
    ],
    
    // 运营商统计
    carrierStats: [
      { carrier: "china_mobile", amount: 95200, count: 1450 },
      { carrier: "china_unicom", amount: 42400, count: 640 },
      { carrier: "china_telecom", amount: 21000, count: 320 }
    ],
    
    // 销售趋势
    salesTrend: [
      { date: "2025-05-02", sales: 9800, orders: 150 },
      { date: "2025-05-03", sales: 12500, orders: 185 },
      { date: "2025-05-04", sales: 8200, orders: 120 },
      { date: "2025-05-05", sales: 14300, orders: 210 },
      { date: "2025-05-06", sales: 16800, orders: 245 },
      { date: "2025-05-07", sales: 15200, orders: 220 },
      { date: "2025-05-08", sales: 18600, orders: 270 },
      { date: "2025-05-09", sales: 10200, orders: 160 }
    ]
  };

  // 根据不同时间范围适当调整数据
  if (timeRange === 'week') {
    return {
      ...baseData,
      totalOrders: baseData.totalOrders * 3,
      totalSales: baseData.totalSales * 3,
      netRevenue: baseData.netRevenue * 3
    };
  } else if (timeRange === 'month') {
    return {
      ...baseData,
      totalOrders: baseData.totalOrders * 8,
      totalSales: baseData.totalSales * 8,
      netRevenue: baseData.netRevenue * 8
    };
  } else if (timeRange === 'last_month') {
    return {
      ...baseData,
      totalOrders: baseData.totalOrders * 7,
      totalSales: baseData.totalSales * 7,
      netRevenue: baseData.netRevenue * 7,
      newUsers: baseData.newUsers * 0.9, // 上月新增用户略少
    };
  }

  return baseData; // 默认返回基础数据（今日）
};
