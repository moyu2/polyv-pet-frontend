/**
 * @file 加载企业微信扫码授权 js 文件
 */
import { loadScript } from '@polyv/utils/load-script';

export interface WwLoginConfig {
  /** 渲染的 id 选择器 */
  id: string;
  /** 企业微信的 corpId */
  appid: string;
  /** 授权方的网页应用 Id */
  agentid: string;
  /** 重定向地址 */
  redirect_uri: string;
  /** 回调状态 */
  state?: string;
  /** 语言 */
  lang?: 'zh' | 'en';
  /** 自定义样式 */
  href?: string;
}

export interface WwLoginInstance {
  /** 销毁 */
  destroyed(): void;
}

export interface WwLoginCtor {
  new (config: WwLoginConfig): WwLoginInstance;
}

declare global {
  interface Window {
    WwLogin?: WwLoginCtor;
  }
}

let loadPromise: Promise<WwLoginCtor> | undefined;

export const loadWorkWeixinLoginSdk = (): Promise<WwLoginCtor> => {
  if (window.WwLogin) {
    return Promise.resolve(window.WwLogin);
  }

  if (!loadPromise) {
    loadPromise = new Promise<WwLoginCtor>((resolve, reject) => {
      (async () => {
        await loadScript('//wwcdn.weixin.qq.com/node/wework/wwopen/js/wwLogin-1.2.7.js');

        if (window.WwLogin) {
          resolve(window.WwLogin);
        } else {
          reject(new Error('loadWorkWeixinLoginSdk fail, window.WwLogin is undefined'));
        }
      })();
    });
  }

  return loadPromise;
};
