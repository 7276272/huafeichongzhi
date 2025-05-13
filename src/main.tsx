import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { decodeUnicodeText } from './utils/unicodeHelper'

// 导入国际化支持
import './i18n'

// 修复全局Unicode乱码问题
console.log('应用Unicode修复方案，解决乱码问题');

// 添加全局字符串扩展方法
declare global {
  interface String {
    fixUnicode(): string;
  }
}

// 为字符串原型添加Unicode修复方法
String.prototype.fixUnicode = function() {
  return decodeUnicodeText(String(this));
};

// 调试环境变量
console.log('环境变量调试信息:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY 存在:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.log('VITE_SUPABASE_ANON_KEY 长度:', import.meta.env.VITE_SUPABASE_ANON_KEY.length);
}

// 设置应用默认语言为中文
console.log('应用已设置默认语言为中文');

// 不再使用Unicode修复包装器，改用字符串原型方法
createRoot(document.getElementById("root")!).render(
  <App />
);
