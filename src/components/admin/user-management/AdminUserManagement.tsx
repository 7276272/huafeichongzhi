
import React, { useState } from "react";
import { AdminUser } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingButton } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { getAdminUsers } from "@/services/adminService";
import { AdminUsersList } from "./AdminUsersList";
import { AddAdminDialog } from "./AddAdminDialog";

interface AdminUserManagementProps {
  adminUsers: AdminUser[];
  onAdminUsersChange: (users: AdminUser[]) => void;
  currentUser?: AdminUser | null;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  adminUsers,
  onAdminUsersChange,
  currentUser
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Handle refreshing the admin users list
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const admins = await getAdminUsers();
      onAdminUsersChange(admins);
      toast({
        title: "刷新成功",
        description: "管理员列表已更新",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "刷新失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">
          共 {adminUsers.length} 个管理员
        </h3>
        <div className="flex gap-2">
          {isRefreshing ? (
            <Button 
              variant="outline" 
              size="sm"
              disabled
            >
              <LoadingButton className="text-xs">刷新</LoadingButton>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
          )}
          
          <AddAdminDialog 
            onAdminAdded={(newAdmin) => {
              onAdminUsersChange([...adminUsers, newAdmin]);
            }}
            currentUser={currentUser || null}
          />
        </div>
      </div>
      
      <AdminUsersList 
        adminUsers={adminUsers} 
        onAdminUsersChange={onAdminUsersChange} 
      />
    </div>
  );
};

export default AdminUserManagement;
