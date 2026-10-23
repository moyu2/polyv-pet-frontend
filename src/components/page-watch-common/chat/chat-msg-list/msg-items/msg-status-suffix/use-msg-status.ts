import { uuidV4 } from '@polyv/utils/string';
import { throttle } from 'lodash-es';
import { ref, watch } from 'vue';

import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { useChatStore } from '@/store/use-chat-store';
import {
  ChatMsgItemSendStatus,
  ChatMsgSpeakType,
  ChatMsgImageType,
  ChatMsgEmotionType,
  ChatMsgSource,
} from '@polyv/live-watch-sdk';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';
import { useChatConnectError } from '../../../chat-connect-error/use-chat-connect-error';
import { useSendMsg } from '../../hooks/send-msg-hook';
import { ChatMsgItemCategory } from '../use-chat-msg-item';
import { useGlobalInject } from '@/app/use-global-inject';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

async function blobUrlToFile(blobUrl: string, fileName: string) {
  // 使用 fetch 方法获取 Blob 数据
  const response = await fetch(blobUrl);
  const blob = await response.blob();

  const suffix = blob.type.split('/')[1];
  // 将 Blob 转换为 File 对象
  return new File([blob], `${fileName}.${suffix}`, { type: blob.type });
}

/**
 * 根据chatMsg的数据获取显示的状态
 */
function getChatMsgStatus(
  chatMsg: ChatMsgImageType | ChatMsgSpeakType | ChatMsgEmotionType,
  chatStore: ReturnType<typeof useChatStore>,
  isShield: boolean,
) {
  if (!chatMsg.isLocal || isShield) return ChatMsgItemSendStatus.Default;

  if (chatStore.connectError) {
    return ChatMsgItemSendStatus.Fail;
  }

  if (chatMsg.isSendFailed) {
    return ChatMsgItemSendStatus.Fail;
  }

  return chatMsg.isSended === undefined
    ? ChatMsgItemSendStatus.Default
    : chatMsg.isSended === false
    ? ChatMsgItemSendStatus.Loading
    : ChatMsgItemSendStatus.Default;
}

