
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Layout from "./Layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { 
  LayoutDashboard, 
  ListOrdered, 
  Settings, 
  Users,
  Menu,
  Wallet,
  Loader2,
  Tags,
  BarChart3
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hasAdminPermission } from "@/services/adminService";
import { AdminUser } from "@/types";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser?: AdminUser | null;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  // Check if user is a super admin (it@haixin.org)
  const isSuperAdmin = user?.email === "it@haixin.org";
  
  // Check if user has admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && user.email) {
        setIsProfileLoading(true);
        try {
          // Look for the user in the admin_users table
          const { data: adminData, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();
            
          if (error) throw error;
          
          setAdminProfile(adminData as AdminUser);
        } catch (error) {
          console.error("Error fetching admin profile:", error);
        } finally {
          setIsProfileLoading(false);
        }
      }
    };
    
    if (user) {
      checkAdminStatus();
    }
  }, [user]);
  
  // Check if user is an admin
  const isAdmin = isSuperAdmin || (adminProfile?.is_admin === true);
  
  // Redirect non-admin users away from admin pages
  useEffect(() => {
    // Wait until authentication status and profile are known
    if (!isLoading && !isProfileLoading) {
      console.log("AdminLayout: Auth check complete", { 
        user: user?.email, 
        isSuperAdmin,
        isAdmin,
        profile: adminProfile 
      });
      
      setIsAdminChecked(true);
      
      if (user && !isAdmin) {
        toast({
          title: "权限不足",
          description: "您没有访问管理后台的权限",
          variant: "destructive"
        });
        navigate("/");
      } else if (!user) {
        console.log("AdminLayout: No user found, redirecting to admin login");
        navigate("/admin/login");
      } else {
        // Check for specific page permissions
        const currentPath = location.pathname;
        const requiredPermission = currentPath.split('/admin/')[1]?.split('/')[0] || 'dashboard';

        // Skip permission check for super admin
        if (!isSuperAdmin && requiredPermission) {
          const hasPermission = hasAdminPermission(adminProfile, requiredPermission);
          
          if (!hasPermission) {
            toast({
              title: "权限不足",
              description: `您没有访问${getPermissionLabel(requiredPermission)}的权限`,
              variant: "destructive"
            });
            navigate("/admin"); // Redirect to main admin page
          }
        }
      }
    }
  }, [user, isAdmin, navigate, isLoading, isProfileLoading, location.pathname, isSuperAdmin, adminProfile]);

  // Get human-readable permission label
  const getPermissionLabel = (permission: string): string => {
    const labels = {
      'dashboard': '控制面板',
      'data-panel': '数据面板',
      'orders': '订单管理',
      'finance': '财务管理',
      'users': '用户管理',
      'settings': '系统设置',
      'business': '业务管理',
      'agents': '代理管理'
    };
    return labels[permission as keyof typeof labels] || permission;
  };

  const adminLinks = [
    { 
      path: '/admin', 
      label: '控制面板', 
      icon: <LayoutDashboard className="h-5 w-5" />,
      permission: 'dashboard'
    },
    { 
      path: '/admin/data-panel', 
      label: '数据面板', 
      icon: <BarChart3 className="h-5 w-5" />,
      permission: 'dashboard'
    },
    { 
      path: '/admin/orders', 
      label: '订单管理', 
      icon: <ListOrdered className="h-5 w-5" />,
      permission: 'orders'
    },
    { 
      path: '/admin/business', 
      label: '业务管理', 
      icon: <Tags className="h-5 w-5" />,
      permission: 'business'
    },
    { 
      path: '/admin/finance', 
      label: '财务管理', 
      icon: <Wallet className="h-5 w-5" />,
      permission: 'finance'
    },
    { 
      path: '/admin/users', 
      label: '用户管理', 
      icon: <Users className="h-5 w-5" />,
      permission: 'users'
    },
    { 
      path: '/admin/agents', 
      label: '代理管理', 
      icon: <Users className="h-5 w-5" />,
      permission: 'users'
    },
    { 
      path: '/admin/settings', 
      label: '系统设置', 
      icon: <Settings className="h-5 w-5" />,
      permission: 'settings'
    },
  ];

  // Filter links based on permissions
  const filteredAdminLinks = adminLinks.filter(link => {
    // Super admin sees all links
    if (isSuperAdmin) return true;
    
    // Check specific permission
    return adminProfile?.is_admin && 
           hasAdminPermission(adminProfile, link.permission);
  });

  const SidebarContent = () => (
    <div className="space-y-1 py-2 w-full">
      {filteredAdminLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={cn(
            "admin-nav-link",
            location.pathname === link.path && "active"
          )}
        >
          {link.icon}
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
  
  // Show loading while checking authentication
  if (isLoading || isProfileLoading || !isAdminChecked) {
    return (
      <Layout>
        <div className="flex h-full min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-500">正在验证管理员权限...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If user is not admin, don't render admin content
  if (!isAdmin && user) {
    return null;
  }
  
  // Show loading or redirect for non-authenticated users
  if (!user) {
    return null;
  }
  
  return (
    <Layout>
      <div className="flex h-full">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="m-4">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="pt-10">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="w-64 border-r p-4 space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">管理面板</h2>
            <SidebarContent />
          </div>
        )}
        
        <div className={cn("flex-1", isMobile ? "px-3 py-2 pb-16" : "p-6")}>
          {children}
        </div>
      </div>
    </Layout>
  );
};

export default AdminLayout;
