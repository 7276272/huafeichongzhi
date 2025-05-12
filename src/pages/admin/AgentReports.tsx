import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import AgentReportsTable from "@/components/admin/agent-reports/AgentReportsTable";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/types";

const AgentReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentAdminProfile, setCurrentAdminProfile] = useState<AdminUser | null>(null);
  
  // 获取当前管理员的资料
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();
          
          if (error) throw error;
          setCurrentAdminProfile(data as AdminUser);
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
          <h2 className="text-2xl font-bold tracking-tight">代理数据报表</h2>
          <p className="text-muted-foreground">
            查看所有代理线下的详细数据统计，包括下级用户数量、充值金额和提现金额
          </p>
        </div>
        
        <AgentReportsTable />
      </div>
    </AdminLayout>
  );
};

export default AgentReportsPage;
