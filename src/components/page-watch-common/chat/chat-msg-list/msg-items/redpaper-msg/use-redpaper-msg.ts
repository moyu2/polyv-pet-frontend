import { computed, ComputedRef, onMounted, ref, unref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { translate } from '@/assets/lang';
import {
  ChatMsgRedpaperType,
  ChatMsgSource,
  ChatMsgType,
  RedpackType,
} from '@polyv/live-watch-sdk';
import { RedpackStatusData } from '@/components/page-watch-common/interactive-receive/redpack-rain/types/redpack-rain-types';

import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';
import {
  obverseTrackShowBehavior,
  useWatchEventTrack,
} from '@/hooks/business/use-watch-event-track';
import { useGlobalInject } from '@/app/use-global-inject';
import { useIdentityStore } from '@/store/use-identity-store';

interface RedpaperEntranceInstance {
  /** 更新红包状态 */
  updateStatus(status: string): void;
  /** Dom 元素 */
  $el: HTMLDivElement;
}

/**
 * @hook 互动-红包-聊天室红包消息
 */
export const useRedpaperMsg = () => {
  const { getEmitter, getWatchCore } = useGlobalInject();

  const { chatMsg } = useChatMsgDataInject<ChatMsgRedpaperType>();

  const watchCore = getWatchCore();

  /** 红包 SDK 实例 */
  const redpackSdk = watchCore.interactReceive.getRedpack();

  /** 红包入口实例 */
  const entranceRef = ref<RedpaperEntranceInstance>();

  /** 竖屏红包消息实例 */
  const portraitRedpaperMsgRef = ref<HTMLDivElement>();

  /** 发送者的昵称 */
  const sendNick = computed(() => {
    return chatMsg.value.user?.nick;
  });

  /** 红包文案 */
  const redpackText = computed<string>(() => {
    const type = chatMsg.value.type || RedpackType.Normal;
    const redpackTexts: Record<string, string> = {
      [RedpackType.Normal]: translate('redpack.type.normal'),
      [RedpackType.OfficialNormal]: translate('redpack.type.normal'),
      [RedpackType.Password]: translate('redpack.type.password'),
      [RedpackType.Rain]: translate('redpack.type.rain'),
      [RedpackType.ScoreOfficialNormal]: translate('redpack.type.normal'),
      [RedpackType.ScorePassword]: translate('redpack.type.password'),
      [RedpackType.ScoreRain]: translate('redpack.type.rain'),
      [RedpackType.Question]: translate('redpack.type.question'),
      [RedpackType.AlipayPasswordOfficialNormal]: translate('redpack.type.alipayPassword'),
    };

    return redpackTexts[type] || translate('redpack.type.normal');
  });

  /** 更新入口状态 */
  function updateEntranceStatus(data: RedpackStatusData) {
    const { redpackId, state } = data;
    if (redpackId !== unref(chatMsg).redpackId) {
      return;
    }

    const instance = unref(entranceRef);
    if (instance && instance.updateStatus) {
      instance.updateStatus(state);
    }
  }

  /** 打开红包弹层 */
  function openRedpackDialog() {
    getEmitter().emit(appEvents.interaction.OpenRedpack, unref(chatMsg));
  }

  const { trackUserReadRedpack } = useWatchEventTrack();

  function __trackUserReadRedpack($el?: HTMLElement) {
    obverseTrackShowBehavior({
      $el,
      cb: () => {
        trackUserReadRedpack({
          redpackId: chatMsg.value.redpackId,
          repackType: chatMsg.value.type,
        });
      },
    });
  }

  useEventBusListener(appEvents.interaction.SetRedpackStatus, updateEntranceStatus);

  onMounted(() => {
    if (entranceRef.value) {
      __trackUserReadRedpack(entranceRef.value.$el);
    }

    if (portraitRedpaperMsgRef.value) {
      __trackUserReadRedpack(portraitRedpaperMsgRef.value);
    }
  });

  return {
    chatMsg,
    entranceRef,
    portraitRedpaperMsgRef,
    redpackSdk,
    sendNick,
    redpackText,
    openRedpackDialog,
  };
};

export const useRedpaperMsgVisible = (chatMsg: ComputedRef<ChatMsgType>) => {
  const identityStore = useIdentityStore();

  /**
   * 检查当前红包消息是否显示
   */
  function checkRedpaperMsgVisible() {
    if (chatMsg.value.msgSource === ChatMsgSource.Redpaper) {
      const currentLabelIds = identityStore.currentLabelIds;
      const redpaperUserLabels = chatMsg.value.userLabels;
      if (redpaperUserLabels?.length) {
        const hasLabel = redpaperUserLabels.some(item => currentLabelIds.includes(item));
        if (!hasLabel) {
          return false;
        }
      }
    }

    return true;
  }

  return {
    checkRedpaperMsgVisible,
  };
};
