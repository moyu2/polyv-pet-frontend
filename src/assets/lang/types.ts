import zhCNLang from './i18ns/zh-CN.json';
import { LangType } from './lang-enum';

/** 某个多语言配置 */
export type LangConfig = typeof zhCNLang;

export type LangKey = keyof LangConfig;

/** 多语言匹配类型（初始化时只有 zh-CN，其他语种按需加载） */
export type LangI18nData = Partial<Record<LangType, LangConfig>>;

/** 动态语言包加载器 */
export type LangLoader = () => Promise<{ default: LangConfig }>;
