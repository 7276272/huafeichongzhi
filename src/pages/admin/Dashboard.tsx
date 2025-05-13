
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, getOrders } from "@/services";
import { DashboardStats, RechargeOrder } from "@/types";
import { ArrowUpRight, CheckCircle, Clock, XCircle } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getAdminStats, AdminStatsData } from "@/services/adminStatsService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRecharges: 0,
    pendingRecharges: 0,
    completedRecharges: 0,
    failedRecharges: 0,
    totalAmount: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<RechargeOrder[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // u52a0u8f7du57fau672cu7edfu8ba1u6570u636e
        const orders = await getOrders();
        const dashboardStats = await getDashboardStats();
        
        // u52a0u8f7du9ad8u7ea7u7edfu8ba1u6570u636e
        const advancedStats = await getAdminStats();
        
        // Get only the 5 most recent orders
        setRecentOrders(orders.slice(0, 5));
        setStats(dashboardStats);
        setAdminStats(advancedStats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3" />
            待处理
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-300">
            <Clock className="h-3 w-3" />
            处理中
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3" />
            已完成
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-300">
            <XCircle className="h-3 w-3" />
            失败
          </Badge>
        );
      default:
        return <Badge variant="outline">未知状态</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">数据看板</h1>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">刷新数据</button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-component-centered">
            <LoadingSpinner size="large" text="加载中..." />
          </div>
        ) : (
          <>
            {/* 统计概览 */}
            <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>统计概览</CardTitle>
              <div className="flex gap-2 text-sm font-normal">
                <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs">今日</button>
                <button className="hover:bg-gray-100 px-3 py-1 rounded-full text-xs">本周</button>
                <button className="hover:bg-gray-100 px-3 py-1 rounded-full text-xs">本月</button>
                <button className="hover:bg-gray-100 px-3 py-1 rounded-full text-xs">全部</button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* 今日销售额 */}
                <div className="col-span-1 md:col-span-1 lg:col-span-2 border rounded-md p-4">
                  <div className="text-sm text-gray-500 mb-1">今日销售额</div>
                  <div className="text-2xl font-bold mb-1">¥{adminStats?.todaySalesAmount.toLocaleString() || '0'}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>同比增长 12.8%</span>
                  </div>
                </div>
                
                {/* u4ecau65e5已完成 */}
                <div className="col-span-1 md:col-span-1 lg:col-span-2 border rounded-md p-4">
                  <div className="text-sm text-gray-500 mb-1">今日已完成</div>
                  <div className="text-2xl font-bold mb-1">¥{adminStats?.todayCompletedAmount.toLocaleString() || '0'}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>同比增长 8.3%</span>
                  </div>
                </div>
                
                {/* u4ecau65e5佣金 */}
                <div className="col-span-1 md:col-span-1 lg:col-span-2 border rounded-md p-4">
                  <div className="text-sm text-gray-500 mb-1">今日佣金</div>
                  <div className="text-2xl font-bold mb-1">¥{adminStats?.todayCommission.toLocaleString() || '0'}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>同比增长 10.2%</span>
                  </div>
                </div>
                
                {/* u4eca日交易总额 */}
                <div className="col-span-1 md:col-span-1 lg:col-span-2 border rounded-md p-4">
                  <div className="text-sm text-gray-500 mb-1">今日交易总额</div>
                  <div className="text-2xl font-bold mb-1">¥{adminStats?.todayTotalAmount.toLocaleString() || '0'}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>同比增长 15.7%</span>
                  </div>
                </div>
                
                {/* u4ecau65e5u8ba2u5355u6570u91cf */}
                <div className="col-span-1 md:col-span-1 lg:col-span-2 border rounded-md p-4">
                  <div className="text-sm text-gray-500 mb-1">今日订单数量</div>
                  <div className="text-2xl font-bold mb-1">{adminStats?.todayOrderCount.toLocaleString() || '0'}</div>
                  <div className="text-xs text-yellow-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>同比增长 2.5%</span>
                  </div>
                </div>
                
                {/* u603bu8ba2u5355u6570u91cf */}
                <div className="col-span-1 md:col-span-1 lg:col-span-2 border rounded-md p-4">
                  <div className="text-sm text-gray-500 mb-1">总订单数量</div>
                  <div className="text-2xl font-bold mb-1">{adminStats?.totalOrderCount.toLocaleString() || '0'}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>累计增长</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* u5468u671fu6570u636e */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>周期数据</CardTitle>
              <div className="flex gap-2 text-sm font-normal">
                <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs">本周</button>
                <button className="hover:bg-gray-100 px-3 py-1 rounded-full text-xs">本月</button>
                <button className="hover:bg-gray-100 px-3 py-1 rounded-full text-xs">上月</button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* u672cu5468u9500u552eu989d */}
                <div className="border rounded-md p-4">
                  <div className="text-sm text-gray-500 mb-1">本周销售额</div>
                  <div className="text-2xl font-bold mb-1">¥{adminStats?.weekSalesAmount.toLocaleString() || '0'}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>同比增长 8.7%</span>
                  </div>
                </div>
                
                {/* u672cu5468u5df2u5b8c成 */}
                <div className="border rounded-md p-4">
                  <div className="text-sm text-gray-500 mb-1">本周已完成</div>
                  <div className="text-2xl font-bold mb-1">¥{adminStats?.weekCompletedAmount.toLocaleString() || '0'}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>同比增长 7.2%</span>
                  </div>
                </div>
                
                {/* u672cu5468u4f63金 */}
                <div className="border rounded-md p-4">
                  <div className="text-sm text-gray-500 mb-1">本周佣金</div>
                  <div className="text-2xl font-bold mb-1">¥{adminStats?.weekCommission.toLocaleString() || '0'}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>同比增长 9.3%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* u57fa础统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                总充值数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">{stats.totalRecharges}</span>
                <span className="text-green-600 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  12%
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                已完成充值
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">{stats.completedRecharges}</span>
                <span className="text-green-600 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  8%
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                待处理充值
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">{stats.pendingRecharges}</span>
                <span className="text-yellow-600 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  2%
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                总收入
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">¥{stats.totalAmount}</span>
                <span className="text-green-600 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  15%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
                <Card>
          <CardHeader>
            <CardTitle>最近订单</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* 桌面端表格显示 */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>运营商</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_id}</TableCell>
                      <TableCell>{order.phone_number}</TableCell>
                      <TableCell>¥{order.amount}</TableCell>
                      <TableCell>{order.carrier}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* 移动端卡片显示 */}
            <div className="sm:hidden">
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm truncate">{order.order_id}</div>
                        <div className="ml-2">{getStatusBadge(order.status)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <div className="text-gray-500">手机号:</div>
                        <div>{order.phone_number}</div>
                        <div className="text-gray-500">金额:</div>
                        <div>¥{order.amount}</div>
                        <div className="text-gray-500">运营商:</div>
                        <div>{order.carrier}</div>
                        <div className="text-gray-500">日期:</div>
                        <div className="text-xs">{formatDate(order.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">没有最近订单</div>
              )}
            </div>
          </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
