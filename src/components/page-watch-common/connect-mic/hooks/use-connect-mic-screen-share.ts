import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { getLocalStorage, setLocalStorage } from '@/assets/utils/storage';
import { SelectOptionItem } from '@/components/common-base/form/form-select/types/form-select-types';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { useToastManager } from '@/hooks/components/use-toast';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { ScreenShareError, ScreenShareMode } from '@polyv/live-watch-sdk';
import { computed, reactive } from 'vue';

/** 屏幕共享提示不再提示 store key */
export const SCREEN_SHARE_TIPS_ONCE_KEY = 'screen-share-tips-once';

/** 是否不再提示 */
export const isTipsOnce = () => getLocalStorage(SCREEN_SHARE_TIPS_ONCE_KEY) === 'true';

/** 设置不再提示 */
export const setTipsOnce = () => setLocalStorage(SCREEN_SHARE_TIPS_ONCE_KEY, 'true');

/** 屏幕共享 hook */
export const useConnectMicScreenShare = () => {
  const connectMicStore = useConnectMicStore();
  const { getEmitter, getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  /** 处理点击开始屏幕共享 */
  function onClickStartScreenShare() {
    if (!connectMicStore.screenShareInfo.supportScreenShare) {
      toast.error(translate('connectMic.error.notSupportScreenShare'));
      return;
    }

    if (!isTipsOnce()) {
      getEmitter().emit(appEvents.connectMic.OpenScreenShareTips, true);
      return;
    }

    startScreenShare();
  }

  /** 开始屏幕共享 */
  async function startScreenShare() {
    const watchCore = getWatchCore();
    const result = await watchCore.connectMic.startScreenShare();

    if (!result.success) {
      const failReason = result.failReason;
      let message = translate('connectMic.error.startScreenShareFail');

      switch (failReason) {
        case ScreenShareError.BrowserNotSupport:
        case ScreenShareError.ChannelNotSupport:
          message = translate('connectMic.error.notSupportScreenShare');
          break;
        case ScreenShareError.PermissionDenied:
          message = translate('connectMic.error.cancelScreenShare');
          break;
        case ScreenShareError.SystemPermissionDenied:
          message = translate('connectMic.error.systemPermissionDenied');
          break;
      }

      toast.error(message);
    }
  }

  /** 结束屏幕共享 */
  async function stopScreenShare() {
    const watchCore = getWatchCore();
    await watchCore.connectMic.stopScreenShare();
  }

  useEventBusListener(appEvents.connectMic.TriggerStartScreenShare, startScreenShare);
  useEventBusListener(appEvents.connectMic.TriggerStopScreenShare, stopScreenShare);

  return {
    onClickStartScreenShare,
    startScreenShare,
    stopScreenShare,
  };
};

/** 屏幕共享设置 hook */
export const useConnectMicScreenShareSetting = () => {
  const { getWatchCore } = useGlobalInject();

  const { visible, show: openSetting, close: closeSetting } = useSimpleVisible(false);

  const connectMicStore = useConnectMicStore();

  const formData = reactive({
    screenShareMode: ScreenShareMode.Detail,
    audioMixEnabled: true,
  });

  /** 模式选项 */
  const modeOptions = computed<SelectOptionItem[]>(() => {
    return [
      { label: translate('connectMic.screenshare.mode.detail'), value: ScreenShareMode.Detail },
      { label: translate('connectMic.screenshare.mode.motion'), value: ScreenShareMode.Motion },
    ];
  });

  /** 混音选项 */
  const audioMixOptions = computed<SelectOptionItem[]>(() => {
    return [
      { label: translate('base.enabled.on'), value: true },
      { label: translate('base.enabled.off'), value: false },
    ];
  });

  function setScreenShareConfig() {
    const watchCore = getWatchCore();
    watchCore.connectMic.setScreenShareConfig({
      screenShareMode: formData.screenShareMode,
      audioMixEnabled: formData.audioMixEnabled,
    });
    closeSetting();
  }

  useEventBusListener(appEvents.connectMic.OpenScreenShareSetting, () => {
    formData.screenShareMode = connectMicStore.screenShareInfo.screenShareMode;
    formData.audioMixEnabled = connectMicStore.screenShareInfo.audioMixEnabled;

    openSetting();
  });

  return {
    visible,
    openSetting,
    closeSetting,
    formData,
    modeOptions,
    audioMixOptions,
    setScreenShareConfig,
  };
};
