import { useGlobalInject } from '@/app/use-global-inject';
import { type PolyvCoupon } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../../_hooks/use-iar-target';

export const useCoupon = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvCoupon.Coupon>(() => {
    return watchCore.interactReceive.getCouponV2();
  });

  return {
    targetInited,
    getIarTarget,
  };
};
