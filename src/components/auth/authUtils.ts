
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const handleLogin = async (email: string, password: string) => {
  try {
    console.log("Attempting to login with:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("登录失败:", error);
      const errorMessage = error.message === "Invalid login credentials" 
        ? "邮箱或密码不正确，请重试" 
        : (error.message || "登录失败，请稍后重试");
      
      return { error: errorMessage, data: null };
    }

    toast({
      title: "登录成功",
      description: `欢迎回来!`,
    });
    
    return { error: null, data };
  } catch (error) {
    console.error("登录失败:", error);
    const errorMessage = error instanceof Error ? error.message : "登录失败，请稍后重试";
    return { error: errorMessage, data: null };
  }
};

export const handleSignup = async (email: string, password: string) => {
  try {
    console.log("Attempting to signup with:", email);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      console.error("注册失败:", error);
      return { error: error.message || "注册失败，请稍后重试", data: null };
    }

    if (data.session) {
      // User was auto-confirmed (happens with some Supabase settings)
      toast({
        title: "注册并登录成功",
        description: "您的账户已创建并已登录",
      });
      
      return { error: null, data };
    }

    // If we got here, user may need to verify email (depends on Supabase settings)
    toast({
      title: "注册成功",
      description: "如果需要验证邮箱，请查收您的邮件",
    });
    
    return { error: null, data };
  } catch (error) {
    console.error("注册失败:", error);
    const errorMessage = error instanceof Error ? error.message : "注册失败，请检查您的输入或稍后重试";
    return { error: errorMessage, data: null };
  }
};

export const handleForgotPassword = async (email: string) => {
  try {
    console.log("Sending password reset email to:", email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    
    if (error) {
      console.error("Password reset error:", error);
      return { error: error.message || "无法发送重置密码的链接，请稍后再试", success: false };
    }
    
    toast({
      title: "重置密码链接已发送",
      description: "请检查您的邮箱以继续重置密码的流程",
    });
    
    return { error: null, success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    const errorMessage = error instanceof Error ? error.message : "无法发送重置密码的链接，请稍后再试";
    return { error: errorMessage, success: false };
  }
};
