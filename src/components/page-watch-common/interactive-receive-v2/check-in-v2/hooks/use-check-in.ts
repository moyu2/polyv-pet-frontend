import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { type PolyvCheckIn } from '@polyv/live-watch-sdk';
import { computed, onBeforeUnmount, ref } from 'vue';

import { translate } from '@/assets/lang';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';
import { ErrorVerifyType, useErrorVerify } from '@/hooks/core/use-error-verify';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useIarTarget } from '../../_hooks/use-iar-target';
import { useCheckInEntrance } from './use-check-in-entrance';

export const useCheckIn = () => {
  const interactReceiveStore = useInteractReceiveStore();
  const playbackStore = usePlaybackStore();

  const { setCheckInEntrance, removeCheckInEntrance } = useCheckInEntrance();

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const { getWatchCore, getEmitter } = useGlobalInject();

  const { redirectToErrorVerify } = useErrorVerify();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvCheckIn.CheckIn>(() => {
    return watchCore.interactReceive.getCheckInV2();
  }, listenCheckInEvents);

  /** 签到是否显示 */
  const checkInVisible = ref(false);
  /** 是否为旧版本聊天室 */
  const isOldEntrance = ref(false);

  /** 互动签到组件实例 */
  const checkInRef = ref();
  /** 签到标题 */
  const checkInTitle = translate('interact.checkIn.title');

  const checkInRecordEnabled = computed(() => {
    return !playbackStore.checkInReplayEnabled;
  });

  /** 获取签到列表数据  */
  const getCheckInRecord = async function () {
    let data;
    try {
      data = await checkInRef.value.getCheckInRecord();
    } catch (e) {
      console.error('获取签到列表数据失败', e);
      // 该方法报错时，说明时私有化聊天室，不支持获取签到列表
      isOldEntrance.value = true;
      // 需要重置标志位
      checkInVisible.value = false;
    }
    return data;
  };

  /** 设置签到是否显示 */
  const setCheckInVisible = async (visible = true, toGetInfo = true) => {
    // to-show 的时候也会去触发这个方法，当标志位一致时就不进入流程
    if (checkInVisible.value === visible && visible === true) return;

    checkInVisible.value = visible;
    if (checkInVisible.value) {
      toLockFeedDrag('portrait-checkIn');
    } else {
      toUnlockFeedDrag();
    }

    if (visible && toGetInfo) {
      await getCheckInRecord();
    }
  };

  const showEntrance = (visible: boolean) => {
    if (visible) {
      onSignIn();
    }
  };
  /** 兼容旧版聊天室，新逻辑：该频道发起过签到后，入口常驻 */
  const beforeRemoveCheckInEntrance = () => {
    if (isOldEntrance.value) {
      removeCheckInEntrance();
    }
  };

  useEventBusListener(appEvents.interaction.OpenCheckIn, setCheckInVisible);

  function onSignIn() {
    setCheckInEntrance();
    interactReceiveStore.$patch({
      hasCheckIn: true,
    });
  }

  function onCheckInEnd() {
    getEmitter().emit(appEvents.interaction.CheckInFinish);
    beforeRemoveCheckInEntrance();
    interactReceiveStore.$patch({
      hasCheckIn: false,
    });
  }

  function onCheckInStatus(checkedIn: boolean) {
    if (!checkedIn) {
      redirectToErrorVerify({
        errorType: ErrorVerifyType.NotCheckIn,
      });
    }
  }

  function listenCheckInEvents() {
    const checkInTarget = getIarTarget();
    checkInTarget.eventEmitter.on(checkInTarget.CheckInEvent.StartCheckIn, onSignIn);
    checkInTarget.eventEmitter.on(checkInTarget.CheckInEvent.StopCheckIn, onCheckInEnd);
    checkInTarget.eventEmitter.on(checkInTarget.CheckInEvent.CheckInSuccess, onCheckInEnd);
    checkInTarget.eventEmitter.on(
      checkInTarget.CheckInEvent.CheckInFail,
      beforeRemoveCheckInEntrance,
    );
  }

  function unlistenCheckInEvents() {
    const checkInTarget = getIarTarget();
    checkInTarget.eventEmitter.off(checkInTarget.CheckInEvent.StartCheckIn, setCheckInEntrance);
    checkInTarget.eventEmitter.off(checkInTarget.CheckInEvent.StopCheckIn, onCheckInEnd);
    checkInTarget.eventEmitter.off(checkInTarget.CheckInEvent.CheckInSuccess, onCheckInEnd);
    checkInTarget.eventEmitter.off(
      checkInTarget.CheckInEvent.CheckInFail,
      beforeRemoveCheckInEntrance,
    );
  }

  onBeforeUnmount(() => {
    unlistenCheckInEvents();
  });

  return {
    targetInited,
    getIarTarget,
    checkInVisible,
    checkInTitle,
    setCheckInVisible,
    removeCheckInEntrance,
    checkInRef,
    isOldEntrance,
    checkInRecordEnabled,
    showEntrance,
    onCheckInStatus,
  };
};
