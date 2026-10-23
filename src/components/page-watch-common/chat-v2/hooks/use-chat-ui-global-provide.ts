/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGlobalInject } from '@/app/use-global-inject';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { PolyvChatUIPkgType, getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useBrowser } from '@polyv/vue-components';
import RedpaperMsg from '../chat-msg-list/components/redpaper-msg/redpaper-msg-wrap.vue';
import {
  getAskMessageInput,
  useChatLikeConfig,
  useChatMessageInput,
  useClickMsgCallback,
  useCopySpeakMsg,
  useHideChatMsg,
  useMessageLayout,
} from './other';
import { useChatTarget } from './use-chat-target';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useDonateStore } from '@/store/use-donate-store';
import { storeToRefs } from 'pinia';
import { translate } from '@/assets/lang';
import { useAskStore } from '@/store/use-ask-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useMobileInput } from '@/hooks/behaviors/use-mobile-input';
import { generateBgStyle } from '@/themes/utils/theme-config';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { appEvents } from '@/app/app-events/use-app-events';
import { TAB_NAME_ASK } from '@/assets/constants/tab-name';
import { usePlaybackStore } from '@/store/use-playback-store';

export const useChatUIGlobalProvide = () => {
  const { getWatchCore, getEmitter } = useGlobalInject();
  const watchCore = getWatchCore();
  const { chatMsgReplayEnabled } = storeDefinitionToRefs(usePlaybackStore);

  const { isMobile } = useBrowser();

  const { watchThemeStyleConfig } = storeDefinitionToRefs(useThemeStore);
  const {
    chatSetting,
    likeIconUrl,
    onlySpecialMsgWidgetVisible,
    likeSingleClickEnabled,
    likeHoldEnabled,
    chatRoomLongTimeNotUsed,
    chatRoomLongTimeNotUsedText,
    chatExited,
  } = storeDefinitionToRefs(useChatStore);
  const { isPortraitWatchLayout, mobileMenuCurrentName, pcAsideTabCurrentName } =
    storeDefinitionToRefs(useLayoutStore);
  const { needHideUserActor } = storeDefinitionToRefs(useViewerStore);
  const { isGoOnRedpackRain } = storeDefinitionToRefs(useInteractReceiveStore);
  const { liveStatus } = storeDefinitionToRefs(useChannelStore);
  const donateStore = useDonateStore();
  const { showDonateGifts } = storeToRefs(donateStore);
  const { askMenuData } = storeDefinitionToRefs(useChannelMenuStore);

  const askSetting = watchCore.ask.getAskSetting();
  const { askWelcomeText, mobileAskPopupVisible } = storeDefinitionToRefs(useAskStore);

  const { getHideSources } = useHideChatMsg();
  const {
    getMessageLayout,
    getShowUserAvatar,
    getMessageHorizontalSpacing,
    getMessageContainerBoundaryPadding,
    getMessageContainerBoundaryShadow,
  } = useMessageLayout();
  const { getCopySpeakEnabled } = useCopySpeakMsg();
  const { getChatInputPlaceholder, getDisabledInput } = useChatMessageInput();
  const { getAskInputPlaceholder } = getAskMessageInput();
  const { clickMsgCallback } = useClickMsgCallback();
  const { toInterruptUserClick } = useInterruptUserClick();
  const { getLikeEffectIcons } = useChatLikeConfig();

  const { chatTarget, ChatMsgSource } = useChatTarget();

  const { onInputFocus, onInputBlur } = useMobileInput();

  const PolyvChatUI = getChatUIV2Pkg();

  PolyvChatUI.useChatGlobalProvide({
    getChatTarget: () => {
      return chatTarget;
    },
    getBaseConfig: () => {
      return {
        hideNickname: watchCore.channel.needHideViewerNickname(),
      };
    },
    getHistoryConfig: () => {
      return {
        getChatHistory: !chatRoomLongTimeNotUsed.value,
        replayMode: chatMsgReplayEnabled.value,
      };
    },
    getMessageConfig: () => {
      let systemText = '';

      if (chatExited.value) {
        // 聊天室被退出提示
        systemText = translate('chat.transformTip');
      } else if (chatRoomLongTimeNotUsed.value) {
        // 聊天室长时间未使用提示
        systemText = chatRoomLongTimeNotUsedText.value;
      }

      return {
        introductionText: watchCore.chat.getChatCustomIntroductionText(),
        systemText,
        showEmptyTips: !isPortraitWatchLayout.value,
        hideSources: getHideSources(),
        showMessageTime: !isPortraitWatchLayout.value,
        messageLayout: getMessageLayout(),
        showUserAvatar: getShowUserAvatar(),
        showOrdinaryActor: !needHideUserActor.value,
        showUserLevels: chatSetting.value.viewerLevelEnabled,
        translateEnabled: chatSetting.value.chatTranslateEnabled,
        copySpeakEnabled: getCopySpeakEnabled(),
        quoteEnabled: chatSetting.value.quoteReplyEnabled,
        messageHorizontalSpacing: getMessageHorizontalSpacing(),
        messageContainerBoundaryPadding: getMessageContainerBoundaryPadding(),
        messageContainerBoundaryShadow: getMessageContainerBoundaryShadow(),
        messageControlInteraction: isMobile ? 'bubble' : 'context-menu',
        onlySpecialMsgEnabled: onlySpecialMsgWidgetVisible.value,
        customMessageRender: {
          [ChatMsgSource.Redpaper]: RedpaperMsg as any,
        },
        clickMsgCallback,
        customViewerLabelUrl: chatSetting.value.customViewerLabelUrl,
      };
    },
    getAskConfig: () => {
      const questionEntryIcon = askSetting.questionEntryIcon;
      const questionEntryCustomUrl = askSetting.questionEntryCustomUrl;
      let askEntryUrl = '1';
      if (questionEntryIcon === 'custom' && questionEntryCustomUrl) {
        askEntryUrl = questionEntryCustomUrl;
      } else if (questionEntryIcon !== 'custom') {
        askEntryUrl = questionEntryIcon;
      }

      return {
        askEnabled: askMenuData.value.visible,
        askWelcomeText: askWelcomeText.value,
        askEntryUrl,
        toShowAsk: () => {
          getEmitter().emit(appEvents.ask.OpenAskFeature);
        },
        getAskVisibleStatus: () => {
          if (mobileAskPopupVisible.value) {
            return true;
          }
          if (mobileMenuCurrentName.value === TAB_NAME_ASK) {
            return true;
          }
          if (pcAsideTabCurrentName.value === TAB_NAME_ASK) {
            return true;
          }
          return false;
        },
      };
    },
    getInputConfig: () => {
      return {
        disabledInput: getDisabledInput(),
        faceEmotionEnabled: chatSetting.value.faceEmotionEnabled,
        imageEmotionEnabled: chatSetting.value.imageEmotionEnabled,

        chatInputPlaceholder: getChatInputPlaceholder(),
        sendChatImageEnabled: chatSetting.value.viewerSendImgEnabled,

        askInputPlaceholder: getAskInputPlaceholder(),
        sendAskImageEnabled: askSetting.questionImageEnabled,

        onInputFocus: () => {
          onInputFocus();
        },

        onInputBlur: () => {
          onInputBlur();
        },
      };
    },
    getLiveStatus: () => {
      return liveStatus.value;
    },
    getLikeConfig: () => {
      return {
        clickEnabled: likeSingleClickEnabled.value,
        holdEnabled: likeHoldEnabled.value,
        countPosition: 'top',
        showCount: chatSetting.value.likeCountEnabled,
        triggerSize: isMobile ? 36 : 40,
        triggerImage: likeIconUrl.value,
        bubbles: getLikeEffectIcons(),
        likeCountStyle: watchThemeStyleConfig.value
          ? {
              background: watchThemeStyleConfig.value.common.chat.btn.like.countBg,
              color: watchThemeStyleConfig.value.common.chat.btn.like.countColor,
            }
          : {},
      };
    },
    getOnlineConfig: () => {
      return {
        searchEnabled: false,
        ruleEnabled: true,
      };
    },
    getSpecialEffectConfig: () => {
      return {
        switchEnabled: showDonateGifts.value,
        defaultVisible: true,
        visibleChangeCallback: visible => {
          donateStore.$patch({
            donateAnimationVisible: visible,
          });
        },
      };
    },
    getCommentAtmosphereConfig: () => {
      return {
        plusOneEnabled: true,
      };
    },
    getAnimationVisible: () => {
      return !isGoOnRedpackRain.value;
    },
    getStyleConfig: () => {
      if (!watchThemeStyleConfig.value) return {};

      const msgInput = watchThemeStyleConfig.value.common.chat.msgInput;
      return {
        messageInputControlStyle: {
          ...generateBgStyle(msgInput.bgConfig),
          border: `1px solid ${msgInput.borderColor}`,
        },
      };
    },
    interceptClick: triggerSource => {
      let ignoreSetNick = false;

      const ignoreSetNickSource: PolyvChatUIPkgType.InterceptTriggerSource[] = ['chat-like'];
      if (ignoreSetNickSource.includes(triggerSource)) {
        ignoreSetNick = true;
      }

      return toInterruptUserClick({
        triggerSource,
        ignoreSetNick,
      });
    },
  });
};
