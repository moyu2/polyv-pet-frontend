import { useGlobalInject } from '@/app/use-global-inject';
import { PlvEmotionalFeedbackInstance } from '@/plugins/polyv-ui/types';
import { ChatEvents, ChatEventsRelations, EmotionalFeedbackType } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, ref, unref } from 'vue';

export const useEmotionalFeedback = () => {
  const { getWatchCore } = useGlobalInject();

  /** 明白了实例 */
  const yesRef = ref<PlvEmotionalFeedbackInstance>();
  /** 没听懂实例 */
  const noRef = ref<PlvEmotionalFeedbackInstance>();

  /** 点击次数 */
  let clickCount = 0;
  /** 点击定时器 */
  let clickTimer: number | undefined;

  /** 本地记录待发送的数量 */
  let waitYesCount = 0;
  /** 本地记录待发送的数量 */
  let waitNoCount = 0;

  /** 发送定时器 */
  let sendTimer: number | undefined;

  /**
   * 开始一个动画
   * @param type 类型
   */
  function startAnimation(type: EmotionalFeedbackType) {
    let instance: PlvEmotionalFeedbackInstance | undefined;
    if (type === EmotionalFeedbackType.Yes) {
      instance = unref(yesRef);
    } else {
      instance = unref(noRef);
    }

    if (!instance) return;

    instance.start(type, true);
  }

  /**
   * 处理点击图标
   * @param type 类型
   */
  function onClickIcon(type: EmotionalFeedbackType) {
    startAnimation(type);

    /** 已经超过 5 次，不再处理 */
    if (clickCount >= 5) return;

    /** 30s 内只能点击 5 次 */
    clickCount += 1;
    if (clickCount >= 5) {
      clickTimer = window.setTimeout(() => {
        clickCount = 0;
        clearTimeout(clickTimer);
        clickTimer = undefined;
      }, 30 * 1000);
    }

    if (type === EmotionalFeedbackType.Yes) {
      waitYesCount += 1;
    } else {
      waitNoCount += 1;
    }
    setSendTimer();
  }

  /**
   * 发送反馈数量
   */
  function sendEmotionalCount() {
    clearSendTimer();
    const watchCore = getWatchCore();

    if (waitYesCount) {
      watchCore.chat.sendEmotionalFeedback(EmotionalFeedbackType.Yes, waitYesCount);
      waitYesCount = 0;
    }
    if (waitNoCount) {
      watchCore.chat.sendEmotionalFeedback(EmotionalFeedbackType.No, waitNoCount);
      waitNoCount = 0;
    }
  }

  /**
   * 设置发送定时器
   */
  function setSendTimer() {
    clearSendTimer();
    sendTimer = window.setTimeout(() => {
      sendEmotionalCount();
    }, 3000);
  }

  /**
   * 清空发送定时器
   */
  function clearSendTimer() {
    if (sendTimer) {
      clearTimeout(sendTimer);
      sendTimer = undefined;
    }
  }

  /** 动画定时器 */
  let animationTimer: number | undefined;

  let animationYesCount = 0;
  let animationNoCount = 0;

  /** 处理情绪事件 */
  function onEmotionFeedbackMsg(evt: ChatEventsRelations[ChatEvents.ChatEmotionalFeedback]) {
    if (evt.type === EmotionalFeedbackType.Yes) {
      animationYesCount += evt.count;
    } else {
      animationNoCount += evt.count;
    }
    checkAnimationTimer();
  }

  onMounted(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.on(ChatEvents.ChatEmotionalFeedback, onEmotionFeedbackMsg);
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.off(ChatEvents.ChatEmotionalFeedback, onEmotionFeedbackMsg);
  });

  /** 设置动画定时器 */
  function setAnimationTimer() {
    animationTimer = window.setInterval(() => {
      if (animationYesCount !== 0) {
        animationYesCount -= 1;
        startAnimation(EmotionalFeedbackType.Yes);
      }

      if (animationNoCount !== 0) {
        animationNoCount -= 1;
        startAnimation(EmotionalFeedbackType.No);
      }

      checkAnimationTimer();
    }, 200);
  }

  /** 清空动画定时器 */
  function clearAnimationTimer() {
    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = undefined;
    }
  }

  /** 检查动画定时器 */
  function checkAnimationTimer() {
    // 动画数为空，清空定时器
    if (animationYesCount === 0 && animationNoCount === 0) {
      clearAnimationTimer();
      return;
    }

    if (animationTimer) {
      return;
    }

    setAnimationTimer();
  }

  onBeforeUnmount(() => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = undefined;
    }
    clearSendTimer();
    clearAnimationTimer();
  });

  return {
    yesRef,
    noRef,
    startAnimation,
    onClickIcon,
    sendEmotionalCount,
  };
};
