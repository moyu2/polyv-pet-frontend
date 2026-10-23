/**
 * @file 加载提问 UI SDK
 */

import { useGlobalInject } from '@/app/use-global-inject';
import { loadScript } from '@polyv/utils/load-script';
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';

interface PolyvChatSceneType {
  MobileAskPortrait: Vue;
}

declare global {
  interface Window {
    PolyvChatScene?: PolyvChatSceneType;
  }
}

let chatSDKAskQuestionUILoader: Promise<PolyvChatSceneType> | undefined;

/**
 * 外链加载提问 UI SDK
 * @desc 只加载竖屏提问组件
 */
export const useChatSDKAskQuestionUILoader = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  function __getConfigByWatchSdkEnv() {
    const env = WATCH_SDK_ENV;
    const domainInfo = watchCore.domain.getDomainInfo();

    const results: Record<SdkLoaderEnv, { domain: string; version: string }> = {
      [SdkLoaderEnv.Prod]: {
        domain: domainInfo.webSdkDomain,
        // eslint-disable-next-line sonarjs/no-duplicate-string
        version: 'rc-20260205',
      },
      [SdkLoaderEnv.Rc]: {
        domain: domainInfo.webSdkTest1Domain,
        version: 'dev-20260205',
      },
      [SdkLoaderEnv.Test]: {
        domain: domainInfo.webSdkTest1Domain,
        version: 'dev-20260205',
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

    return `${targetEnvConfig.domain}/chat-sdk-ui-ask-question/${targetEnvConfig.version}/lib/MobileAskPortrait/MobileAskPortrait.umd.min.js`;
  }

  function loadChatSDKAskQuestionApp() {
    if (window.PolyvChatScene) {
      return Promise.resolve(window.PolyvChatScene);
    }

    if (!chatSDKAskQuestionUILoader) {
      const url = __getScriptUrl();

      chatSDKAskQuestionUILoader = new Promise((resolve, reject) => {
        (async () => {
          try {
            await loadScript(url, {
              backupURL: __getScriptUrl({
                useBackupDomain: true,
              }),
            });
            if (window.PolyvChatScene) {
              resolve(window.PolyvChatScene);
            } else {
              reject(
                new Error('loadChatSDKAskQuestionApp fail, window.PolyvChatScene is undefined'),
              );
            }
          } catch (error) {
            reject(error);
          }
        })();
      });
    }

    return chatSDKAskQuestionUILoader;
  }

  async function asyncImportChatSDKAskQuestionComponent() {
    await loadChatSDKAskQuestionApp();

    if (!window.PolyvChatScene) {
      throw new Error('chat-sdk-ask-question not init');
    }

    return window.PolyvChatScene.MobileAskPortrait;
  }

  return {
    asyncImportChatSDKAskQuestionComponent,
  };
};
