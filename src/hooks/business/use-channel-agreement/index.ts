import { ref, computed, onMounted } from 'vue';
import { ChannelAgreementConfig, LanguageType } from '@polyv/live-watch-sdk';

import { useLangStore } from '@/store/use-lang-store';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

import { convert2WatchSdkLang } from '@/assets/lang/util';

const generateDefaultChannelAgreementConfigItem = (): ChannelAgreementConfig[LanguageType] => {
  return {
    content: '',
    dialogContent: '',
    dialogTitle: '',
  };
};

/**
 * 频道用户协议 hook
 * @param autoGet 是否自动获取
 */
export const useChannelAgreement = (autoGet = false) => {
  const { getWatchCore } = useMultiPolyvWatchApp();

  const langStore = useLangStore();

  const channelAgreementConfig = ref<ChannelAgreementConfig>();

  /** 当前频道协议配置 */
  const currentChannelAgreementConfig = computed(() => {
    const defaultData = generateDefaultChannelAgreementConfigItem();
    if (!channelAgreementConfig.value) return defaultData;

    const langKey = convert2WatchSdkLang(langStore.currentLang);
    return channelAgreementConfig.value[langKey] || defaultData;
  });

  const protocolConfirmInfo = computed(() => {
    return {
      content: currentChannelAgreementConfig.value.dialogContent,
      title: currentChannelAgreementConfig.value.dialogTitle,
    };
  });

  const protocolContent = computed(() => {
    return currentChannelAgreementConfig.value.content;
  });

  async function initChanelAgreement() {
    const watchCore = getWatchCore();
    channelAgreementConfig.value = await watchCore.channel.getChannelAgreementConfig();
  }

  onMounted(() => {
    if (autoGet) {
      initChanelAgreement();
    }
  });

  return {
    channelAgreementConfig,
    protocolContent,
    protocolConfirmInfo,
    currentChannelAgreementConfig,
    initChanelAgreement,
  };
};
