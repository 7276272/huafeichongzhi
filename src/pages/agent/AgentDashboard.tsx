import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, LogOut, TrendingUp, CalendarDays, CircleDollarSign, ArrowUp, ArrowDown, CheckCircle, XCircle, Users, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Agent, RechargeOrder } from "@/types";
import AgentLayout from "@/components/agent/AgentLayout";
import ProcessOrderDialog from "@/components/agent/ProcessOrderDialog";
import ReferralDashboard from "@/components/agent/ReferralDashboard";
import { getAgentOrderStats, AgentOrderStats } from "@/services/agentStatsService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<RechargeOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RechargeOrder | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [orderStats, setOrderStats] = useState<AgentOrderStats>({
    todayOrderCount: 0,
    todayOrderAmount: 0,
    todayCompletedCount: 0,
    todayCompletedAmount: 0,
    todayCanceledCount: 0,
    todayCanceledAmount: 0,
    weekOrderCount: 0,
    weekOrderAmount: 0,
    monthOrderAmount: 0,
    lastMonthOrderAmount: 0
  });

  // 加载待处理订单
  const loadPendingOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recharge_orders')
        .select('*')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPendingOrders(data as RechargeOrder[]);
    } catch (error) {
      console.error("Error loading pending orders:", error);
      toast({
        variant: "destructive",
        title: "加载失败",
        description: "无法加载待处理订单",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // 加载订单统计数据
  const loadOrderStats = useCallback(async (agentId: string) => {
    setIsStatsLoading(true);
    try {
      const stats = await getAgentOrderStats(agentId);
      setOrderStats(stats);
    } catch (error) {
      console.error("加载订单统计数据失败:", error);
      toast({
        variant: "destructive",
        title: "统计数据加载失败",
        description: "无法加载订单统计数据",
      });
    } finally {
      setIsStatsLoading(false);
    }
  }, [toast]);

  // 加载代理信息和订单
  useEffect(() => {
    // 获取存储的代理信息
    const agentData = localStorage.getItem("agent");
    console.log("从本地存储读取的代理数据:", agentData);
    
    if (!agentData) {
      toast({
        variant: "destructive",
        title: "未登录",
        description: "请先登录代理账号",
      });
      navigate("/vip");
      return;
    }
    
    try {
      // 确保解析正确
      const parsedAgent = JSON.parse(agentData);
      console.log("解析后的代理数据:", parsedAgent);
      
      if (!parsedAgent || !parsedAgent.id) {
        throw new Error("代理信息不完整");
      }
      
      // 如果收到已经解析的对象，直接使用
      setAgent(parsedAgent);
      
      // 添加日志显示设置后的agent值
      console.log("设置后的代理状态:", parsedAgent);
      
      // 加载订单列表
      loadPendingOrders();
      
      // 加载订单统计数据
      if (parsedAgent.id) {
        loadOrderStats(parsedAgent.id);
      }
    } catch (error) {
      console.error("代理数据解析错误:", error);
      localStorage.removeItem("agent");
      toast({
        variant: "destructive",
        title: "登录信息错误",
        description: "请重新登录代理账号",
      });
      navigate("/vip");
    }
  }, [navigate, toast, loadPendingOrders, loadOrderStats]);

  // 刷新订单列表和统计数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPendingOrders();
    if (agent?.id) {
      await loadOrderStats(agent.id);
    }
    setIsRefreshing(false);
  };

  // 抢单
  const handleClaimOrder = async (order: RechargeOrder) => {
    try {
      if (!agent) {
        toast({
          variant: "destructive",
          title: "未登录",
          description: "请先登录代理账号",
        });
        return;
      }
      
      // 确保代理ID存在
      if (!agent.id) {
        throw new Error('代理信息不完整，请重新登录');
      }
      
      // 确保订单ID存在
      if (!order.id) {
        throw new Error('订单ID不存在');
      }
      
      // 更新订单状态为处理中，并添加代理ID
      const { error } = await supabase
        .from('recharge_orders')
        .update({
          status: 'processing',
          processed_by: agent.id
        })
        .eq('id', order.id);
        
      if (error) throw error;
      
      // 刷新订单列表
      await loadPendingOrders();
      
      // 显示成功消息
      toast({
        title: "抢单成功",
        description: `已成功抢到${order.amount}元订单，请及时处理，处理完成后上传交易凭证 点击已完成`,
      });
      
    } catch (error) {
      console.error("Error claiming order:", error);
      toast({
        variant: "destructive",
        title: "抢单失败",
        description: error instanceof Error ? error.message : "操作失败，请重试",
      });
    }
  };

  // 打开处理订单对话框
  const openProcessDialog = (order: RechargeOrder) => {
    setSelectedOrder(order);
    setProcessDialogOpen(true);
  };

  // 处理订单成功
  const handleOrderProcessed = (_processedOrder: RechargeOrder) => {
    // 刷新订单列表和统计数据
    loadPendingOrders();
    if (agent?.id) {
      loadOrderStats(agent.id);
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem("agent");
    localStorage.removeItem("agentLoggedIn");
    navigate("/vip");
  };

  return (
    <AgentLayout>
      <div className="flex flex-col space-y-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">欢迎，{agent?.name || '代理'}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  刷新中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              退出
            </Button>
          </div>
        </div>
      
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders" className="flex items-center">
              <CircleDollarSign className="mr-2 h-4 w-4" />
              订单处理
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              推广管理
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="mt-4 space-y-6">

        {/* 数据统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* 今日订单总计 */}
          <Card className="col-span-1 md:col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <CalendarDays className="mr-1 h-4 w-4" />
                今日总订单
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex justify-center items-center h-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">¥{orderStats.todayOrderAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    订单数量: <span className="font-medium">{orderStats.todayOrderCount}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 今日已完成订单 */}
          <Card className="col-span-1 md:col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center">
                <CheckCircle className="mr-1 h-4 w-4" />
                已完成订单
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex justify-center items-center h-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-green-600">¥{orderStats.todayCompletedAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    数量: <span className="font-medium">{orderStats.todayCompletedCount}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 今日已取消订单 */}
          <Card className="col-span-1 md:col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center">
                <XCircle className="mr-1 h-4 w-4" />
                已取消订单
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex justify-center items-center h-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-red-600">¥{orderStats.todayCanceledAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    数量: <span className="font-medium">{orderStats.todayCanceledCount}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 本周订单数据 */}
          <Card className="col-span-1 md:col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="mr-1 h-4 w-4" />
                本周订单
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex justify-center items-center h-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">¥{orderStats.weekOrderAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    订单数量: <span className="font-medium">{orderStats.weekOrderCount}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 本月订单数据 */}
          <Card className="col-span-1 md:col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <CircleDollarSign className="mr-1 h-4 w-4" />
                本月订单
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex justify-center items-center h-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">¥{orderStats.monthOrderAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 上月订单对比 */}
          <Card className="col-span-1 md:col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <CircleDollarSign className="mr-1 h-4 w-4" />
                上月订单
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex justify-center items-center h-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">¥{orderStats.lastMonthOrderAmount.toFixed(2)}</span>
                  </div>
                  {/* 与本月比较 */}
                  <div className="text-xs flex items-center">
                    {orderStats.monthOrderAmount > orderStats.lastMonthOrderAmount ? (
                      <>
                        <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                        <span className="text-green-500">
                          {orderStats.lastMonthOrderAmount > 0 
                            ? `增长${(((orderStats.monthOrderAmount - orderStats.lastMonthOrderAmount) / orderStats.lastMonthOrderAmount) * 100).toFixed(0)}%` 
                            : '新增长'}
                        </span>
                      </>
                    ) : orderStats.monthOrderAmount < orderStats.lastMonthOrderAmount ? (
                      <>
                        <ArrowDown className="h-3 w-3 mr-1 text-red-500" />
                        <span className="text-red-500">
                          {`下降${(((orderStats.lastMonthOrderAmount - orderStats.monthOrderAmount) / orderStats.lastMonthOrderAmount) * 100).toFixed(0)}%`}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">持平</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* 月环比 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                月环比
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isStatsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {orderStats.lastMonthOrderAmount > 0 ? (
                      <>
                        {((orderStats.monthOrderAmount - orderStats.lastMonthOrderAmount) / orderStats.lastMonthOrderAmount * 100).toFixed(1)}%
                        {orderStats.monthOrderAmount > orderStats.lastMonthOrderAmount ? (
                          <ArrowUp className="inline h-4 w-4 text-green-500 ml-1" />
                        ) : (
                          <ArrowDown className="inline h-4 w-4 text-red-500 ml-1" />
                        )}
                      </>
                    ) : (
                      '无数据'
                    )}
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                与上月相比
              </p>
            </CardContent>
          </Card>
          {/* USDT余额 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                USDT余额
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {agent?.usdt_balance ? agent.usdt_balance.toFixed(2) : '0.00'} USDT
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                汇率: 1 RMB = {agent?.exchange_rate || 0.14} USDT
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="space-y-0">
            <div className="flex items-center justify-between">
              <CardTitle>待处理充值订单</CardTitle>
              <Badge variant="outline">{pendingOrders.length}</Badge>
            </div>
            <CardDescription>
              点击处理按钮来完成或标记订单失败
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                当前没有待处理的订单
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号/手机号</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>运营商/地区</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => {
                      // 格式化订单ID显示
                      const displayOrderId = order.id ? 
                        `ord-${order.id.substring(0, 3)}-${order.id.substring(3, 7)}` : 
                        '未知ID';
                        
                      // 格式化订单日期
                      const orderDate = order.created_at 
                        ? new Date(order.created_at).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '未知时间';
                        
                      // 格式化运营商信息
                      const carrierDisplay = typeof order.carrier === 'string' && order.carrier.length < 20 
                        ? order.carrier
                        : '未知运营商';
                        
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{displayOrderId}</span>
                              <span className="text-xs text-muted-foreground">{order.phone_number}</span>
                              <span className="text-xs text-muted-foreground">{orderDate}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-primary">￥{order.amount || 0}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{carrierDisplay}</span>
                              <span className="text-xs text-muted-foreground">{order.city || '未知地区'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.processed_by ? (
                              <Badge variant="outline" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                已锁定
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
                                新订单
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {order.processed_by ? (
                              order.processed_by === agent?.id ? (
                                <Button variant="default" className="w-full" onClick={() => openProcessDialog(order)}>
                                  查看详情
                                </Button>
                              ) : (
                                <Button variant="outline" className="w-full" disabled>
                                  已被锁定
                                </Button>
                              )
                            ) : (
                              <Button 
                                variant="default" 
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleClaimOrder(order)}
                              >
                                抢单
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
            
          <TabsContent value="referrals" className="mt-4">
            <ReferralDashboard agent={agent} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 处理订单对话框 */}
      {selectedOrder && (
        <ProcessOrderDialog 
          open={processDialogOpen} 
          onOpenChange={setProcessDialogOpen} 
          order={selectedOrder} 
          onOrderProcessed={(order) => {
            if (order) handleOrderProcessed(order);
          }}
          agentId={agent?.id || ''}
        />
      )}
    </AgentLayout>
  );
}
