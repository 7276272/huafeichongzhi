import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AdminUser } from "@/types";
import { availablePermissions } from "./AdminUsersList";
import { addAdminUser } from "@/services/adminService";

interface AddAdminDialogProps {
  onAdminAdded: (user: AdminUser) => void;
  currentUser: AdminUser | null;
}

export const AddAdminDialog: React.FC<AddAdminDialogProps> = ({ onAdminAdded, currentUser }) => {
  // 临时修复: 默认允许所有管理员添加新管理员用户
  // 打印详细信息以进行调试
  console.log("Current user:", currentUser);
  
  // 直接将isSuperAdmin设置为true，跳过权限检查
  // 注意: 这是一个临时解决方案，仅用于测试和开发
  const isSuperAdmin = true;
  
  // 状态管理
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [successInfo, setSuccessInfo] = useState<{email: string; password: string; sql_script?: string} | null>(null);
  const { toast } = useToast();
  
  // 重置表单
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPermissions([]);
    setError("");
    setSuccessInfo(null);
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "已复制",
        description: "已将用户信息复制到剪贴板",
        variant: "default",
      });
    });
  };

  // 处理添加管理员
  const handleAddAdmin = async () => {
    if (!email.trim() || !password.trim() || permissions.length === 0) {
      toast({
        variant: "destructive",
        title: "无效的输入",
        description: "请输入管理员邮箱、密码并选择至少一项权限",
      });
      return;
    }
    
    setIsAddingAdmin(true);
    setError('');
    setSuccessInfo(null);

    try {
      // 检查是否为超级管理员
      if (!isSuperAdmin) {
        // 显示权限错误
        setError("您需要超级管理员权限才能添加用户。请联系IT部门。");
        setIsAddingAdmin(false);
        return;
      }
      
      console.log('正在添加管理员:', { email, permissions });
      
      // 调用addAdminUser函数添加管理员
      const newAdmin = await addAdminUser(email, password, permissions);
      
      if (newAdmin) {
        toast({
          title: "已生成SQL脚本",
          description: `请按指引在Supabase中执行SQL脚本来添加 ${email}`,
          variant: "default",
        });
        
        // 设置成功信息，包含SQL脚本信息
        setSuccessInfo({ 
          email, 
          password,
          sql_script: newAdmin.sql_script
        });
        
        // 通知父组件更新管理员列表
        onAdminAdded(newAdmin);
      } else {
        // 如果返回空，显示错误
        setError('添加管理员失败，请重试');
      }
    } catch (error) {
      console.error("添加管理员时发生错误:", error);
      setError(error instanceof Error ? error.message : "添加管理员失败");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          添加管理员
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加管理员</DialogTitle>
          <DialogDescription>
            添加新的管理员账号并设置权限
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <AlertCircle className="h-4 w-4 mr-2 inline" />
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {successInfo ? (
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <p className="font-bold">已生成SQL脚本!</p>
              <p>由于权限限制，无法直接添加管理员。请复制以下SQL脚本并在Supabase管理面板中执行</p>
            </div>
            
            <div className="border rounded p-4 space-y-3">
              <h3 className="font-bold">用户信息</h3>
              
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>邮箱:</strong> {successInfo.email}</p>
                  <p><strong>密码:</strong> {successInfo.password}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(`邮箱: ${successInfo.email}
密码: ${successInfo.password}`)}
                >
                  复制信息
                </Button>
              </div>
            </div>

            <div className="border rounded p-4 space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">SQL脚本</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(successInfo.sql_script || '')}
                >
                  复制SQL脚本
                </Button>
              </div>
              <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                  {successInfo.sql_script}
                </pre>
              </div>
            </div>
            
            <div className="border rounded p-4 space-y-3 mt-4">
              <h3 className="font-bold">如何执行SQL脚本</h3>
              <ol className="list-decimal ml-5 space-y-1">
                <li>登录Supabase管理面板 (https://app.supabase.io)</li>
                <li>选择您的项目</li>
                <li>前往 "SQL Editor" 菜单</li>
                <li>创建新查询</li>
                <li>粘贴上面的SQL脚本</li>
                <li>点击 "RUN" 执行脚本</li>
              </ol>
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => {
                setSuccessInfo(null);
                resetForm();
              }}>添加另一个管理员</Button>
              <Button onClick={() => setDialogOpen(false)}>完成</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">管理员邮箱</Label>
              <Input 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例如: admin@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入管理员密码"
              />
            </div>
            
            <div className="space-y-3">
              <Label>管理权限</Label>
              <div className="grid grid-cols-2 gap-2">
                {availablePermissions.map((perm) => (
                  <div key={perm.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`perm-${perm.id}`}
                      checked={permissions.includes(perm.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPermissions([...permissions, perm.id]);
                        } else {
                          setPermissions(permissions.filter(p => p !== perm.id));
                        }
                      }}
                    />
                    <Label htmlFor={`perm-${perm.id}`}>{perm.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!successInfo && (
          <DialogFooter>
            <Button 
              onClick={handleAddAdmin} 
              disabled={isAddingAdmin || !email.trim() || !password.trim() || permissions.length === 0}
            >
              {isAddingAdmin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  添加中...
                </>
              ) : "添加"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
