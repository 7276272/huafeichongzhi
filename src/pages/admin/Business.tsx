
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getBusinessTypes, getRechargeProducts } from "@/services/businessService";
import { LoadingSpinner } from "@/components/ui";
import { BusinessType, RechargeProduct } from "@/types";
import BusinessTypeList from "@/components/admin/business/BusinessTypeList";
import ProductsList from "@/components/admin/business/ProductsList";

const Business = () => {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [rechargeProducts, setRechargeProducts] = useState<RechargeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch business types and recharge products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch business types
        const types = await getBusinessTypes();
        setBusinessTypes(types);
        
        // Fetch recharge products
        const products = await getRechargeProducts();
        setRechargeProducts(products);
      } catch (error) {
        console.error("Error fetching business data:", error);
        toast({
          variant: "destructive",
          title: "获取数据失败",
          description: "无法加载业务类型和充值产品数据",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">业务管理</h1>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="medium" text="" />
          </div>
        ) : (
          <Tabs defaultValue="businessTypes" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="businessTypes">业务类型</TabsTrigger>
              <TabsTrigger value="products">充值产品</TabsTrigger>
            </TabsList>
            
            <TabsContent value="businessTypes">
              <BusinessTypeList 
                businessTypes={businessTypes}
                onBusinessTypesChange={setBusinessTypes}
              />
            </TabsContent>
            
            <TabsContent value="products">
              <ProductsList 
                products={rechargeProducts}
                businessTypes={businessTypes}
                onProductsChange={setRechargeProducts}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
};

export default Business;
