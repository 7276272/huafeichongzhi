
import { RechargeOrder, CarrierType } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// 订单数据库类型，包含所有数据库字段

interface OrderDatabaseRecord {
  id: string;
  order_id: string;
  phone_number: string;
  amount: number;
  carrier: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  name: string | null;
  is_batch: boolean | null;
  batch_count: number | null;
  balance: number | null;
  province: string | null;
  city: string | null;
  original_carrier: string | null;
  user_id: string | null;
  processed_by: string | null;
  proof_image: string | null;
}

// Get all orders
// 删除userId参数，因为表中没有相应列来过滤用户订单
export const getAllOrders = async (): Promise<RechargeOrder[]> => {
  try {
    // 改为const，因为查询不再被修改
    const query = supabase
      .from('recharge_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 根据数据库结构，recharge_orders表中没有user_id或customer_id列
    // 因此我们需要获取所有订单
    // TODO: 需要添加数据库级别的关联或修改表结构，方便按用户过滤
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Convert carrier and status to their proper types
    // u5e76u5c06nullu503cu8f6cu6362u4e3aundefinedu4ee5u7b26u5408RechargeOrderu7c7bu578bu5b9au4e49
    const typedData = (data || []).map(order => {
      // 处理所有可能为null的字段，转换为undefined以符合RechargeOrder类型定义
      const processedOrder = {
        ...order,
        carrier: order.carrier as CarrierType,
        status: order.status as "pending" | "completed" | "failed",
        completed_at: order.completed_at || undefined,
        province: order.province || undefined,
        city: order.city || undefined,
        balance: order.balance || undefined,
        batch_count: order.batch_count || undefined,
        name: order.name || undefined,
        is_batch: order.is_batch === null ? undefined : order.is_batch,
        original_carrier: order.original_carrier || undefined
      };
      return processedOrder;
    });
    
    return typedData;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Also export the existing getOrders function for backward compatibility
export const getOrders = getAllOrders;

// Get a single order by ID
export const getOrderById = async (orderId: string): Promise<RechargeOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('recharge_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) return null;
    
    // Cast fields to their proper types and convert null to undefined
    return {
      ...data,
      carrier: data.carrier as CarrierType,
      status: data.status as "pending" | "completed" | "failed",
      completed_at: data.completed_at || undefined,
      province: data.province || undefined,
      city: data.city || undefined,
      balance: data.balance || undefined,
      batch_count: data.batch_count || undefined,
      name: data.name || undefined,
      is_batch: data.is_batch === null ? undefined : data.is_batch,
      original_carrier: data.original_carrier || undefined
    };
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: "pending" | "completed" | "failed") => {
  try {
    // 先获取订单原始信息，用于后续可能的退款处理
    const { data: originalOrder, error: fetchError } = await supabase
      .from('recharge_orders')
      .select('*')
      .eq('order_id', orderId)
      .single() as { data: OrderDatabaseRecord | null, error: any };
    
    if (fetchError || !originalOrder) {
      console.error(`找不到订单信息 ${orderId}:`, fetchError);
      throw new Error('找不到订单信息');
    }
    
    // 更新订单状态
    const { data, error } = await supabase
      .from('recharge_orders')
      .update({ status })
      .eq('order_id', orderId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) return null;
    
    // 如果订单被标记为失败，且有用户ID，则退款到用户钱包
    if (status === 'failed' && originalOrder.user_id) {
      try {
        console.log(`正在为订单 ${orderId} 退款...`);
        
        // 计算退款金额
        const refundAmount = originalOrder.is_batch && originalOrder.batch_count
          ? originalOrder.amount * originalOrder.batch_count
          : originalOrder.amount;
        
        // 查找用户钱包
        const { data: wallet } = await supabase
          .from('user_wallets')
          .select('id, balance')
          .eq('user_id', originalOrder.user_id)
          .single();
        
        if (wallet) {
          // 更新钱包余额
          await supabase
            .from('user_wallets')
            .update({
              balance: wallet.balance + refundAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', wallet.id);
          
          console.log(`订单 ${orderId} 退款成功: ¥${refundAmount}`);
        } else {
          console.error(`无法找到用户钱包: ${originalOrder.user_id}`);
        }
      } catch (refundError) {
        console.error(`退款过程中出错:`, refundError);
        // 不中断流程，继续返回更新后的订单信息
      }
    }
    
    // Cast fields to their proper types and convert null to undefined
    return {
      ...data,
      carrier: data.carrier as CarrierType,
      status: data.status as "pending" | "completed" | "failed",
      completed_at: data.completed_at || undefined,
      province: data.province || undefined,
      city: data.city || undefined,
      balance: data.balance || undefined,
      batch_count: data.batch_count || undefined,
      name: data.name || undefined,
      is_batch: data.is_batch === null ? undefined : data.is_batch,
      original_carrier: data.original_carrier || undefined
    };
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};
