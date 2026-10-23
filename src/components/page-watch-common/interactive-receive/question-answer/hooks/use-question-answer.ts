import { appEvents, useEventBusListener } from '@/app/app-events';
import { computed } from 'vue';

import { TAB_NAME_QA } from '@/assets/constants/tab-name';
import { previewImage } from '@/hooks/components/use-image-preview';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

/**
 * @hook 互动-问答
 */
export const useQuestionAnswer = () => {
  const interactReceiveStore = useInteractReceiveStore();
  const viewerStore = useViewerStore();

  const { getWatchCore } = useGlobalInject();

  const { needInterruptUserClick, toInterruptUserClick } = useInterruptUserClick();

  const watchCore = getWatchCore();
  const questionAnswerSdk = watchCore.interactReceive.getQuestionAnswer();

  /**
   * 处理设置昵称
   */
  function onSetNick() {
    toInterruptUserClick({ triggerSource: 'iar-qa', ignoreSetNick: false });
  }

  const innerHasNickname = computed(() => {
    if (!viewerStore.hasNickname) {
      return false;
    }

    return !needInterruptUserClick.value;
  });

  /**
   * 处理图片浏览
   * @param data
   */
  function onPreviewImage(data: { url: string }) {
    previewImage([data.url]);
  }

  function onTabSwitch(name: string) {
    // 切换到问答 tab，取消红点
    if (name === TAB_NAME_QA) {
      interactReceiveStore.$patch({
        qaReminderVisible: false,
      });
    }
  }

  useEventBusListener(appEvents.global.PcAsideMenuSwitch, onTabSwitch);

  useEventBusListener(appEvents.global.MobileBottomMenuSwitch, onTabSwitch);

  return {
    questionAnswerSdk,
    innerHasNickname,
    onSetNick,
    onPreviewImage,
  };
};
