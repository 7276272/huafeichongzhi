
import React, { useState } from 'react';
import { Copy, DollarSign, CreditCard } from 'lucide-react';
import { LoadingButton, LoadingSpinner } from '@/components/ui';
import { PaymentAddress } from "@/types";
import { createWalletRechargeRequest } from "@/services/walletService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RechargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentAddresses: PaymentAddress[];
  userId: string;
  isLoadingAddresses: boolean;
  onRechargeComplete: () => Promise<void>;
}

const RechargeDialog: React.FC<RechargeDialogProps> = ({ 
  open, 
  onOpenChange, 
  paymentAddresses, 
  userId,
  isLoadingAddresses,
  onRechargeComplete 
}) => {
  const { toast } = useToast();
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Find active TRC20 address
  const trc20Address = paymentAddresses.find(
    addr => addr.type === "TRC20" && addr.active
  );
  
  const copyAddressToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "已复制",
      description: "USDT地址已复制到剪贴板",
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setRechargeAmount(value);
    }
  };

  const handleRechargeComplete = async () => {
    if (!userId) return;
    
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount < 10) {
      toast({
        title: "充值金额错误",
        description: "请输入至少10USDT的充值金额",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Creating recharge request for user:", userId, "amount:", amount);
      
      const result = await createWalletRechargeRequest({ 
        user_id: userId, 
        amount: amount 
      });
      
      console.log("Recharge request created:", result);
      
      toast({
        title: "充值申请已提交",
        description: `您已提交${amount.toFixed(2)}USDT的充值申请，请等待系统确认`,
      });
      
      // Reset form
      setRechargeAmount("");
      
      // Close dialog
      onOpenChange(false);
      
      // Refresh data with a slight delay to allow database to update
      setTimeout(async () => {
        try {
          await onRechargeComplete();
        } catch (error) {
          console.error("Error refreshing wallet data:", error);
        }
      }, 500);
    } catch (error) {
      console.error("Error submitting recharge request:", error);
      toast({
        title: "提交失败",
        description: "充值申请提交失败，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>USDT充值</DialogTitle>
          <DialogDescription>
            请输入充值金额并将USDT转账到以下地址，充值将在区块链确认后到账
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          {/* 充值金额输入 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">充值金额 (USDT)</div>
            <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary">
              <div className="pl-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                type="text"
                value={rechargeAmount}
                onChange={handleAmountChange}
                placeholder="请输入充值金额"
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <p className="text-xs text-gray-500">最低充值金额：10 USDT</p>
          </div>

          <div className="flex justify-center mb-2">
            <CreditCard className="h-12 w-12 text-primary" />
          </div>
          
          {isLoadingAddresses ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="small" text="" />
            </div>
          ) : trc20Address ? (
            <div className="border rounded-md p-3">
              <div className="text-xs text-gray-500 mb-1">USDT-TRC20地址</div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium break-all pr-2">{trc20Address.address}</div>
                <Button variant="ghost" size="sm" onClick={() => copyAddressToClipboard(trc20Address.address)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {trc20Address.description && (
                <div className="text-xs text-gray-500 mt-1">{trc20Address.description}</div>
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 py-2">
              暂无可用充值地址，请联系客服
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-center">
            <p className="text-orange-500">请确保使用TRC20网络进行转账</p>
            <p>充值完成后请保留转账凭证</p>
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            关闭
          </Button>
          <Button 
            onClick={handleRechargeComplete}
            disabled={!rechargeAmount || parseFloat(rechargeAmount) < 10 || isSubmitting}
          >
            {isSubmitting ? (
              <LoadingButton>提交中...</LoadingButton>
            ) : "我已完成充值"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeDialog;
