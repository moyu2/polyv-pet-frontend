import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useThemeStore } from '@/store/use-theme-store';
import { computed } from 'vue';

export const useLuckLotteryPendant = () => {
  const themeStore = useThemeStore();

  const { toInterruptUserClick } = useInterruptUserClick();

  const iconUrl = computed(() => {
    if (!themeStore.watchThemeStyleConfig) return '';

    return themeStore.watchThemeStyleConfig.common.pendant.luckyLottery;
  });

  function beforeClickInterrupt() {
    return toInterruptUserClick({ triggerSource: 'lucky-lottery-pendant', ignoreSetNick: true });
  }

  return {
    iconUrl,
    beforeClickInterrupt,
  };
};
