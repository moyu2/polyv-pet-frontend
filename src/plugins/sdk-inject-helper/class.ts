import { WatchAppEmitterType, createEmitter } from '@/app/app-events';
import { isBuildForFeedMainMode, isInjectByExternalApp } from '@/assets/utils/utils';
import { getUrlQueryParams } from '@/hooks/core/use-query-params';
import { destroyWatchCore, MobileWatchLayout, PolyvWatchCore } from '@polyv/live-watch-sdk';

interface PolyvWatchAppStoreMap {
  watchCore?: PolyvWatchCore;
  queryParams: UniversalParams<string | string[] | undefined>;
  emitter: WatchAppEmitterType;
}

export class PolyvWatchAppClass {
  private __vueInstance?: Vue;

  public getVueInstance(): Vue {
    if (!this.__vueInstance) {
      throw new Error('vueInstance is not created');
    }

    return this.__vueInstance;
  }

  /**
   * 用来存储每个 PolyvWatchApp 中需要用到的单实例
   */
  private __storeMap: PolyvWatchAppStoreMap = Object.create(null);

  constructor(opts: { createVueApp: () => Vue } & CreatePolyvWatchAppParams) {
    this.__vueInstance = opts.createVueApp();

    let extraParams = {};
    if (isInjectByExternalApp()) {
      const feedMainParams = isBuildForFeedMainMode()
        ? {
            watchLayout: MobileWatchLayout.Portrait,
            feedLayoutLevel: '0',
          }
        : {};

      extraParams = {
        watchPageInitStatus: 'active',
        ...feedMainParams,
      };
    }

    this.__storeMap.queryParams = {
      ...extraParams,
      ...getUrlQueryParams(),
    };

    this.__storeMap.emitter = createEmitter();
  }

  public updateStoreMap(param: PolyvWatchAppStoreMap) {
    this.__storeMap = {
      ...this.__storeMap,
      ...param,
    };
  }

  public getStoreMap() {
    return this.__storeMap;
  }

  public saveWatchCore(watchCore: PolyvWatchCore) {
    this.__storeMap.watchCore = watchCore;
  }

  public getWatchCore() {
    const watchCore = this.getStoreMap().watchCore;
    if (!watchCore) {
      throw new Error('not init to getWatchCore');
    }

    return watchCore;
  }

  public removeWatchCore() {
    this.__storeMap.watchCore = undefined;
  }

  public setQueryParams(params: UniversalParams<string | string[] | undefined>) {
    this.__storeMap.queryParams = {
      ...this.__storeMap.queryParams,
      ...params,
    };
  }

  public resetQueryParams(params: UniversalParams<string | string[] | undefined>) {
    this.__storeMap.queryParams = {
      ...params,
    };
  }

  public getEmitter() {
    return this.__storeMap.emitter;
  }

  public destroy() {
    this.getVueInstance().$destroy();

    // 注意需要确保 vue 实例销毁完再销毁核心
    destroyWatchCore(this.__storeMap.watchCore);
    this.removeWatchCore();
  }
}
