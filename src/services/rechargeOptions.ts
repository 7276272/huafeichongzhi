
import { RechargeOption, CarrierType, RechargeOrder } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { generateOrderId } from "./carrierDetection";

// 默认汇率，真实环境应该从API获取或配置
const DEFAULT_EXCHANGE_RATE = 7.2; // 1 USDT = 7.2 RMB

// Default recharge options if no custom ones are defined
const defaultRechargeOptions: RechargeOption[] = [
  { value: 30, label: "¥30" },
  { value: 50, label: "¥50" },
  { value: 100, label: "¥100", discount: 2 },
  { value: 200, label: "¥200", discount: 5 },
  { value: 300, label: "¥300", discount: 8 },
  { value: 500, label: "¥500", discount: 15 },
];

// Get recharge options from the database or use defaults
export const getRechargeOptions = async (): Promise<RechargeOption[]> => {
  try {
    // Try to fetch recharge products from the database
    const { data: products, error } = await supabase
      .from('recharge_products')
      .select('*')
      .eq('is_active', true)
      .order('value', { ascending: true });
    
    // If there's an error or no data, use default options
    if (error || !products || products.length === 0) {
      return defaultRechargeOptions;
    }
    
    // Map products to RechargeOption format
    return products.map(product => ({
      value: product.value,
      label: `¥${product.value}`,
      discount: product.discount
    }));
  } catch (error) {
    console.error("Error fetching recharge options:", error);
    return defaultRechargeOptions;
  }
};

// Process phone recharge
export interface RechargeParams {
  phoneNumber: string;
  amount: number;
  carrier: CarrierType;
  userId?: string;
  // 新增参数
  name?: string;           // 充值人姓名（选填）
  isBatch?: boolean;       // 是否批量充值
  batchCount?: number;     // 批量充值数量
}

// Create a recharge order
export const rechargePhone = async (params: RechargeParams): Promise<RechargeOrder> => {
  try {
    const orderId = generateOrderId();
    
    const { data, error } = await supabase
      .from('recharge_orders')
      .insert({
        order_id: orderId,
        phone_number: params.phoneNumber,
        amount: params.amount,
        carrier: params.carrier,
        status: 'pending',
        user_id: params.userId,
        // 新增字段
        name: params.name,
        is_batch: params.isBatch || false,
        batch_count: params.batchCount || 1
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // If user has a wallet, reduce the balance
    if (params.userId) {
      // 如果是批量充值，扣除的金额为单价乘以数量
      const totalRmbAmount = params.isBatch && params.batchCount ? params.amount * params.batchCount : params.amount;

      // 获取系统汇率设置 - 实际应该从settings表获取当前汇率
      let exchangeRate = DEFAULT_EXCHANGE_RATE;
      try {
        const { data: rateSetting } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'exchange_rate')
          .single();
          
        if (rateSetting && rateSetting.value) {
          exchangeRate = parseFloat(rateSetting.value);
        }
      } catch (error) {
        console.log('使用默认汇率:', DEFAULT_EXCHANGE_RATE);
        // 如果获取汇率失败，使用默认值
      }
      
      // 计算需要扣除的USDT金额
      const usdtAmount = +(totalRmbAmount / exchangeRate).toFixed(2);
      console.log(`扣款计算: ${totalRmbAmount} RMB 等于 ${usdtAmount} USDT (汇率: ${exchangeRate})`);
      
      // 获取钱包余额并检查是否足够
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('id, balance')
        .eq('user_id', params.userId)
        .single();
      
      // 确保钱包存在且余额充足
      if (!wallet) {
        throw new Error("未找到钱包信息，请联系客服");
      }
      
      // 余额不足时抛出错误 - 比较USDT金额
      if (wallet.balance < usdtAmount) {
        throw new Error(`钱包余额不足，需要 ${usdtAmount} USDT，当前余额 ${wallet.balance} USDT`);
      }
      
      // 扣除USDT余额
      await supabase
        .from('user_wallets')
        .update({ 
          balance: wallet.balance - usdtAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);
      
      console.log(`扣款成功: ${usdtAmount} USDT (${totalRmbAmount} RMB)`);
      
    }
    
    // 将返回的数据转换为RechargeOrder类型
    return {
      ...data,
      carrier: data.carrier as CarrierType,
      status: data.status as "pending" | "completed" | "failed"
    };
  } catch (error) {
    console.error("Error submitting recharge:", error);
    throw new Error("提交充值请求失败，请稍后重试");
  }
};

// Export default options for fallback
export const rechargeOptions = defaultRechargeOptions;
