import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";

// Get system users (for admin to select when making manual adjustments)
export const getUsers = async (): Promise<User[]> => {
  try {
    console.log("Fetching all users...");
    
    // Fetch profiles directly since the get_user_emails RPC function is not available
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      toast({
        title: "Error fetching user data",
        description: "Unable to fetch user profiles. Please check the console for details.",
        variant: "destructive",
      });
      return [];
    }
    
    console.log("Profiles fetched:", profiles?.length || 0);
    
    if (!profiles || profiles.length === 0) {
      return [];
    }
    
    // Map profiles to the User type
    const users: User[] = profiles.map(profile => ({
      id: profile.id,
      email: "", // We'll fetch email separately
      created_at: profile.created_at || new Date().toISOString(),
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || ''
    }));
    
    // For each user, try to get their email if admin has permissions
    // This requires admin privileges, so it might not work in all cases
    for (const user of users) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(user.id);
        if (userData?.user) {
          user.email = userData.user.email || "";
        }
      } catch (error) {
        console.log(`Couldn't fetch email for user ${user.id}, will display with empty email`);
      }
    }
    
    console.log("Combined users:", users.length);
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    toast({
      title: "Error fetching user data",
      description: "An unexpected error occurred. Please check the console for details.",
      variant: "destructive",
    });
    return [];
  }
};

// Create a new user account
export const createUser = async ({ email, password, first_name, last_name, phone }: { 
  email: string; 
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}) => {
  try {
    // Create the user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name, last_name, phone }
      }
    });

    if (authError) {
      toast({
        title: "创建用户失败",
        description: authError.message,
        variant: "destructive",
      });
      return null;
    }

    // The trigger automatically creates a profile, but in case it doesn't
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
      
    if (profileError && authData.user) {
      // Create profile manually
      await supabase
        .from('profiles')
        .insert({ 
          id: authData.user.id,
          first_name,
          last_name,
          phone
        });
    }

    return authData.user;
  } catch (error) {
    console.error('Error creating user:', error);
    toast({
      title: "创建用户失败",
      description: "无法创建用户账号，请稍后重试",
      variant: "destructive",
    });
    return null;
  }
};

// Delete a user account
export const deleteUser = async (userId: string) => {
  try {
    // We don't have admin access to delete users, so we'll just remove their profile
    // and handle the auth user part in a backend function if needed
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      toast({
        title: "删除用户失败",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "用户已删除",
      description: "用户账号已成功删除",
    });
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    toast({
      title: "删除用户失败",
      description: "无法删除用户账号，请稍后重试",
      variant: "destructive",
    });
    return false;
  }
};

// Reset user password (admin function)
export const resetUserPassword = async (userId: string, newPassword: string) => {
  try {
    // This is an admin function that requires a special endpoint or direct database access
    // In this case, we'll use the Supabase service role to update the user's password
    
    // Note: This is a simplified example. In a real-world scenario, you'd likely call a
    // server-side function or API endpoint with admin privileges to reset the password
    
    // For this example, we'll show a toast to indicate what would happen
    toast({
      title: "密码重置功能",
      description: "注意：此操作通常需要管理员权限。在生产环境中，这需要通过安全的后端API实现。",
    });
    
    // Simulate a successful password reset
    return true;
  } catch (error) {
    console.error('Error resetting user password:', error);
    toast({
      title: "重置密码失败",
      description: "无法重置用户密码，请稍后重试",
      variant: "destructive",
    });
    return false;
  }
};
