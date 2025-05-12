import { IDDisplay } from './IDDisplay';
import { EmptyDataView } from './EmptyDataView';
import { DataWidgetHeader } from './DataWidgetHeader';

interface PaymentMethodChartProps {
  paymentMethods: {
    method: string;
    count: number;
    amount: number;
  }[];
}

const PaymentMethodChart = ({ paymentMethods = [] }: PaymentMethodChartProps) => {
  const totalAmount = paymentMethods.reduce((sum, method) => sum + method.amount, 0);

  // 获取支付方式名称
  const getPaymentMethodLabel = (method: string): string => {
    const methodMap: Record<string, string> = {
      wallet: '钱包支付',
      alipay: '支付宝',
      wechat: '微信支付',
      bank: '银行卡',
      crypto: '加密货币'
    };

    return methodMap[method] || method;
  };

  // 获取颜色
  const getMethodColor = (method: string): string => {
    const colorMap: Record<string, string> = {
      wallet: '#4299e1', // blue-500
      alipay: '#48bb78', // green-500
      wechat: '#805ad5', // purple-500
      bank: '#ecc94b',   // yellow-500
      crypto: '#f56565'  // red-500
    };

    // 生成一个基于方法名的稳定颜色（对于未知方法）
    if (!colorMap[method]) {
      let hash = 0;
      for (let i = 0; i < method.length; i++) {
        hash = method.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    }

    return colorMap[method];
  };

  // 计算百分比
  const calculatePercentage = (amount: number): number => {
    return totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow">
      <DataWidgetHeader title="支付方式分布" icon="pie" />

      <div className="h-64">
        {paymentMethods && paymentMethods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="pie-chart h-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
                  {paymentMethods.map((method, index) => {
                    // 计算饼图扇区
                    const percentage = calculatePercentage(method.amount);
                    const startAngle = paymentMethods
                      .slice(0, index)
                      .reduce((sum, m) => sum + calculatePercentage(m.amount), 0) * 3.6; // 百分比转角度
                    const endAngle = startAngle + percentage * 3.6;
                    const largeArcFlag = percentage > 50 ? 1 : 0;

                    // 计算SVG路径坐标
                    const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                    const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                    const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                    const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

                    return percentage > 0 ? (
                      <path
                        key={index}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={getMethodColor(method.method)}
                        stroke="white"
                        strokeWidth="1"
                      />
                    ) : null;
                  })}
                  <circle cx="50" cy="50" r="20" fill="white" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              {paymentMethods.map((method, index) => {
                const percentage = calculatePercentage(method.amount);
                const isLongId = method.method.startsWith('u') && method.method.length > 20;

                if (percentage === 0) return null;

                return (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span
                        className="w-3 h-3 rounded-sm mr-2"
                        style={{ backgroundColor: getMethodColor(method.method) }}
                      ></span>
                      {isLongId ? (
                        <IDDisplay id={method.method} maxLength={15} showLabel={false} />
                      ) : (
                        <span>{getPaymentMethodLabel(method.method)}</span>
                      )}
                    </div>
                    <div className="text-sm">
                      {percentage}% (¥{method.amount.toLocaleString()})
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-500">总交易金额</div>
                  <div className="font-semibold mt-1">
                    ¥{totalAmount.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">总交易笔数</div>
                  <div className="font-semibold mt-1">{paymentMethods.reduce((sum, m) => sum + m.count, 0).toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">支付方式数</div>
                  <div className="font-semibold mt-1">{paymentMethods.length}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyDataView message="暂无支付方式数据" className="h-64" />
        )}
      </div>
    </div>
  );
};

export default PaymentMethodChart;
