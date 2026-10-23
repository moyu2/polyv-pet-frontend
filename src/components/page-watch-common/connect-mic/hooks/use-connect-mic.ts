import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { ConnectMicError, ConnectMicEvents, FacingMode } from '@polyv/live-watch-sdk';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { onBeforeUnmount, onMounted } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

/**
 * 连麦设备设置 hook
 */
export const useConnectMicDevice = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();

  /** 开启设备设置 */
  function openDeviceSetting() {
    const watchCore = getWatchCore();
    watchCore.connectMic.openDeviceSetting();
  }

  /** 关闭设备设置 */
  function closeDeviceSetting() {
    const watchCore = getWatchCore();
    watchCore.connectMic.closeDeviceSetting();
  }

  return {
    openDeviceSetting,
    closeDeviceSetting,
  };
};

/**
 * 连麦申请 hook
 */
export const useConnectMicApply = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const watchCore = getWatchCore();

  /** 申请连麦 */
  async function applyConnectMic() {
    const result = await watchCore.connectMic.applyConnectMic();

    if (!result.success && result.failReason === ConnectMicError.GetDevicePermissionFail) {
      toast.error(translate('connectMic.error.getDeviceFail'));
    }
  }

  /** 取消连麦申请 */
  function cancelApplyConnectMic() {
    watchCore.connectMic.cancelApplyConnectMic();
  }

  /** 接受邀请上麦 */
  function acceptInviteConnectMic() {
    watchCore.connectMic.acceptInvite();
  }

  /** 拒绝邀请上麦 */
  function refuseInviteConnectMic() {
    watchCore.connectMic.refuseInvite();
  }

  return {
    applyConnectMic,
    cancelApplyConnectMic,
    acceptInviteConnectMic,
    refuseInviteConnectMic,
  };
};

/**
 * 连麦控制 hook
 */
export const useConnectMicControl = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  const connectMicStore = useConnectMicStore();

  /** 开启摄像头 */
  function enabledVideo() {
    watchCore.connectMic.enabledVideo();
  }

  /** 关闭摄像头 */
  function disabledVideo() {
    watchCore.connectMic.disabledVideo();
  }

  /** 切换摄像头 */
  function toggleVideo() {
    if (connectMicStore.localIsVideoMuted) {
      enabledVideo();
    } else {
      disabledVideo();
    }
  }

  /** 开启麦克风 */
  function enabledAudio() {
    watchCore.connectMic.enabledAudio();
  }

  /** 关闭麦克风 */
  function disabledAudio() {
    watchCore.connectMic.disabledAudio();
  }

  /** 切换麦克风 */
  function toggleAudio() {
    if (connectMicStore.localIsAudioMuted) {
      enabledAudio();
    } else {
      disabledAudio();
    }
  }

  /** 切换前后摄像头 */
  function toggleFacingMode() {
    if (connectMicStore.facingMode === FacingMode.User) {
      watchCore.connectMic.changeFacingMode(FacingMode.Environment);
    } else {
      watchCore.connectMic.changeFacingMode(FacingMode.User);
    }
  }

  /** 切换镜像 */
  function toggleMirror(enabled?: boolean) {
    watchCore.connectMic.toggleMirror(enabled);
  }

  /** 结束连麦 */
  function endConnectMic() {
    watchCore.connectMic.endConnectMic();
  }

  return {
    enabledVideo,
    disabledVideo,
    toggleVideo,
    enabledAudio,
    disabledAudio,
    toggleAudio,
    toggleFacingMode,
    toggleMirror,
    endConnectMic,
  };
};

/**
 * 连麦总 hook
 * @description 各端仅限注册一次
 */
export const useConnectMic = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const connectMicStore = useConnectMicStore();

  const { openDeviceSetting } = useConnectMicDevice();
  useEventBusListener(appEvents.connectMic.TriggerOpenDeviceSetting, openDeviceSetting);

  const { applyConnectMic, cancelApplyConnectMic } = useConnectMicApply();
  useEventBusListener(appEvents.connectMic.TriggerApplyConnectMic, applyConnectMic);
  useEventBusListener(appEvents.connectMic.TriggerCancelApplyConnectMic, cancelApplyConnectMic);

  const { endConnectMic } = useConnectMicControl();
  useEventBusListener(appEvents.connectMic.TriggerEndConnectMic, endConnectMic);

  const watchCore = getWatchCore();

  /** 连麦 v2（移动端 + PC 端）自定义了邀请 UI，无需调用 SDK 的内置邀请窗口 */
  const isConnectMicUIV2 = () => connectMicStore.isConnectMicUIV2;

  // 邀请上麦
  function onInviteConnectMic() {
    if (isConnectMicUIV2()) return;
    watchCore.connectMic.openInviting();
  }

  function onHandUpMic() {
    toast.info(translate('connectMic.teacherHangUp'));
  }

  function onApplyTimeOut() {
    toast.info(translate('connectMic.applyTimeOut'));
  }

  // 连麦人数达到限制
  function onOverLimit() {
    toast.error(translate('connectMic.error.overLimit'));
  }

  // 设备采集失败
  function onDeviceRecoverFail() {
    const connectMicStore = useConnectMicStore();
    connectMicStore.$patch({
      isDeviceRecoverFailed: true,
    });
  }

  // 主讲设置
  function onSpeaker() {
    if (connectMicStore.currentIsSpeaker) {
      toast.info(translate('connectMic.speaker.receive'));
    } else {
      toast.info(translate('connectMic.speaker.remove'));
    }
  }

  // 前后摄像头切换
  function onFacingModeChange() {
    connectMicStore.syncFacingMode();
  }

  // 用户流播放失败
  function onUserStreamPlayFailed() {
    connectMicStore.$patch({
      isUserStreamPlayFailed: true,
    });
  }

  onMounted(() => {
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.InviteConnectMic, onInviteConnectMic);
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.TeacherHangUp, onHandUpMic);
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.ApplyTimeOut, onApplyTimeOut);
    // 当前是被邀请的状态，需要弹出邀请面板
    if (connectMicStore.inviteStatus) {
      onInviteConnectMic();
    }

    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.ConnectMicOverLimit, onOverLimit);
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.DeviceRecoverFail, onDeviceRecoverFail);
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.CurrentSpeakerStatusChanged, onSpeaker);
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.FacingModeChange, onFacingModeChange);
    watchCore.connectMic.eventEmitter.on(
      ConnectMicEvents.UserStreamPlayFailed,
      onUserStreamPlayFailed,
    );
  });

  onBeforeUnmount(() => {
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.InviteConnectMic, onInviteConnectMic);
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.TeacherHangUp, onHandUpMic);
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.ApplyTimeOut, onApplyTimeOut);

    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.ConnectMicOverLimit, onOverLimit);
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.DeviceRecoverFail, onDeviceRecoverFail);
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.CurrentSpeakerStatusChanged, onSpeaker);
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.FacingModeChange, onFacingModeChange);
    watchCore.connectMic.eventEmitter.off(
      ConnectMicEvents.UserStreamPlayFailed,
      onUserStreamPlayFailed,
    );
  });
};
