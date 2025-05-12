
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BusinessType } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createBusinessType, updateBusinessType } from '@/services/businessService';
import { Loader2 } from 'lucide-react';

interface BusinessTypeDialogProps {
  businessType: BusinessType | null; // null for create, BusinessType for update
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBusinessTypesChange: (businessTypes: BusinessType[]) => void;
  businessTypes?: BusinessType[]; // Optional existing business types for updates
}

const BusinessTypeDialog = ({
  businessType,
  open,
  onOpenChange,
  onBusinessTypesChange,
  businessTypes = [],
}: BusinessTypeDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(businessType?.name || '');
  const [description, setDescription] = useState(businessType?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUpdate = !!businessType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "请输入业务名称",
        description: "业务名称不能为空",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isUpdate && businessType) {
        const updatedBusinessType = await updateBusinessType(businessType.id, {
          name,
          description: description || undefined,
        });
        
        // Update business types list
        const updatedList = businessTypes.map(type => 
          type.id === updatedBusinessType.id ? updatedBusinessType : type
        );
        
        onBusinessTypesChange(updatedList);
        
        toast({
          title: "业务类型已更新",
          description: `业务类型「${name}」已成功更新`,
        });
      } else {
        const newBusinessType = await createBusinessType({
          name,
          description: description || undefined,
        });
        
        // Add new business type to list
        onBusinessTypesChange([newBusinessType, ...businessTypes]);
        
        toast({
          title: "业务类型已创建",
          description: `业务类型「${name}」已成功创建`,
        });
      }
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving business type:", error);
      toast({
        variant: "destructive",
        title: "保存失败",
        description: (error as Error).message || "无法保存业务类型",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "编辑业务类型" : "添加业务类型"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">业务名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入业务名称"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">描述 (可选)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入业务描述"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdate ? "更新" : "创建"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessTypeDialog;