const useResendImageHelper = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();

  const { toast } = useToastManager();

  async function resendImage(
    chatMsg: ChatMsgImageType,
    insertLocalImageMsg: ReturnType<typeof useSendMsg>['insertLocalImageMsg'],
  ) {
    if (!chatMsg.isSended && !chatMsg.localImageUrl) {
      toast.warning(translate('chatStatus.resendImageError'));
      return;
    }

    let imageId = uuidV4();
    // oss上传失败时为本地图片，oss上传成功但聊天室失败的场景为imageUrl
    let imageUrl = chatMsg.isSended ? chatMsg.imageUrl : chatMsg.localImageUrl || '';
    let size = chatMsg.size;

    // 先重新发送本地图片
    const newLocalImageMsg = insertLocalImageMsg({
      imageId,
      imageUrl,
    });

    watchCore.chat.removeChatMsg(chatMsg.id);

    // oss上传失败的场景，先上传到oss
    if (!chatMsg.isSended && chatMsg.localImageUrl) {
      try {
        const file = await blobUrlToFile(chatMsg.localImageUrl, chatMsg.id);

        const res = await watchCore.utils.directUploadImage(file);

        imageUrl = res.imageUrl;
        size = res.size;
        imageId = res.imageId;
      } catch (e) {
        console.error(e);
        toast.warning(translate('watchCore.error.uploadImage'));

        newLocalImageMsg.isSendFailed = true;

        watchCore.chat.replaceChatMsg(newLocalImageMsg.id, newLocalImageMsg);
        return;
      }
    }

    if (imageUrl && size && newLocalImageMsg) {
      watchCore.chat.sendImageMsgDirectly({
        ...newLocalImageMsg,
        imageUrl,
        size,
      });
    }
  }

  /**
   * 提问图片重发不考虑oss重发失败的情况
   */
  function resendAskImage(chatMsg: ChatMsgImageType) {
    const imageId = uuidV4();
    // oss上传失败时为本地图片，oss上传成功但聊天室失败的场景为imageUrl
    const imageUrl = chatMsg.imageUrl;
    const size = chatMsg.size;

    if (imageUrl && size && imageUrl) {
      watchCore.ask.removeAskMsg(chatMsg.id);
      watchCore.ask.sendAskImage({
        imageId,
        imageUrl,
        size,
      });
    } else {
      toast.error(translate('chatStatus.resendImageError'));
    }
  }

  return {
    resendImage,
    resendAskImage,
  };
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const useChatMsgStatus = () => {
  const { chatMsg, category } = useChatMsgDataInject<
    ChatMsgSpeakType | ChatMsgImageType | ChatMsgEmotionType
  >();

  const { getWatchCore } = useGlobalInject();
  const { resendImage, resendAskImage } = useResendImageHelper();

  const chatStore = useChatStore();

  const { connectErrorVisible } = useChatConnectError();
  const { sendSpeakMsg, insertLocalImageMsg, sendEmotionImageMsg } = useSendMsg();

  const watchCore = getWatchCore();
  const chatInfo = watchCore.chat.getChatInfo();

  const msgStatus = ref<ChatMsgItemSendStatus>(
    getChatMsgStatus(chatMsg.value, chatStore, chatInfo.isShield),
  );
  /**
   * 显示状态，跟消息的实际状态有点不同， 默认default
   * default: 成功(无内容显示) loading: 加载中(显示loading icon) fail: 失败(显示失败icon)
   * 若状态为Fail，则直接设置
   */
  const iconShowStatus = ref<ChatMsgItemSendStatus>(
    msgStatus.value === ChatMsgItemSendStatus.Fail
      ? ChatMsgItemSendStatus.Fail
      : ChatMsgItemSendStatus.Default,
  );

  if (chatMsg.value.isLocal) {
    /**
     * 延迟2s再更新显示的状态
     */
    const delayTwoSecondToLoadingTimer = setTimeout(() => {
      iconShowStatus.value = msgStatus.value;
    }, 2000);

    /**
     * 10s后若还是loading状态，则转为失败
     */
    const delayTenSecondToFailTimer = setTimeout(() => {
      if (iconShowStatus.value === ChatMsgItemSendStatus.Loading) {
        iconShowStatus.value = ChatMsgItemSendStatus.Fail;
      }
    }, 10000);

    const clearDelayTimer = () => {
      delayTwoSecondToLoadingTimer && clearTimeout(delayTwoSecondToLoadingTimer);
      delayTenSecondToFailTimer && clearTimeout(delayTenSecondToFailTimer);
    };

    watch(
      () => chatStore.connectError,
      () => {
        if (connectErrorVisible.value && iconShowStatus.value === ChatMsgItemSendStatus.Loading) {
          iconShowStatus.value = ChatMsgItemSendStatus.Fail;
          clearDelayTimer();
        }
      },
    );
  }

  async function handleReSendMsg() {
    // 禁言弹提示
    if (category.value === ChatMsgItemCategory.Chat) {
      if (chatMsg.value.msgSource === ChatMsgSource.Speak) {
        sendSpeakMsg(chatMsg.value);
        watchCore.chat.removeChatMsg(chatMsg.value.id);
      }

      if (chatMsg.value.msgSource === ChatMsgSource.Image && chatMsg.value.imageUrl) {
        resendImage(chatMsg.value, insertLocalImageMsg);
      }

      if (chatMsg.value.msgSource === ChatMsgSource.Emotion) {
        sendEmotionImageMsg({
          ...chatMsg.value,
          emotionId: chatMsg.value.emotionId || uuidV4(),
        });
        watchCore.chat.removeChatMsg(chatMsg.value.id);
      }
    } else {
      if (chatMsg.value.msgSource === ChatMsgSource.Speak) {
        watchCore.ask.removeAskMsg(chatMsg.value.id);

        watchCore.ask.sendAskSpeak({
          content: chatMsg.value.content,
        });
      }

      if (chatMsg.value.msgSource === ChatMsgSource.Image) {
        resendAskImage(chatMsg.value);
      }
    }
  }

  const handleThrottleReSendMsg = throttle(handleReSendMsg, 300);

  return {
    iconShowStatus,

    handleReSendMsg,
    handleThrottleReSendMsg,

    chatMsg,
  };
};
