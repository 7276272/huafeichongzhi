
import React, { useState } from "react";
import { BusinessType } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import BusinessTypeDialog from "@/components/admin/business/BusinessTypeDialog";
import { toggleBusinessTypeStatus } from "@/services/businessService";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface BusinessTypeListProps {
  businessTypes: BusinessType[];
  onBusinessTypesChange: (businessTypes: BusinessType[]) => void;
}

const BusinessTypeList: React.FC<BusinessTypeListProps> = ({ 
  businessTypes, 
  onBusinessTypesChange 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const { toast } = useToast();
  
  // Format date function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  // Handle edit business type
  const handleEditBusinessType = (businessType: BusinessType) => {
    setSelectedBusinessType(businessType);
    setIsDialogOpen(true);
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const updatedType = await toggleBusinessTypeStatus(id, isActive);
      
      // Update the list with the updated business type
      const updatedList = businessTypes.map(type => 
        type.id === id ? updatedType : type
      );
      
      onBusinessTypesChange(updatedList);
      
      toast({
        title: isActive ? "业务类型已启用" : "业务类型已禁用",
        description: `业务类型状态已${isActive ? '启用' : '禁用'}`,
      });
    } catch (error) {
      console.error("Error toggling status:", error);
      toast({
        variant: "destructive",
        title: "更新状态失败",
        description: "无法更新业务类型状态，请稍后重试",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">业务类型列表</h3>
        <Button 
          onClick={() => {
            setSelectedBusinessType(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          添加业务类型
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businessTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  暂无业务类型
                </TableCell>
              </TableRow>
            ) : (
              businessTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.description || "-"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={type.is_active}
                      onCheckedChange={(checked) => handleToggleStatus(type.id, checked)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(type.created_at)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditBusinessType(type)}
                    >
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <BusinessTypeDialog
        businessType={selectedBusinessType}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onBusinessTypesChange={onBusinessTypesChange}
        businessTypes={businessTypes}
      />
    </div>
  );
};

export default BusinessTypeList;
