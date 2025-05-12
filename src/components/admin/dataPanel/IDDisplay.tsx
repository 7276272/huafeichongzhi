import React, { useState } from 'react';
import { CopyCheck, Copy } from 'lucide-react';

/**
 * 数据ID显示组件
 * 专门用于处理数据面板中的长ID字符串和哈希值
 */
export const IDDisplay: React.FC<{
  id: string;
  maxLength?: number;
  className?: string;
  showLabel?: boolean;
}> = ({ id, maxLength = 12, className = '', showLabel = true }) => {
  const [copied, setCopied] = useState(false);
  
  // 复制ID到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // 如果ID是编码格式且超长，或者是普通的长数字/字符串
  if ((id.startsWith('u') && /u[0-9a-f]{4}/.test(id) && id.length > 20) || id.length > 30) {
    const shortId = id.substring(0, maxLength) + '...';
    
    return (
      <div 
        className={`${className} inline-flex items-center rounded px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-mono group hover:bg-gray-200 transition-colors cursor-default`} 
        title={`完整ID: ${id}`}
      >
        {showLabel && <span className="opacity-75 mr-1">ID:</span>}
        <span>{shortId}</span>
        <button 
          onClick={copyToClipboard} 
          className="ml-1.5 text-gray-500 hover:text-gray-700 focus:outline-none" 
          title="复制ID"
        >
          {copied ? <CopyCheck size={12} /> : <Copy size={12} />}
        </button>
      </div>
    );
  }
  
  // 正常显示
  return <div className={className}>{id}</div>;
};
