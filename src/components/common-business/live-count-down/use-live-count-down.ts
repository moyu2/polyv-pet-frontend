import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { IRemaining as CountDownSurplusData } from '@polyv/utils/countdown';

export const useLiveCountDown = () => {
  const channelInfoStore = useChannelInfoStore();
  const liveBookingStore = useLiveBookingStore();

  function onCountDownFinish() {
    channelInfoStore.$patch({
      isLiveStartCountDownEnd: true,
    });
  }

  function onCountDownChange(params: CountDownSurplusData) {
    // 剩余倒计时小于 25 分钟
    if (params.totalMsecs < 25 * 60 * 1000 && liveBookingStore.showLiveBookingButton) {
      liveBookingStore.$patch({
        forceHideLiveBookingButton: true,
      });
    }
  }

  return {
    onCountDownChange,
    onCountDownFinish,
  };
};
