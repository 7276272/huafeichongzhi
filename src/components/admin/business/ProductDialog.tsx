
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BusinessType, RechargeProduct } from '@/types';
import { AmountOption, ProductWithAmountOptions } from '@/types/productTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createRechargeProduct, updateRechargeProduct } from '@/services/businessService';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProductDialogProps {
  product: ProductWithAmountOptions | null; // null for create, ProductWithAmountOptions for update
  businessTypes: BusinessType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductsChange: (products: ProductWithAmountOptions[]) => void;
  products?: ProductWithAmountOptions[]; // Optional existing products for updates
}

const ProductDialog = ({
  product,
  businessTypes,
  open,
  onOpenChange,
  onProductsChange,
  products = [],
}: ProductDialogProps) => {
  const { toast } = useToast();
  const [businessTypeId, setBusinessTypeId] = useState(product?.business_type_id || '');
  const [name, setName] = useState(product?.name || '');
  
  // 初始化多金额选项
  const initializeAmountOptions = () => {
    if (product) {
      // 如果产品有自定义金额选项，使用它们
      if (product.amount_options && Array.isArray(product.amount_options) && product.amount_options.length > 0) {
        return product.amount_options.map(opt => ({
          value: opt.value.toString(),
          discount: opt.discount ? opt.discount.toString() : ''
        }));
      } 
      // 否则使用主要金额
      return [{ 
        value: product.value.toString(), 
        discount: product.discount ? product.discount.toString() : '' 
      }];
    }
    // 新产品默认一个空的金额选项
    return [{ value: '', discount: '' }];
  };
  
  const [amountOptions, setAmountOptions] = useState<{value: string; discount?: string}[]>(initializeAmountOptions());
  const [exchangeRate, setExchangeRate] = useState(product?.exchange_rate?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 只显示激活的业务类型
  const activeBusinessTypes = businessTypes.filter(type => type.is_active);

  // 如果是创建新产品且有可用业务类型，设置默认业务类型
  useEffect(() => {
    if (!product && activeBusinessTypes.length > 0 && !businessTypeId) {
      setBusinessTypeId(activeBusinessTypes[0].id);
    }
  }, [activeBusinessTypes, businessTypeId, product]);

  const isUpdate = !!product;

  // 添加新的金额选项
  const addAmountOption = () => {
    setAmountOptions([...amountOptions, { value: '', discount: '' }]);
  };

  // 删除金额选项
  const removeAmountOption = (index: number) => {
    if (amountOptions.length <= 1) {
      toast({
        variant: "destructive",
        title: "至少需要一个金额选项",
        description: "充值产品必须至少有一个金额选项"
      });
      return;
    }
    
    const newOptions = [...amountOptions];
    newOptions.splice(index, 1);
    setAmountOptions(newOptions);
  };

  // 更新金额选项值
  const updateAmountOption = (index: number, field: 'value' | 'discount', value: string) => {
    const newOptions = [...amountOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setAmountOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessTypeId) {
      toast({
        variant: "destructive",
        title: "请选择业务类型",
        description: "必须选择一个业务类型",
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "请输入产品名称",
        description: "产品名称不能为空",
      });
      return;
    }
    
    // 验证所有金额选项
    let hasError = false;
    amountOptions.forEach((option, index) => {
      if (!option.value.trim() || isNaN(Number(option.value)) || Number(option.value) <= 0) {
        toast({
          variant: "destructive",
          title: `金额选项 ${index + 1} 无效`,
          description: "请输入有效的面值",
        });
        hasError = true;
      }
      
      // 验证折扣（如果有）
      if (option.discount && (isNaN(Number(option.discount)) || Number(option.discount) < 0 || Number(option.discount) > 100)) {
        toast({
          variant: "destructive",
          title: `金额选项 ${index + 1} 折扣无效`,
          description: "折扣应该在0-100之间",
        });
        hasError = true;
      }
    });
    
    if (hasError) return;
    
    // 验证汇率（如果有）
    if (exchangeRate && (isNaN(Number(exchangeRate)) || Number(exchangeRate) <= 0)) {
      toast({
        variant: "destructive",
        title: "无效的汇率",
        description: "请输入有效的汇率",
      });
      return;
    }
    setIsSubmitting(true);
    
    try {
      // 使用第一个金额选项作为主要面值（兼容现有数据结构）
      const mainOption = amountOptions[0];
      
      // 处理所有金额选项
      const parsedAmountOptions = amountOptions.map(opt => ({
        value: Number(opt.value),
        discount: opt.discount && opt.discount.trim() ? Number(opt.discount) : undefined
      }));
      
      if (isUpdate && product) {
        // 更新现有产品
        const updatedData = {
          business_type_id: businessTypeId,
          name,
          value: Number(mainOption.value),
          discount: mainOption.discount && mainOption.discount.trim() ? Number(mainOption.discount) : undefined,
          exchange_rate: exchangeRate && exchangeRate.trim() ? Number(exchangeRate) : undefined,
          // 存储所有金额选项作为元数据
          metadata: {
            amount_options: parsedAmountOptions
          }
        };
        
        const updatedProduct = await updateRechargeProduct(product.id, updatedData);
        
        // 确保返回的产品对象也有amount_options属性用于前端显示
        const enhancedProduct = updatedProduct as ProductWithAmountOptions;
        enhancedProduct.amount_options = parsedAmountOptions;
        
        // 更新产品列表
        const updatedList = products.map(p => 
          p.id === enhancedProduct.id ? enhancedProduct : p
        );
        
        onProductsChange(updatedList);
        
        toast({
          title: "充值产品已更新",
          description: `充值产品「${name}」已成功更新`,
        });
      } else {
        // 创建新产品
        const productData = {
          business_type_id: businessTypeId,
          name,
          value: Number(mainOption.value),
          discount: mainOption.discount && mainOption.discount.trim() ? Number(mainOption.discount) : undefined,
          exchange_rate: exchangeRate && exchangeRate.trim() ? Number(exchangeRate) : undefined,
          metadata: {
            amount_options: parsedAmountOptions
          }
        };
        
        const newProduct = await createRechargeProduct(businessTypeId, name, productData);
        
        // 确保返回的产品对象也有amount_options属性用于前端显示
        const enhancedProduct = newProduct as ProductWithAmountOptions;
        enhancedProduct.amount_options = parsedAmountOptions;
        
        // 添加新产品到列表
        onProductsChange([...products, enhancedProduct]);
        
        toast({
          title: "充值产品已创建",
          description: `充值产品「${name}」已成功创建`,
        });
      }
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "保存失败",
        description: (error as Error).message || "无法保存充值产品",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "编辑充值产品" : "添加充值产品"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="businessType">业务类型</Label>
            <Select 
              value={businessTypeId} 
              onValueChange={setBusinessTypeId}
              disabled={isSubmitting || activeBusinessTypes.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择业务类型" />
              </SelectTrigger>
              <SelectContent>
                {activeBusinessTypes.length === 0 ? (
                  <SelectItem value="none" disabled>
                    没有可用的业务类型
                  </SelectItem>
                ) : (
                  activeBusinessTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">产品名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入产品名称"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>面值设置</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addAmountOption} 
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" /> 添加金额选项
              </Button>
            </div>
            
            <Separator className="my-2" />
            
            {amountOptions.map((option, index) => (
              <div key={index} className="grid grid-cols-7 gap-2 items-end">
                <div className="col-span-3 space-y-1">
                  <Label htmlFor={`value-${index}`}>面值 (元)</Label>
                  <Input
                    id={`value-${index}`}
                    value={option.value}
                    onChange={(e) => updateAmountOption(index, 'value', e.target.value)}
                    placeholder="输入面值"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="col-span-3 space-y-1">
                  <Label htmlFor={`discount-${index}`}>折扣 (%) (可选)</Label>
                  <Input
                    id={`discount-${index}`}
                    value={option.discount}
                    onChange={(e) => updateAmountOption(index, 'discount', e.target.value)}
                    placeholder="例如: 95"
                    disabled={isSubmitting}
                  />
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAmountOption(index)}
                  disabled={isSubmitting || amountOptions.length <= 1}
                  className="ml-auto mb-1"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="exchangeRate">汇率 (可选)</Label>
            <Input
              id="exchangeRate"
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="例如: 7.2"
              disabled={isSubmitting}
              min="0"
              step="0.1"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || activeBusinessTypes.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
