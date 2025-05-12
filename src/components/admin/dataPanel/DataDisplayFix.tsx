import React from 'react';

/**
 * Unicode编码修复组件
 * 该组件专门用于修复DataPanel中的Unicode编码问题
 */
export const DataText: React.FC<{text: string | React.ReactNode}> = ({ text }) => {
  if (typeof text !== 'string') {
    return <>{text}</>;
  }
  
  // 检查是否是长ID字符串(u6682u65e0...)，如果是则不处理
  if (text.length > 20 && text.startsWith('u') && /u[0-9a-f]{4}u[0-9a-f]{4}/.test(text)) {
    return <span title="数据ID">{text}</span>;
  }
  
  // 解码Unicode编码的中文
  const decoded = text.replace(/u([0-9a-f]{4})/g, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch (e) {
      return _; // 如果解码失败，保留原字符
    }
  });
  
  return <span>{decoded}</span>;
};

/**
 * 修复图表标题组件
 */
export const FixedChartTitle: React.FC<{title: string}> = ({ title }) => {
  return <h3 className="text-lg font-medium"><DataText text={title} /></h3>;
};

/**
 * 标签修复组件
 */
export const FixedLabel: React.FC<{label: string, className?: string}> = ({ label, className }) => {
  return <div className={className || "text-sm text-gray-500"}><DataText text={label} /></div>;
};

/**
 * 修复卡片标题
 */
export const FixedCardTitle: React.FC<{title: string, className?: string}> = ({ title, className }) => {
  return <div className={className || "text-sm font-medium text-gray-500"}><DataText text={title} /></div>;
};
