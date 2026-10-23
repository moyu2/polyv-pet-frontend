import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { isWeixin } from '@/assets/utils/browser';
import { PlvRedpackModule, SendRedpackConfig } from '@polyv/live-watch-sdk';
import { useWatchAppStore } from './use-watch-app-store';
import { useChannelStore } from './use-channel-store';

export interface RedpackStoreState {
  /** 观众发红包的配置 */
  sendRedpackConfig: Ref<SendRedpackConfig>;
  /** 是否展示"发送红包"功能 */
  sendRedpackVisible: ComputedRef<boolean>;
  /** 是否使用“积分红包” */
  scoreRedpackEnabled: Ref<boolean>;
  /** 积分单位 */
  scoreUnit: Ref<string>;
}

export interface RedpackStoreAction {
  /** 同步红包 Store */
  syncRedpackStore: () => void;
}

export interface RedpackStore extends RedpackStoreState, RedpackStoreAction {}

export const useRedpackStore = defineStore<'redpack', RedpackStore>('redpack', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();

  /** 观众发红包的限制 */
  const sendRedpackConfig = ref<SendRedpackConfig>(
    PlvRedpackModule.generateDefaultSendRedpackConfig(),
  );

  /** 是否展示"发送红包"功能 */
  const sendRedpackVisible = computed<boolean>(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;
    if (channelStore.isSeminarChannel) return false;

    return isWeixin && sendRedpackConfig.value.sendRedpackEnabled;
  });

  const __scoreRedpackConfig = PlvRedpackModule.generateDefaultScoreRedpackConfig();

  /** 是否使用“积分红包” */
  const scoreRedpackEnabled = ref(__scoreRedpackConfig.scoreRedpackEnabled);

  /** 积分单位 */
  const scoreUnit = ref(__scoreRedpackConfig.scoreUnit);

  /** 同步发送红包 Store */
  function syncRedpackStore() {
    const watchCore = watchAppStore.getWatchCore();

    sendRedpackConfig.value = watchCore.redpack.getSendRedpackConfig();

    const scoreRedpackConfig = watchCore.redpack.getScoreRedpackConfig();
    scoreRedpackEnabled.value = scoreRedpackConfig.scoreRedpackEnabled;
    scoreUnit.value = scoreRedpackConfig.scoreUnit;
  }

  return {
    sendRedpackConfig,
    sendRedpackVisible,

    scoreRedpackEnabled,
    scoreUnit,

    syncRedpackStore,
  };
});
