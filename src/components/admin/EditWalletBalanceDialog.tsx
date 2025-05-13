
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updateUserWalletBalance } from "@/services/walletService";

interface EditWalletBalanceDialogProps {
  userId: string;
  userName: string;
  currentBalance: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditWalletBalanceDialog: React.FC<EditWalletBalanceDialogProps> = ({
  userId,
  userName,
  currentBalance,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newBalance, setNewBalance] = useState<string>(
    currentBalance !== null ? currentBalance.toString() : "0"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNaN(Number(newBalance))) {
      toast({
        title: "无效的金额",
        description: "请输入有效的数字金额",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await updateUserWalletBalance(userId, Number(newBalance));
      
      if (success) {
        toast({
          title: "余额已更新",
          description: `${userName} 的钱包余额已更新为 ${newBalance}`,
        });
        
        // Trigger parent refresh of data
        onSuccess();
      } else {
        throw new Error("Failed to update balance");
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      toast({
        title: "更新失败",
        description: "无法更新用户钱包余额，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>修改用户余额</DialogTitle>
            <DialogDescription>
              更新 {userName || "用户"} 的钱包余额
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-balance" className="text-right">
                当前余额
              </Label>
              <Input
                id="current-balance"
                value={currentBalance !== null ? currentBalance : "未设置"}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-balance" className="text-right">
                新余额
              </Label>
              <Input
                id="new-balance"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="输入新余额"
                className="col-span-3"
                type="number"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                "确认修改"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWalletBalanceDialog;
