import { useGlobalInject } from '@/app/use-global-inject';
import { loadScript } from '@polyv/utils/load-script';
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';

import Vue, { ComponentOptions } from 'vue';

const entranceMobile = {} as {
  MobileWatchIdentifyLoginPage: ComponentOptions<Vue>;
  MobileWatchIdentifyCollectInfoDialog: ComponentOptions<Vue>;
  MobileWatchIdentityGuestLoginSplashDialog: ComponentOptions<Vue>;
};

const entrancePc = {} as {
  PcWatchIdentifyLoginPage: ComponentOptions<Vue>;
  PcWatchIdentifyCollectInfoDialog: ComponentOptions<Vue>;
  PcWatchIdentityGuestLoginSplashDialog: ComponentOptions<Vue>;
};

type PolyvWatchIdentifySDKSceneType = {
  entranceMobile?: typeof entranceMobile;
  entrancePc?: typeof entrancePc;
};

type WatchIdentifySDKSceneEntrance = keyof PolyvWatchIdentifySDKSceneType;

declare global {
  interface Window {
    PolyvWatchIdentifySDKScene: PolyvWatchIdentifySDKSceneType;
  }
}

let watchIdentifySDKSceneLoader: Promise<PolyvWatchIdentifySDKSceneType> | undefined;

export const useWatchIdentifySDKSceneLoader = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  function __getConfigByEnv() {
    const env = WATCH_SDK_ENV;
    const domainInfo = watchCore.domain.getDomainInfo();

    const results: Record<SdkLoaderEnv, { domain: string; version: string }> = {
      [SdkLoaderEnv.Prod]: {
        domain: domainInfo.webSdkDomain,
        version: 'rc-20260806',
      },
      [SdkLoaderEnv.Rc]: {
        domain: domainInfo.webSdkTest1Domain,
        version: 'dev-20260806',
      },
      [SdkLoaderEnv.Test]: {
        domain: domainInfo.webSdkTest1Domain,
        version: 'dev-20260806',
      },
    };

    return results[env];
  }

  function __getScriptUrl(opts?: {
    version?: string;
    useBackupDomain?: boolean;
    entrance?: WatchIdentifySDKSceneEntrance;
  }) {
    const { version = '', useBackupDomain = false, entrance = 'entranceMobile' } = opts || {};

    const targetEnvConfig = __getConfigByEnv();

    if (version) {
      targetEnvConfig.version = version;
    }
    if (useBackupDomain) {
      targetEnvConfig.domain = targetEnvConfig.domain.replace('websdk', 'websdk2');
    }

    return `${targetEnvConfig.domain}/watch-identify-sdk-ui-default/${targetEnvConfig.version}/lib/${entrance}/${entrance}.umd.min.js`;
  }

  /**
   * 加载场景 SDK
   */
  function loadWatchIdentifySDKScene(
    entrance: WatchIdentifySDKSceneEntrance,
  ): Promise<PolyvWatchIdentifySDKSceneType> {
    if (window.PolyvWatchIdentifySDKScene) {
      return Promise.resolve(window.PolyvWatchIdentifySDKScene);
    }

    if (!watchIdentifySDKSceneLoader) {
      const url = __getScriptUrl({ entrance });

      watchIdentifySDKSceneLoader = new Promise((resolve, reject) => {
        (async () => {
          try {
            await loadScript(url, {
              backupURL: __getScriptUrl({
                entrance,
                useBackupDomain: true,
              }),
            });
            if (window.PolyvWatchIdentifySDKScene) {
              resolve(window.PolyvWatchIdentifySDKScene);
            } else {
              reject(
                new Error(
                  'loadWatchIdentifySDKScene fail, window.PolyvWatchIdentifySDKScene is undefined',
                ),
              );
            }
          } catch (error) {
            reject(error);
          }
        })();
      });
    }

    return watchIdentifySDKSceneLoader;
  }

  // function loadWatchIdentifySDKSceneModule(entrance: WatchIdentifySDKSceneEntrance) {
  //   return import(`@polyv/watch-identify-sdk-ui-default/lib/${entrance}/${entrance}.umd.min.js`);
  // }

  /**
   * 获取移动端 UI 组件配置
   * @param sceneKey 组件名称
   */
  async function getMobilePolyvWatchIdentifySDKSceneComponent(
    sceneKey: keyof typeof entranceMobile,
  ) {
    const entranceType = 'entranceMobile';
    const PolyvWatchIdentifySDKScene = await loadWatchIdentifySDKScene(entranceType);

    console.warn('PolyvWatchIdentifySDKScene', PolyvWatchIdentifySDKScene);

    if (!PolyvWatchIdentifySDKScene) {
      throw new Error(
        'getPolyvWatchIdentifySDKSceneComponent fail, window.PolyvWatchIdentifySDKScene is undefined',
      );
    }

    const entranceApp = PolyvWatchIdentifySDKScene[entranceType];
    if (!entranceApp) {
      throw new Error(`getPolyvWatchIdentifySDKSceneComponent fail, ${entranceType} is undefined`);
    }

    if (!entranceApp[sceneKey]) {
      throw new Error(`not exist ${sceneKey}`);
    }

    return entranceApp[sceneKey];
  }

  /**
   * 获取 PC 端 UI 组件配置
   * @param sceneKey 组件名称
   */
  async function getPcPolyvWatchIdentifySDKSceneComponent(sceneKey: keyof typeof entrancePc) {
    const entranceType = 'entrancePc';
    const PolyvWatchIdentifySDKScene = await loadWatchIdentifySDKScene(entranceType);

    if (!PolyvWatchIdentifySDKScene) {
      throw new Error(
        'getPolyvWatchIdentifySDKSceneComponent fail, window.PolyvWatchIdentifySDKScene is undefined',
      );
    }

    const entranceApp = PolyvWatchIdentifySDKScene[entranceType];
    if (!entranceApp) {
      throw new Error(`getPolyvWatchIdentifySDKSceneComponent fail, ${entranceType} is undefined`);
    }

    if (!entranceApp[sceneKey]) {
      throw new Error(`not exist ${sceneKey}`);
    }

    return entranceApp[sceneKey];
  }

  return {
    loadWatchIdentifySDKScene,
    // loadWatchIdentifySDKSceneModule,

    getMobilePolyvWatchIdentifySDKSceneComponent,
    getPcPolyvWatchIdentifySDKSceneComponent,
  };
};
