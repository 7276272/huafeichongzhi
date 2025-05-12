
import React from "react";
import { AdminUser } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EditAdminDialog } from "./EditAdminDialog";
import { RemoveAdminDialog } from "./RemoveAdminDialog";

// Available admin permissions
export const availablePermissions = [
  { id: "dashboard", label: "控制面板" },
  { id: "orders", label: "订单管理" },
  { id: "finance", label: "财务管理" },
  { id: "users", label: "用户管理" },
  { id: "settings", label: "系统设置" },
];

interface AdminUsersListProps {
  adminUsers: AdminUser[];
  onAdminUsersChange: (users: AdminUser[]) => void;
}

export const AdminUsersList: React.FC<AdminUsersListProps> = ({ 
  adminUsers,
  onAdminUsersChange
}) => {
  // Format date strings
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };
  
  return (
    <>
      {adminUsers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>管理员</TableHead>
              <TableHead>权限</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.email || "未知邮箱"}
                  {user.email === "it@haixin.org" && (
                    <Badge className="ml-2" variant="secondary">超级管理员</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.admin_permissions?.map(perm => {
                      const permission = availablePermissions.find(p => p.id === perm);
                      return (
                        <Badge key={perm} variant="outline" className="bg-primary/10">
                          {permission?.label || perm}
                        </Badge>
                      );
                    })}
                    {!user.admin_permissions?.length && (
                      <span className="text-muted-foreground text-sm italic">无权限</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {user.created_at ? formatDate(user.created_at) : "未知"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <EditAdminDialog 
                      user={user} 
                      onUpdatePermissions={(updatedUser) => {
                        const updatedUsers = adminUsers.map(u => 
                          u.id === updatedUser.id ? updatedUser : u
                        );
                        onAdminUsersChange(updatedUsers);
                      }}
                    />
                    
                    <RemoveAdminDialog 
                      user={user} 
                      onRemoveAdmin={(email) => {
                        const updatedUsers = adminUsers.filter(u => u.email !== email);
                        onAdminUsersChange(updatedUsers);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          暂无管理员数据
        </div>
      )}
    </>
  );
};
