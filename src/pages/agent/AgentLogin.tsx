import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, EyeIcon, EyeOffIcon } from "lucide-react";
import Layout from "@/components/Layout";
import { agentLogin } from "@/services/agentService";

export default function AgentLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理代理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 验证输入
      if (!formData.email) {
        throw new Error("请输入邮箱");
      }
      if (!formData.password) {
        throw new Error("请输入密码");
      }

      // 使用代理登录服务
      const agentData = await agentLogin(formData.email, formData.password);

      // 登录成功，保存代理信息到本地存储
      localStorage.setItem("agent", JSON.stringify(agentData));
      localStorage.setItem("agentLoggedIn", "true");
      
      // 登录成功提示
      toast({
        title: "登录成功",
        description: `欢迎回来，${agentData.name || agentData.email || '代理'}`,
      });

      // 跳转到代理面板
      navigate("/agent/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">代理登录</CardTitle>
            <CardDescription className="text-center">
              请使用您的代理账号邮箱和密码登录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="输入密码"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 
                        <EyeOffIcon className="h-4 w-4" /> : 
                        <EyeIcon className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full mt-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    "登录"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              如无法登录，请联系管理员添加代理账号
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
