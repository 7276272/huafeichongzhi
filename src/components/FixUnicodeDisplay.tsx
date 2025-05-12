import React from 'react';

/**
 * 这个组件用于解决显示乱码的问题
 * 它会自动检测并修复各种Unicode编码显示问题
 */
const FixUnicodeDisplay: React.FC<{text: string}> = ({ text }) => {
  // 修复Unicode编码
  const fixUnicode = (input: string): string => {
    if (!input) return '';
    
    // 如果是特别长的ID字符串，可能是数据ID，保留原样
    if (input.length > 30 && input.startsWith('u') && /^u[0-9a-f]{4}/.test(input)) {
      return input;
    }
    
    // 处理常见的编码问题
    return input.replace(/u([0-9a-f]{4})/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return _;
      }
    });
  };

  return <span>{fixUnicode(text)}</span>;
};

export default FixUnicodeDisplay;
