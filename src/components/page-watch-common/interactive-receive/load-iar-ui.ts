import { isMobile } from '@/assets/utils/browser';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { loadScript } from '@polyv/utils/load-script';
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import { PolyvIRSceneComponentOption, PolyvIRSceneKey, PolyvIRSceneType } from './_types';

// 判断当前加载移动端和PC端互动
const interactAppEntrance = isMobile ? 'entranceMobile' : 'entrancePc';

/** 根据观看页 SDK 环境获取互动 UI 层对应环境的配置 */
function getIarUIConfigByWatchSdkEnv() {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();

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

/**
 * 获取互动功能 UI 的加载地址
 */
function getIarUILoaderUrl(domain: string, version: string) {
  return `${domain}/interactions-receive-sdk-ui-default/${version}/lib/${interactAppEntrance}/${interactAppEntrance}.umd.min.js`;
}

let iarUILoader: Promise<PolyvIRSceneType> | undefined;

/**
 * 加载互动功能 UI
 */
export function loadIarUI(): Promise<PolyvIRSceneType> {
  if (window.PolyvIRScene) {
    return Promise.resolve(window.PolyvIRScene);
  }

  if (!iarUILoader) {
    const { domain, version } = getIarUIConfigByWatchSdkEnv();
    const url = getIarUILoaderUrl(domain, version);

    iarUILoader = new Promise((resolve, reject) => {
      (async () => {
        try {
          await loadScript(url, {
            backupURL: getIarUILoaderUrl(domain.replace('websdk', 'websdk2'), version),
            // props: {
            //   crossOrigin: 'anonymous',
            // },
          });

          if (window.PolyvIRScene) {
            resolve(window.PolyvIRScene);
          } else {
            reject(new Error('loadInteractiveReceiveUI fail, window.PolyvIRScene is undefined'));
          }
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  return iarUILoader;
}

/**
 * 获取互动功能 UI 组件配置
 * @param iarKey 互动组件
 */
export function getIarComponent(iarKey: PolyvIRSceneKey): PolyvIRSceneComponentOption {
  if (!window.PolyvIRScene) {
    throw new Error('getIarComponent fail, window.PolyvIRScene is undefined');
  }

  const PolyvIRScene = window.PolyvIRScene;
  const entranceApp = PolyvIRScene[interactAppEntrance];
  if (!entranceApp) {
    throw new Error(`getIarComponent fail, ${interactAppEntrance} is undefined`);
  }

  if (!entranceApp[iarKey]) {
    throw new Error(`IarEntranceApp not exist ${iarKey}`);
  }

  return entranceApp[iarKey];
}
