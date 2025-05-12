import React, { useState, useEffect } from 'react';
import { decodeUnicodeText } from './unicodeHelper';

/**
 * 全局Unicode文本解析组件 - 简化版
 * 仅处理文本节点，避免深度递归和循环引用问题
 */
export const UnicodeFixWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // 直接返回子元素，不做递归处理
  // 依赖于String.prototype.fixUnicode扩展来处理文本
  return <>{children}</>;
};

/**
 * 简化版Unicode文本修复组件
 * 只处理字符串，不处理对象和组件
 */
export const SimpleTextFix: React.FC<{text: string}> = ({ text }) => {
  const [fixedText, setFixedText] = useState(text);
  
  useEffect(() => {
    try {
      // 仅处理简单的Unicode字符串，不进行递归
      setFixedText(decodeUnicodeText(text));
    } catch (e) {
      console.error('Unicode解码失败:', e);
      setFixedText(text); // 失败时回退到原始文本
    }
  }, [text]);
  
  return <>{fixedText}</>;
};
