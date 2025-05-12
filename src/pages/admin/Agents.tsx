import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import AgentManagement from "@/components/admin/agent-management/AgentManagement";
import AgentReportsTable from "@/components/admin/agent-reports/AgentReportsTable";
import ExchangeRateSettings from "@/components/admin/agent-settings/ExchangeRateSettings";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/types";

import { User, BarChart2, BarChartHorizontal } from "lucide-react";

const AgentsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentAdminProfile, setCurrentAdminProfile] = useState<AdminUser | null>(null);
  
  // 获取当前管理员的资料
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (user?.email) {
        try {
          // 使用as any绕过Supabase类型限制
          const { data, error } = await (supabase
            .from('admin_users' as any)
            .select('*')
            .eq('email', user.email)
            .maybeSingle());
          
          if (error) throw error;
          
          // 先转换为unknown再转换为AdminUser类型
          const adminUser: AdminUser = {
            id: data?.id || '',
            email: user.email,
            is_admin: data?.is_admin || false,
            admin_permissions: data?.admin_permissions || [],
            created_at: data?.created_at || new Date().toISOString(),
            updated_at: data?.updated_at || new Date().toISOString()
          };
          
          setCurrentAdminProfile(adminUser);
        } catch (error) {
          console.error("Error fetching admin profile:", error);
        }
      }
    };
    
    fetchAdminProfile();
  }, [user]);
  
  return (
    <AdminLayout currentUser={currentAdminProfile}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">代理系统管理</h2>
          <p className="text-muted-foreground">
            管理系统代理用户、查看统计报表并设置汇率参数
          </p>
        </div>
        
        <div className="space-y-10">
          {/* 代理管理部分 */}
          <div>
            <div className="flex items-center mb-4">
              <User className="mr-2 h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">代理管理</h3>
            </div>
            <AgentManagement currentUser={currentAdminProfile} />
          </div>
          
          {/* 代理报表部分 */}
          <div>
            <div className="flex items-center mb-4">
              <BarChart2 className="mr-2 h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">代理报表</h3>
            </div>
            <AgentReportsTable />
          </div>
          
          {/* 汇率设置部分 */}
          <div>
            <div className="flex items-center mb-4">
              <BarChartHorizontal className="mr-2 h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">汇率设置</h3>
            </div>
            <ExchangeRateSettings />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AgentsPage;
