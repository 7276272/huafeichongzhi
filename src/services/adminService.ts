
import { AdminUser } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Add admin permissions to a user
export const addAdminUser = async (email: string, password: string, permissions: string[]): Promise<AdminUser | null> => {
  try {
    console.log("开始添加管理员用户:", { email });
    
    // 1. 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("无效的邮箱地址");
    }

    // 2. 检查密码强度
    if (password.length < 8) {
      throw new Error("密码必须至少8个字符");
    }

    // 3. 检查权限选择
    if (permissions.length === 0) {
      throw new Error("必须选择至少一项管理员权限");
    }

    // 启用SQL模式 - 生成应该在数据库中运行的SQL脚本
    // 因为客户端不能直接写入管理员数据，所以我们生成SQL脚本
    
    const formattedPermissions = JSON.stringify(permissions).replace(/"/g, "'");

    // 确定用户是否可以添加其他管理员
    const canAddAdmin = permissions.includes("users") ? true : false;
    
    // 确定用户是否为经理
    const isManager = permissions.includes("finance") && permissions.includes("settings") ? true : false;
    
    // 生成插入管理员的SQL脚本
    const sqlScript = `
-- 以下是添加管理员的SQL脚本，请在Supabase SQL编辑器中运行
-- 第1步: 在auth.users表中创建用户
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '${email}',
  crypt('${password}', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"is_admin":true}'
);

-- 第2步: 添加到admin_users表
INSERT INTO admin_users (
  email, 
  password, 
  is_admin, 
  admin_permissions, 
  created_at, 
  updated_at,
  can_add_admin,
  is_manager
)
VALUES (
  '${email}',
  '${password}',
  true,
  ${formattedPermissions}::text[],
  now(),
  now(),
  ${canAddAdmin},
  ${isManager}
);

-- 确保设置RLS策略不影响管理员访问
-- 如果下面的策略已存在，这段无需执行或可能会失败，请分开运行
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
CREATE POLICY "Admins can view admin users" ON admin_users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.email = auth.jwt() ->> 'email' AND au.is_admin = true
  )
);

DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
CREATE POLICY "Super admins can manage admin users" ON admin_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE (au.email = auth.jwt() ->> 'email' AND au.can_add_admin = true)
       OR au.email IN ('it@haixin.org', 'yema598@icloud.com')
  )
);
`;
    
    console.log("暂时无法直接添加管理员，请使用以下脚本在Supabase SQL编辑器中添加");
    console.log(sqlScript);

    // 创建一个模拟的管理员对象供前端使用
    const simulatedAdmin: AdminUser = {
      id: Date.now().toString(),
      email: email,
      password: password,
      is_admin: true,
      admin_permissions: permissions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sql_script: sqlScript // 添加SQL脚本到对象属性
    };
    
    console.log("管理员记录生成成功，请使用SQL脚本创建用户");
    console.log("请在Supabase管理面板中执行以下SQL脚本");
    console.log("1. 登录Supabase管理面板");
    console.log("2. 前往SQL编辑器");
    console.log("3. 复制上面生成的SQL脚本");
    console.log("4. 执行脚本");

    // 返回生成的SQL脚本供前端使用
    return simulatedAdmin;
  } catch (error) {
    console.error("管理员添加过程中发生错误:", {
      email,
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};

// Update admin permissions for a user
export const updateAdminPermissions = async (email: string, permissions: string[]): Promise<AdminUser | null> => {
  try {
    // Update in the admin_users table
    const { data, error: adminError } = await supabase
      .from('admin_users')
      .update({ 
        admin_permissions: permissions,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();
    
    if (adminError) {
      console.error("Error updating admin permissions:", adminError);
      throw new Error("更新管理员权限失败");
    }
    
    // Also update the user's profile if they exist
    const { data: userLookup } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (userLookup?.id) {
      await supabase
        .from('profiles')
        .update({ 
          admin_permissions: permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', userLookup.id);
    }
    
    return data as unknown as AdminUser;
  } catch (error) {
    console.error("Error updating admin permissions:", error);
    throw error;
  }
};

// Remove admin permissions from a user
export const removeAdminPermissions = async (email: string): Promise<boolean> => {
  try {
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('email', email);
    
    if (adminError) {
      console.error("Error removing admin permissions:", adminError);
      throw new Error("移除管理员权限失败");
    }
    
    // Also update the user's profile if they exist
    const { data: userLookup } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (userLookup?.id) {
      await supabase
        .from('profiles')
        .update({ 
          is_admin: false,
          admin_permissions: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', userLookup.id);
    }
    
    return true;
  } catch (error) {
    console.error("Error removing admin permissions:", error);
    throw error;
  }
};

// Check if a user has a specific admin permission
export const hasAdminPermission = (user: AdminUser | null, permission: string): boolean => {
  if (!user) return false;
  if (!user.is_admin) return false;
  
  // Super admin has all permissions
  if (user.email === "it@haixin.org" || user.email === "yema598@icloud.com") return true;
  
  return user.admin_permissions?.includes(permission) || false;
};

// Get all available admin permissions
export const getAvailableAdminPermissions = (): { id: string, label: string }[] => {
  return [
    { id: "dashboard", label: "控制面板" },
    { id: "orders", label: "订单管理" },
    { id: "finance", label: "财务管理" },
    { id: "users", label: "用户管理" },
    { id: "settings", label: "系统设置" },
    { id: "business", label: "业务管理" }
  ];
};

// Get all admin users from the admin_users table
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('*');
    
    if (error) {
      console.error("Error fetching admin users:", error);
      throw new Error("获取管理员列表失败");
    }
    
    return admins as AdminUser[];
  } catch (error) {
    console.error("Error fetching admin users:", error);
    throw error;
  }
};
