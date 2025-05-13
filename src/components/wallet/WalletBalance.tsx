
import React from 'react';
import { 
  Wallet, 
  ArrowDown, 
  ArrowUp
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WalletBalanceProps {
  balance: number | null;
  isLoading: boolean;
  onRechargeClick: () => void;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  balance, 
  isLoading, 
  onRechargeClick 
}) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-medium">我的钱包</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center bg-gray-50 rounded-full p-4">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">账户余额</p>
            {isLoading ? (
              <div className="flex justify-center mt-2">
                <LoadingSpinner size="small" text="" />
              </div>
            ) : (
              <p className="text-4xl font-bold">
                {balance !== null ? balance.toFixed(2) : "0.00"} USDT
              </p>
            )}
          </div>
          
          <div className="flex gap-4 w-full">
            <Button 
              className="flex-1 h-12" 
              onClick={onRechargeClick}
            >
              <ArrowDown className="mr-2" /> 充值
            </Button>
            <Button 
              className="flex-1 h-12" 
              variant="outline" 
              onClick={() => navigate("/withdraw")}
            >
              <ArrowUp className="mr-2" /> 提现
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            <p>使用USDT稳定币充值和提现</p>
            <p>提现处理时间：24小时内</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
