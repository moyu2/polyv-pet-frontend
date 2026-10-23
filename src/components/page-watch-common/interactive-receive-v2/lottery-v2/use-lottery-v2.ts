import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import type { LotteryConfig } from '@polyv/iar-lottery-ui';
import { type PolyvLottery } from '@polyv/live-watch-sdk';
import { storeToRefs } from 'pinia';
import { useSendMsg } from '../../chat/chat-msg-list/hooks/send-msg-hook';
import { useIarTarget } from '../_hooks/use-iar-target';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useThemeStore } from '@/store/use-theme-store';

export const useLotteryTarget = () => {
  const interactReceiveStore = useInteractReceiveStore();
  const { interactSetting } = storeToRefs(interactReceiveStore);

  const enrollStore = useEnrollStore();

  const { sendSpeakMsg } = useSendMsg();

  const { watchThemeStyleConfig } = storeToRefs(useThemeStore());

  const { getWatchCore, getEmitter } = useGlobalInject();

  const { toInterruptUserClick } = useInterruptUserClick();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvLottery.Lottery>(() => {
    return watchCore.interactReceive.getLotteryV2();
  });

  const privacyDetail = watchCore.interactReceive.getLotteryPrivacyDetail();
  const lotteryConfig: LotteryConfig = {
    privateContent: privacyDetail.privacyContent,
    animationBtnText: interactSetting.value.lotteryGiftButtonTextCH,
    animationBtnEnText: interactSetting.value.lotteryGiftButtonTextEN,
    detailAutoPopper: interactSetting.value.conditionLotteryAutoPopperEnabled,
    toFillQuestionnaire: questionnaireId => {
      interactReceiveStore.setQuestionnaireBackBtnVisible(false);
      getEmitter().emit(appEvents.interaction.OpenQuestionnaire, questionnaireId);
    },
    customIconConfig: {
      normalIconUrl: watchThemeStyleConfig.value?.common.pendant.lottery,
      conditionIconUrl: watchThemeStyleConfig.value?.common.pendant.conditionLottery,
    },
    beforeJoinLottery: async () => {
      // 需要先拦截用户操作
      const res = toInterruptUserClick({
        triggerSource: 'before-join-lottery',
        ignoreSetNick: true,
      });
      if (res) {
        return false;
      }

      // 需要先报名
      if (enrollStore.needEnrollByChat) {
        getEmitter().emit(appEvents.global.OpenEnrollDialog);
        return false;
      }

      return true;
    },
    customSendComment: options => {
      sendSpeakMsg({
        content: options.comment,
      });

      return Promise.resolve();
    },
  };

  return {
    targetInited,
    getIarTarget,
    lotteryConfig,
  };
};
