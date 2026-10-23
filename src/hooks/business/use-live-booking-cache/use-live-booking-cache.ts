import { getStorageKey } from '@/assets/utils/storage';
import { useChannelStore } from '@/store/use-channel-store';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { local } from '@polyv/utils/storage';

interface LiveBookingCache {
  channelId: string; // 关联的频道 ID（主要用于区分不同频道的预约缓存）

  // 预约的手机号
  phoneNumber: string;
  // 预约的手机区号
  areaCode: string;
  // 是否已短信验证成功
  smsVerified: boolean;
  // smsVerified 设置为 true 的时间戳（用于 5 分钟自动失效，内部处理）
  smsVerifiedAt: number;

  // 是否自动打开预约弹窗，默认为 false
  needAutoOpenBooking: boolean;
}

export const useLiveBookingCache = () => {
  const liveBookingStore = useLiveBookingStore();
  const channelStore = useChannelStore();

  // local 中的预约缓存
  // 只有单份 channelId 的缓存，后续切换频道后会覆盖之前的缓存，获取时根据 channelId 判断是否有效
  const LOCAL_KEY = getStorageKey('live-booking-cache');

  function getDefaultCache(): LiveBookingCache {
    return {
      channelId: '',
      phoneNumber: '',
      areaCode: '+86',
      smsVerified: false,
      smsVerifiedAt: 0,
      needAutoOpenBooking: false,
    };
  }

  /**
   * 提前设置直播预约缓存，只有在直播预约按钮可见时才会设置缓存
   */
  function advanceSetLiveBookingCache(params: Partial<LiveBookingCache>) {
    if (!liveBookingStore.showLiveBookingButton) {
      return;
    }

    setLiveBookingCache({
      channelId: channelStore.channelId,
      ...params,
    });
  }

  function setLiveBookingCache(params: Partial<LiveBookingCache>) {
    const channelId = params.channelId || channelStore.channelId;
    const cache = getLiveBookingCache(channelId);

    const newCache: LiveBookingCache = {
      ...getDefaultCache(),
      ...cache,
      ...params,
      // 当 smsVerified 被设为 true 时，记录时间戳
      ...(params.smsVerified === true ? { smsVerifiedAt: Date.now() } : {}),
      // 当 smsVerified 被设为 false 时，清除时间戳
      ...(params.smsVerified === false ? { smsVerifiedAt: 0 } : {}),
    };
    local.setAsJSON(LOCAL_KEY, newCache);
  }

  // smsVerified 有效期：5 分钟
  const SMS_VERIFIED_TIMEOUT = 5 * 60 * 1000;

  function getLiveBookingCache(channelId?: string): LiveBookingCache {
    const cache = (local.getAsJSON(LOCAL_KEY) as LiveBookingCache) || getDefaultCache();

    const currentChannelId = channelId || channelStore.channelId;
    if (cache.channelId !== currentChannelId) {
      // 频道 ID 不匹配，返回默认缓存
      return getDefaultCache();
    }

    // 检查 smsVerified 是否过期
    if (cache.smsVerified && cache.smsVerifiedAt > 0) {
      const isExpired = Date.now() - cache.smsVerifiedAt > SMS_VERIFIED_TIMEOUT;
      if (isExpired) {
        // 过期后返回 smsVerified: false（不修改存储，下次存储时会更新）
        return { ...cache, smsVerified: false };
      }
    }
    return cache;
  }

  function clearLiveBookingCache() {
    local.remove(LOCAL_KEY);
  }

  return {
    advanceSetLiveBookingCache,

    setLiveBookingCache,
    getLiveBookingCache,
    clearLiveBookingCache,
  };
};
