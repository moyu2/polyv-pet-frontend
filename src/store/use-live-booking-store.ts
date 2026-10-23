/**
 * @file 直播预约 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, Ref, ref, unref } from 'vue';
import { isMobile, isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useChannelInfoStore } from './use-channel-info-store';
import { useChannelStore } from './use-channel-store';
import {
  OtherChannelBookingConfig,
  OtherChannelBookingConfigItem,
  PlvLiveBookingModule,
  LiveStatus,
} from '@polyv/live-watch-sdk';
import { useWatchAppStore } from './use-watch-app-store';

export interface LiveBookingStoreState {
  /** 是否使用微信预约 */
  useWxBooking: Ref<boolean>;
  /** 强制隐藏直播预约按钮 */
  forceHideLiveBookingButton: Ref<boolean>;
  /** 是否显示直播预约按钮 */
  showLiveBookingButton: ComputedRef<boolean>;
  /** 是否已短信预约 */
  isSmsLiveBooking: Ref<boolean>;
  /** 是否已微信预约 */
  isWxLiveBooking: Ref<boolean>;
  /** 是否已预约直播 */
  isLiveBooking: ComputedRef<boolean>;
  /** 是否已关注了微信公众号 */
  isWxSubscribed: Ref<boolean>;
  /** 微信预约弹层提示文案 */
  wxBookingTips: Ref<string>;
  /** 是否展示微信预约人数 */
  wxBookingCountVisible: Ref<boolean>;
  /** 微信预约人数 */
  wxBookingCount: Ref<number>;
  /** 微信公众号图片 */
  wxMpImageUrl: Ref<string>;
  /** 下一场直播预约配置 */
  otherChannelBookingConfig: Ref<OtherChannelBookingConfig>;
  /** 是否允许其他直播预约 */
  otherChannelBookingEnabled: ComputedRef<boolean>;
  /** 获取当前下一场其他直播配置(单个直播情况) */
  singleOtherChannelBookingConfig: Ref<OtherChannelBookingConfigItem | null>;
  /** 是否是其他直播预约 */
  isOtherLiveBooking: ComputedRef<boolean>;
  /** 当前下一场其他直播是否已开启自定义预约(单个直播情况) */
  singleOtherChannelSmsLiveBookingEnable: ComputedRef<boolean>;
  /** 当前下一场其他直播是否已短信预约(单个直播情况) */
  singleOtherChannelSmsLiveBooking: ComputedRef<boolean>;
  /** 单场其他直播预约是否使用微信预约 */
  useSingleWxBooking: ComputedRef<boolean>;
  /** 是否使用短信预约 */
  useSmsBooking: ComputedRef<boolean>;
  /** 是否使用自定义预约 */
  useCustomBooking: ComputedRef<boolean>;
  /** 是否已自定义预约 */
  isCustomLiveBooking: Ref<boolean>;
  /** 当前下一场其他直播是否已开启自定义预约(单个直播情况) */
  singleOtherChannelCustomLiveBookingEnable: ComputedRef<boolean>;
  /** 当前下一场其他直播是否已自定义预约 */
  singleOtherChannelCustomLiveBooking: ComputedRef<boolean>;
  /** 当前下一场其他直播是否已微信预约(单个直播情况) */
  singleOtherChannelWxLiveBooking: ComputedRef<boolean>;
}

export interface LiveBookingStoreAction {
  /** 同步直播预约 Store 数据 */
  syncLiveBookingStore(): void;
}

export interface LiveBookingStore extends LiveBookingStoreState, LiveBookingStoreAction {}

