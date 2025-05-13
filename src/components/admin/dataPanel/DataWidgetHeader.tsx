import React from 'react';
import { BarChart3, PieChart, Clock } from 'lucide-react';
import { FixedChartTitle } from './DataDisplayFix';

/**
 * 通用数据卡片标题组件
 * 用于所有数据面板卡片的统一标题样式
 */
export const DataWidgetHeader: React.FC<{
  title: string;
  icon?: 'chart' | 'pie' | 'clock'; 
  className?: string;
}> = ({ title, icon = 'chart', className = '' }) => {
  // 根据类型选择图标
  const IconComponent = {
    chart: BarChart3,
    pie: PieChart,
    clock: Clock
  }[icon];
  
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <FixedChartTitle title={title} />
      <IconComponent className="h-5 w-5 text-gray-500" />
    </div>
  );
};
