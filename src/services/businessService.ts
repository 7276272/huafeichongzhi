
import { supabase } from "@/integrations/supabase/client";
import { BusinessType, RechargeProduct } from "@/types";
import { ProductWithAmountOptions } from "@/types/productTypes";
import { toast } from "@/hooks/use-toast";

// Get all business types
export const getBusinessTypes = async (): Promise<BusinessType[]> => {
  try {
    const { data, error } = await supabase
      .from('business_types')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching business types:", error);
    toast({
      title: "获取业务类型失败",
      description: "无法获取业务类型列表，请稍后重试",
      variant: "destructive",
    });
    return [];
  }
};

// Create a new business type
export const createBusinessType = async (businessType: Partial<BusinessType>): Promise<BusinessType> => {
  try {
    const { data, error } = await supabase
      .from('business_types')
      .insert({
        name: businessType.name,
        description: businessType.description,
        is_active: businessType.is_active !== undefined ? businessType.is_active : true
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error creating business type:", error);
    toast({
      title: "创建业务类型失败",
      description: "无法创建新业务类型，请稍后重试",
      variant: "destructive",
    });
    throw error;
  }
};

// Update a business type
export const updateBusinessType = async (id: string, businessType: Partial<BusinessType>): Promise<BusinessType> => {
  try {
    const { data, error } = await supabase
      .from('business_types')
      .update({
        name: businessType.name,
        description: businessType.description,
        is_active: businessType.is_active
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error updating business type:", error);
    toast({
      title: "更新业务类型失败",
      description: "无法更新业务类型，请稍后重试",
      variant: "destructive",
    });
    throw error;
  }
};

// Toggle business type status (active/inactive)
export const toggleBusinessTypeStatus = async (id: string, isActive: boolean): Promise<BusinessType> => {
  try {
    const { data, error } = await supabase
      .from('business_types')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error toggling business type status:", error);
    toast({
      title: "更新状态失败",
      description: "无法更新业务类型状态，请稍后重试",
      variant: "destructive",
    });
    throw error;
  }
};

// Get all recharge products
export const getRechargeProducts = async (): Promise<RechargeProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('recharge_products')
      .select('*')
      .order('value', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching recharge products:", error);
    toast({
      title: "获取充值产品失败",
      description: "无法获取充值产品列表，请稍后重试",
      variant: "destructive",
    });
    return [];
  }
};

// Create a new recharge product
export const createRechargeProduct = async (
  businessTypeId: string,
  name: string,
  productData: any
): Promise<RechargeProduct> => {
  try {
    // 提取基本字段
    const { data, error } = await supabase
      .from('recharge_products')
      .insert({
        business_type_id: businessTypeId,
        name,
        value: productData.value,
        discount: productData.discount,
        exchange_rate: productData.exchange_rate || 1,
        metadata: productData.metadata || {}
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // 为前端使用添加amount_options字段
    if (data && productData.metadata?.amount_options) {
      (data as any).amount_options = productData.metadata.amount_options;
    }
    
    return data;
  } catch (error) {
    console.error("Error creating recharge product:", error);
    toast({
      title: "创建充值产品失败",
      description: "无法创建新充值产品，请稍后重试",
      variant: "destructive",
    });
    throw error;
  }
};

// Update a recharge product
export const updateRechargeProduct = async (id: string, product: any): Promise<RechargeProduct> => {
  try {
    // 构建更新数据对象
    const updateData: any = {
      business_type_id: product.business_type_id,
      name: product.name,
      value: product.value,
      discount: product.discount,
      exchange_rate: product.exchange_rate
    };
    
    // 如果有metadata字段，也进行更新
    if (product.metadata) {
      updateData.metadata = product.metadata;
    }
    
    const { data, error } = await supabase
      .from('recharge_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // 为前端使用添加amount_options字段
    if (data && product.metadata?.amount_options) {
      (data as any).amount_options = product.metadata.amount_options;
    }
    
    return data;
  } catch (error) {
    console.error("Error updating recharge product:", error);
    toast({
      title: "更新充值产品失败",
      description: "无法更新充值产品，请稍后重试",
      variant: "destructive",
    });
    throw error;
  }
};

// Toggle recharge product status (active/inactive)
export const toggleRechargeProductStatus = async (id: string, isActive: boolean): Promise<RechargeProduct> => {
  try {
    const { data, error } = await supabase
      .from('recharge_products')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error toggling product status:", error);
    toast({
      title: "更新状态失败",
      description: "无法更新充值产品状态，请稍后重试",
      variant: "destructive",
    });
    throw error;
  }
};

// Get products for a specific business type
export const getProductsForBusinessType = async (businessTypeId: string): Promise<RechargeProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('recharge_products')
      .select('*')
      .eq('business_type_id', businessTypeId)
      .order('value', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching products for business type:", error);
    toast({
      title: "获取产品失败",
      description: "无法获取产品列表，请稍后重试",
      variant: "destructive",
    });
    return [];
  }
};
