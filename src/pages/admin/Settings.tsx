
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui";
import { getAdminUsers } from "@/services/adminService";
import { AdminUser } from "@/types";
import AdminUserManagement from "@/components/admin/user-management/AdminUserManagement";
import { useSession } from "@supabase/auth-helpers-react";

const Settings = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const session = useSession();
  const currentUser = session?.user as unknown as AdminUser;

  // Fetch admin users on component mount
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        setIsLoading(true);
        const admins = await getAdminUsers();
        setAdminUsers(admins);
      } catch (error) {
        console.error("Error fetching admin users:", error);
        toast({
          variant: "destructive",
          title: "获取管理员列表失败",
          description: "请稍后重试或联系系统管理员",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminUsers();
  }, [toast]);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">系统设置</h1>

        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="admins">管理员设置</TabsTrigger>
            <TabsTrigger value="system">系统配置</TabsTrigger>
          </TabsList>
          
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>管理员账号设置</CardTitle>
                <CardDescription>
                  配置管理员账号和权限
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="medium" text="" />
                  </div>
                ) : (
                  <AdminUserManagement 
                    adminUsers={adminUsers}
                    onAdminUsersChange={setAdminUsers}
                    currentUser={currentUser}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>系统配置</CardTitle>
                <CardDescription>
                  配置系统设置和偏好
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12 text-center">
                <div>
                  <p className="text-muted-foreground">
                    更多系统设置功能将在下一阶段实施。
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    该模块将允许配置充值选项、运营商设置和系统偏好。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
