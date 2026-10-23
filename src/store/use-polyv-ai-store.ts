import { PolyvAIAssistantConfig, PolyvAIModule } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, Ref, ref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';

export interface PolyvAIStore {
  /** AI SDK 核心已安装 */
  watchAICoreSetuped: Ref<boolean>;
  /** AI 助手是否可用 */
  AIAssistantEnabled: ComputedRef<boolean>;
  /** 同步 PolyvAI 存储数据 */
  syncPolyvAIStore: () => void;
}

/**
 * 保利威 AI Store
 */
export const usePolyvAIStore = defineStore<'polyvAI', PolyvAIStore>('polyvAI', () => {
  const watchAppStore = useWatchAppStore();

  /** AI SDK 核心已安装 */
  const watchAICoreSetuped = ref(false);

  /** 是否支持 AI 助手聊天 */
  const supportAIAssistantChat = ref(false);

  /** AI 助手相关配置 */
  const AIAssistantConfig = ref<PolyvAIAssistantConfig>(
    PolyvAIModule.generateDefaultAIAssistantConfig(),
  );

  /** AI 助手是否可用 */
  const AIAssistantEnabled = computed(() => {
    return (
      watchAICoreSetuped.value &&
      supportAIAssistantChat.value &&
      AIAssistantConfig.value.aiAssistantEnabled
    );
  });

  /**
   * 同步 PolyvAI 存储数据
   */
  function syncPolyvAIStore() {
    const watchCore = watchAppStore.getWatchCore();

    const config = watchCore.polyvAI.getAIAssistantConfig();
    AIAssistantConfig.value = config;

    const supported = watchCore.polyvAI.supportAIAssistantChat().support;
    supportAIAssistantChat.value = supported;
  }

  return {
    watchAICoreSetuped,

    AIAssistantEnabled,

    syncPolyvAIStore,
  };
});
