import { useGlobalInject } from '@/app/use-global-inject';
import type { WxLiveBookingOptions } from '@polyv/live-watch-sdk';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { ref } from 'vue';
import type { SubscribeInstance } from '../types';
import { useLiveBookingFail } from './use-live-booking-fail';

export const useLiveBookingWx = (options?: WxLiveBookingOptions) => {
  const { getWatchCore } = useGlobalInject();
  const { toastBookingFail } = useLiveBookingFail();

  const liveBookingStore = useLiveBookingStore();

  const subscribeRef = ref<SubscribeInstance>();

  /** 提交微信预约 */
  async function wxSubmitLiveBooking() {
    const watchCore = getWatchCore();
    // 当存在自定义预约+短信预约时，在短信提醒成功后，后端会自动调用自定义预约接口，所以这里不需要再调用一次
    const result = await watchCore.liveBooking.submitWxLiveBooking(options);

    if (result.success) {
      const wxBookingCount = liveBookingStore.wxBookingCount + 1;

      if (options?.otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
            isWxLiveBooking: true,
          },
        });
      } else {
        liveBookingStore.$patch({
          wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
          isWxLiveBooking: true,
        });
      }

      const isWxSubscribed = options?.otherChannelId
        ? liveBookingStore.singleOtherChannelBookingConfig?.isWxSubscribed
        : liveBookingStore.isWxSubscribed;

      // 未关注，弹出二维码弹层
      if (!isWxSubscribed) {
        // 预约成功若服务端配置了二维码，则弹出配置二维码
        const imgUrl = result?.wxOfficialAccountQRCodeUrl ?? undefined;
        subscribeRef.value?.openPopup(imgUrl);
      }
    } else {
      toastBookingFail(result.failReason);
    }
  }

  /** 取消微信预约 */
  async function wxCancelLiveBooking() {
    const watchCore = getWatchCore();
    // 当存在自定义预约+短信预约时，在短信提醒成功后，后端会自动调用自定义预约接口，所以这里不需要再调用一次
    const result = await watchCore.liveBooking.cancelWxLiveBooking(options);

    if (result.success) {
      const wxBookingCount = liveBookingStore.wxBookingCount - 1;
      if (options?.otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
            isWxLiveBooking: false,
          },
        });
      } else {
        liveBookingStore.$patch({
          wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
          isWxLiveBooking: false,
        });
      }
    } else {
      toastBookingFail(result.failReason);
    }
  }

  return {
    subscribeRef,
    wxSubmitLiveBooking,
    wxCancelLiveBooking,
  };
};
