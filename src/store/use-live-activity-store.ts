/**
 * @file 互动大屏 SDK
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';

export interface LiveActivityStoreState {
  /** 是否正在加载任一新活动。 */
  liveActivityLoading: Ref<boolean>;
  /** 至少一个新活动已经可用。 */
  liveActivityLoaded: ComputedRef<boolean>;
  /** 两个活动的聚合加载错误。 */
  liveActivityLoadError: ComputedRef<string>;
  /** 滚动抽奖是否已经完成初始化。 */
  rollingLotteryLoaded: Ref<boolean>;
  /** 滚动抽奖初始化错误。 */
  rollingLotteryLoadError: Ref<string>;
  /** 竞技 PK 是否已经完成初始化。 */
  shakePkLoaded: Ref<boolean>;
  /** 竞技 PK 初始化错误。 */
  shakePkLoadError: Ref<string>;
  /** 当前观众是否存在直播活动奖励。 */
  liveActivityRewardAvailable: Ref<boolean>;
  /** 是否显示我的奖励入口 */
  liveActivityRewardEntranceVisible: ComputedRef<boolean>;
}

export interface LiveActivityStoreAction {
  setRollingLotteryLoaded(loaded: boolean, error?: string): void;
  setShakePkLoaded(loaded: boolean, error?: string): void;
  setLiveActivityLoading(loading: boolean): void;
  setLiveActivityRewardAvailable(available: boolean): void;
}

export interface LiveActivityStore extends LiveActivityStoreState, LiveActivityStoreAction {}

export const useLiveActivityStore = defineStore<'liveActivity', LiveActivityStore>(
  'liveActivity',
  () => {
    const liveActivityLoading = ref(false);
    const rollingLotteryLoaded = ref(false);
    const rollingLotteryLoadError = ref('');
    const shakePkLoaded = ref(false);
    const shakePkLoadError = ref('');
    const liveActivityRewardAvailable = ref(false);

    const liveActivityLoaded = computed(() => {
      return rollingLotteryLoaded.value || shakePkLoaded.value;
    });

    const liveActivityLoadError = computed(() => {
      return [rollingLotteryLoadError.value, shakePkLoadError.value].filter(Boolean).join('; ');
    });

    const liveActivityRewardEntranceVisible = computed(() => {
      return liveActivityRewardAvailable.value;
    });

    function setRollingLotteryLoaded(loaded: boolean, error = '') {
      rollingLotteryLoaded.value = loaded;
      rollingLotteryLoadError.value = error;
    }

    function setShakePkLoaded(loaded: boolean, error = '') {
      shakePkLoaded.value = loaded;
      shakePkLoadError.value = error;
    }

    function setLiveActivityLoading(loading: boolean) {
      liveActivityLoading.value = loading;
    }

    function setLiveActivityRewardAvailable(available: boolean) {
      liveActivityRewardAvailable.value = available;
    }

    return {
      liveActivityLoading,
      liveActivityLoaded,
      liveActivityLoadError,
      rollingLotteryLoaded,
      rollingLotteryLoadError,
      shakePkLoaded,
      shakePkLoadError,
      liveActivityRewardAvailable,
      liveActivityRewardEntranceVisible,
      setRollingLotteryLoaded,
      setShakePkLoaded,
      setLiveActivityLoading,
      setLiveActivityRewardAvailable,
    };
  },
);
