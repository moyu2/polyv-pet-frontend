/** @file 滚动抽奖与竞技 PK 接收端 UI 的统一 UMD 加载器。 */
import { useGlobalInject } from '@/app/use-global-inject';
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import { loadScript } from '@polyv/utils/load-script';
import type { LiveActivityUIPkg, LiveActivityUIType } from './pkg';
import { liveActivityUIVersions } from './version-config';

const liveActivityUILoaders: Record<string, Promise<unknown> | undefined> = {};

function getLiveActivityUI<T extends LiveActivityUIType>(
  liveActivityUIType: T,
): LiveActivityUIPkg<T> {
  const globalVariable = liveActivityUIVersions[liveActivityUIType].globalVariable;
  const pkg = window[globalVariable];
  if (!pkg) {
    throw new Error(`getLiveActivityUI fail, window.${globalVariable} is undefined`);
  }
  return pkg as LiveActivityUIPkg<T>;
}

/** 创建活动 UI 包加载器。 */
export function useLiveActivityUILoader<T extends LiveActivityUIType>(liveActivityUIType: T) {
  const { getWatchCore } = useGlobalInject();
  const domainInfo = getWatchCore().domain.getDomainInfo();
  const domains: Record<SdkLoaderEnv, string> = {
    [SdkLoaderEnv.Prod]: domainInfo.webSdkDomain,
    [SdkLoaderEnv.Rc]: domainInfo.webSdkTest1Domain,
    [SdkLoaderEnv.Test]: domainInfo.webSdkTest1Domain,
  };
  const domain = domains[WATCH_SDK_ENV];
  const version = liveActivityUIVersions[liveActivityUIType][WATCH_SDK_ENV];
  const scriptPath = `${liveActivityUIType}/${version}/index.umd.js`;
  const scriptUrl = `${domain}/${scriptPath}`;
  const backupUrl = `${domain.replace('websdk', 'websdk2')}/${scriptPath}`;

  function loadLiveActivityUI(): Promise<LiveActivityUIPkg<T>> {
    const globalVariable = liveActivityUIVersions[liveActivityUIType].globalVariable;
    if (window[globalVariable]) {
      return Promise.resolve(getLiveActivityUI(liveActivityUIType));
    }

    if (!liveActivityUILoaders[scriptUrl]) {
      liveActivityUILoaders[scriptUrl] = new Promise((resolve, reject) => {
        (async () => {
          try {
            await loadScript(scriptUrl, { backupURL: backupUrl });
            resolve(getLiveActivityUI(liveActivityUIType));
          } catch (error) {
            reject(error);
          }
        })();
      });
    }

    return liveActivityUILoaders[scriptUrl] as Promise<LiveActivityUIPkg<T>>;
  }

  return { loadLiveActivityUI };
}

export function getRollingLotteryUI(): LiveActivityUIPkg<'rolling-lottery-ui'> {
  return getLiveActivityUI('rolling-lottery-ui');
}

export function useRollingLotteryUILoader() {
  const { loadLiveActivityUI } = useLiveActivityUILoader('rolling-lottery-ui');
  return { loadRollingLotteryUI: loadLiveActivityUI };
}

export function useShakePkUILoader() {
  const { loadLiveActivityUI } = useLiveActivityUILoader('shake-pk-ui');
  return { loadShakePkUI: loadLiveActivityUI };
}
