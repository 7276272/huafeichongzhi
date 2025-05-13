
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { LoadingButton } from "@/components/ui";
import { Link } from "react-router-dom";

// 将从admin_users表验证管理员身份，不再使用硬编码列表

const AdminAuthPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // If the user is already logged in, check if they are admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && user.email) {
        try {
          // Check admin_users table for this email
          const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();
            
          if (data && !error) {
            console.log("User is admin:", user.email);
            navigate("/admin");
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
        }
      }
    };
    
    checkAdminStatus();
  }, [user, navigate]);

  // Form schema for admin login
  const formSchema = z.object({
    email: z.string().email("请输入有效的管理员邮箱地址"),
    password: z.string().min(6, "密码至少6位"),
  });

  // Initialize form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "it@haixin.org",
      password: ""
    }
  });

  // Handle form submission for admin login
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // 检查用户是否在admin_users表中
      const { data: adminUser, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', values.email)
        .maybeSingle();
      
      if (adminCheckError) {
        console.error("Error checking admin_users table:", adminCheckError);
      }
      
      if (!adminUser) {
        toast({
          variant: "destructive",
          title: "无效的管理员账户",
          description: "该邮箱未注册为管理员，请联系超级管理员添加",
        });
        setLoginError("无效的管理员账户");
        setIsLoading(false);
        return;
      }

      console.log("Attempting admin login with:", values.email);

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Admin login error:", error);
        toast({
          variant: "destructive",
          title: "登录失败",
          description: error.message === "Invalid login credentials" 
            ? "邮箱或密码错误" 
            : (error.message || "登录失败，请稍后重试"),
        });
        setLoginError(error.message === "Invalid login credentials" 
          ? "邮箱或密码错误" 
          : (error.message || "登录失败，请稍后重试"));
      } else if (data && data.user) {
        console.log("Admin login successful:", data.user.email);
        toast({
          title: "登录成功",
          description: "欢迎回来，管理员",
        });
        navigate("/admin");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "发生未知错误，请稍后重试",
      });
      setLoginError("发生未知错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="pt-8 pb-2 text-center">
            <Link to="/" className="inline-flex items-center text-blue-600 absolute top-4 left-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> 返回首页
            </Link>
            <CardTitle className="text-2xl font-bold">管理员登录</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>管理员邮箱</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="it@haixin.org" 
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="******" 
                            {...field}
                            disabled={isLoading}
                            className="pr-10"
                          />
                          <button 
                            type="button" 
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {loginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm">
                    {loginError}
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingButton>登录中...</LoadingButton>
                  ) : "登录管理后台"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center text-center text-sm text-gray-500">
            <p>仅限管理员登录。如需管理员账号，请联系系统管理员。</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuthPage;
