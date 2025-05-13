
import { RechargeOrder } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { queryPhoneInfo } from "./phoneService";
import { getOrderById } from "./orderManagement";

// 刷新订单的手机号码信息
export const refreshOrderPhoneInfo = async (orderId: string): Promise<RechargeOrder | null> => {
  try {
    // 首先获取订单
    const order = await getOrderById(orderId);
    
    if (!order) {
      console.error('找不到订单:', orderId);
      return null;
    }
    
    // 查询最新的手机号码信息
    const phoneInfo = await queryPhoneInfo(order.phone_number);
    
    if (!phoneInfo) {
      console.error('无法获取手机号码信息:', order.phone_number);
      return null;
    }
    
    // 更新订单信息 - 确保所有字段都在数据库中存在
    const { data, error } = await supabase
      .from('recharge_orders')
      .update({
        balance: phoneInfo.balance,
        province: phoneInfo.province,
        city: phoneInfo.city,
        carrier: phoneInfo.carrier,
        original_carrier: phoneInfo.originalCarrier
      })
      .eq('order_id', orderId)
      .select()
      .single();
    
    if (error) {
      console.error('更新订单信息失败:', error);
      return null;
    }
    
    return data as RechargeOrder;
  } catch (error) {
    console.error('刷新订单手机信息失败:', error);
    return null;
  }
};
