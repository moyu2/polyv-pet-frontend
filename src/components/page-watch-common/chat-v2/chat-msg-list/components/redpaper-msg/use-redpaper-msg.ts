import { appEvents, useEventBusListener } from '@/app/app-events';
import { ChatMsgRedpaperType } from '@polyv/chat';
import { onMounted, ref, unref } from 'vue';
import { RedpackStatusData } from '@/components/page-watch-common/interactive-receive/redpack-rain/types/redpack-rain-types';
import { useGlobalInject } from '@/app/use-global-inject';
import {
  obverseTrackShowBehavior,
  useWatchEventTrack,
} from '@/hooks/business/use-watch-event-track';
import { PropUtils, VueProps, useProps } from '@polyv/vue-components';

export const redpapperMsgProps = () => ({
  chatMsg: PropUtils.object<ChatMsgRedpaperType>(),
});

interface RedpaperEntranceInstance {
  /** 更新红包状态 */
  updateStatus(status: string): void;
}

/**
 * @hook 互动-红包-聊天室红包消息
 */
export const useRedpaperMsg = (options: { props: VueProps<typeof redpapperMsgProps> }) => {
  const { props } = options;

  const { chatMsg } = useProps(props);

  const { getEmitter, getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  /** 红包 SDK 实例 */
  const redpackSdk = watchCore.interactReceive.getRedpack();

  /** 红包入口实例 */
  const entranceRef = ref();

  const wrapRef = ref<HTMLDivElement>();

  /** 更新入口状态 */
  function updateEntranceStatus(data: RedpackStatusData) {
    const { redpackId, state } = data;
    if (redpackId !== unref(chatMsg)?.redpackId) {
      return;
    }

    const instance = unref(entranceRef) as RedpaperEntranceInstance;
    if (instance && instance.updateStatus) {
      instance.updateStatus(state);
    }
  }

  /** 打开红包弹层 */
  function openRedpackDialog() {
    getEmitter().emit(appEvents.interaction.OpenRedpack, unref(chatMsg));
  }

  const { trackUserReadRedpack } = useWatchEventTrack();

  function __trackUserReadRedpack($el?: Element) {
    obverseTrackShowBehavior({
      $el,
      cb: () => {
        const msg = unref(chatMsg);
        if (!msg) {
          return;
        }

        trackUserReadRedpack({
          redpackId: msg.redpackId,
          repackType: msg.type,
        });
      },
    });
  }

  useEventBusListener(appEvents.interaction.SetRedpackStatus, updateEntranceStatus);

  onMounted(() => {
    const elem = wrapRef.value;
    if (elem) {
      __trackUserReadRedpack(elem);
    }
  });

  return {
    chatMsg,
    entranceRef,
    wrapRef,
    redpackSdk,
    openRedpackDialog,
  };
};
