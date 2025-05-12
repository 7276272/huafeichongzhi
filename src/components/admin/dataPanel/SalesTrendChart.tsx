import { LineChart } from "lucide-react";

interface SalesTrendChartProps {
  salesTrend: {
    date: string;
    sales: number;
    orders: number;
  }[];
}

const SalesTrendChart = ({ salesTrend = [] }: SalesTrendChartProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">销售趋势</h3>
        <LineChart className="h-5 w-5 text-gray-500" />
      </div>
      
      <div className="h-64 flex items-center justify-center">
        {salesTrend && salesTrend.length > 0 ? (
          <div className="w-full h-full">
            <div className="relative h-48">
              {/* 简易折线图实现 */}
              <div className="absolute inset-0 flex items-end">
                {salesTrend.map((point, index) => {
                  const maxSales = Math.max(...salesTrend.map(s => s.sales), 1);
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`timeline-bar timeline-bar-h-${Math.max(5, Math.round((point.sales / maxSales) * 100))}`}
                      ></div>
                      <div className="text-xs mt-1 transform -rotate-45 origin-top-left truncate w-12">
                        {formatDate(point.date)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 水平网格线 */}
              <div className="absolute inset-0">
                {[0, 1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    className={`timeline-grid-line timeline-grid-pos-${i * 25}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-500">总销售额</div>
                <div className="font-semibold mt-1">
                  ¥{salesTrend.reduce((sum, p) => sum + p.sales, 0).toLocaleString()}
                </div>
              </div>
              
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-500">总订单数</div>
                <div className="font-semibold mt-1">
                  {salesTrend.reduce((sum, p) => sum + p.orders, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">暂无销售趋势数据</div>
        )}
      </div>
    </div>
  );
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  // 处理月份格式 "YYYY-MM"
  if (dateStr.length === 7 && dateStr.includes('-')) {
    return dateStr;
  }
  
  // 处理日期格式 "YYYY-MM-DD"
  try {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } catch (e) {
    return dateStr;
  }
};

export default SalesTrendChart;
