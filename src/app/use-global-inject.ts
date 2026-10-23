import { isInjectByExternalApp } from '@/assets/utils/utils';
import { getPolyvWatchAppByUniqueId } from '@/plugins/sdk-inject-helper/helper';
import { inject } from 'vue';

/**
 * vue 实例全局注入
 * @warn 不能在这个 hook 里使用 store
 */
export const useGlobalInject = () => {
  const uniqueId = inject<string>('uniqueId');

  /**
   * 获取真实的根节点
   */
  function getRootElement() {
    return document.documentElement;
  }

  /**
   * 获取应用的根节点
   */
  function getAppRootElement() {
    const appElementSelector = isInjectByExternalApp() ? `#${uniqueId}__root` : undefined;

    if (appElementSelector) {
      const $appEl = document.querySelector(appElementSelector) as HTMLElement;
      return $appEl || document.documentElement;
    }

    return getRootElement();
  }

  /**
   * 获取真实的 body 节点
   */
  function getBodyElement(): HTMLElement {
    return document.body;
  }

  /**
   * 获取应用的 body 节点
   */
  function getAppBodyElement(): HTMLElement {
    const appElementSelector = isInjectByExternalApp() ? `#${uniqueId}__body` : undefined;

    if (appElementSelector) {
      const $appEl = document.querySelector(appElementSelector) as HTMLElement;
      return $appEl || document.body;
    }

    return getBodyElement();
  }

  /**
   * 获取应用的节点
   */
  function getAppElement() {
    const appElementSelector = isInjectByExternalApp() ? `#${uniqueId}` : undefined;

    if (appElementSelector) {
      const $appEl = document.querySelector(appElementSelector) as HTMLElement;
      return $appEl || document.querySelector('#app');
    }

    return document.querySelector('#app');
  }

  function getPolyvWatchApp() {
    return getPolyvWatchAppByUniqueId(uniqueId);
  }

  function getWatchCore() {
    const plvWatchApp = getPolyvWatchApp();
    if (!plvWatchApp) {
      throw new Error(`getWatchCore: getPolyvWatchApp error, error uniqueId: ${uniqueId}`);
    }

    return plvWatchApp.getWatchCore();
  }

  function getSocket() {
    return getWatchCore().chat.getSocket(false);
  }

  function getPinia() {
    const plvWatchApp = getPolyvWatchApp();

    return plvWatchApp?.getVueInstance().$pinia;
  }

  function getEmitter() {
    const plvWatchApp = getPolyvWatchApp();

    if (!plvWatchApp) {
      throw new Error('getEmitter error');
    }

    return plvWatchApp.getEmitter();
  }

  return {
    uniqueId,
    getRootElement,
    getAppRootElement,
    getBodyElement,
    getAppBodyElement,
    getAppElement,

    getPolyvWatchApp,
    getWatchCore,
    getSocket,
    getPinia,
    getEmitter,
  };
};

export type GlobalInjectType = ReturnType<typeof useGlobalInject>;
