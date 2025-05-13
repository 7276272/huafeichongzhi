
import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock 
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

// Type for combined transaction items
export type CombinedTransactionItem = {
  id: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  isTransaction?: boolean;
  isRequest?: boolean;
};

interface TransactionListProps {
  transactions: CombinedTransactionItem[];
  isLoading: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, isLoading }) => {

  // Function to format date
  const formatDate = (date: string) => {
    return format(new Date(date), 'yyyy-MM-dd HH:mm');
  };

  // Get transaction status icon
  const getTransactionIcon = (type: string) => {
    if (type === 'deposit') {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    } else if (type === 'withdrawal') {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    } else {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get recharge request status
  const getRequestStatusText = (status: string) => {
    if (status === 'completed') {
      return <span className="text-green-500">已完成</span>;
    } else if (status === 'pending') {
      return <span className="text-amber-500">处理中</span>;
    } else {
      return <span className="text-red-500">已拒绝</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">最近交易</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="small" text="" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center">
                  <div className="bg-gray-100 p-2 rounded-full mr-3">
                    {item.isRequest ? 
                      <Clock className={`h-4 w-4 ${item.status === 'completed' ? 'text-green-500' : item.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`} /> : 
                      getTransactionIcon(item.type)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {item.isRequest ? 
                        '充值申请' : 
                        item.type === 'deposit' ? '充值' : 
                        item.type === 'withdrawal' ? '提现' : '调整'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${item.type === 'deposit' || item.type === 'recharge' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'deposit' || item.type === 'recharge' ? '+' : '-'}{item.amount.toFixed(2)} USDT
                  </p>
                  <p className="text-xs">
                    {item.isRequest ? 
                      getRequestStatusText(item.status) : 
                      item.status === 'completed' ? 
                        <span className="text-green-500">已完成</span> : 
                        <span className="text-amber-500">处理中</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">
            暂无交易记录
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
