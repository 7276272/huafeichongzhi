import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ArrowUpRight, CheckCircle, XCircle, Clock } from "lucide-react";

interface OrderStatsSectionProps {
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  pendingOrders: number;
  salesTrend: { date: string; sales: number; orders: number; }[];
  carrierStats: { carrier: string; count: number; amount: number; }[];
}

const OrderStatsSection = ({
  totalOrders,
  completedOrders,
  failedOrders,
  pendingOrders,
  salesTrend,
  carrierStats
}: OrderStatsSectionProps) => {
  // 计算完成率
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const failureRate = totalOrders > 0 ? Math.round((failedOrders / totalOrders) * 100) : 0;
  const pendingRate = totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">订单统计</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">总订单数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{totalOrders.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                12%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">已完成订单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">{completedOrders.toLocaleString()}</span>
                <span className="text-green-600 flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {completionRate}%
                </span>
              </div>
              <div className="progress-bar mt-2">
                <div className={`progress-bar-completed chart-bar-w-${Math.round(completionRate)}`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">失败订单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">{failedOrders.toLocaleString()}</span>
                <span className="text-red-600 flex items-center text-sm">
                  <XCircle className="h-4 w-4 mr-1" />
                  {failureRate}%
                </span>
              </div>
              <div className="progress-bar mt-2">
                <div className={`progress-bar-failed chart-bar-w-${Math.round(failureRate)}`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">待处理订单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">{pendingOrders.toLocaleString()}</span>
                <span className="text-yellow-600 flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {pendingRate}%
                </span>
              </div>
              <div className="progress-bar mt-2">
                <div className={`progress-bar-pending chart-bar-w-${Math.round(pendingRate)}`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">订单趋势</h3>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {salesTrend && salesTrend.length > 0 ? (
              <div className="w-full h-full">
                <ul className="space-y-4">
                  {salesTrend.slice(-5).map((item, index) => (
                    <li key={index} className="flex flex-col">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.date}</span>
                        <span>{item.orders} 笔订单</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className={`chart-bar-blue chart-bar-w-${Math.min(100, Math.round((item.orders / Math.max(...salesTrend.map(s => s.orders))) * 100))}`}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-500">暂无订单趋势数据</div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">运营商分布</h3>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {carrierStats && carrierStats.length > 0 ? (
              <div className="w-full h-full">
                <ul className="space-y-4">
                  {carrierStats.map((item, index) => (
                    <li key={index} className="flex flex-col">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.carrier}</span>
                        <span>{item.count} 笔 / ¥{item.amount.toLocaleString()}</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className={`${index % 3 === 0 ? 'chart-bar-blue' : index % 3 === 1 ? 'chart-bar-green' : 'chart-bar-purple'} chart-bar-w-${Math.min(100, Math.round((item.count / Math.max(...carrierStats.map(c => c.count))) * 100))}`}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-500">暂无运营商分布数据</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow">
        <h3 className="text-lg font-medium mb-4">订单状态分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-green-700 flex items-center"><CheckCircle className="h-4 w-4 mr-2" />已完成</h4>
              <span className="text-lg font-bold">{completionRate}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">共 {completedOrders} 笔订单已成功完成</p>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-red-700 flex items-center"><XCircle className="h-4 w-4 mr-2" />失败</h4>
              <span className="text-lg font-bold">{failureRate}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">共 {failedOrders} 笔订单处理失败</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-yellow-700 flex items-center"><Clock className="h-4 w-4 mr-2" />待处理</h4>
              <span className="text-lg font-bold">{pendingRate}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">共 {pendingOrders} 笔订单等待处理</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatsSection;
