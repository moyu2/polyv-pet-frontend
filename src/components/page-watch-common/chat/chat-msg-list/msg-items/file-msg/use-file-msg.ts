import { translate } from '@/assets/lang';
import { isIframe } from '@/assets/utils/browser';
import { copyText } from '@/assets/utils/copy';
import { downloadFile, getFileSuffix } from '@/assets/utils/file';
import { useToastManager } from '@/hooks/components/use-toast';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { ChatMsgFileType } from '@polyv/live-watch-sdk';
import { computed, nextTick, onMounted, ref, unref } from 'vue';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export const useFileMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgFileType>();

  const { toast } = useToastManager();

  const watchAppStore = useWatchAppStore();

  /** 文件地址 */
  const fileUrl = computed<string>(() => {
    return unref(chatMsg).fileUrl;
  });

  /** 文件名 */
  const fileName = computed<string>(() => {
    return unref(chatMsg).fileName;
  });

  /** 文件扩展名 */
  const fileSuffix = computed<string>(() => {
    const name = unref(fileName);
    return getFileSuffix(name);
  });

  /** 下载文件 */
  function toDownloadFile() {
    // 微信小程序 webview 下改为复制下载地址
    if (watchAppStore.isWxMiniProgram) {
      copyFileUrl();
      return;
    }

    if (isIframe) {
      const msg = {
        name: 'file',
        path: unref(fileUrl),
        fileName: unref(fileName),
      };

      window.parent.postMessage(msg, '*');
      return;
    }

    const url = unref(fileUrl);
    const name = unref(fileName);

    downloadFile(url, name);
  }

  /** 复制下载地址 */
  async function copyFileUrl() {
    await copyText(unref(fileUrl));
    toast.success(translate('copy.linkSuccess'));
  }

  return {
    chatMsg,
    fileName,
    fileSuffix,
    toDownloadFile,
    copyFileUrl,
  };
};

/**
 * 文件名截断 hook
 */
export const useFileNameBlock = () => {
  const textWrapRef = ref<HTMLDivElement>();
  const textContentRef = ref<HTMLDivElement>();

  /** 是否需要截断 */
  const needBlock = ref(false);

  async function checkNeedBlock() {
    await nextTick();
    const wrapElem = unref(textWrapRef);
    const contentElem = unref(textContentRef);

    if (!wrapElem || !contentElem) {
      return;
    }

    needBlock.value = contentElem.clientHeight > wrapElem.clientHeight;
  }

  onMounted(() => {
    checkNeedBlock();
  });

  return {
    textWrapRef,
    textContentRef,
    needBlock,
    checkNeedBlock,
  };
};
