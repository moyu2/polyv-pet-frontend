import { LangType } from './lang-enum';
import { LangConfig, LangLoader } from './types';

import zhCNLang from './i18ns/zh-CN.json';

/** zh-CN 常驻语言包 */
export const defaultLocaleMessages: LangConfig = zhCNLang;

/** 已加载的语种集合（zh-CN 始终常驻） */
export const loadedLangSet = new Set<LangType>([LangType.ZH_CN]);

/** 其他语种的动态加载器 */
export const asyncLocaleLoaders: Partial<Record<LangType, LangLoader>> = {
  [LangType.ZH_TW]: () => import(/* webpackChunkName: "lang-zh-tw" */ './i18ns/zh-TW.json'),
  [LangType.English]: () => import(/* webpackChunkName: "lang-en" */ './i18ns/en.json'),
  [LangType.Japanese]: () => import(/* webpackChunkName: "lang-ja" */ './i18ns/ja.json'),
  [LangType.Korean]: () => import(/* webpackChunkName: "lang-ko" */ './i18ns/ko.json'),
  [LangType.Russian]: () => import(/* webpackChunkName: "lang-ru" */ './i18ns/ru.json'),
};
