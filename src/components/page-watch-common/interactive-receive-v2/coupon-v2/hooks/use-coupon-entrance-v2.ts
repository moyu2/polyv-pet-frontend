import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useCoupon } from './use-coupon';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { computed } from 'vue';
import { useThemeStore } from '@/store/use-theme-store';

export const useCouponCommonPendantV2 = () => {
  const { targetInited, getIarTarget } = useCoupon();

  const themeStore = useThemeStore();

  const { getEmitter } = useGlobalInject();
  const { couponPendantVisible } = storeDefinitionToRefs(useInteractReceiveStore);

  const { toInterruptUserClick } = useInterruptUserClick();

  function showCouponCommonList() {
    const res = toInterruptUserClick({
      triggerSource: 'coupon-pendant',
      ignoreSetNick: true,
    });
    if (res) {
      return;
    }

    getEmitter().emit(appEvents.interaction.OpenCouponCommonList, true);
  }

  const iconUrl = computed(() => {
    if (!themeStore.watchThemeStyleConfig) return '';

    return themeStore.watchThemeStyleConfig.common.pendant.coupon;
  });

  return {
    targetInited,
    getIarTarget,
    couponPendantVisible,
    iconUrl,
    showCouponCommonList,
  };
};
