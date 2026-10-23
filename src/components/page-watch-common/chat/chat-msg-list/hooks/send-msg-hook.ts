import { appEvents } from '@/app/app-events';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import {
  SendEmotionImageMsgOptions,
  SendSpeakMsgOptions,
  SendImageMsgOptions,
  ChatMsgImageType,
} from '@polyv/live-watch-sdk';

export const useSendMsg = () => {
  const { getEmitter, getWatchCore } = useMultiPolyvWatchApp();

  /**
   * 发送 speak 消息
   */
  function sendSpeakMsg(options: SendSpeakMsgOptions) {
    const watchCore = getWatchCore();
    watchCore.chat.sendSpeakMsg(options);
    getEmitter().emit(appEvents.chat.ScrollToNew);
  }

  /**
   * 发送 emotion 图片消息
   */
  async function sendEmotionImageMsg(options: SendEmotionImageMsgOptions) {
    const watchCore = getWatchCore();
    watchCore.chat.sendEmotionImageMsg(options);
    getEmitter().emit(appEvents.chat.ScrollToNew);
  }

  /**
   * 发送 system 系统消息
   */
  function sendSystemMsg(content: string) {
    const watchCore = getWatchCore();
    watchCore.chat.sendSystemMsg(content);
    getEmitter().emit(appEvents.chat.ScrollToNew);
  }

  /**
   * 发送图片
   */
  function sendImageMsg(options: SendImageMsgOptions) {
    const watchCore = getWatchCore();
    watchCore.chat.sendImageMsg(options);
    getEmitter().emit(appEvents.chat.ScrollToNew);
  }

  /**
   * 插入本地图片
   */
  function insertLocalImageMsg(options: SendImageMsgOptions): ChatMsgImageType {
    const watchCore = getWatchCore();
    const imageChatMsg = watchCore.chat.insertLocalImageChatMsg(options);
    getEmitter().emit(appEvents.chat.ScrollToNew);

    return imageChatMsg;
  }

  return {
    sendSpeakMsg,
    sendEmotionImageMsg,
    sendSystemMsg,
    sendImageMsg,
    insertLocalImageMsg,
  };
};
