import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, LineChart } from "lucide-react";

interface FinancialStatsSectionProps {
  totalSales: number;
  totalRefunds: number;
  netRevenue: number;
  grossProfit: number;
  salesTrend: { date: string; sales: number; orders: number; }[];
  paymentMethodStats: { method: string; count: number; amount: number; }[];
}

const FinancialStatsSection = ({
  totalSales,
  totalRefunds,
  netRevenue,
  grossProfit,
  salesTrend,
  paymentMethodStats
}: FinancialStatsSectionProps) => {
  // u589eu957fu7387u8ba1u7b97uff08u8fd9u91ccu7b80u5355u6f14u793auff0cu5b9eu9645u9879u76eeu5e94u4eceu540eu7aefu83b7u53d6uff09
  const growthRate = 15;
  
  // u8ba1u7b97u6bd4u4f8b
  const refundRate = totalSales > 0 ? Math.round((totalRefunds / totalSales) * 100) : 0;
  const profitMargin = netRevenue > 0 ? Math.round((grossProfit / netRevenue) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">u8d22u52a1u7edfu8ba1</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">u603bu9500u552eu989d</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">u00a5{totalSales.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {growthRate}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">u9000u6b3eu91d1u989d</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">u00a5{totalRefunds.toLocaleString()}</span>
              <span className="text-red-600 flex items-center text-sm">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                {refundRate}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">u51c0u6536u5165</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">u00a5{netRevenue.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {growthRate - 2}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">u6bdbu5229u6da6</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">u00a5{grossProfit.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {profitMargin}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">u6536u5165u8d8bu52bf</h3>
            <LineChart className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {salesTrend && salesTrend.length > 0 ? (
              <div className="w-full h-full">
                <ul className="space-y-4">
                  {salesTrend.slice(-5).map((item, index) => (
                    <li key={index} className="flex flex-col">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.date}</span>
                        <span>u00a5{item.sales.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className={`bg-green-500 h-2.5 rounded-full chart-bar-w-${Math.min(100, Math.round((item.sales / Math.max(...salesTrend.map(s => s.sales))) * 100))}`}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-500">u6682u65e0u6536u5165u8d8bu52bfu6570u636e</div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">u652fu4ed8u65b9u5f0fu5206u5e03</h3>
            <DollarSign className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {paymentMethodStats && paymentMethodStats.length > 0 ? (
              <div className="w-full h-full">
                <ul className="space-y-4">
                  {paymentMethodStats.map((item, index) => (
                    <li key={index} className="flex flex-col">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{getPaymentMethodLabel(item.method)}</span>
                        <span>{item.count} u7b14 / u00a5{item.amount.toLocaleString()}</span>
                      </div>
                      <div className="chart-bar">
                        <div 
                          className={`${index % 4 === 0 ? 'chart-bar-blue' : index % 4 === 1 ? 'chart-bar-green' : index % 4 === 2 ? 'chart-bar-purple' : 'chart-bar-yellow'} chart-bar-w-${Math.min(100, Math.round((item.amount / Math.max(...paymentMethodStats.map(p => p.amount))) * 100))}`}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-500">u6682u65e0u652fu4ed8u65b9u5f0fu6570u636e</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow">
        <h3 className="text-lg font-medium mb-4">u8d22u52a1u6307u6807u5206u6790</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <div className="flex justify-between text-sm mb-1">
              <span>u6bdbu5229u7387</span>
              <span className="font-semibold">{profitMargin}%</span>
            </div>
            <div className="chart-bar">
              <div className={`chart-bar-green chart-bar-w-${Math.round(profitMargin)}`}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">u6bdbu5229u6da6u5360u51c0u6536u5165u7684u767eu5206u6bd4</p>
          </div>
          
          <div className="flex flex-col">
            <div className="flex justify-between text-sm mb-1">
              <span>u9000u6b3eu7387</span>
              <span className="font-semibold">{refundRate}%</span>
            </div>
            <div className="chart-bar">
              <div className={`chart-bar-red chart-bar-w-${Math.round(refundRate)}`}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">u9000u6b3eu91d1u989du5360u603bu9500u552eu989du7684u767eu5206u6bd4</p>
          </div>
          
          <div className="flex flex-col">
            <div className="flex justify-between text-sm mb-1">
              <span>u589eu957fu7387</span>
              <span className="font-semibold">{growthRate}%</span>
            </div>
            <div className="chart-bar">
              <div className={`chart-bar-blue chart-bar-w-${Math.min(100, Math.round(growthRate))}`}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">u4e0eu53bbu5e74u540cu671fu76f8u6bd4u7684u589eu957fu7387</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// u652fu4ed8u65b9u5f0fu6807u7b7eu8f6cu6362
const getPaymentMethodLabel = (method: string): string => {
  const methodMap: Record<string, string> = {
    wallet: 'u94b1u5305u652fu4ed8',
    alipay: 'u652fu4ed8u5b9d',
    wechat: 'u5faeu4fe1u652fu4ed8',
    bank: 'u94f6u884cu5361',
    crypto: 'u52a0u5bc6u8d27u5e01'
  };
  
  return methodMap[method] || method;
};

export default FinancialStatsSection;
