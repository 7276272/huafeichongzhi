import { EmptyDataView } from './EmptyDataView';
import { DataWidgetHeader } from './DataWidgetHeader';

interface ProductStatsSectionProps {
  topProducts: {
    product_id: string;
    product_name: string;
    sales: number;
    orders: number;
  }[];
}

const ProductStatsSection = ({ topProducts = [] }: ProductStatsSectionProps) => {
  const maxSales = Math.max(...topProducts.map(p => p.sales), 1);
  
  return (
    <div className="bg-white p-6 rounded-lg border shadow">
      <DataWidgetHeader title="热门产品" icon="chart" />
      
      <div className="h-64 flex items-center justify-center">
        {topProducts && topProducts.length > 0 ? (
          <div className="w-full h-full">
            <ul className="space-y-4">
              {topProducts.map((product, index) => (
                <li key={index} className="flex flex-col">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{product.product_name}</span>
                    <span>¥{product.sales.toLocaleString()} ({product.orders} 笔)</span>
                  </div>
                  <div className="chart-bar">
                    <div 
                      className={`${getBarColor(index).replace('bg-', 'chart-bar-')} chart-bar-w-${Math.round((product.sales / maxSales) * 100)}`}
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyDataView message="暂无产品统计数据" className="h-64" />
        )}
      </div>
      
      {topProducts && topProducts.length > 0 && (
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">总销售额</div>
            <div className="font-semibold mt-1">
              ¥{topProducts.reduce((sum, p) => sum + p.sales, 0).toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">总订单数</div>
            <div className="font-semibold mt-1">
              {topProducts.reduce((sum, p) => sum + p.orders, 0).toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">平均单价</div>
            <div className="font-semibold mt-1">
              ¥{(topProducts.reduce((sum, p) => sum + p.sales, 0) / 
                  Math.max(1, topProducts.reduce((sum, p) => sum + p.orders, 0))).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// u83b7u53d6u67d3u8272u6837u5f0f
const getBarColor = (index: number): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ];
  
  return colors[index % colors.length];
};

export default ProductStatsSection;
