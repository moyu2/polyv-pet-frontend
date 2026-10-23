/**
 * @file 频道信息 store
 */
import { DATE_FORMAT_DOT } from '@/assets/constants/date-format';
import { translate } from '@/assets/lang';
import {
  isAndroid,
  isBaiduApp,
  isIOS,
  isQQBrowser,
  isUCBrowser,
  isWeixin,
  isWorkWeixin,
} from '@/assets/utils/browser';
import { htmlStr2Text } from '@/assets/utils/string';
import {
  ChannelBasicInfo,
  ChannelCountdownSetting,
  ChannelWatchDurationSetting,
  ChannelWatchDurationType,
  LiveStatus,
  PageViewShowLocation,
  PlvChannelModule,
} from '@polyv/live-watch-sdk';
import { formatDate } from '@polyv/utils/date';
import { defineStore } from 'pinia';
import { ComputedRef, Ref, computed, ref, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { useLangStore } from './use-lang-store';
import { useWatchAppStore } from './use-watch-app-store';

export interface ChannelInfoStoreState {
  /** 频道信息（中文） */
  cnChannelBasicInfo: Ref<ChannelBasicInfo>;
  /** 频道信息（英文） */
  enChannelBasicInfo: Ref<ChannelBasicInfo>;
  /** 频道信息（根据多语言返回） */
  channelInfo: ComputedRef<ChannelBasicInfo>;
  /** 频道标题（根据多语言返回） */
  channelTitle: ComputedRef<string>;
  /** 频道主持人（根据多语言返回） */
  channelPublisher: ComputedRef<string>;
  /** 频道主持人头像 */
  channelPublisherPic: ComputedRef<string | undefined>;
  /** 频道描述（根据多语言返回） */
  channelDescription: ComputedRef<string>;
  /** 频道描述是否为空 */
  channelDescriptionIsEmpty: ComputedRef<boolean>;

  /** 观看浏览次数显示开关 */
  pvShowEnabled: Ref<boolean>;
  /** 页面浏览次数 */
  pageViewCount: Ref<number>;
  /** 移动端页面浏览次数显示位置 */
  pageViewCountLocation: ComputedRef<PageViewShowLocation>;

  /** 直播开始时间 */
  liveStartTime: ComputedRef<number | undefined>;
  /** 是否直播开始时间倒计时结束 */
  isLiveStartCountDownEnd: Ref<boolean>;
  /** 直播开始时间显示文案 */
  liveStartTimeText: ComputedRef<string>;
  /** 信息卡片展示的直播时间（按时间类型选择后的结果） */
  liveShowTime: ComputedRef<number | undefined>;
  /** 信息卡片直播时间显示文案 */
  liveShowTimeText: ComputedRef<string>;
  /** 是否显示直播倒计时 */
  showLiveCountDown: ComputedRef<boolean>;
  /** 当前指定场次是否已进入开播后的状态 */
  isTargetSessionStarted: ComputedRef<boolean>;

  /** 学习时长开关 */
  learningStatsEnabled: ComputedRef<boolean>;
  /** 观看时长，单位分钟 */
  viewerWatchDuration: Ref<number>;
  /** 学习时长统计弹窗是否可用 */
  learningStatsDialogEnabled: ComputedRef<boolean>;

  /** 主讲信息弹层是否显示 */
  anchorPopupVisible: Ref<boolean>;
}

export interface ChannelInfoStoreAction {
  /** 刷新频道信息 */
  syncChannelInfo: () => void;
}

/** 频道信息 store */
export interface ChannelInfoStore extends ChannelInfoStoreState, ChannelInfoStoreAction {}

export const useChannelInfoStore = defineStore<'channelInfo', ChannelInfoStore>(
  'channelInfo',
  () => {
    const langStore = useLangStore();
    const channelStore = useChannelStore();
    const watchAppStore = useWatchAppStore();

    /** 频道信息（中文） */
    const cnChannelBasicInfo = ref<ChannelBasicInfo>({
      title: '',
      publisher: '',
      description: '',
    });

    /** 频道信息（英文） */
    const enChannelBasicInfo = ref<ChannelBasicInfo>({
      title: '',
      publisher: '',
      description: '',
    });

    /** 频道信息（根据多语言返回） */
    const channelInfo = computed(() => {
      let info: ChannelBasicInfo = unref(cnChannelBasicInfo);

      if (langStore.englishSettingEnabled && !langStore.isChineseLang) {
        info = unref(enChannelBasicInfo);
      }

      return info;
    });

    /**
     * 频道标题
     * 一般情况会根据多语言返回对应的频道信息标题，但是通过回放地址进入观看页时，需要使用回放视频名称
     * */
    const channelTitle = computed(() => {
      return watchAppStore.playbackWatchBasicInfo.videoName || unref(channelInfo).title;
    });

    /** 频道主持人（根据多语言返回） */
    const channelPublisher = computed(() => {
      let publisher = unref(channelInfo).publisher;

      if (channelStore.teacherInfo?.anchorEnabled) {
        return channelStore.teacherInfo.nick;
      }

      if (!publisher && channelStore.isSeminarChannel) {
        publisher = translate('seminar.host');
      }

      return publisher;
    });

    /** 频道主持人头像 */
    const channelPublisherPic = computed<string | undefined>(() => {
      if (channelStore.teacherInfo?.anchorEnabled) {
        return channelStore.teacherInfo?.pic;
      }

      return undefined;
    });

    /** 频道描述（根据多语言返回） */
    const channelDescription = computed(() => unref(channelInfo).description);

    /** 频道描述是否为空 */
    const channelDescriptionIsEmpty = computed<boolean>(() => {
      const htmlContent = unref(channelDescription);
      if (!htmlContent) {
        return true;
      }
      // 具有以下标签的则不为空
      const labelName = ['img'];
      for (let i = 0; i <= labelName.length; i++) {
        if (htmlContent.indexOf(labelName[i]) !== -1) {
          return false;
        }
      }
      // 纯文本为空
      const htmlText = htmlStr2Text(htmlContent);
      if (!htmlText) {
        return true;
      }
      return false;
    });

    /** 观看浏览次数显示开关 */
    const pvShowEnabled = ref(false);

    /** 页面浏览次数 */
    const pageViewCount = ref(0);

    /** 移动端页面浏览位置 */
    const mobilePvShowLocation = ref(PageViewShowLocation.Desc);

    /** 页面浏览次数显示位置，默认显示在频道介绍中 */
    const pageViewCountLocation = computed<PageViewShowLocation>(() => {
      const mobilePvShowLocationVal = unref(mobilePvShowLocation);

      // 显示在频道介绍中
      if (mobilePvShowLocationVal === PageViewShowLocation.Desc) {
        return PageViewShowLocation.Desc;
      }

      // 显示在播放器
      if (
        mobilePvShowLocationVal === PageViewShowLocation.Player &&
        channelStore.liveStatus === LiveStatus.Live &&
        ((isAndroid && (isWeixin || isWorkWeixin)) ||
          (isIOS && !isQQBrowser && !isUCBrowser && !isBaiduApp))
      ) {
        return PageViewShowLocation.Player;
      }

      return PageViewShowLocation.Desc;
    });

    /** 倒计时设置信息 */
    const countdownSetting = ref<ChannelCountdownSetting>({
      liveStartTime: undefined,
      countdownEnabled: false,
      playbackShowCountdownEnabled: false,
    });

    /** 是否处于指定场次，随频道信息同步，避免切换场次后沿用旧值 */
    const inTargetSession = ref(false);

    /** 指定场次开播后，不再按计划时间显示本场倒计时和预约入口 */
    const isTargetSessionStarted = computed<boolean>(() => {
      return (
        inTargetSession.value &&
        [LiveStatus.Live, LiveStatus.Stop, LiveStatus.End, LiveStatus.Playback].includes(
          channelStore.liveStatus,
        )
      );
    });

    /** 直播开始时间 */
    const liveStartTime = computed<number | undefined>(() => {
      return unref(countdownSetting).liveStartTime;
    });

    /** 是否直播开始时间倒计时结束 */
    const isLiveStartCountDownEnd = ref(false);

    /** 直播开始时间显示文案 */
    const liveStartTimeText = computed<string>(() => {
      const time = unref(liveStartTime);
      if (!time) {
        return '- -';
      }

      return formatDate(time, DATE_FORMAT_DOT);
    });

    /** 信息卡片直播时间设置 */
    const descLiveTimeSetting = ref<{
      liveShowTime: number | undefined;
      descLiveTimeType: 'plan' | 'actual';
    }>({
      liveShowTime: undefined,
      descLiveTimeType: 'plan',
    });

    /** 信息卡片展示的直播时间（按时间类型选择后的结果） */
    const liveShowTime = computed<number | undefined>(() => {
      return unref(descLiveTimeSetting).liveShowTime;
    });

    /** 信息卡片直播时间显示文案 */
    const liveShowTimeText = computed<string>(() => {
      const time = unref(liveShowTime);
      if (!time) {
        return '- -';
      }

      return formatDate(time, DATE_FORMAT_DOT);
    });

    /** 直播倒计时是否显示 */
    const showLiveCountDown = computed(() => {
      if (isTargetSessionStarted.value) {
        return false;
      }

      const liveStartTimeVal = unref(liveStartTime);
      // 后台开关
      if (!unref(countdownSetting).countdownEnabled) {
        return false;
      }

      // 没有返回开始时间
      if (!liveStartTimeVal) {
        return false;
      }

      // 直播中和已结束直播
      if ([LiveStatus.Live, LiveStatus.End].includes(channelStore.liveStatus)) {
        return false;
      }

      // 在观看页中，处于直播回放状态，需要再判断开关
      if (
        watchAppStore.watchPageInited &&
        channelStore.liveStatus === LiveStatus.Playback &&
        !unref(countdownSetting).playbackShowCountdownEnabled
      ) {
        return false;
      }

      // 倒计时结束
      if (isLiveStartCountDownEnd.value) {
        return false;
      }

      return Date.now() < liveStartTimeVal;
    });

    /** 观看时长配置 */
    const watchDurationSetting = ref<ChannelWatchDurationSetting>(
      PlvChannelModule.generateDefaultWatchDurationSetting(),
    );

    /** 学习时长开关 */
    const learningStatsEnabled = computed(() => {
      const { watchDurationEnabled, watchDurationType } = watchDurationSetting.value;

      if (watchDurationType === ChannelWatchDurationType.LivePlayback) {
        return watchDurationEnabled;
      }

      if (
        watchDurationType === ChannelWatchDurationType.Live &&
        channelStore.liveStatus === LiveStatus.Live
      ) {
        return watchDurationEnabled;
      }

      if (
        watchDurationType === ChannelWatchDurationType.Playback &&
        channelStore.liveStatus === LiveStatus.Playback
      ) {
        return watchDurationEnabled;
      }

      return false;
    });

    /** 观看时长，单位分钟 */
    const viewerWatchDuration = ref(0);

    /** 学习时长统计弹窗是否可用 */
    const learningStatsDialogEnabled = computed(() => {
      const { watchDurationEnabled, watchDurationType } = watchDurationSetting.value;

      return (
        watchDurationEnabled &&
        watchDurationType === ChannelWatchDurationType.Playback &&
        channelStore.liveStatus === LiveStatus.Playback
      );
    });

    /** 主讲信息弹层是否显示 */
    const anchorPopupVisible = ref(false);

    /** 刷新频道信息 */
    function syncChannelInfo(): void {
      const watchCore = watchAppStore.getWatchCore();
      const channelBasicInfo = watchCore.channel.getChannelBasicInfo('zh_CN');

      cnChannelBasicInfo.value = {
        title: channelBasicInfo.title,
        publisher: channelBasicInfo.publisher,
        description: channelBasicInfo.description,
      };

      const channelBasicEnInfo = watchCore.channel.getChannelBasicInfo('en');
      enChannelBasicInfo.value = {
        title: channelBasicEnInfo.title,
        publisher: channelBasicEnInfo.publisher,
        description: channelBasicEnInfo.description,
      };

      pageViewCount.value = watchCore.channel.getPageViewCount();
      const pvSetting = watchCore.channel.getPageViewSetting();
      pvShowEnabled.value = pvSetting.pvShowEnabled;
      mobilePvShowLocation.value = pvSetting.mobilePvShowLocation;

      const channelCountdownSetting = watchCore.channel.getCountdownSetting();
      inTargetSession.value = watchCore.inTargetSession();
      countdownSetting.value = {
        ...channelCountdownSetting,
        countdownEnabled: channelCountdownSetting.countdownEnabled || inTargetSession.value,
      };

      descLiveTimeSetting.value = watchCore.channel.getDescLiveTimeSetting();

      watchDurationSetting.value = watchCore.channel.getWatchDurationSetting();
    }

    return {
      cnChannelBasicInfo,
      enChannelBasicInfo,
      channelInfo,

      channelTitle,
      channelPublisher,
      channelPublisherPic,
      channelDescription,
      channelDescriptionIsEmpty,

      pvShowEnabled,
      pageViewCount,
      pageViewCountLocation,

      liveStartTime,
      isLiveStartCountDownEnd,
      liveStartTimeText,
      liveShowTime,
      liveShowTimeText,
      showLiveCountDown,
      isTargetSessionStarted,

      learningStatsEnabled,
      viewerWatchDuration,
      learningStatsDialogEnabled,

      anchorPopupVisible,

      syncChannelInfo,
    };
  },
);
