/**
 * @file 红包相关 hook
 */
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useSendMsg } from '@/components/page-watch-common/chat/chat-msg-list/hooks/send-msg-hook';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { ChatMsgRedpaperType } from '@polyv/live-watch-sdk';
import { computed, ref } from 'vue';

/**
 * @hook 互动-红包状态
 * */
export const useRedpackStatus = () => {
  const { getEmitter } = useGlobalInject();

  /** 设置某个红包的状态 */
  const setRedpackStatus = (redpackId: string, status: string) => {
    getEmitter().emit(appEvents.interaction.SetRedpackStatus, {
      redpackId,
      status,
    });
  };

  return {
    setRedpackStatus,
  };
};

/**
 * @hook 互动-红包
 */
export const useRedpack = () => {
  const { getEmitter, getWatchCore } = useGlobalInject();

  const { sendSpeakMsg } = useSendMsg();

  const interactReceiveStore = useInteractReceiveStore();

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const watchCore = getWatchCore();
  /** 红包 SDK 实例 */
  const redpackSdk = watchCore.interactReceive.getRedpack();

  /** 自定义红包皮肤 */
  const customImgConfig = computed(() => {
    return {
      redpackCoverImg: interactReceiveStore.interactSetting.redpackImage,
    };
  });

  /** 当前显示的红包数据 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redpackData = ref<UniversalParams<any>>();

  /** 打开某个红包 */
  function openRedpack(data: ChatMsgRedpaperType) {
    if (data.type.includes('rain')) {
      // 类型是红包雨，则发送事件打开红包雨
      getEmitter().emit(appEvents.interaction.OpenRedpackRain, {
        redCacheId: data.redCacheId,
        redpackId: data.redpackId,
        avatar: data.user.pic,
        nickname: data.user.nick,
        greeting: data.content,
        type: data.type,
      });
    } else {
      redpackData.value = data;
    }
  }

  function onShowRedpack() {
    toLockFeedDrag('redpack');
  }

  useEventBusListener(appEvents.interaction.OpenRedpack, openRedpack);

  const { setRedpackStatus } = useRedpackStatus();
  /** 处理红包状态改变 */
  function onStatusChange(redpackId: string, status: string) {
    setRedpackStatus(redpackId, status);
  }

  /** 处理关闭红包 */
  function onCloseRedpack() {
    redpackData.value = undefined;
    toUnlockFeedDrag();
  }

  /** 处理点击提现按钮 */
  function onClickWithdraw() {
    onCloseRedpack();
    getEmitter().emit(appEvents.withdraw.OpenWithdrawApply, true);
  }

  /** 处理点击积分记录 */
  function onClickScoreRecord() {
    onCloseRedpack();
    getEmitter().emit(appEvents.interaction.OpenScoreRecord, true);
  }

  /** 处理口令红包领取 */
  function onPasswordReceived(pwd: string) {
    // 发送口令到聊天室
    if (pwd) {
      sendSpeakMsg({
        content: pwd,
      });
    }
  }

  return {
    redpackSdk,
    redpackData,
    customImgConfig,
    openRedpack,
    onStatusChange,
    onShowRedpack,
    onCloseRedpack,
    onClickWithdraw,
    onClickScoreRecord,
    onPasswordReceived,
  };
};
