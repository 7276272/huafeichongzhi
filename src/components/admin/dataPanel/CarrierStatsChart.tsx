import { IDDisplay } from './IDDisplay';
import { EmptyDataView } from './EmptyDataView';
import { DataWidgetHeader } from './DataWidgetHeader';

interface CarrierStatsChartProps {
  carrierStats: {
    carrier: string;
    amount: number;
    count: number;
  }[];
}

// 运营商统计图表组件
const CarrierStatsChart = ({ carrierStats = [] }: CarrierStatsChartProps) => {
  const totalAmount = carrierStats.reduce((sum, carrier) => sum + carrier.amount, 0);
  
  // 获取运营商名称
  const getCarrierLabel = (carrier: string): string => {
    return carrier;
  };
  
  // 获取颜色
  const getCarrierColor = (carrier: string): string => {
    const colorMap: Record<string, string> = {
      '移动': '#4299e1', // blue-500
      '联通': '#48bb78', // green-500
      '电信': '#ed8936', // orange-500
      '其他': '#a0aec0'  // gray-500
    };
    
    // 生成一个基于运营商名称的稳定颜色（对于未知运营商）
    if (!colorMap[carrier]) {
      let hash = 0;
      for (let i = 0; i < carrier.length; i++) {
        hash = carrier.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    }
    
    return colorMap[carrier];
  };
  
  // 计算百分比
  const calculatePercentage = (amount: number): number => {
    if (totalAmount === 0) return 0;
    return Math.round((amount / totalAmount) * 100);
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow">
      <DataWidgetHeader title="运营商统计" icon="pie" />
      
      <div className="h-64 flex items-center justify-center">
        {carrierStats && carrierStats.length > 0 ? (
          <div className="w-full h-full">
            <div className="space-y-4">
              {carrierStats.map((carrier, index) => {
                const percentage = calculatePercentage(carrier.amount);
                
                return (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-sm mr-2"
                          style={{ backgroundColor: getCarrierColor(carrier.carrier) }}
                        ></span>
                        {carrier.carrier.startsWith('u') && carrier.carrier.length > 20 ? (
                          <IDDisplay id={carrier.carrier} maxLength={15} showLabel={false} />
                        ) : (
                          <span className="text-sm">{getCarrierLabel(carrier.carrier)}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                    <div className="chart-bar">
                      <div
                        className={`chart-bar-w-${Math.round(percentage)}`}
                        style={{ backgroundColor: getCarrierColor(carrier.carrier), height: '8px', borderRadius: '2px' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-500">总交易金额</div>
                  <div className="font-semibold mt-1">
                    ¥{totalAmount.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">订单数量</div>
                  <div className="font-semibold mt-1">
                    {carrierStats.reduce((sum, c) => sum + c.count, 0).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">平均交易额</div>
                  <div className="font-semibold mt-1">
                    ¥{(totalAmount / Math.max(1, carrierStats.reduce((sum, c) => sum + c.count, 0))).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyDataView message="暂无运营商分布数据" className="h-64" />
        )}
      </div>
    </div>
  );
};

export default CarrierStatsChart;
