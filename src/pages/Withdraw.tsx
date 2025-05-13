
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

const Withdraw = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock balance - in a real app, this would come from your API
  const userBalance = 1000.00;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !address) {
      toast.error("请填写提现金额和USDT钱包地址");
      return;
    }
    
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("请输入有效的提现金额");
      return;
    }
    
    if (withdrawAmount > userBalance) {
      toast.error("余额不足");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("提现申请已提交，请等待审核");
      setIsSubmitting(false);
      navigate("/wallet");
    }, 1500);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">未登录</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate("/auth")}>前往登录</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>USDT提现</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw}>
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">可提现余额</p>
                  <p className="text-2xl font-bold">{userBalance.toFixed(2)} USDT</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">提现金额 (USDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="请输入提现金额"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">USDT钱包地址 (TRC20)</Label>
                  <Input
                    id="address"
                    placeholder="请输入您的USDT钱包地址"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">请确保填写正确的TRC20网络USDT地址</p>
                </div>
                
                <div className="text-sm text-gray-500 space-y-2 bg-gray-50 p-3 rounded-md">
                  <p>• 提现处理时间：24小时内</p>
                  <p>• 最低提现金额：10 USDT</p>
                  <p>• 提现手续费：1%</p>
                </div>
              </div>
              
              <CardFooter className="flex justify-center pt-6 pb-0">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "处理中..." : "确认提现"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Withdraw;
