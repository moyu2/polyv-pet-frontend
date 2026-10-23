import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { usePageList } from '@/hooks/tools/use-page';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { LiveStatus, MultiMeetingItem } from '@polyv/live-watch-sdk';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, unref, watch } from 'vue';

/**
 * 分会场频道状态轮询 hook
 */
export const useMultiMeetingStatusPolling = () => {
  const multiMeetingStore = useMultiMeetingStore();

  let pollingTimer: number | undefined;
  /** 开始直播状态轮询 */
  function startLiveStatusPolling(): void {
    closeLiveStatusPolling();

    pollingTimer = window.setInterval(() => {
      multiMeetingStore.refreshMultiMeetingLiveStatus();
    }, 60 * 1000);

    multiMeetingStore.refreshMultiMeetingLiveStatus();
  }

  /** 关闭直播状态轮询 */
  function closeLiveStatusPolling(): void {
    if (pollingTimer) {
      window.clearInterval(pollingTimer);
      pollingTimer = undefined;
    }
  }

  watch(
    () => multiMeetingStore.multiMeetingTotal,
    () => {
      if (multiMeetingStore.multiMeetingTotal) {
        startLiveStatusPolling();
      } else {
        closeLiveStatusPolling();
      }
    },
    {
      immediate: true,
    },
  );

  onBeforeUnmount(() => {
    closeLiveStatusPolling();
  });
};

/**
 * 分会场分页逻辑
 */
export const useMultiMeetingPage = (
  options: {
    /** 每页数量，默认：5 */
    pageSize?: number;
  } = {},
) => {
  const multiMeetingStore = useMultiMeetingStore();

  const { multiMeetingList, currentMultiMeetingSeat } = storeToRefs(multiMeetingStore);

  const {
    pageNumber,
    pageSize,
    totalPages,
    totalItems,
    currentPageList,
    nextIsDisabled,
    prevIsDisabled,
    toPage,
    toNextPage,
    toPrevPage,
  } = usePageList({
    listRef: multiMeetingList,
    pageSize: options.pageSize ?? 5,
  });

  // 自动切到当前会场所在页数
  watch(
    () => unref(currentMultiMeetingSeat),
    () => {
      const currentMeetingPage = Math.ceil(unref(currentMultiMeetingSeat) / unref(pageSize));
      toPage(currentMeetingPage);
    },
  );

  return {
    pageNumber,
    pageSize,
    totalPages,
    totalItems,
    currentPageList,
    nextIsDisabled,
    prevIsDisabled,
    toPage,
    toNextPage,
    toPrevPage,
  };
};

/**
 * 分会场 hook
 */
export const useMultiMeeting = (autoInit = true) => {
  const multiMeetingStore = useMultiMeetingStore();

  useMultiMeetingStatusPolling();

  const { getEmitter, getWatchCore } = useGlobalInject();

  /** 初始化分会场，获取分会场列表 */
  async function initMultiMeeting() {
    const watchCore = getWatchCore();
    const result = await watchCore.multiMeeting.getMultiMeetingList({
      pageNumber: 1,
      // 一次性获取全部，分会场+总会场
      pageSize: multiMeetingStore.multiMeetingMaxCount + 1,
    });

    multiMeetingStore.$patch({
      multiMeetingList: result.contents,
    });

    getEmitter().emit(appEvents.global.MobileLayoutComputedSize);
  }

  /** 是否显示直播图标 */
  function isShowLiveIcon(item: MultiMeetingItem) {
    return (
      item.isCurrentChannel && [LiveStatus.Live, LiveStatus.Playback].includes(item.liveStatus)
    );
  }

  if (autoInit) {
    onMounted(() => {
      initMultiMeeting();
    });
  }

  return {
    initMultiMeeting,
    isShowLiveIcon,
  };
};
