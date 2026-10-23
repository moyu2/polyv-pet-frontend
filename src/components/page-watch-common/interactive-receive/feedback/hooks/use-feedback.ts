import { computed, ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * @hook 互动-反馈
 * */
export const useFeedback = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  /** 反馈 SDK 实例 */
  const feedbackSdk = watchCore.interactReceive.getFeedBack();

  /** 反馈标题 */
  const feedbackTitle = computed(() => translate('interact.feedback.title'));

  /** 反馈是否显示 */
  const feedbackVisible = ref(false);

  /** 设置反馈是否显示 */
  const setFeedbackVisible = (visible = true) => {
    feedbackVisible.value = visible;
  };

  useEventBusListener(appEvents.interaction.OpenFeedback, setFeedbackVisible);

  return {
    feedbackSdk,
    feedbackTitle,
    feedbackVisible,
    setFeedbackVisible,
  };
};
