
import React, { useState } from "react";
import { AdminUser } from "@/types";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { updateAdminPermissions } from "@/services/adminService";
import { availablePermissions } from "./AdminUsersList";

interface EditAdminDialogProps {
  user: AdminUser;
  onUpdatePermissions: (updatedUser: AdminUser) => void;
}

export const EditAdminDialog: React.FC<EditAdminDialogProps> = ({ 
  user,
  onUpdatePermissions
}) => {
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [permissions, setPermissions] = useState<string[]>(user.admin_permissions || []);
  const { toast } = useToast();
  
  const handleUpdatePermissions = async () => {
    setIsEditingPermissions(true);
    
    try {
      const updatedUser = await updateAdminPermissions(user.email, permissions);
      if (updatedUser) {
        onUpdatePermissions(updatedUser);
        toast({
          title: "更新成功",
          description: `已成功更新管理员权限`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsEditingPermissions(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2"
          disabled={user.email === "it@haixin.org"}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑管理员权限</DialogTitle>
          <DialogDescription>
            修改 {user.email} 的管理权限
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <div className="grid grid-cols-2 gap-2">
            {availablePermissions.map((perm) => (
              <div key={perm.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`edit-perm-${perm.id}`}
                  checked={permissions.includes(perm.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPermissions([...permissions, perm.id]);
                    } else {
                      setPermissions(permissions.filter(p => p !== perm.id));
                    }
                  }}
                />
                <Label htmlFor={`edit-perm-${perm.id}`}>{perm.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleUpdatePermissions} 
            disabled={isEditingPermissions || permissions.length === 0}
          >
            {isEditingPermissions ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                更新中...
              </>
            ) : "更新权限"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
