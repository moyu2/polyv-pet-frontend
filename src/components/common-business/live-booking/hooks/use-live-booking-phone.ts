import { useGlobalInject } from '@/app/use-global-inject';
import { useLiveBookingCache } from '@/hooks/business/use-live-booking-cache/use-live-booking-cache';
import { useIdentityStore } from '@/store/use-identity-store';

const defaultAreaCode = '+86';

export interface LiveBookingPhoneData {
  phoneNumber: string;
  areaCode: string;
  trusted: boolean;
}

function normalizePhoneNumber(phoneNumber?: string) {
  return phoneNumber?.trim() || '';
}

function normalizeAreaCode(areaCode?: string) {
  return areaCode || defaultAreaCode;
}

export const useLiveBookingPhone = () => {
  const { getWatchCore } = useGlobalInject();
  const { getLiveBookingCache } = useLiveBookingCache();
  const identityStore = useIdentityStore();

  async function getLastBookingPhone(): Promise<LiveBookingPhoneData | undefined> {
    try {
      const watchCore = getWatchCore();
      const lastBookingPhone = await watchCore.liveBooking.getLastLiveBookingPhone();
      const phoneNumber = normalizePhoneNumber(lastBookingPhone.phoneNumber);

      if (!phoneNumber) return;

      return {
        phoneNumber,
        areaCode: normalizeAreaCode(lastBookingPhone.areaCode),
        trusted: true,
      };
    } catch {
      return undefined;
    }
  }

  async function getDefaultLiveBookingPhone(): Promise<LiveBookingPhoneData> {
    const lastBookingPhone = await getLastBookingPhone();
    if (lastBookingPhone) return lastBookingPhone;

    const cache = getLiveBookingCache();
    const cachePhoneNumber = normalizePhoneNumber(cache.phoneNumber);
    if (cachePhoneNumber) {
      return {
        phoneNumber: cachePhoneNumber,
        areaCode: normalizeAreaCode(cache.areaCode),
        trusted: cache.smsVerified,
      };
    }

    const identityPhoneNumber = normalizePhoneNumber(identityStore.identityUnionInfo?.phoneNumber);
    if (identityPhoneNumber) {
      return {
        phoneNumber: identityPhoneNumber,
        areaCode: normalizeAreaCode(cache.areaCode),
        trusted: false,
      };
    }

    return {
      phoneNumber: '',
      areaCode: normalizeAreaCode(cache.areaCode),
      trusted: false,
    };
  }

  return {
    getDefaultLiveBookingPhone,
  };
};
