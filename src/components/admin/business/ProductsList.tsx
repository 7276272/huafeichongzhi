
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BusinessType, RechargeProduct } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Edit } from 'lucide-react';
import { toggleRechargeProductStatus } from '@/services/businessService';
import ProductDialog from './ProductDialog';

interface ProductsListProps {
  products: RechargeProduct[];
  businessTypes: BusinessType[];
  onProductsChange: (products: RechargeProduct[]) => void;
}

const ProductsList = ({ 
  products, 
  businessTypes,
  onProductsChange 
}: ProductsListProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<RechargeProduct | null>(null);

  const handleEdit = (product: RechargeProduct) => {
    setCurrentProduct(product);
    setIsDialogOpen(true);
  };

  const handleStatusToggle = async (id: string, isActive: boolean) => {
    try {
      const updatedProduct = await toggleRechargeProductStatus(id, isActive);
      
      // Update the list with the modified product
      const updatedList = products.map(product => 
        product.id === id ? updatedProduct : product
      );
      
      onProductsChange(updatedList);
      
      toast({
        title: isActive ? "充值产品已启用" : "充值产品已禁用",
        description: `充值产品状态已成功${isActive ? '启用' : '禁用'}`,
      });
    } catch (error) {
      console.error("Error toggling status:", error);
      toast({
        variant: "destructive",
        title: "操作失败",
        description: (error as Error).message || "无法更改充值产品状态",
      });
    }
  };
  
  // Get business type name by ID
  const getBusinessTypeName = (id: string): string => {
    const businessType = businessTypes.find(type => type.id === id);
    return businessType?.name || "-";
  };

  const columns = [
    {
      accessorKey: "business_type_id",
      header: "业务类型",
      cell: ({ row }: any) => {
        if (!row.business_type_id) return "-";
        return getBusinessTypeName(row.business_type_id);
      },
    },
    {
      accessorKey: "name",
      header: "产品名称",
      cell: ({ row }: any) => {
        return row.name || "-";
      }
    },
    {
      accessorKey: "value",
      header: "面值",
      cell: ({ row }: any) => {
        if (row.value === undefined) return "-";
        return `¥${row.value}`;
      },
    },
    {
      accessorKey: "discount",
      header: "折扣",
      cell: ({ row }: any) => {
        const discount = row.discount;
        return discount ? `${discount}%` : "-";
      },
    },
    {
      accessorKey: "exchange_rate",
      header: "汇率",
      cell: ({ row }: any) => {
        const rate = row.exchange_rate;
        return rate ? rate : "-";
      },
    },
    {
      accessorKey: "is_active",
      header: "状态",
      cell: ({ row }: any) => {
        if (row.id === undefined) return null;
        return (
          <Switch
            checked={row.is_active || false}
            onCheckedChange={(checked) => handleStatusToggle(row.id, checked)}
          />
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        if (!row) return null;
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">编辑</span>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">充值产品列表</h3>
        <Button 
          onClick={() => {
            setCurrentProduct(null);
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          添加充值产品
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={products}
      />
      
      {isDialogOpen && (
        <ProductDialog
          product={currentProduct}
          businessTypes={businessTypes}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onProductsChange={onProductsChange}
          products={products}
        />
      )}
    </div>
  );
};

export default ProductsList;
