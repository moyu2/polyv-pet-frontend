import { translate } from '@/assets/lang';
import { ErrorVerifyType, useErrorVerify } from '@/hooks/core/use-error-verify';
import { useChatStore } from '@/store/use-chat-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { ChatEvents, ChatMsgSource, ChatMsgType, PolyvWatchCore } from '@polyv/live-watch-sdk';
import { usePetStore } from '@/components/pet-panel/use-pet-store';
import { useCommentRewardStore } from '@/components/pet-panel/use-comment-rewards';

/**
 * 监听聊天室模块事件
 */
export function bindChatModuleEvents(watchCore: PolyvWatchCore): void {
  const watchAppStore = useWatchAppStore();
  const chatStore = useChatStore();

  /** SPEAK 广播即视为发送成功；仅为当前观众提交回执，过滤本地回显和重放。 */
  function onConfirmedComment(chatMsg: ChatMsgType, receivedFromChat = false) {
    const pet = usePetStore();
    if (
      chatMsg.msgSource !== ChatMsgSource.Speak ||
      (!receivedFromChat && chatMsg.isSended !== true) ||
      chatMsg.isSendFailed ||
      !pet.authenticated ||
      String(chatMsg.user.userId) !== pet.identity?.viewerId ||
      Math.abs(Date.now() - chatMsg.time) > 60000
    )
      return;
    const rewards = useCommentRewardStore();
    rewards.queue({
      messageId: chatMsg.id,
      content: chatMsg.content,
      messageTime: chatMsg.time,
    });
    rewards.tick();
  }
  watchCore.chat.eventEmitter.on(ChatEvents.SelfSpeak, ({ chatMsg, isOnlyLocalMsg }) => {
    if (!isOnlyLocalMsg) onConfirmedComment(chatMsg);
  });
  watchCore.chat.eventEmitter.on(ChatEvents.ReplaceChatMessage, ({ chatMsg }) =>
    onConfirmedComment(chatMsg),
  );
  watchCore.chat.eventEmitter.on(ChatEvents.ChatMessage, ({ chatMsg, isChatReplayMsg }) => {
    if (!isChatReplayMsg) onConfirmedComment(chatMsg, true);
  });

  const { redirectToErrorVerify } = useErrorVerify();

  watchCore.chat.eventEmitter.on(ChatEvents.ChatSdkV2Setuped, () => {
    chatStore.$patch({
      chatSdkV2Setuped: true,
    });
  });

  // 聊天室连接失败
  watchCore.chat.eventEmitter.on(ChatEvents.ChatConnectFail, () => {
    chatStore.$patch({
      connectError: true,
    });

    if (!watchAppStore.watchPageInited) {
      watchAppStore.$patch({
        watchPageInited: true,
      });
    }
  });

  // 聊天室重连成功
  watchCore.chat.eventEmitter.on(ChatEvents.ChatReconnectSuccess, async () => {
    chatStore.$patch({
      connectError: false,
    });

    watchCore.chat.sendSystemMsg(translate('chat.reconnect.tip'));

    if (!watchAppStore.watchPageChatConnected) {
      watchAppStore.$patch({
        watchPageChatConnected: true,
      });
    }
  });

  // 聊天室基础信息变更
  watchCore.chat.eventEmitter.on(ChatEvents.ChatInfoChange, () => {
    chatStore.syncChatStore();
  });

  // 重复登录，页面跳走
  watchCore.chat.eventEmitter.on(ChatEvents.CurrentUserRelogin, params => {
    redirectToErrorVerify(params);
  });

  // OverLoginLimit事件，跳到满员页面
  watchCore.chat.eventEmitter.on(ChatEvents.OverLoginLimit, params => {
    const errorType =
      params && params?.isStartLiveOverLogin
        ? ErrorVerifyType.SmallClassStartLiveOverLogin
        : ErrorVerifyType.SmallClassOverLogin;

    redirectToErrorVerify({
      errorType,
    });
  });

  // 点赞数修改
  watchCore.chat.eventEmitter.on(ChatEvents.ChatLikeCountChange, () => {
    const realtimeLikes = watchCore.chat.getRealtimeLikes();
    chatStore.$patch({
      realtimeLikes,
    });
  });

  // 在线人数修改
  watchCore.chat.eventEmitter.on(ChatEvents.OnlineUserCountChange, () => {
    const onlineUserCount = watchCore.chat.getOnlineUserCount();
    chatStore.$patch({
      onlineUserCount,
    });
  });

  // 超出直播间最大在线人数
  watchCore.chat.eventEmitter.on(ChatEvents.OverMaxOnlineCount, () => {
    redirectToErrorVerify({
      errorType: ErrorVerifyType.Restrict,
    });
  });
}
