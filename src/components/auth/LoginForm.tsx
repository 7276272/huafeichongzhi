
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { handleLogin } from "./authUtils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  onForgotPassword: () => void;
  onSwitchToSignup: () => void;
  returnTo: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  onForgotPassword,
  onSwitchToSignup,
  returnTo,
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("请输入邮箱和密码");
      toast({
        title: "请填写所有字段",
        description: "请输入邮箱和密码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error: loginError, data } = await handleLogin(email, password);
    setIsLoading(false);

    if (loginError) {
      setError(loginError);
      toast({
        title: "登录失败",
        description: loginError,
        variant: "destructive",
      });
      return;
    }

    navigate(returnTo);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">邮箱</Label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-500 peer-focus:text-primary" />
            <Input
              id="email"
              placeholder="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">密码</Label>
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm" 
              type="button"
              onClick={onForgotPassword}
            >
              忘记密码?
            </Button>
          </div>
          <div className="relative">
            <Lock className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-500 peer-focus:text-primary" />
            <Input
              id="password"
              placeholder="密码"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10"
              disabled={isLoading}
            />
            <button 
              type="button" 
              tabIndex={-1}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-center text-sm text-red-500 p-2 bg-red-50 rounded border border-red-200">
            {error}
          </div>
        )}

        <Button disabled={isLoading} type="submit">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          登录
        </Button>

        <div className="text-center text-sm text-gray-500">
          没有账号?{" "}
          <Button variant="link" onClick={onSwitchToSignup} className="p-0 h-auto">
            注册
          </Button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