export const useLiveBookingStore = defineStore<'liveBooking', LiveBookingStore>(
  'liveBooking',
  () => {
    const watchAppStore = useWatchAppStore();
    const channelInfoStore = useChannelInfoStore();
    const channelStore = useChannelStore();

    const __liveBookingConfig = PlvLiveBookingModule.generateDefaultLiveBookingConfig();

    /** 是否开启了短信预约 */
    const smsBookingEnabled = ref(__liveBookingConfig.smsBookingEnabled);

    /** 是否开启了微信预约 */
    const wxBookingEnabled = ref(__liveBookingConfig.wxBookingEnabled);

    /** 强制隐藏直播预约按钮 */
    const forceHideLiveBookingButton = ref(false);

    /** 是否已短信预约 */
    const isSmsLiveBooking = ref(__liveBookingConfig.isSmsLiveBooking);

    /** 是否已微信预约 */
    const isWxLiveBooking = ref(__liveBookingConfig.isWxLiveBooking);

    /** 是否已关注了微信公众号 */
    const isWxSubscribed = ref(__liveBookingConfig.isWxSubscribed);

    /** 微信预约弹层提示文案 */
    const wxBookingTips = ref(__liveBookingConfig.wxBookingTips);

    /** 是否展示微信预约人数 */
    const wxBookingCountVisible = ref(__liveBookingConfig.wxBookingCountVisible);

    /** 微信预约人数 */
    const wxBookingCount = ref(__liveBookingConfig.wxBookingCount);

    /** 微信公众号图片 */
    const wxMpImageUrl = ref(__liveBookingConfig.wxMpImageUrl);

    /** 是否开启了自定义预约 */
    const customBookingEnabled = ref(__liveBookingConfig.customBookingEnabled);
    /** 是否已自定义预约 */
    const isCustomLiveBooking = ref(__liveBookingConfig.isCustomLiveBooking);

    /** 下一场直播预约配置 */
    const otherChannelBookingConfig = ref<OtherChannelBookingConfig>([]);

    /** 当前下一场其他直播配置(目前只有单个直播配置) */
    const singleOtherChannelBookingConfig = ref<OtherChannelBookingConfigItem | null>(null);

    /** 当前下一场其他直播是否已微信预约 */
    const singleOtherChannelWxLiveBooking = computed<boolean>(() => {
      return singleOtherChannelBookingConfig.value?.isWxLiveBooking || false;
    });

    /** 当前下一场其他直播是否已短信预约 */
    const singleOtherChannelSmsLiveBooking = computed<boolean>(() => {
      return singleOtherChannelBookingConfig.value?.isSmsLiveBooking || false;
    });

    /** 当前下一场其他直播是否已自定义预约 */
    const singleOtherChannelCustomLiveBooking = computed<boolean>(() => {
      return singleOtherChannelBookingConfig.value?.isCustomLiveBooking || false;
    });
    /** 单场其他直播预约是否开启了短信预约 */
    const singleOtherChannelSmsLiveBookingEnable = computed<boolean>(() => {
      return singleOtherChannelBookingConfig.value?.smsBookingEnabled || false;
    });
    /** 单场其他直播预约是否开启了自定义预约 */
    const singleOtherChannelCustomLiveBookingEnable = computed<boolean>(() => {
      return singleOtherChannelBookingConfig.value?.customBookingEnabled || false;
    });

    /** 是否使用微信预约 */
    const useWxBooking = computed<boolean>(() => {
      return isMobile && isWeixin && !isWorkWeixin && unref(wxBookingEnabled);
    });
    /** 是否使用自定义预约 */
    const useCustomBooking = computed<boolean>(() => {
      return unref(customBookingEnabled);
    });

    /** 是否使用短信预约 */
    const useSmsBooking = computed<boolean>(() => {
      return unref(smsBookingEnabled);
    });

    /** 其他直播预约是否使用微信预约 */
    const useSingleWxBooking = computed<boolean>(() => {
      return (
        isMobile &&
        isWeixin &&
        !isWorkWeixin &&
        (unref(singleOtherChannelBookingConfig.value?.wxBookingEnabled) || false)
      );
    });

    /** 是否是其他直播预约 */
    const isOtherLiveBooking = computed<boolean>(() => {
      if (!singleOtherChannelBookingConfig.value) {
        return false;
      }

      return (
        (unref(useSingleWxBooking) &&
          unref(singleOtherChannelBookingConfig.value.isWxLiveBooking)) ||
        unref(singleOtherChannelBookingConfig.value.isSmsLiveBooking) ||
        unref(singleOtherChannelBookingConfig.value.isCustomLiveBooking)
      );
    });

    /** 是否已预约直播 */
    const isLiveBooking = computed<boolean>(() => {
      return (
        (unref(useWxBooking) && unref(isWxLiveBooking)) ||
        unref(isSmsLiveBooking) ||
        unref(isCustomLiveBooking)
      );
    });

    /** 是否显示直播预约按钮 */
    const showLiveBookingButton = computed<boolean>(() => {
      if (channelInfoStore.isTargetSessionStarted) {
        return false;
      }

      if (forceHideLiveBookingButton.value) {
        return false;
      }

      // 没有设置开始时间
      if (!channelInfoStore.liveStartTime) {
        return false;
      }

      // 倒计时结束
      if (channelInfoStore.isLiveStartCountDownEnd) {
        return false;
      }

      return unref(useWxBooking) || unref(smsBookingEnabled) || unref(customBookingEnabled);
    });

    /** 是否允许预约下一场其他直播 */
    const otherChannelBookingEnabled = computed<boolean>(() => {
      const config = singleOtherChannelBookingConfig.value;

      if (forceHideLiveBookingButton.value) {
        return false;
      }

      if (channelStore.liveStatus !== LiveStatus.Live) {
        return false;
      }

      if (!config || !config.startTime) {
        return false;
      }

      // 下一场直播开始时间需要晚于当前时间25分钟以上
      if (Number(config.startTime) < Date.now() + 1000 * 60 * 25) {
        return false;
      }

      return (
        unref(useSingleWxBooking) ||
        unref(config.smsBookingEnabled) ||
        unref(config.customBookingEnabled)
      );
    });

    /** 同步直播预约 Store 数据 */
    function syncLiveBookingStore(): void {
      const watchCore = watchAppStore.getWatchCore();
      const liveBookingConfig = watchCore.liveBooking.getLiveBookingConfig();

      smsBookingEnabled.value = liveBookingConfig.smsBookingEnabled;
      isSmsLiveBooking.value = liveBookingConfig.isSmsLiveBooking;

      wxBookingEnabled.value = liveBookingConfig.wxBookingEnabled;
      isWxLiveBooking.value = liveBookingConfig.isWxLiveBooking;
      isWxSubscribed.value = liveBookingConfig.isWxSubscribed;
      wxBookingTips.value = liveBookingConfig.wxBookingTips;
      wxBookingCountVisible.value = liveBookingConfig.wxBookingCountVisible;
      wxBookingCount.value = liveBookingConfig.wxBookingCount;
      wxMpImageUrl.value = liveBookingConfig.wxMpImageUrl;

      customBookingEnabled.value = liveBookingConfig.customBookingEnabled;
      isCustomLiveBooking.value = liveBookingConfig.isCustomLiveBooking;

      otherChannelBookingConfig.value = watchCore.liveBooking.getOtherLiveBookingConfig();
      console.log('otherChannelBookingConfig', otherChannelBookingConfig.value);

      if (otherChannelBookingConfig.value.length > 0) {
        singleOtherChannelBookingConfig.value = otherChannelBookingConfig.value[0] || null;
      } else {
        singleOtherChannelBookingConfig.value = null;
      }
    }

    return {
      useWxBooking,
      forceHideLiveBookingButton,
      showLiveBookingButton,
      isSmsLiveBooking,
      isWxLiveBooking,
      isLiveBooking,
      isWxSubscribed,
      wxBookingTips,
      wxBookingCountVisible,
      wxBookingCount,
      wxMpImageUrl,
      syncLiveBookingStore,
      otherChannelBookingConfig,
      otherChannelBookingEnabled,
      singleOtherChannelBookingConfig,
      isOtherLiveBooking,
      singleOtherChannelSmsLiveBooking,
      useSingleWxBooking,

      singleOtherChannelWxLiveBooking,

      // 短信预约
      useSmsBooking,
      singleOtherChannelSmsLiveBookingEnable,

      // 自定义预约
      useCustomBooking,
      isCustomLiveBooking,
      singleOtherChannelCustomLiveBooking,
      singleOtherChannelCustomLiveBookingEnable,
    };
  },
);
