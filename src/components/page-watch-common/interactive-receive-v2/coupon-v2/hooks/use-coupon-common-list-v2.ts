import { computed, ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useCoupon } from './use-coupon';
import type { NormalCouponCommonListInstance } from '@polyv/iar-coupon-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { translate } from '@/assets/lang';
import { PcSidePopupInstance } from '@/components/common-base/side-popup/type';

export const useCouponCommonList = () => {
  const { targetInited, getIarTarget } = useCoupon();

  /** 优惠券是否显示 */
  const { couponCommonListVisible } = storeDefinitionToRefs(useInteractReceiveStore);

  const couponSidePopupRef = ref<PcSidePopupInstance>();

  const couponCommonListRef = ref<NormalCouponCommonListInstance>();

  /** 优惠券标题 */
  const couponCommonListTitle = computed(() => {
    return translate('interact.coupon.title');
  });

  /** 设置优惠券是否显示 */
  const setCouponVisible = (visible = true) => {
    couponCommonListVisible.value = visible;
    if (!!visible && couponCommonListVisible.value === true && couponSidePopupRef.value) {
      couponSidePopupRef.value.raiseZIndex();
    }
  };

  useEventBusListener(appEvents.interaction.OpenCouponCommonList, setCouponVisible);

  return {
    couponCommonListRef,
    targetInited,
    getIarTarget,
    couponCommonListVisible,
    couponCommonListTitle,
    couponSidePopupRef,
  };
};
