
import React from "react";
import { AdminUser } from "@/types";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { removeAdminPermissions } from "@/services/adminService";

interface RemoveAdminDialogProps {
  user: AdminUser;
  onRemoveAdmin: (email: string) => void;
}

export const RemoveAdminDialog: React.FC<RemoveAdminDialogProps> = ({ 
  user,
  onRemoveAdmin
}) => {
  const { toast } = useToast();
  
  const handleRemoveAdmin = async () => {
    try {
      const success = await removeAdminPermissions(user.email);
      if (success) {
        onRemoveAdmin(user.email);
        toast({
          title: "移除成功",
          description: "已成功移除管理员权限",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "移除失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="h-8 px-2"
          disabled={user.email === "it@haixin.org"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>移除管理员权限</AlertDialogTitle>
          <AlertDialogDescription>
            确定要移除 {user.email} 的管理员权限吗？此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemoveAdmin}>
            移除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
