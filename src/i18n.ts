import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译资源
import zhCN from './locales/zh-CN.json';

// 支持的语言
const resources = {
  'zh-CN': zhCN,
};

i18n
  // 自动检测用户语言
  .use(LanguageDetector)
  // 初始化react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    debug: process.env.NODE_ENV === 'development',
    resources,
    fallbackLng: 'zh-CN', // 默认语言
    interpolation: {
      escapeValue: false, // 不转义HTML内容
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;
