import { useChatStore } from '@/store/use-chat-store';
import { useViewerStore } from '@/store/use-viewer-store';
import {
  AppConfig,
  PolyvWatchCore,
  createWatchCore,
  setDebugMode,
  SdkLoaderEnv,
  destroyWatchCore,
} from '@polyv/live-watch-sdk';

import { bindChannelModuleEvents } from '@/core/bind-sdk-events/bind-channel-events';
import { bindChatModuleEvents } from '@/core/bind-sdk-events/bind-chat-events';
import { bindConnectMicModuleEvents } from '@/core/bind-sdk-events/bind-connect-mic-events';
import { bindEnrollModuleEvents } from '@/core/bind-sdk-events/bind-enroll-events';
import { bindFinanceRiskEvaluationEvents } from '@/core/bind-sdk-events/bind-finance-risk-evaluation-events';
import { bindInteractReceiveEvents } from '@/core/bind-sdk-events/bind-interact-receive-events';
import { bindPlayerModuleEvents } from '@/core/bind-sdk-events/bind-player-events';
import { bindUserEvents } from '@/core/bind-sdk-events/bind-user-events';
import { bindWatchCoreEvents } from '@/core/bind-sdk-events/bind-watch-core-events';
import { bindDocEvents } from './bind-sdk-events/bind-doc-events';
import { bindInviteModuleEvents } from './bind-sdk-events/bind-invite-events';
import { bindSubtitleEvents } from './bind-sdk-events/bind-subtitle-events';
import { bindTaskActivityEvents } from './bind-sdk-events/bind-task-activity-events';
import { getPolyvWatchApp, getPolyvWatchAppByUniqueId } from '@/plugins/sdk-inject-helper';

/** 初始化观看页应用对象 */
export function initWatchSdk(appConfig: AppConfig): PolyvWatchCore {
  const chatStore = useChatStore();
  const viewerStore = useViewerStore();

  const watchCore = createWatchCore(appConfig, { multiEnable: !!appConfig.uniqueId });
  const plvWatchApp = appConfig.uniqueId
    ? getPolyvWatchAppByUniqueId(appConfig.uniqueId)
    : getPolyvWatchApp();
  plvWatchApp?.saveWatchCore(watchCore);

  if (WATCH_SDK_ENV !== SdkLoaderEnv.Prod) {
    setDebugMode(true);
  }

  // 绑定 SDK 相关事件的监听回调
  bindWatchCoreEvents(watchCore);
  bindChannelModuleEvents(watchCore);
  bindChatModuleEvents(watchCore);
  bindConnectMicModuleEvents(watchCore);
  bindEnrollModuleEvents(watchCore);
  bindInteractReceiveEvents(watchCore);
  bindPlayerModuleEvents(watchCore);
  bindUserEvents(watchCore);
  bindDocEvents(watchCore);
  bindInviteModuleEvents(watchCore);
  bindSubtitleEvents(watchCore);
  bindFinanceRiskEvaluationEvents(watchCore);
  bindTaskActivityEvents(watchCore);

  // 设置弹幕添加拦截器，如果当前只看主持人，则不添加弹幕
  watchCore.barrage.setBarrageAddIntercept(data => {
    const userType = data.user?.userType;
    const userId = data.user?.userId;
    const actor = data.user?.actor;

    if (watchCore.isPlaybackWatchByVid() && data.isChatReplayMsg) {
      return true;
    }

    if (
      chatStore.onlySpecialMsg &&
      !watchCore?.user.isSpecialUserType(userType, actor) &&
      userId !== viewerStore.viewerId
    ) {
      return true;
    }

    return false;
  });

  return watchCore;
}

/** 销毁观看页应用对象 */
export function destroyWatchSdk() {
  destroyWatchCore(getPolyvWatchApp()?.getWatchCore());

  const polyvWatchApp = getPolyvWatchApp();
  polyvWatchApp?.removeWatchCore();
}

window.debugWatchSdk = () => {
  // @PLV-WARN
  window.watchCore = getPolyvWatchApp()?.getWatchCore();
  setDebugMode(true);
  console.info(window.watchCore);
};
