import VueI18n from 'vue-i18n';
import Vue from 'vue';
import { LangKey } from './types';

import { defaultLocaleMessages, asyncLocaleLoaders, loadedLangSet } from './locale';
import { LangType } from './lang-enum';

/**
 * i18n 实例
 * @PLV-WARN 注意：这里不将 i18n 注入到 Vue 实例中，防止和其他 SDK 的多语言逻辑冲突
 */
let i18n: InstanceType<typeof VueI18n> | undefined;

/** 正在进行中的语种加载 Promise 缓存，避免重复请求 */
const loadLocalePromiseMap = new Map<LangType, Promise<void>>();

/** 语种切换请求序号，保证只有最后一次请求能真正生效 */
let localeRequestId = 0;

/**
 * 兼容旧的语种处理
 */
function __formatLang(lang: string): LangType {
  const lowerLocale = lang && lang.toLowerCase && lang.toLowerCase();
  if (lowerLocale === 'zh_cn' || lowerLocale === 'zh-cn') {
    return LangType.ZH_CN;
  }
  return lang as LangType;
}

export function isTargetLocaleLoaded(lang: LangType): boolean {
  return loadedLangSet.has(lang);
}

/**
 * 确保目标语种已加载，若未加载则触发动态导入
 */
async function ensureLocaleLoaded(lang: LangType): Promise<void> {
  if (!i18n) {
    throw new Error('not install i18n');
  }

  if (loadedLangSet.has(lang)) return;

  // 若已有进行中的加载任务，复用同一个 Promise
  if (loadLocalePromiseMap.has(lang)) {
    return loadLocalePromiseMap.get(lang)!;
  }

  const loader = asyncLocaleLoaders[lang];
  if (!loader) {
    console.warn(`[i18n] No loader found for lang: ${lang}`);
    return;
  }

  const promise = loader()
    .then(mod => {
      i18n?.setLocaleMessage(lang, mod.default);
      loadedLangSet.add(lang);
      loadLocalePromiseMap.delete(lang);
    })
    .catch(err => {
      console.error(`[i18n] Failed to load locale: ${lang}`, err);
      loadLocalePromiseMap.delete(lang);
      throw err;
    });

  loadLocalePromiseMap.set(lang, promise);
  return promise;
}

/**
 * 应用语种到 i18n 实例，只有最后一次请求允许真正落盘
 * @returns 是否真正应用了该语种
 */
async function applyLocale(lang: LangType): Promise<boolean> {
  if (!i18n) {
    throw new Error('not install i18n');
  }

  const requestId = ++localeRequestId;
  const targetLang = __formatLang(lang);

  await ensureLocaleLoaded(targetLang);

  if (requestId !== localeRequestId) {
    return false;
  }

  i18n.locale = targetLang;
  return true;
}

/**
 * 切换 i18n 语种（异步：先确保语种包已加载，再切换）
 */
export async function switchI18nLocale(lang: LangType): Promise<boolean> {
  return applyLocale(lang);
}

/**
 * 转换多语言
 */
export function translate(key: LangKey, options: UniversalParams<string | number> = {}): string {
  if (!i18n) {
    console.error('not install i18n');
    return '';
  }

  return i18n.tc(key, 1, options);
}

/**
 * 安装 i18n（同步，仅注册 zh-CN 常驻包）
 */
export function installI18n() {
  Vue.use(VueI18n);

  loadLocalePromiseMap.clear();
  loadedLangSet.clear();
  loadedLangSet.add(LangType.ZH_CN);
  localeRequestId = 0;

  i18n = new VueI18n({
    locale: LangType.ZH_CN,
    fallbackLocale: LangType.ZH_CN,
    messages: {
      [LangType.ZH_CN]: defaultLocaleMessages,
    },
  });

  Vue.prototype.$lang = translate;
}
