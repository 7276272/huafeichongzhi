
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { handleForgotPassword } from "./authUtils";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  email,
  setEmail,
  onBackToLogin,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    
    if (!email) {
      setError("请输入邮箱");
      toast({
        title: "请填写邮箱",
        description: "请输入您的邮箱以接收重置密码的链接",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    const { error: resetError, success } = await handleForgotPassword(email);
    setIsLoading(false);
    
    if (resetError) {
      setError(resetError);
      toast({
        title: "发送重置链接失败",
        description: resetError,
        variant: "destructive",
      });
      return;
    }
    
    setResetSent(true);
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
              disabled={isLoading || resetSent}
            />
          </div>
        </div>
        
        {error && (
          <div className="text-center text-sm text-red-500 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        {resetSent ? (
          <div className="text-center text-sm text-green-500 p-2 bg-green-50 rounded">
            密码重置链接已发送到您的邮箱，请查收
          </div>
        ) : (
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            发送重置密码链接
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          type="button" 
          onClick={onBackToLogin}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回登录
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
