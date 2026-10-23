import { ref } from 'vue';

import { changeProtocol } from '@polyv/utils/net';
import { wait } from '@/assets/utils/utils';

import { MsgInputWrapInstance } from '@/components/page-watch-common/msg-input-wrap/use-msg-input-wrap';
import { PlvInputContent } from '@/plugins/polyv-ui/types';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

export const useAskSend = (options: { scrollToNew: () => void; hideMoreMsg: () => void }) => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  /** 消息输入框 */
  const msgInputWrapRef = ref<MsgInputWrapInstance>();

  /** 监听输入框消息发送 */
  async function onSubmitMessage({ contentList }: { contentList: PlvInputContent[] }) {
    if (!msgInputWrapRef.value) return;

    msgInputWrapRef.value.clearInput();
    msgInputWrapRef.value.resetStatus();

    await submitMessageQueue(contentList);

    options.scrollToNew();
    options.hideMoreMsg();
  }

  /** 提交消息队列 */
  async function submitMessageQueue(contentList: PlvInputContent[]) {
    for await (const message of contentList) {
      if (message.type === 'text') {
        submitAskMsg(message.content);
      } else if (message.type === 'img') {
        await sendAskImage(message.file);
      }
      await wait(200);
    }
  }

  /** 发送提问的图片消息 */
  async function sendAskImage(file: File | null) {
    try {
      const watchCore = getWatchCore();
      const { imageId, imageUrl, size } = await watchCore.utils.directUploadImage(file);

      watchCore.ask.sendAskImage({
        imageId,
        imageUrl: changeProtocol(imageUrl, 'https'),
        size,
      });
    } catch (error) {
      toast.error(translate('watchCore.error.uploadImage'));
    }
  }

  /** 发送提问的发言消息 - 纯文本 */
  function submitAskMsg(content: string) {
    const watchCore = getWatchCore();
    watchCore.ask.sendAskSpeak({
      content,
    });
  }

  function onSendSystemMsg({ content }: { content: string }) {
    const watchCore = getWatchCore();
    watchCore.ask.sendSystemMsg(content);
  }

  /**
   * 处理点击发送图片
   */
  async function onClickSendImage() {
    const watchCore = getWatchCore();
    watchCore.utils.uploadMultiImage({
      success: ({ imageId, imageUrl, size }) => {
        watchCore.ask.sendAskImage({
          imageId,
          imageUrl: changeProtocol(imageUrl, 'https'),
          size,
        });
      },
      fail: () => {
        toast.error(translate('watchCore.error.uploadImage'));
      },
    });
  }

  return {
    msgInputWrapRef,
    onSubmitMessage,
    onClickSendImage,
    onSendSystemMsg,
  };
};
