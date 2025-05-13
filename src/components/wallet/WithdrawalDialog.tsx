import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { requestWithdrawal, getUserWithdrawalAddress } from "@/services/walletWithdrawalService";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui";

// 提现表单验证schema
const withdrawalSchema = z.object({
  amount: z.string().min(1, {
    message: "请输入提现金额",
  }).refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "提现金额必须大于0",
  }),
  transactionPassword: z.string().min(6, {
    message: "交易密码不能少于6个字符",
  }),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userBalance: number;
  onWithdrawalSuccess: () => void;
  onAddressNeeded: () => void;
}

const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userBalance,
  onWithdrawalSuccess,
  onAddressNeeded
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalAddress, setWithdrawalAddress] = useState<any>(null);
  const [isCheckingAddress, setIsCheckingAddress] = useState(true);
  const { toast } = useToast();
  
  // 获取用户的提现地址
  useEffect(() => {
    if (open && userId) {
      const checkAddress = async () => {
        setIsCheckingAddress(true);
        try {
          const address = await getUserWithdrawalAddress(userId);
          setWithdrawalAddress(address);
        } catch (error) {
          console.error("获取提现地址出错:", error);
          setWithdrawalAddress(null);
        } finally {
          setIsCheckingAddress(false);
        }
      };
      
      checkAddress();
    }
  }, [open, userId]);
  
  // 当没有绑定提现地址时，提示用户先绑定
  useEffect(() => {
    if (open && !isCheckingAddress && !withdrawalAddress) {
      toast({
        title: "需要绑定提现地址",
        description: "请先绑定USDT提现地址后再操作",
        variant: "default",
      });
      onOpenChange(false);
      onAddressNeeded();
    }
  }, [open, isCheckingAddress, withdrawalAddress, onOpenChange, onAddressNeeded, toast]);
  
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      transactionPassword: "",
    },
  });

  const onSubmit = async (values: WithdrawalFormValues) => {
    if (!userId || !withdrawalAddress) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "用户信息不存在或未绑定提现地址",
      });
      return;
    }

    const amount = Number(values.amount);
    if (amount > userBalance) {
      toast({
        variant: "destructive",
        title: "提现失败",
        description: "提现金额不能大于当前余额",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await requestWithdrawal(
        userId,
        amount,
        withdrawalAddress.address,
        values.transactionPassword
      );
      
      toast({
        title: "提现申请已提交",
        description: "您的提现申请已提交，请等待处理",
      });
      
      onOpenChange(false);
      onWithdrawalSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "提现失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAddress) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex justify-center py-10">
            <LoadingSpinner size="medium" text="正在检查提现地址..." />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!withdrawalAddress) {
    return null; // 在useEffect中会处理这种情况
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">USDT提现</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 mt-2">
          <p className="text-sm text-gray-500">提现地址: {withdrawalAddress.address.slice(0, 6)}...{withdrawalAddress.address.slice(-6)}</p>
          <p className="text-sm text-gray-500">地址类型: {withdrawalAddress.address_type}</p>
          <p className="text-sm font-medium mt-1">当前余额: {userBalance.toFixed(2)} USDT</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>提现金额</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="请输入提现金额" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    最低提现金额：10 USDT
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="transactionPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>交易密码</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="请输入交易密码" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner size="small" text="" /> : "提交提现"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;
