import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface SubordinateAgent {
  id: string;
  name: string;
  email: string;
  account_balance: number;
  usdt_balance: number;
  commission_rate: number; // 汇率: 1 USDT = ? RMB
  today_orders_amount: number;
  yesterday_orders_amount: number;
  month_orders_amount: number;
  cancelled_orders_amount: number;
  cancelled_orders_count: number;
  today_withdrawal_amount: number;
  total_withdrawal_amount: number;
  is_active: boolean;
}

interface AgentSubordinatesDialogProps {
  agentId: string;
  agentName: string;
  subordinateCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AgentSubordinatesDialog: React.FC<AgentSubordinatesDialogProps> = ({
  agentId,
  agentName,
  subordinateCount,
  open,
  onOpenChange,
}) => {
  const [subordinates, setSubordinates] = useState<SubordinateAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // 加载代理的下级数据
  useEffect(() => {
    if (open && agentId) {
      loadSubordinates();
    }
  }, [open, agentId]);

  const loadSubordinates = async () => {
    setIsLoading(true);
    try {
      // 获取下级代理数据
      const { data: subordinatesData, error } = await supabase
        .from('agents')
        .select('*')
        .eq('parent_agent_id', agentId);

      if (error) throw error;

      if (subordinatesData) {
        // 获取每个下级代理的今日订单金额等数据
        const enrichedSubordinates = await Promise.all(
          subordinatesData.map(async (sub) => {
            // 今日日期
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // 昨日日期
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // 本月第一天
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            // 获取今日订单金额
            const { data: todayOrdersData } = await supabase
              .from('recharge_orders')
              .select('amount')
              .eq('completed_by', sub.id)
              .eq('status', 'completed')
              .gte('completed_at', today.toISOString());
            
            // 获取昨日订单金额
            const { data: yesterdayOrdersData } = await supabase
              .from('recharge_orders')
              .select('amount')
              .eq('completed_by', sub.id)
              .eq('status', 'completed')
              .gte('completed_at', yesterday.toISOString())
              .lt('completed_at', today.toISOString());
            
            // 获取当月订单金额
            const { data: monthOrdersData } = await supabase
              .from('recharge_orders')
              .select('amount')
              .eq('completed_by', sub.id)
              .eq('status', 'completed')
              .gte('completed_at', firstDayOfMonth.toISOString());
            
            // 获取取消订单信息
            const { data: cancelledOrdersData } = await supabase
              .from('recharge_orders')
              .select('amount')
              .eq('completed_by', sub.id)
              .eq('status', 'failed');
            
            // 获取今日提现金额
            const { data: todayWithdrawalsData } = await supabase
              .from('agent_transactions')
              .select('amount')
              .eq('agent_id', sub.id)
              .eq('type', 'withdrawal')
              .eq('status', 'completed')
              .gte('created_at', today.toISOString());
            
            // 获取总提现金额
            const { data: totalWithdrawalsData } = await supabase
              .from('agent_transactions')
              .select('amount')
              .eq('agent_id', sub.id)
              .eq('type', 'withdrawal')
              .eq('status', 'completed');
            
            // 计算各项金额
            const todayOrdersAmount = todayOrdersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
            const yesterdayOrdersAmount = yesterdayOrdersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
            const monthOrdersAmount = monthOrdersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
            const cancelledOrdersAmount = cancelledOrdersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
            const cancelledOrdersCount = cancelledOrdersData?.length || 0;
            const todayWithdrawalAmount = todayWithdrawalsData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
            const totalWithdrawalAmount = totalWithdrawalsData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
            
            return {
              ...sub,
              today_orders_amount: todayOrdersAmount,
              yesterday_orders_amount: yesterdayOrdersAmount,
              month_orders_amount: monthOrdersAmount,
              cancelled_orders_amount: cancelledOrdersAmount,
              cancelled_orders_count: cancelledOrdersCount,
              today_withdrawal_amount: todayWithdrawalAmount,
              total_withdrawal_amount: totalWithdrawalAmount,
              account_balance: sub.balance || 0,
              usdt_balance: sub.usdt_balance || 0
            };
          })
        );

        setSubordinates(enrichedSubordinates as SubordinateAgent[]);
      }
    } catch (error) {
      console.error('加载下级代理数据失败:', error);
      toast({
        variant: "destructive",
        title: "加载失败",
        description: "无法加载下级代理数据，请稍后再试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // 格式化USDT金额
  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount) + ' USDT';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agentName || `代理(${agentId.slice(0, 8)})`}的下级代理</DialogTitle>
          <DialogDescription>
            共 {subordinateCount} 个下级代理，查看每个下级代理的详细数据
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="details">详细数据</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">下级代理总数</div>
                  <div className="text-2xl font-bold mt-1">{subordinateCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">下级今日订单总金额</div>
                  <div className="text-2xl font-bold mt-1 text-green-600">
                    {formatAmount(subordinates.reduce((sum, sub) => sum + sub.today_orders_amount, 0))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">下级昨日订单总金额</div>
                  <div className="text-2xl font-bold mt-1 text-blue-600">
                    {formatAmount(subordinates.reduce((sum, sub) => sum + sub.yesterday_orders_amount, 0))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">下级当月订单总金额</div>
                  <div className="text-2xl font-bold mt-1 text-purple-600">
                    {formatAmount(subordinates.reduce((sum, sub) => sum + sub.month_orders_amount, 0))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">下级今日提现总金额</div>
                  <div className="text-2xl font-bold mt-1 text-orange-600">
                    {formatUSDT(subordinates.reduce((sum, sub) => sum + sub.today_withdrawal_amount, 0))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm font-medium">下级总提现总金额</div>
                  <div className="text-2xl font-bold mt-1 text-red-600">
                    {formatUSDT(subordinates.reduce((sum, sub) => sum + sub.total_withdrawal_amount, 0))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>代理名称</TableHead>
                      <TableHead>代理邮箱</TableHead>
                      <TableHead>账户余额</TableHead>
                      <TableHead>USDT余额</TableHead>
                      <TableHead>汇率</TableHead>
                      <TableHead>今日订单金额</TableHead>
                      <TableHead>昨日订单金额</TableHead>
                      <TableHead>当月订单金额</TableHead>
                      <TableHead>取消订单金额</TableHead>
                      <TableHead>取消订单笔数</TableHead>
                      <TableHead>今日提现金额</TableHead>
                      <TableHead>总提现金额</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subordinates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="h-24 text-center">
                          暂无下级代理数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      subordinates.map((subordinate) => (
                        <TableRow key={subordinate.id}>
                          <TableCell className="font-medium">{subordinate.name || `代理${subordinate.id.slice(0, 4)}`}</TableCell>
                          <TableCell>{subordinate.email}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatAmount(subordinate.account_balance)}
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            {formatUSDT(subordinate.usdt_balance)}
                          </TableCell>
                          <TableCell>
                            {subordinate.commission_rate?.toFixed(1) || '7.2'}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatAmount(subordinate.today_orders_amount)}
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            {formatAmount(subordinate.yesterday_orders_amount)}
                          </TableCell>
                          <TableCell className="font-medium text-purple-600">
                            {formatAmount(subordinate.month_orders_amount)}
                          </TableCell>
                          <TableCell className="font-medium text-red-600">
                            {formatAmount(subordinate.cancelled_orders_amount)}
                          </TableCell>
                          <TableCell>
                            {subordinate.cancelled_orders_count}
                          </TableCell>
                          <TableCell className="font-medium text-orange-600">
                            {formatUSDT(subordinate.today_withdrawal_amount)}
                          </TableCell>
                          <TableCell className="font-medium text-red-600">
                            {formatUSDT(subordinate.total_withdrawal_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={subordinate.is_active ? "default" : "outline"} className={subordinate.is_active ? "bg-green-500 hover:bg-green-500/80" : "text-muted-foreground"}>
                              {subordinate.is_active ? "活跃" : "禁用"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AgentSubordinatesDialog;
