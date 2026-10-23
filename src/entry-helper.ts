import Vue from 'vue';
import * as Vue2Module from 'vue';
import { PiniaVuePlugin, createPinia } from 'pinia';

import {
  injectPolyvWatchAppSdkMethods,
  PolyvWatchAppClass,
  setPolyvWatchApp,
} from './plugins/sdk-inject-helper';
import { loadVConsole } from '@/plugins/vconsole';

import { installI18n } from '@/assets/lang';
import '@/assets/styles/animation.scss';
import '@/assets/utils/ie-polyfill/index.js';
import { DEFAULT_APP_UNIQUE_ID } from '@/assets/constants/defaults';
import { isDevBuildMode, isInjectByExternalApp, needInternalBuildVue } from '@/assets/utils/utils';

/**
 * 注册 Vue 相关逻辑
 *
 * @warn 由于观看页 SDK 支持被容器注入使用，所以大致会有 4 种场景
 *
 * 1、SaaS 通用场景： 容器和观看页 SDK 都使用 Vue2.7 版本，且都使用外链
 * 2、SDK 注入场景 A： 容器使用 Vue2.6 外链，观看页 SDK 使用 Vue2.7 内部打包
 * 3、SDK 注入场景 B: 容器不使用 Vue2.6 外链，自身构建打包或者使用第三方框架，观看页 SDK 使用 Vue2.7 内部打包
 * 4、SDK 注入场景 C: 容器不使用 Vue2.6 外链，自身构建打包或者使用第三方框架，观看页 SDK 使用 Vue2.7 外链
 */
const installVue = () => {
  // 处理 SaaS 通用场景
  if (window.Vue && window.Vue.version === '2.7.16') {
    (window.Vue2Module as unknown) = window.Vue;
  }

  // 本地调试挂载全局 Vue 对象，让底层 SDK 的 UI 能够正常实例化
  // 非 SaaS 通用场景的情况，也需要挂载 window.Vue2Module
  if (isDevBuildMode() || needInternalBuildVue()) {
    if (!window.Vue) {
      (window.Vue as unknown) = Vue;
    }
    (window.Vue2Module as unknown) = Vue2Module;
  }

  if (!window.Vue2Module) {
    console.error(
      '异常场景!!! 请确认 needInternalBuildVue 标志位，确保 window.Vue2Module 和 window.Vue 正常设置',
    );
  }

  Vue.config.productionTip = false;

  Vue.config.errorHandler = error => {
    console.error(error);
    if (window.plvLogger) {
      window.plvLogger.error(error);
    }
  };

  Vue.use(PiniaVuePlugin);

  installI18n();
};

/**
 * 创建 Vue 应用实例
 */
const createVueApp = (uniqueId: string, RootApp: Vue) => {
  const pinia = createPinia();

  pinia.use(({ store }) => {
    store.$uniqueId = uniqueId;
  });

  const isNotDev = BUILD_ENV === 'pre' || BUILD_ENV === 'prod';
  try {
    // 被 iframe 时，用量上报功能疑似会导致页面崩溃，故在该情况下不启用
    // 生产环境暂不启用 rum-sdk
    if (
      !isNotDev &&
      RUM_ENABLED &&
      window.self === window.top &&
      window.baseChannelConfig?.watchDosageReportEnabled === 'Y'
    ) {
      const sampleRate = isNotDev ? 0.05 : 1;
      const logStore = isNotDev ? 'live-watch' : 'live-watch-dev';

      import(/* webpackChunkName: "polyv-rum-sdk" */ '@polyv/rum-sdk').then(
        ({ initRUMSystemVue2 }) => {
          initRUMSystemVue2(
            {
              Vue,
            },
            {
              debug: false,
              environment: BUILD_ENV,
              sampleRate: {
                error: 0,
                click: sampleRate,
                route: sampleRate,
                custom: sampleRate,
                xhr: 0,
              },
              slsConfigOverride: {
                host: 'cn-shenzhen.log.aliyuncs.com',
                project: 'live-admin-rum',
                logstore: logStore,
                enabled: true,
                appName: 'live-watch',
              },
            },
          ).catch(error => {
            console.warn('RUM system initialization failed:', error);
          });
        },
      );
    }
  } catch (error) {
    console.warn('RUM system initialization not support:', error);
  }

  return new Vue({
    pinia,
    provide: {
      uniqueId,
    },
    components: {
      WatchApp: RootApp,
    },
    render(createElement) {
      return createElement('watch-app');
    },
  });
};

/**
 * 创建保利威观看页应用实例
 */
function createPolyvWatchApp(opts: CreatePolyvWatchAppParams, RootApp: Vue) {
  const uniqueId = opts.id;

  return new PolyvWatchAppClass({
    createVueApp: () => createVueApp(uniqueId, RootApp),
    ...opts,
  });
}

// 主入口工厂
export function mainFactory(RootApp: Vue) {
  // eslint-disable-next-line
  loadVConsole().finally(() => {
    installVue();

    if (isInjectByExternalApp()) {
      // 注入模式需要回调 init 注入方法，并回调相关事件表示注入完成
      injectPolyvWatchAppSdkMethods({
        createPolyvWatchApp: opts => createPolyvWatchApp(opts, RootApp),
      });
      window.PolyvWatchAppSdk?.eventEmitter.emit('init');
    } else {
      // 非注入模式就直接挂载即可
      const uniqueId = DEFAULT_APP_UNIQUE_ID;
      const plvWatchApp = createPolyvWatchApp({ id: uniqueId }, RootApp);
      setPolyvWatchApp(plvWatchApp);
      plvWatchApp.getVueInstance().$mount(`#${uniqueId}`);
    }
  });
}
