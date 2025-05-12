// 用户账户数据模型
export interface UserAccount {
  id: string;            // 用户唯一ID
  username: string;      // 登录账号
  password_hash: string; // 加密密码
  phone: string;         // 绑定手机号
  email: string;         // 绑定邮箱
  balance: number;       // 账户余额
  status: 'active' | 'frozen' | 'deleted'; // 账户状态(正常/冻结/注销)
  created_at: string;    // 注册时间
  last_login: string;    // 最后登录时间
}

// 充值产品数据模型
export interface RechargeProduct {
  product_id: string;    // 产品ID
  carrier: 'mobile' | 'unicom' | 'telecom'; // 运营商(移动/联通/电信)
  face_value: number;    // 金额
  sell_price: number;    // 销售价格人民币/USDT
  cost_price: number;    // 成本价格人民币/USDT
  discount: number;      // 折扣率
  product_type: 'call' | 'data' | 'package' | 'other'; // 类型(话费/流量/套餐/其他充值类型)
  validity_period: string; // 有效期
  status: 'active' | 'inactive'; // 上架/下架
  description: string;   // 产品描述
}

// 订单交易数据模型
export interface OrderTransaction {
  order_id: string;      // 订单号
  user_id: string;       // 用户ID
  product_id: string;    // 产品ID
  phone_number: string;  // 充值手机号
  amount: number;        // 充值金额人民币/USDT
  payment_amount: number;// 实际支付金额人民币/USDT
  payment_method: 'wallet' | 'alipay' | 'wechat' | 'bank' | 'crypto'; // 支付方式
  order_status: 'pending' | 'processing' | 'completed' | 'failed'; // 状态(待支付/充值中/成功/失败)
  create_time: string;   // 下单时间
  complete_time: string; // 完成时间
  processed_by?: string; // 处理人(代理ID)
}

// 财务结算数据模型
export interface FinancialTransaction {
  transaction_id: string; // 交易ID
  user_id: string;       // 关联用户
  amount: number;        // 变动金额
  balance: number;       // 变动后余额
  transaction_type: 'recharge' | 'consumption' | 'refund' | 'withdrawal'; // 类型(充值/消费/退款/提现)
  related_order: string;  // 关联订单
  remark: string;        // 备注
  create_time: string;   // 创建时间
}

// 系统管理数据模型
export interface AdminUser {
  admin_id: string;      // 管理员ID
  role: 'super_admin' | 'finance' | 'customer_service'; // 角色(超级管理员/财务/客服)
  permissions: any;      // 权限列表
  last_login_ip: string; // 最后登录IP
  login_history: any;    // 登录历史
}

// 风控与日志数据模型
export interface OperationLog {
  log_id: string;        // 日志ID
  user_id: string;       // 操作用户
  action_type: string;   // 操作类型
  ip_address: string;    // 操作IP
  device_info: string;   // 设备信息
  action_detail: string; // 操作详情
  create_time: string;   // 操作时间
}

// API对接数据模型
export interface ApiSupplier {
  supplier_id: string;   // 供应商ID
  supplier_name: string; // 供应商名称
  api_endpoint: string;  // API地址
  api_key: string;       // API密钥
  balance: number;       // 供应商余额
  rate: number;          // 结算费率
  status: 'active' | 'inactive'; // 合作状态
}

// 代理数据模型
export interface Agent {
  agent_id: string;      // 代理ID
  name: string;          // 代理名称
  contact: string;       // 联系方式
  commission_rate: number; // 佣金比例
  total_orders: number;  // 总订单数
  total_amount: number;  // 总交易额
  balance: number;       // 账户余额（人民币）
  usdt_balance: number;  // USDT余额
  exchange_rate: number; // 汇率：1 RMB = ? USDT
  create_time: string;   // 创建时间
  status: 'active' | 'inactive'; // 状态
}

// 推广数据模型
export interface Promotion {
  promotion_id: string;  // 推广ID
  title: string;         // 推广标题
  description: string;   // 推广描述
  start_time: string;    // 开始时间
  end_time: string;      // 结束时间
  discount_rate: number; // 折扣率
  target_products: string[]; // 目标产品
  clicks: number;        // 点击次数
  conversions: number;   // 转化次数
  status: 'active' | 'inactive'; // 状态
}

// 数据统计面板相关接口
export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

export type TimeRangeType = 'today' | 'week' | 'month' | 'last_month' | 'custom';

export interface DataPanelStats {
  // 用户统计
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  
  // 订单统计
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  pendingOrders: number;
  
  // 财务统计
  totalSales: number;
  totalRefunds: number;
  netRevenue: number;
  grossProfit: number;
  
  // A总i业统计
  totalAgents: number;
  activeAgents: number;
  agentRevenue: number;
  agentCommission: number;
  
  // 产品统计
  topProducts: {
    product_id: string;
    product_name: string;
    sales: number;
    orders: number;
  }[];
  
  // 支付方式统计
  paymentMethodStats: {
    method: string;
    count: number;
    amount: number;
  }[];
  
  // 运营商统计
  carrierStats: {
    carrier: string;
    count: number;
    amount: number;
  }[];
  
  // 时间趋势
  salesTrend: {
    date: string;
    sales: number;
    orders: number;
  }[];
}
