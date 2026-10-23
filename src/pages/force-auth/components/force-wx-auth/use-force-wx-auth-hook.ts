import { computed, onMounted, ref } from 'vue';

import { isWeixin } from '@/assets/utils/browser';
import { copyText, useCopyText } from '@/assets/utils/copy';
import { wait } from '@/assets/utils/utils';
import { useWeixinAuthorize } from '@/hooks/platform/use-weixin/use-weixin-authorize';

import { FormProtocolInstance } from '@/components/common-base/form/form-protocol/use-form-protocol';
import { MessageBoxInstance } from '@/components/common-base/message-box';
import { useChannelAgreement } from '@/hooks/business/use-channel-agreement';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useGlobalInject } from '@/app/use-global-inject';

export const useForceWxAuthHook = () => {
  const { toastCopySuccess } = useCopyText();

  const { getWatchCore } = useGlobalInject();

  const { redirectWeixinAuthorize } = useWeixinAuthorize();

  const watchCore = getWatchCore();
  const themeStore = useThemeStore();
  const channelInfoStore = useChannelInfoStore();

  const { channelAgreementConfig, protocolContent, protocolConfirmInfo, initChanelAgreement } =
    useChannelAgreement();

  const watchUrl = computed(() => {
    return window.location.href;
  });

  const qrcodeUrl = computed(() => {
    return watchCore.utils.generateQrcodeUrl(watchUrl.value);
  });

  /** 复制内容 */
  async function copyContent() {
    await copyText(watchUrl.value);
    toastCopySuccess();
  }

  const protocolRef = ref<FormProtocolInstance>();

  const protocolTipsVisible = ref(true);

  const protocolChecked = ref(false);

  const imageUrl = computed(() => {
    return themeStore.channelCoverImg;
  });

  const titleText = computed(() => {
    return channelInfoStore.channelTitle;
  });

  const protocolConfirmRef = ref<MessageBoxInstance>();

  function onClickProtocolConfirmLink(a: HTMLAnchorElement) {
    if (protocolRef.value) {
      protocolRef.value.openProtocol(a);
    }
  }

  /** 防止重复点击 */
  let btnEnabled = true;

  async function onClickAuthBtn() {
    if (!btnEnabled) return;

    try {
      if (!protocolChecked.value) {
        const res = await protocolConfirmRef.value?.$confirm();
        if (!res) {
          return;
        }
        protocolChecked.value = true;
      }

      btnEnabled = false;
      await redirectWeixinAuthorize({ snsApiBase: false });
    } catch (error) {
      btnEnabled = true;
      console.error(error);
    }
  }

  onMounted(async () => {
    if (isWeixin) {
      initChanelAgreement();
      await wait(3000);
      protocolTipsVisible.value = false;
    }
  });

  return {
    channelAgreementConfig,

    qrcodeUrl,
    copyContent,

    protocolRef,
    protocolChecked,
    protocolContent,
    protocolTipsVisible,
    protocolConfirmInfo,
    imageUrl,
    titleText,

    protocolConfirmRef,
    onClickProtocolConfirmLink,

    onClickAuthBtn,
  };
};
