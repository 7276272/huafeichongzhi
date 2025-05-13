/**
 * Unicode编码修复工具
 * 这个工具用于修复显示为编码(u70ed等)的中文字符
 */

export function decodeUnicodeText(text: string): string {
  if (!text) return '';
  
  // 检查是否看起来像长的ID编码(u6682u65e5e0u...)这样的字符串
  if (/^u[0-9a-f]{4}u[0-9a-f]{4}/.test(text) && text.length > 20) {
    // 如果类似ID编码，则保留原样
    return text;
  }
  
  // 处理多个uXXXX连在一起的情况，如u70edu95e8 -> 热门
  const multiPattern = /u([0-9a-f]{4})u([0-9a-f]{4})/g;
  let processedText = text;
  
  // 递归处理直到不再有变化
  let lastText = '';
  while (lastText !== processedText) {
    lastText = processedText;
    processedText = processedText.replace(multiPattern, (_, hex1, hex2) => {
      try {
        return String.fromCodePoint(parseInt(hex1, 16)) + String.fromCodePoint(parseInt(hex2, 16));
      } catch (e) {
        return _;
      }
    });
  }
  
  // 处理单个u70ed这样的Unicode编码
  return processedText.replace(/u([0-9a-f]{4})/g, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch (e) {
      console.error('解码Unicode失败:', hex, e);
      return _; // 如果解码失败，保留原字符
    }
  });
}

/**
 * 安全的对象属性递归处理器
 * 防止循环引用和递归过深
 */
export function fixAllStringProps(obj: unknown, depth = 0, visited = new WeakMap<object, boolean>()): unknown {
  // 控制递归深度，防止栈溢出
  if (depth > 100) {
    console.warn('递归深度超过限制，跳过后续处理');
    return obj;
  }
  
  // 处理null和基本类型
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object' && typeof obj !== 'string') return obj;
  
  // 字符串直接解码
  if (typeof obj === 'string') {
    return decodeUnicodeText(obj);
  }
  
  // 防止循环引用
  if (typeof obj === 'object') {
    if (visited.has(obj)) {
      return obj; // 已访问过的对象直接返回，防止循环
    }
    
    // 标记当前对象为已访问
    visited.set(obj, true);
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => fixAllStringProps(item, depth + 1, visited));
  }
  
  // 处理普通对象
  if (typeof obj === 'object' && obj.constructor === Object) {
    const result: Record<string, unknown> = {};
    
    // 只遍历自身属性，不遍历原型链
    for (const key of Object.keys(obj)) {
      try {
        // @ts-expect-error - obj[key] 访问是安全的，因为我们是通过Object.keys遍历
        result[key] = fixAllStringProps(obj[key], depth + 1, visited);
      } catch (e) {
        console.warn(`处理属性${key}时出错:`, e);
        // @ts-expect-error - 错误处理时保留原值
        result[key] = obj[key]; // 出错时保留原值
      }
    }
    return result;
  }
  
  // 其他复杂对象，原样返回
  return obj;
}
