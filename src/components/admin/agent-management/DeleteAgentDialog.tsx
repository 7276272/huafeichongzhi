import React, { useState } from "react";
import { Agent } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { deleteAgent } from "@/services/agentService";
import { AlertTriangle } from "lucide-react";

interface DeleteAgentDialogProps {
  agent: Agent;
  onAgentDeleted: (agentId: string) => void;
}

const DeleteAgentDialog: React.FC<DeleteAgentDialogProps> = ({ agent, onAgentDeleted }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // 处理删除代理
  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      // 删除代理
      await deleteAgent(agent.id);
      
      // 通知父组件更新
      onAgentDeleted(agent.id);
      
      toast({
        title: "删除成功",
        description: `代理 ${agent.name} 已删除`,
        variant: "default",
      });
      
      // 关闭对话框
      setDialogOpen(false);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            确认删除
          </DialogTitle>
          <DialogDescription>
            您确定要删除代理 <span className="font-semibold">{agent.name}</span> 吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <ul className="list-disc pl-4 space-y-1">
              <li>删除代理将永久移除其所有信息</li>
              <li>如果代理有交易记录，将无法删除</li>
              <li>如果代理账户有余额，请先将余额清零</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
            取消
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中
              </>
            ) : (
              "确认删除"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAgentDialog;
