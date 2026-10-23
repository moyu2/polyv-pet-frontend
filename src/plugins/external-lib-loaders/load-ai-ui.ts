/**
 * @file 加载直播 AI 功能 UI
 */

import { useGlobalInject } from '@/app/use-global-inject';
import { loadScript } from '@polyv/utils/load-script';
import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import type {
  PlaybackQuestionCard,
  AiAssistantChat,
  AiAggregateFeaturePanel,
} from '@polyv/live-watch-ai-ui';

interface LiveWatchAIUIType {
  AiAggregateFeaturePanel: typeof AiAggregateFeaturePanel;
  PlaybackQuestionCard: typeof PlaybackQuestionCard;
  AiAssistantChat: typeof AiAssistantChat;
}

declare global {
  interface Window {
    PolyvLiveWatchAIUI?: LiveWatchAIUIType;
  }
}

let liveWatchAIUILoader: Promise<LiveWatchAIUIType> | undefined;

/**
 * 加载直播 AI 功能 UI
 */
export const useLiveWatchAIUILoader = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  function __getConfigByWatchSdkEnv() {
    const env = WATCH_SDK_ENV;
    const domainInfo = watchCore.domain.getDomainInfo();

    const results: Record<SdkLoaderEnv, { domain: string; version: string }> = {
      [SdkLoaderEnv.Prod]: {
        domain: domainInfo.webSdkDomain,
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

    return `${targetEnvConfig.domain}/live-watch-ai-ui/${targetEnvConfig.version}/live-watch-ai-ui.umd.js`;
  }

  function loadLiveWatchAIUIApp() {
    if (window.PolyvLiveWatchAIUI) {
      return Promise.resolve(window.PolyvLiveWatchAIUI);
    }

    if (!liveWatchAIUILoader) {
      const url = __getScriptUrl();

      liveWatchAIUILoader = new Promise((resolve, reject) => {
        (async () => {
          try {
            await loadScript(url, {
              backupURL: __getScriptUrl({
                useBackupDomain: true,
              }),
            });
            if (window.PolyvLiveWatchAIUI) {
              resolve(window.PolyvLiveWatchAIUI);
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

    return liveWatchAIUILoader;
  }

  async function loadLiveWatchAIUIComponent(componentKey: keyof LiveWatchAIUIType) {
    await loadLiveWatchAIUIApp();

    if (!window.PolyvLiveWatchAIUI) {
      throw new Error('live-watch-ai-ui not init');
    }

    return window.PolyvLiveWatchAIUI[componentKey];
  }

  return {
    loadLiveWatchAIUIApp,
    loadLiveWatchAIUIComponent,
  };
};
