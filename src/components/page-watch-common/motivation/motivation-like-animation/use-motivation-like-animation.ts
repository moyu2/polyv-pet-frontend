import { onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import { PropUtils, VueProps } from '@polyv/vue-components';
import {
  ChatEvents,
  ChatMsgMotivationLikeType,
  ChatMsgSource,
  ChatMsgType,
  MotivationLikeType,
} from '@polyv/live-watch-sdk';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { useSvgaPlayer } from '@/hooks/animation/use-svga-player';
import { useMotivationLike } from '../motivation-like/use-motivation-like';
import { useGlobalInject } from '@/app/use-global-inject';

export const MotivationLikeAnimationProps = () => ({
  enableTypes: PropUtils.array<MotivationLikeType>().def([
    MotivationLikeType.Speak,
    MotivationLikeType.Mic,
  ]),
});

export const useMotivationLikeAnimation = (options: {
  props: VueProps<typeof MotivationLikeAnimationProps>;
}) => {
  const { getWatchCore } = useGlobalInject();

  const { props } = options;

  const { isGoOnRedpackRain } = storeDefinitionToRefs(useInteractReceiveStore);

  const { isMotivatedForCurrent, getMotivationContent } = useMotivationLike();

  /** 用于渲染动画的 ref 节点 */
  const likeAnimationRef = ref<HTMLDivElement>();

  const { animationQueue, pushAnimationQueue, pauseAnimationQueue, startAnimationQueue } =
    useSvgaPlayer<{ chatMsg: ChatMsgMotivationLikeType }>(likeAnimationRef, {
      beforePlaySvgaAnimation(svgaPlayer, { chatMsg }) {
        svgaPlayer.setText(
          {
            text: getMotivationContent(chatMsg),
            family: 'PingFangSC-Regular',
            size: '44px',
            color: '#fff',
            offset: { x: 0.0, y: 0.0 },
          },
          'hfbg',
        );
      },
    });

  // 如果正在显示红包雨不显示打赏特效
  watch(
    () => unref(isGoOnRedpackRain),
    () => {
      if (unref(isGoOnRedpackRain)) {
        pauseAnimationQueue();
      } else {
        startAnimationQueue();
      }
    },
  );

  function canPushInQueue(chatMsg: ChatMsgMotivationLikeType) {
    if (!props.enableTypes.includes(chatMsg.type)) {
      return false;
    }

    if (isMotivatedForCurrent(chatMsg)) {
      return true;
    }

    return unref(animationQueue).length < 100;
  }

  /** 处理聊天室消息 */
  function onChatMsgEvent(evt: { chatMsg: ChatMsgType }) {
    const chatMsg = evt.chatMsg;
    if (chatMsg.msgSource !== ChatMsgSource.MotivationLike) {
      return;
    }

    const pushInQueue = canPushInQueue(chatMsg);
    if (!pushInQueue) {
      return;
    }

    const svgaUrl = require('./assets/like-user.svga');
    pushAnimationQueue(svgaUrl, isMotivatedForCurrent(chatMsg), { chatMsg });
  }

  onMounted(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMessage, onChatMsgEvent);
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.off(ChatEvents.ChatMessage, onChatMsgEvent);
  });

  return {
    likeAnimationRef,
  };
};
