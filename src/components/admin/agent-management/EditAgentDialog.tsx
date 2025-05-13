import React, { useState } from "react";
import { Agent } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit2, Loader2, Key, LockKeyhole, DollarSign, UserCheck, UserX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface EditAgentDialogProps {
  agent: Agent;
  onAgentUpdated: (agent: Agent) => void;
}

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const EditAgentDialog: React.FC<EditAgentDialogProps> = ({ agent, onAgentUpdated }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordResetting, setIsPasswordResetting] = useState(false);
  const [isFreezingAccount, setIsFreezingAccount] = useState(false);
  
  // 基本信息表单
  const [formData, setFormData] = useState({
    name: agent.name || '',
    email: agent.email || '',
    phone: agent.phone || '',
    status: agent.status || 'active'
  });
  
  // 汇率设置表单
  const [exchangeRateData, setExchangeRateData] = useState({
    commission_rate: agent.commission_rate || 7.2 // 默认汇率1 USDT = 7.2 RMB
  });
  
  // 密码重置表单
  const [passwordData, setPasswordData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  });
  
  const { toast } = useToast();

  // 处理基本信息输入变化
  const handleBasicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 处理激活状态切换
  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value as "active" | "inactive",
    });
  };

  // 处理汇率输入变化
  const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setExchangeRateData({
      commission_rate: isNaN(value) ? 7.2 : Math.max(1, Math.min(value, 20)),
    });
  };

  // 处理密码输入变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // 提交基本信息表单
  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 验证表单
      if (!formData.name) throw new Error("代理名称不能为空");
      if (!formData.email) throw new Error("邮箱不能为空");
      if (!formData.phone) throw new Error("手机号不能为空");
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("邮箱格式不正确");
      }

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error("手机号格式不正确");
      }

      // 更新代理基本信息
      const { error } = await supabase
        .from('agents')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
        })
        .eq('id', agent.id);
        
      if (error) throw error;
      
      // 更新本地代理对象
      const updatedAgent = {
        ...agent,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status
      };
      
      // 通知父组件更新
      onAgentUpdated(updatedAgent);
      
      toast({
        title: "更新成功",
        description: `代理 ${updatedAgent.name} 基本信息已更新`,
        variant: "default",
      });
      
      // 切换到汇率选项卡
      setActiveTab("rate");
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 提交汇率设置表单
  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 更新代理汇率
      const { error } = await supabase
        .from('agents')
        .update({
          commission_rate: exchangeRateData.commission_rate
        })
        .eq('id', agent.id);
      
      if (error) throw error;
      
      // 更新本地代理对象
      const updatedAgent = {
        ...agent,
        commission_rate: exchangeRateData.commission_rate
      };
      
      // 通知父组件更新
      onAgentUpdated(updatedAgent);
      
      toast({
        title: "汇率更新成功",
        description: `代理 ${agent.name || '未命名'} 的汇率已更新为 1USDT = ${exchangeRateData.commission_rate}元`,
        variant: "default",
      });
      
      // 切换到密码选项卡
      setActiveTab("password");
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "汇率更新失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordResetting(true);
    
    try {
      // 验证密码
      if (!passwordData.newPassword) throw new Error("新密码不能为空");
      if (passwordData.newPassword.length < 6) throw new Error("密码长度不能小于6位");
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("两次输入的密码不一致");
      }
      
      // 通过Supabase Auth API重置密码 (需要管理员权限)
      // 在真实环境中，这里应使用后端代理API来重置用户密码
      const { error } = await supabase
        .from('agents')
        .update({
          password: passwordData.newPassword, // 注意：实际应用中应该加密存储
        })
        .eq('id', agent.id);
      
      if (error) throw error;
      
      toast({
        title: "密码重置成功",
        description: `代理 ${agent.name || '未命名'} 的密码已成功重置`,
        variant: "default",
      });
      
      // 清空密码表单
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
      
      // 关闭对话框
      setDialogOpen(false);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "密码重置失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsPasswordResetting(false);
    }
  };
  
  // 冻结/解冻代理账户
  const handleToggleFreeze = async () => {
    setIsFreezingAccount(true);
    
    try {
      // 反转当前状态
      const newStatus = formData.status === 'active' ? 'inactive' : 'active';
      
      // 更新代理状态
      const { error } = await supabase
        .from('agents')
        .update({
          status: newStatus
        })
        .eq('id', agent.id);
      
      if (error) throw error;
      
      // 更新本地表单状态
      setFormData({
        ...formData,
        status: newStatus
      });
      
      // 更新本地代理对象
      const updatedAgent = {
        ...agent,
        status: newStatus as 'active' | 'inactive'
      };
      
      // 通知父组件更新
      onAgentUpdated(updatedAgent);
      
      toast({
        title: newStatus === 'active' ? "代理已激活" : "代理已冻结",
        description: `代理 ${agent.name || '未命名'} 状态已更新`,
        variant: "default",
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新状态失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsFreezingAccount(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>编辑代理信息</DialogTitle>
          <DialogDescription>
            管理代理的基本信息、汇率和账户设置
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mx-6">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>基本信息</span>
            </TabsTrigger>
            <TabsTrigger value="rate" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>汇率设置</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>密码/状态</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="p-6 pt-4">
            <form onSubmit={handleBasicSubmit}>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    代理名称
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleBasicInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    邮箱
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleBasicInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    手机号
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleBasicInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    状态
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Badge 
                      variant={formData.status === 'active' ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleStatusChange('active')}
                    >
                      活跃
                    </Badge>
                    <Badge 
                      variant={formData.status === 'inactive' ? "destructive" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleStatusChange('inactive')}
                    >
                      停用
                    </Badge>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      处理中
                    </>
                  ) : (
                    "保存并继续"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="rate" className="p-6 pt-4">
            <form onSubmit={handleRateSubmit}>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="commission_rate" className="text-right">
                    汇率设置
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <span className="text-sm font-medium">1 USDT = </span>
                    <Input
                      id="commission_rate"
                      name="commission_rate"
                      type="number"
                      min="1"
                      max="20"
                      step="0.1"
                      value={exchangeRateData.commission_rate}
                      onChange={handleExchangeRateChange}
                      className="w-24"
                    />
                    <span className="text-sm font-medium">RMB</span>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-md mt-2">
                  <p className="text-sm text-muted-foreground">
                    设置代理专属汇率，该汇率将用于计算代理的佣金和充值金额。
                    <br />当前建议汇率范围: 7.0 - 7.5 RMB/USDT
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                  返回
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      处理中
                    </>
                  ) : (
                    "保存并继续"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="password" className="p-6 pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <LockKeyhole className="w-4 h-4" />
                  重置密码
                </h3>
                <form onSubmit={handleResetPassword}>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="newPassword" className="text-right">
                        新密码
                      </Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="confirmPassword" className="text-right">
                        确认密码
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={isPasswordResetting}>
                      {isPasswordResetting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          处理中
                        </>
                      ) : (
                        "重置密码"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  冻结账户
                </h3>
                <div className="bg-muted/30 p-3 rounded-md mb-4">
                  <p className="text-sm text-muted-foreground">
                    冻结账户后，该代理将无法登录系统和接收订单。
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant={formData.status === 'active' ? "destructive" : "default"}
                    onClick={handleToggleFreeze}
                    disabled={isFreezingAccount}
                  >
                    {isFreezingAccount ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中
                      </>
                    ) : formData.status === 'active' ? (
                      "冻结账户"
                    ) : (
                      "激活账户"
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setActiveTab("rate")}>
                返回
              </Button>
              <Button type="button" onClick={() => setDialogOpen(false)}>
                完成
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentDialog;