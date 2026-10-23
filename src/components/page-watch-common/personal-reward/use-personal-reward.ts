import { appEvents, useEventBusListener } from '@/app/app-events';
import { iarEvents } from '@/app/app-events/events/iar';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { computed, ref, watch } from 'vue';

export const usePersonalReward = () => {
  const { getEmitter } = useGlobalInject();
  const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);
  const { notNeedIar } = storeDefinitionToRefs(useWatchAppStore);
  const { rollingLotteryLoaded } = storeDefinitionToRefs(useLiveActivityStore);

  const rewardTypes = computed(() => {
    const legacyRewardTypes = [
      { type: 'task-activity', text: translate('personalReward.taskEnter') },
      { type: 'lottery', text: translate('personalReward.lotteryEnter') },
      { type: 'lucky-lottery', text: translate('personalReward.luckyLotteryEnter') },
      { type: 'lucky-bag', text: translate('personalReward.luckyBagEnter') },
    ];

    const types = iarSdkLoaded.value && !notNeedIar.value ? legacyRewardTypes : [];
    if (rollingLotteryLoaded.value) {
      types.push({
        type: 'live-activity',
        text: translate('personalReward.liveActivityEnter'),
      });
    }
    return types;
  });

  const currentType = ref('');

  const { visible, show, close } = useSimpleVisible(false);

  watch([visible, currentType], () => {
    if (visible.value) {
      switch (currentType.value) {
        case 'task-activity':
          getEmitter().emit(appEvents.global.RefreshTaskRewardList);
          break;
        case 'lottery':
          getEmitter().emit(appEvents.iar.RefreshLotteryRecordList);
          break;
        case 'lucky-lottery':
          getEmitter().emit(appEvents.iar.RefreshLuckyLotteryPrizeList);
          break;
        case 'lucky-bag':
          getEmitter().emit(appEvents.iar.RefreshLuckyBagWinRecord);
          break;
        case 'live-activity':
          getEmitter().emit(appEvents.liveActivity.RefreshLiveActivityWinRecord);
          break;
      }
    }
  });

  useEventBusListener(appEvents.global.OpenPersonalRewardDialog, (type?: string) => {
    const defaultType =
      !isMobile && rewardTypes.value.some(item => item.type === 'lottery')
        ? 'lottery'
        : rewardTypes.value[0]?.type || 'task-activity';
    currentType.value =
      type && rewardTypes.value.some(item => item.type === type) ? type : defaultType;
    show();
  });

  useEventBusListener(appEvents.global.ClosePersonalRewardDialog, () => {
    close();
  });

  useEventBusListener(appEvents.iar.OpenLotteryRecordDialog, () => {
    currentType.value = 'lottery';
    show();
  });

  function openLuckyLotteryPrizeList() {
    currentType.value = 'lucky-lottery';
    show();
  }

  // UI 发出的是原始事件名；appEvents 会加上 iar. 前缀，无法接收首次打开事件。
  useEventBusListener(iarEvents.OpenLuckyLotteryPrizeList, openLuckyLotteryPrizeList);
  useEventBusListener(appEvents.iar.OpenLuckyLotteryPrizeListDialog, openLuckyLotteryPrizeList);

  useEventBusListener(appEvents.iar.OpenLuckyBagPrizeListDialog, () => {
    currentType.value = 'lucky-bag';
    show();
  });

  return {
    visible,
    close,
    show,

    rewardTypes,
    currentType,
  };
};
