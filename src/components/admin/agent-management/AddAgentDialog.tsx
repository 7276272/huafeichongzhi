import React, { useState } from "react";
import { Agent } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { addAgent } from "@/services/agentService";

interface AddAgentDialogProps {
  onAgentAdded: (agent: Agent) => void;
}

const AddAgentDialog: React.FC<AddAgentDialogProps> = ({ onAgentAdded }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    commission_rate: 10,
    status: 'active' as 'active' | 'inactive',
  });
  const { toast } = useToast();

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
      commission_rate: 10,
      status: 'active',
    });
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 特殊处理佣金比例字段，确保是数字
    if (name === 'commission_rate') {
      const numValue = parseFloat(value);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 0 : Math.min(Math.max(numValue, 0), 100),
      });
    } else if (name === 'status') {
      setFormData({
        ...formData,
        status: value as 'active' | 'inactive',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 验证表单
      if (!formData.name) throw new Error("代理名称不能为空");
      if (!formData.email) throw new Error("邮箱不能为空");
      if (!formData.phone) throw new Error("手机号不能为空");
      if (!formData.password) throw new Error("密码不能为空");
      
      // 验证密码
      if (formData.password.length < 6) {
        throw new Error("密码不能少于6个字符");
      }
      
      if (formData.password !== formData.password_confirm) {
        throw new Error("两次输入的密码不一致");
      }
      
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

      // 从表单数据中移除password_confirm字段，该字段只用于前端验证
      const { password_confirm, ...agentData } = formData;
      
      // 添加代理
      const newAgent = await addAgent(agentData);
      
      // 通知父组件更新
      onAgentAdded(newAgent);
      
      toast({
        title: "添加成功",
        description: `代理 ${newAgent.name} 已添加`,
        variant: "default",
      });
      
      // 关闭对话框并重置表单
      setDialogOpen(false);
      resetForm();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "添加失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-1" />
          添加代理
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新代理</DialogTitle>
          <DialogDescription>
            添加新的代理用户，设置佣金比例和基本信息
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                代理名称
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="输入代理名称"
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
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="输入代理邮箱"
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
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="输入代理手机号"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                登录密码
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="输入登录密码"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password_confirm" className="text-right">
                确认密码
              </Label>
              <Input
                id="password_confirm"
                name="password_confirm"
                type="password"
                value={formData.password_confirm}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="再次输入密码"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commission_rate" className="text-right">
                佣金比例(%)
              </Label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commission_rate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                状态
              </Label>
              <Select 
                name="status"
                value={formData.status} 
                onValueChange={(value) => handleInputChange({target: {name: 'status', value}} as any)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择代理状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">激活</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
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
                "添加"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAgentDialog;
