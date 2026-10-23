import { Countdown, IRemaining as CountDownSurplusData } from '@polyv/utils/countdown';
import { computed, isRef, onUnmounted, Ref, ref, unref } from 'vue';

export interface UseSecondCountDownOptions {
  /** 总秒数，单位秒 */
  second?: Ref<number | undefined> | number | undefined;
  /** 结束的时间戳 */
  endTimestamp?: Ref<number | undefined> | number | undefined;
  /** 倒计时剩余时间改变回调 */
  onCountDownChange?: (surplusData: CountDownSurplusData) => void;
  /** 倒计时结束回调 */
  onCountDownFinish?: () => void;
}

/**
 * @hook 简单的秒数倒计时
 */
export const useSecondCountDown = (options: UseSecondCountDownOptions = {}) => {
  let second = options.second ?? ref();
  let endTimestamp = options.endTimestamp ?? ref();
  let onCountDownChange = options.onCountDownChange;
  let onCountDownFinish = options.onCountDownFinish;

  function __updateSecond(paramSecond: UseSecondCountDownOptions['second']) {
    if (isRef(second)) {
      second.value = isRef(paramSecond) ? paramSecond.value : paramSecond;
    } else {
      second = paramSecond || second;
    }
  }

  function __updateEndTimestamp(paramEndTimestamp: UseSecondCountDownOptions['endTimestamp']) {
    if (isRef(endTimestamp)) {
      endTimestamp.value = isRef(paramEndTimestamp) ? paramEndTimestamp.value : paramEndTimestamp;
    } else {
      endTimestamp = paramEndTimestamp || endTimestamp;
    }
  }

  function updateOptions(options: UseSecondCountDownOptions = {}) {
    if (options.second) {
      __updateSecond(options.second);
    }

    if (options.endTimestamp) {
      __updateEndTimestamp(options.endTimestamp);
    }

    onCountDownChange = options.onCountDownChange;
    onCountDownFinish = options.onCountDownFinish;
  }

  /** 默认的倒计时数据 */
  const defaultSurplusData: CountDownSurplusData = {
    // 天数
    days: 0,
    // 小时数
    hours: 0,
    // 分钟数
    minutes: 0,
    // 秒数
    seconds: 0,
    // 剩余总毫秒数
    totalMsecs: 0,
  };

  /** 剩余时间数据 */
  const surplusTime = ref<CountDownSurplusData>({ ...defaultSurplusData });

  /** 根据入参选项获取需要计算的秒数 */
  const computedSecond = computed<number>(() => {
    const secondVal = unref(second);
    const endTimestampVal = unref(endTimestamp);

    if (typeof secondVal === 'number') {
      return secondVal;
    } else if (typeof endTimestampVal === 'number') {
      const diffTime = (endTimestampVal - Date.now()) / 1000;
      return diffTime < 0 ? 0 : diffTime;
    }

    return 0;
  });

  /** 倒计时对象实例 */
  let countDownInstance: Countdown | undefined;

  /** 初始化倒计时 */
  function initCountDown(): void {
    surplusTime.value = { ...defaultSurplusData };
    destroyCountDown();
    countDownInstance = new Countdown(unref(computedSecond), onCountDownCallback);
    startCountDown();
  }

  /** 销毁倒计时 */
  function destroyCountDown(): void {
    stopCountDown();
    countDownInstance = undefined;
  }

  /** 开始倒计时 */
  function startCountDown(options?: UseSecondCountDownOptions): void {
    if (options) {
      updateOptions(options);
    }

    if (countDownInstance) {
      countDownInstance.start();
    } else {
      // 如果倒计时对象不存在则自动创建一个
      initCountDown();
    }
  }

  /** 停止倒计时 */
  function stopCountDown(): void {
    countDownInstance && countDownInstance.stop();
  }

  /** 暂停倒计时 */
  function pauseCountDown(): void {
    countDownInstance && countDownInstance.pause();
  }

  /**
   * 处理倒计时时间改变
   * @param rest 倒计时剩余时间数据
   */
  function onCountDownCallback(rest: CountDownSurplusData) {
    surplusTime.value = rest;
    onCountDownChange && onCountDownChange(unref(surplusTime));

    if (rest.totalMsecs === 0) {
      onCountDownFinish && onCountDownFinish();
    }
  }

  onUnmounted(() => {
    destroyCountDown();
  });

  return {
    surplusTime,
    computedSecond,
    initCountDown,
    startCountDown,
    stopCountDown,
    pauseCountDown,
    destroyCountDown,
  };
};
