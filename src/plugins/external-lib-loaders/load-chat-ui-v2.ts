import { useGlobalInject } from '@/app/use-global-inject';
import { loadScript } from '@polyv/utils/load-script';
import type * as PolyvChatUIPkgType from '@polyv/chat-ui';
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import { onMounted, ref } from 'vue';

export { PolyvChatUIPkgType };

declare global {
  interface Window {
    [PolyvChatUIPkgType.GlobalVariable]: typeof PolyvChatUIPkgType;
  }
}

let chatUILoader: Promise<typeof PolyvChatUIPkgType> | undefined;

let chatUIV2Pkg: typeof PolyvChatUIPkgType | undefined;

export function useLoadChatUIV2(autoLoad = true) {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  /** 聊天室 UI 是否加载完成 */
  const isLoaded = ref(
    (() => {
      if (window.PolyvChatUI || chatUIV2Pkg) {
        return true;
      }

      return false;
    })(),
  );

  function __getConfigByWatchSdkEnv() {
    const env = WATCH_SDK_ENV;
    const domainInfo = watchCore.domain.getDomainInfo();

    const results: Record<SdkLoaderEnv, { domain: string; version: string }> = {
      [SdkLoaderEnv.Prod]: {
        domain: domainInfo.webSdkDomain,
        version: 'rc-20261015',
      },
      [SdkLoaderEnv.Rc]: {
        domain: domainInfo.webSdkTest1Domain,
        version: 'dev-20261015',
      },
      [SdkLoaderEnv.Test]: {
        domain: domainInfo.webSdkTest1Domain,
        version: 'dev-20261015',
      },
    };

    return results[env];
  }

  function __getScriptUrl(opts?: { version?: string; useBackupDomain?: boolean }) {
    const { version = '', useBackupDomain = false } = opts || {};

    const targetEnvConfig = __getConfigByWatchSdkEnv();

    if (version) {
      targetEnvConfig.version = version;
    }
    if (useBackupDomain) {
      targetEnvConfig.domain = targetEnvConfig.domain.replace('websdk', 'websdk2');
    }

    return `${targetEnvConfig.domain}/chat-ui/${targetEnvConfig.version}/index.umd.js`;
  }

  function loadChatUIV2() {
    if (window.PolyvChatUI) {
      chatUIV2Pkg = window.PolyvChatUI;
      return Promise.resolve(window.PolyvChatUI);
    }

    if (!chatUILoader) {
      const url = __getScriptUrl();

      chatUILoader = new Promise((resolve, reject) => {
        (async () => {
          try {
            await loadScript(url, {
              backupURL: __getScriptUrl({
                useBackupDomain: true,
              }),
            });

            if (window.PolyvChatUI) {
              chatUIV2Pkg = window.PolyvChatUI;
              resolve(window.PolyvChatUI);
            } else {
              reject(new Error('loadChatUIV2 fail, window.PolyvChatUI is undefined'));
            }
          } catch (error) {
            reject(error);
          }
        })();
      });
    }
  }

  if (autoLoad) {
    onMounted(async () => {
      await loadChatUIV2();
      isLoaded.value = true;
    });
  }

  return {
    isLoaded,
    loadChatUIV2,
  };
}

export function getChatUIV2Pkg() {
  if (!chatUIV2Pkg) {
    throw new Error('chatUIV2Pkg is undefined');
  }
  return chatUIV2Pkg;
}
