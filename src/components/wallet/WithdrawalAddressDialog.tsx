import React, { useState } from 'react';
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
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveUserWithdrawalAddress } from "@/services/walletWithdrawalService";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui";

// 提现地址验证schema
const withdrawalAddressSchema = z.object({
  address: z.string().min(10, {
    message: "提现地址不能少于10个字符",
  }),
  addressType: z.enum(["TRC20", "ERC20"], {
    required_error: "请选择地址类型",
  }),
  transactionPassword: z.string().min(6, {
    message: "交易密码不能少于6个字符",
  }),
  confirmPassword: z.string().min(6, {
    message: "确认密码不能少于6个字符",
  }),
}).refine((data) => data.transactionPassword === data.confirmPassword, {
  message: "交易密码与确认密码不匹配",
  path: ["confirmPassword"],
});

type WithdrawalAddressFormValues = z.infer<typeof withdrawalAddressSchema>;

interface WithdrawalAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onAddressAdded: () => void;
}

const WithdrawalAddressDialog: React.FC<WithdrawalAddressDialogProps> = ({
  open,
  onOpenChange,
  userId,
  onAddressAdded
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<WithdrawalAddressFormValues>({
    resolver: zodResolver(withdrawalAddressSchema),
    defaultValues: {
      address: "",
      addressType: "TRC20",
      transactionPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: WithdrawalAddressFormValues) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "用户信息不存在，请重新登录",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await saveUserWithdrawalAddress(
        userId,
        values.address,
        values.addressType,
        values.transactionPassword
      );
      
      toast({
        title: "提现地址已保存",
        description: "您的提现地址已成功保存",
      });
      
      onOpenChange(false);
      onAddressAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">绑定提现地址</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="addressType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>USDT网络类型</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="TRC20" id="trc20" />
                        <label htmlFor="trc20" className="text-sm font-medium leading-none cursor-pointer">
                          TRC20 (推荐)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ERC20" id="erc20" />
                        <label htmlFor="erc20" className="text-sm font-medium leading-none cursor-pointer">
                          ERC20
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>USDT提现地址</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="请输入您的USDT提现地址" 
                      {...field} 
                    />
                  </FormControl>
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
                      placeholder="设置交易密码" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认交易密码</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="再次输入交易密码" 
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
                {isSubmitting ? <LoadingSpinner size="small" text="" /> : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalAddressDialog;
