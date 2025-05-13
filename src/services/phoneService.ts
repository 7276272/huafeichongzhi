
import { supabase } from "@/integrations/supabase/client";

// 接口响应类型定义
export interface PhoneChargeResponse {
  code: number;
  msg: string;
  data?: {
    mobile: string;
    curFee: number;
    mobile_fee: number;
    province: string;
    city: string;
    sp: string;
    pri_sp: string;
  };
  exec_time?: number;
  ip?: string;
}

// 手机号码信息
export interface PhoneInfo {
  phoneNumber: string;
  balance: number;
  province: string;
  city: string;
  carrier: string;
  originalCarrier: string;
}

// API密钥
const API_KEY = "tAooD3C5CtB31AGuW5xb8barX8";
const API_URL = "https://api.taolale.com/api/Inquiry_Phone_Charges/get";

// 将运营商名称标准化为中文
export const standardizeCarrier = (carrier: string): string => {
  const lowerCarrier = carrier.toLowerCase();
  
  if (lowerCarrier.includes("移动") || lowerCarrier.includes("mobile")) {
    return "中国移动";
  } else if (lowerCarrier.includes("电信") || lowerCarrier.includes("telecom")) {
    return "中国电信";
  } else if (lowerCarrier.includes("联通") || lowerCarrier.includes("unicom")) {
    return "中国联通";
  }
  
  // 如果是中文名称但没有包含"中国"前缀，添加前缀
  if (lowerCarrier.includes("移动")) {
    return "中国移动";
  } else if (lowerCarrier.includes("电信")) {
    return "中国电信";
  } else if (lowerCarrier.includes("联通")) {
    return "中国联通";
  }
  
  // 英文名称转换
  if (lowerCarrier.includes("china mobile") || lowerCarrier.includes("cmcc")) {
    return "中国移动";
  } else if (lowerCarrier.includes("china telecom") || lowerCarrier.includes("ctcc")) {
    return "中国电信";
  } else if (lowerCarrier.includes("china unicom") || lowerCarrier.includes("cucc")) {
    return "中国联通";
  }
  
  return carrier; // 如果无法识别，返回原始值
};

// 查询手机号码信息
export const queryPhoneInfo = async (phoneNumber: string): Promise<PhoneInfo | null> => {
  try {
    // 构建请求URL
    const url = `${API_URL}?key=${API_KEY}&mobile=${phoneNumber}`;
    
    // 发送请求
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8;'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 解析响应
    const data: PhoneChargeResponse = await response.json();
    
    if (data.code !== 200 || !data.data) {
      console.error("API返回错误:", data.msg);
      return null;
    }

    // 返回格式化后的数据
    return {
      phoneNumber,
      balance: data.data.curFee,
      province: data.data.province,
      city: data.data.city,
      carrier: standardizeCarrier(data.data.sp),
      originalCarrier: standardizeCarrier(data.data.pri_sp)
    };
  } catch (error) {
    console.error("查询手机号码信息失败:", error);
    return null;
  }
};

// 将电话信息保存到订单中
export const updateOrderWithPhoneInfo = async (orderId: string, phoneInfo: Partial<PhoneInfo>) => {
  try {
    const { error } = await supabase
      .from('recharge_orders')
      .update({
        balance: phoneInfo.balance,
        province: phoneInfo.province,
        city: phoneInfo.city,
        carrier: phoneInfo.carrier,
        original_carrier: phoneInfo.originalCarrier
      })
      .eq('order_id', orderId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("更新订单信息失败:", error);
    return false;
  }
};
