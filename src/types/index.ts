export type CarrierType = "中国移动" | "中国联通" | "中国电信";

export type RechargeOrder = {
  id?: string;
  order_id: string;
  phone_number: string;
  amount: number;
  carrier: CarrierType;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  name?: string;
  is_batch?: boolean;
  batch_count?: number;
  balance?: number;
  province?: string;
  city?: string;
  original_carrier?: string;
  user_id?: string; // 用户ID
  processed_by?: string; // 处理该订单的代理ID
  proof_image?: string; // 充值凭证图片URL
};

export interface User {
  id: string;
  email: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_admin?: boolean;
  admin_permissions?: string[];
  referred_by?: string; // 推荐人的代理ID
}

// Admin user type specifically for the admin_users table
export type AdminUser = {
  id: string;
  email: string;
  is_admin: boolean;
  admin_permissions: string[];
  created_at: string;
  updated_at: string;
  sql_script?: string; // SQL脚本用于手动添加管理员
  password?: string; // 临时存储密码用于前端展示
};

export type DashboardStats = {
  totalRecharges: number;
  pendingRecharges: number;
  completedRecharges: number;
  failedRecharges: number;
  totalAmount: number;
};

export type RechargeOption = {
  id?: string;
  value: number;
  label: string;
  name?: string;
  businessType?: string;
  discount?: number;
};

// New types for business management
export type BusinessType = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RechargeProduct = {
  id: string;
  business_type_id: string;
  name: string;
  value: number;
  discount?: number;
  exchange_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// New types for finance management
export type PaymentAddressType = "TRC20" | "ERC20";

export type PaymentAddress = {
  id: string;
  type: PaymentAddressType;
  address: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type TransactionType = "deposit" | "withdrawal" | "adjustment";
export type TransactionStatus = "pending" | "completed" | "rejected";

export type WalletTransaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  transaction_hash?: string;
  network?: PaymentAddressType;
  reference_id?: string;
  note?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  user_email?: string; // For display purposes
};

export type UserWallet = {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
  user_email?: string; // For display purposes
};

// Add a new type for wallet recharge requests
export type WalletRechargeRequest = {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "completed" | "rejected";
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  user_email?: string; // For display purposes
};

// Agent user type
export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  commission_rate: number;
  status: 'active' | 'inactive';
  balance: number;
  total_commission: number;
  total_orders: number;
  level: number;
  invite_code: string;
  referral_count: number;
  created_at: string;
  updated_at?: string;
  parent_agent_id?: string;
  wallet_address?: string;
  wallet_type?: 'trc20' | 'erc20';
  
  // USDT相关
  usdt_balance?: number;      // USDT余额
  exchange_rate?: number;     // 汇率: 1 USDT = ? RMB
  
  // 订单处理相关
  processing_orders_count?: number; // 处理中订单数量
  completed_orders_count?: number; // 完成的订单数量
  
  // 今日完成订单
  today_orders_amount?: number;        // 今日订单金额
  today_completed_orders_count?: number; // 今日完成订单笔数
  
  // 昨日完成订单
  yesterday_orders_amount?: number;        // 昨日订单金额
  yesterday_completed_orders_count?: number; // 昨日完成订单笔数
  
  // 历史完成订单
  total_orders_amount?: number;        // 历史订单总金额
  total_completed_orders_count?: number; // 历史完成订单总笔数
  
  // 取消订单
  today_canceled_orders_count?: number;     // 今日取消订单笔数
  yesterday_canceled_orders_count?: number;  // 昨日取消订单笔数
  total_canceled_orders_count?: number;      // 历史取消订单笔数
  
  // 提现相关
  today_withdrawal_amount?: number;     // 今日提现金额
  yesterday_withdrawal_amount?: number;  // 昨日提现金额
  total_withdrawal_amount?: number;      // 历史提现总金额
  
  // 额外统计信息
  agent_line_count?: number;           // 代理线数据数量
  is_online?: boolean;                // 在线状态
  referral_code?: string;             // 唯一推广代码
  referral_link?: string;             // 推广链接
  referral_amount?: number;           // 推广充值总金额
  referral_commission?: number;       // 推广佣金总额
}

// Agent transaction record
export type AgentTransaction = {
  id: string;
  agent_id: string;
  amount: number;
  type: "commission" | "withdrawal" | "adjustment";
  status: "pending" | "completed" | "rejected";
  reference_id?: string; // u5173u8054u8ba2u5355u7f16u53f7u7b49
  description?: string;
  created_at: string;
  updated_at: string;
  agent_name?: string; // For display purposes
};

// Agent Referral System Types
export type AgentReferral = {
  id: string;
  agent_id: string;
  referral_code: string;
  referred_user_id: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type ReferralStats = {
  total_referrals: number;
  active_referrals: number;
  total_recharge_amount: number;
  total_commission_earned: number;
  total_commission_withdrawn: number;
  pending_commission: number;
  referral_user_count: number;
};

export type SubAgentStats = {
  user_id: string;
  user_email: string;
  recharge_count: number;
  recharge_amount: number;
  commission_generated: number;
  created_at: string;
  last_activity: string;
};

// 代理提现记录
 export type AgentWithdrawal = {
  id: string;
  agent_id: string;
  amount: number;
  status: "pending" | "completed" | "rejected";
  transaction_hash?: string;
  wallet_address: string;
  wallet_type: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  admin_notes?: string;
};
