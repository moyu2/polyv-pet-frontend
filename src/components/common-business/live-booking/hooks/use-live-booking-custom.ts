import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { useLiveBookingStore } from '@/store/use-live-booking-store';

export const useLiveBookingCustom = ({
  otherChannelId,
  sessionId,
  singleMode,
}: {
  otherChannelId?: string;
  sessionId?: string;
  singleMode?: boolean;
} = {}) => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const liveBookingStore = useLiveBookingStore();

  const submitLiveBookingOfCustom = async () => {
    const watchCore = getWatchCore();
    const result = await watchCore.liveBooking.submitCustomLiveBooking({
      otherChannelId,
      sessionId,
    });

    if (result.success) {
      // 预约下一场其他直播的处理
      if (otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            isCustomLiveBooking: true,
          },
        });
      } else {
        liveBookingStore.$patch({
          isCustomLiveBooking: true,
        });
      }
      singleMode && toast.success(translate('liveBooking.bookingSuccess'));
    } else {
      singleMode && toast.error(translate('liveBooking.fail'));
    }
  };

  const cancelLiveBookingOfCustom = async () => {
    const watchCore = getWatchCore();
    const result = await watchCore.liveBooking.cancelCustomLiveBooking({
      otherChannelId,
      sessionId,
    });

    if (result.success) {
      // 预约下一场其他直播的处理
      if (otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            isCustomLiveBooking: false,
          },
        });
      } else {
        liveBookingStore.$patch({
          isCustomLiveBooking: false,
        });
      }
      singleMode && toast.success(translate('liveBooking.cancelSuccess'));
    } else {
      singleMode && toast.error(translate('liveBooking.fail'));
    }
  };

  const patchSroreOfCustom = (isBooking: boolean) => {
    if (otherChannelId) {
      liveBookingStore.$patch({
        singleOtherChannelBookingConfig: {
          isCustomLiveBooking: isBooking,
        },
      });
    } else {
      liveBookingStore.$patch({
        isCustomLiveBooking: isBooking,
      });
    }
  };

  return {
    submitLiveBookingOfCustom,
    cancelLiveBookingOfCustom,
    patchSroreOfCustom,
  };
};
