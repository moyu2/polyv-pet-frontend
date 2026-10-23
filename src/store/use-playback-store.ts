/**
 * @file 回放 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { LiveStatus, PlaybackMode, PlaybackTarget } from '@polyv/live-watch-sdk';
import { useWatchAppStore } from './use-watch-app-store';
import { useChannelStore } from './use-channel-store';
import { useQueryParams } from '@/hooks/core/use-query-params';

export interface PlaybackStoreState {
  /** 当前是否正在播放回放 */
  isPlaybacking: Ref<boolean>;
  /** 回放方式 */
  playbackMode: Ref<PlaybackMode | undefined>;
  /** 当前已加载的回放页数，默认：0 */
  pageNumber: Ref<number>;
  /** 每页数量 */
  pageSize: Ref<number>;
  /** 总页数 */
  totalPages: Ref<number>;
  /** 总数量 */
  totalItems: Ref<number>;
  /** 是否正在加载中 */
  isLoading: Ref<boolean>;
  /** 是否已加载完毕 */
  isNoMore: Ref<boolean>;
  /** 已加载的列表 */
  playbackList: Ref<PlaybackTarget[]>;
  /** 是否开启循环播放 */
  loopPlayEnabled: Ref<boolean>;
  /** 回放列表是否显示开始时间 */
  listLiveStartTimeEnabled: Ref<boolean>;
  /** 当前页的回放列表 */
  currentPagePlaybackList: ComputedRef<PlaybackTarget[]>;
  /** 当前播放的回放对象 */
  currentPlaybackTarget: Ref<PlaybackTarget | undefined>;
  /** 章节是否显示 */
  chapterVisible: ComputedRef<boolean>;
  /** 回放列表是否显示 */
  playbackListVisible: ComputedRef<boolean>;
  /** 是否能够聊天重放 */
  chatReplayEnabled: ComputedRef<boolean>;
  /** 是否能够聊天消息重放 */
  chatMsgReplayEnabled: ComputedRef<boolean>;
  /** 是否能够商品库重放 */
  productReplayEnabled: ComputedRef<boolean>;
  /** 是否能够签到重放 */
  checkInReplayEnabled: ComputedRef<boolean>;
  /** 是否能够答题卡重放 */
  answerCardReplayEnabled: ComputedRef<boolean>;
  /** 是否能够问卷重放 */
  questionnaireReplayEnabled: ComputedRef<boolean>;

  /** AI 回放问答是否显示 */
  aiKnowledgeQuizEnabled: ComputedRef<boolean>;
  /** 搜索关键词 */
  searchKeyword: Ref<string>;
  /** 搜索结果是否为空（非 loading、有搜索词、列表为空） */
  searchEmpty: ComputedRef<boolean>;
}

export interface PlaybackStoreActions {
  /** 同步 Store 数据 */
  syncPlaybackStore: () => void;
  /** 更新当前回放对象 */
  updateCurrentPlaybackTarget(target?: PlaybackTarget): void;
  /** 初始化当前回放对象 */
  initCurrentPlaybackTarget(): Promise<void>;
  /** 初始化回放列表 */
  initPlaybackList(): Promise<void>;
  /** 加载下一批回放 */
  loadNextPlaybackList(): Promise<void>;
  /** 监听分页器切换事件 */
  onPageChange(nextPageNumber: number): Promise<void>;
  /** 获取回放的场次Id */
  getPlaybackSessionId(): string;
  /** 生成用于分享回放的 Vid */
  getPlaybackShareId(): string | undefined;
  /** 重置回放 Store 数据 */
  resetPlaybackStoreData(): void;
  /** 补充回放参数到当前链接 */
  appendPlaybackQueueParams(): void;
  /** 设置搜索关键词 */
  setSearchKeyword(keyword: string): void;
  /** 搜索回放列表 */
  searchPlaybackList(): Promise<void>;
}

export interface PlaybackStore extends PlaybackStoreState, PlaybackStoreActions {}

export const usePlaybackStore = defineStore<'playback', PlaybackStore>('playback', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();

  const { appendQueryParam, paramGetter } = useQueryParams();

  /** 当前是否正在播放回放 */
  const isPlaybacking = ref(false);

  /** 回放方式 */
  const playbackMode = ref<PlaybackMode>();

  /** 当前已加载的回放页数，默认：0 */
  const pageNumber = ref(0);

  /** 每页数量 */
  const pageSize = ref(12);

  /** 总页数 */
  const totalPages = ref(1);

  const totalItems = ref(0);

  /** 是否正在加载中 */
  const isLoading = ref(false);

  /** 是否已加载完毕 */
  const isNoMore = ref(false);

  /** 回放列表是否显示开始时间 */
  const listLiveStartTimeEnabled = ref(false);

  /** 已加载的列表 */
  const playbackList = ref<PlaybackTarget[]>([]);

  /** 已加载的列表映射 */
  const playbackListMap = ref<{ [pageNumber: string]: PlaybackTarget[] }>({ 0: [] });

  /** 当前页的回放列表 */
  const currentPagePlaybackList = computed<PlaybackTarget[]>(() => {
    if (pageNumber.value === 0 || !playbackList.value.length) {
      return [];
    }
    const idx = pageNumber.value <= 0 ? 0 : pageNumber.value;
    return playbackListMap.value[idx];
  });

  /** 当前播放的回放对象 */
  const currentPlaybackTarget = ref<PlaybackTarget>();

  /**
   * 是否支持重放场景
   */
  const __supportReplay = computed(() => {
    if (channelStore.liveStatus === LiveStatus.Live) return false;

    return true;
  });

  /**
   * 是否可以聊天重放
   * @warn 在 v2.0.0 之前的版本 chatMsgReplayEnabled 其实和 chatReplayEnabled 等同
   */
  const chatReplayEnabled = computed(() => {
    if (!__supportReplay.value) return false;
    if (!currentPlaybackTarget.value) return false;

    return currentPlaybackTarget.value.chatReplayEnabled;
  });

  /** 是否可以聊天消息重放 */
  const chatMsgReplayEnabled = computed(() => {
    if (!__supportReplay.value) return false;
    if (!currentPlaybackTarget.value) return false;

    return currentPlaybackTarget.value.chatMsgReplayEnabled;
  });

  /** 是否可以商品库重放 */
  const productReplayEnabled = computed(() => {
    if (!__supportReplay.value) return false;
    if (!currentPlaybackTarget.value) return false;

    return currentPlaybackTarget.value.productReplayEnabled;
  });

  /** 是否可以签到重放 */
  const checkInReplayEnabled = computed(() => {
    if (!__supportReplay.value) return false;
    if (!currentPlaybackTarget.value) return false;

    return currentPlaybackTarget.value.checkInReplayEnabled;
  });

  /** 是否可以答题卡重放 */
  const answerCardReplayEnabled = computed(() => {
    if (!__supportReplay.value) return false;
    if (!currentPlaybackTarget.value) return false;

    return currentPlaybackTarget.value.answerCardReplayEnabled;
  });

  /** 是否可以问卷重放 */
  const questionnaireReplayEnabled = computed(() => {
    if (!__supportReplay.value) return false;
    if (!currentPlaybackTarget.value) return false;

    return currentPlaybackTarget.value.questionnaireReplayEnabled;
  });

  /** AI 回放问答是否显示 */
  const aiKnowledgeQuizEnabled = computed(() => {
    if (!currentPlaybackTarget.value) return false;

    return currentPlaybackTarget.value.aiKnowledgeQuizEnabled;
  });

  /** 搜索关键词 */
  const searchKeyword = ref('');

  /** 搜索结果是否为空（非 loading、有搜索词、列表为空） */
  const searchEmpty = computed<boolean>(() => {
    return !!searchKeyword.value && !isLoading.value && playbackList.value.length === 0;
  });

  /** 是否开启循环播放 */
  const loopPlayEnabled = ref(true);

  const chapterEnabled = ref(false);

  /** 章节是否显示 */
  const chapterVisible = computed<boolean>(() => {
    return isPlaybacking.value && chapterEnabled.value && channelStore.isPptChannel;
  });

  /** 回放列表是否显示 */
  const playbackListVisible = computed<boolean>(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;

    return unref(isPlaybacking) && playbackMode.value === PlaybackMode.List;
  });

  /**
   * 同步 Store 数据
   */
  function syncPlaybackStore() {
    const watchCore = watchAppStore.getWatchCore();

    playbackMode.value = watchCore.playback.getCurrentPlaybackMode();
    chapterEnabled.value = watchCore.playback.getChapterEnabled();
    loopPlayEnabled.value = watchCore.playback.getLoopPlayEnabled();
    listLiveStartTimeEnabled.value = watchCore.playback.getListLiveStartTimeEnabled();
  }

  /**
   * 根据回放列表获取当前回放对象
   */
  async function __getCurrentPlaybackTargetByList(): Promise<PlaybackTarget> {
    let result = playbackList.value[0];

    try {
      const playBackVid = paramGetter().playBackVid();
      if (playBackVid) {
        const sharedPlaybackTarget = playbackList.value.find(
          playbackTarget => playbackTarget.playbackId === playBackVid,
        );

        if (!sharedPlaybackTarget) {
          const watchCore = watchAppStore.getWatchCore();

          result = await watchCore.playback.getPlaybackTargetById({
            playbackId: playBackVid,
          });
        } else {
          result = sharedPlaybackTarget;
        }
      }
    } catch (error) {
      console.error('__getCurrentPlaybackTargetByList error', error);
    }

    return result;
  }

  /**
   * 初始化当前回放对象
   * @warn 副作用：如果为列表回放，会初始化一次回放列表数据
   * */
  async function initCurrentPlaybackTarget() {
    const watchCore = watchAppStore.getWatchCore();
    const liveStatus = watchCore.channel.getLiveStatus();

    if (liveStatus !== LiveStatus.Playback) {
      currentPlaybackTarget.value = undefined;
      return;
    }

    // 列表回放时，则先获取一次回放列表并设置回放对象
    if (playbackMode.value === PlaybackMode.List) {
      await initPlaybackList();
      const playbackTarget = await __getCurrentPlaybackTargetByList();
      updateCurrentPlaybackTarget(playbackTarget);
      return;
    }

    // 单个回放时使用的回放数据
    if (playbackMode.value === PlaybackMode.Single) {
      const watchCore = watchAppStore.getWatchCore();
      const playbackTarget = watchCore.playback.getSinglePlaybackTarget();
      updateCurrentPlaybackTarget(playbackTarget);
    }
  }

  /** 更新当前的回放对象 */
  function updateCurrentPlaybackTarget(target?: PlaybackTarget) {
    currentPlaybackTarget.value = target;

    const watchCore = watchAppStore.getWatchCore();
    watchCore.playback.setCurrentPlaybackTarget(target);
  }

  /** 补充回放参数到当前链接 */
  function appendPlaybackQueueParams() {
    const params: Parameters<typeof appendQueryParam>[0] = {};

    const playbackShareId = getPlaybackShareId();
    if (playbackShareId) {
      params.playBackVid = playbackShareId;
    }

    appendQueryParam(params);
  }

  /** 初始化回放列表 */
  async function initPlaybackList() {
    pageNumber.value = 0;
    isLoading.value = false;
    isNoMore.value = false;
    playbackList.value = [];
    await loadNextPlaybackList();
  }

  /** 加载下一批回放 */
  async function loadNextPlaybackList() {
    if (isNoMore.value || isLoading.value) {
      return;
    }

    await loadPlaybackListByPageNumber(pageNumber.value + 1);
  }

  /** 指定页码加载回放列表 */
  async function loadPlaybackListByPageNumber(pageNo: number) {
    if (pageNo < 0 || playbackListMap.value[pageNo]) {
      return;
    }

    isLoading.value = true;
    const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
    try {
      const watchCore = watchAppStore.getWatchCore();
      const [data] = await Promise.all([
        watchCore.playback.getPlaybackList({
          pageNumber: pageNo,
          pageSize: unref(pageSize),
          keyword: unref(searchKeyword) || undefined,
        }),
        sleep(500), // loading 至少展示 500ms
      ]);

      pageNumber.value = data.pageNumber;
      isNoMore.value = data.pageNumber >= data.totalPages;
      totalPages.value = data.totalPages;
      totalItems.value = data.totalItems;

      playbackList.value.push(...data.contents);
      playbackListMap.value[data.pageNumber] = data.contents;
    } catch (err) {
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  /** 监听分页器切换事件 */
  async function onPageChange(nextPageNumber: number) {
    if (
      nextPageNumber < 0 ||
      nextPageNumber === pageNumber.value ||
      nextPageNumber > totalPages.value
    )
      return;

    if (!playbackListMap.value[nextPageNumber]) {
      await loadPlaybackListByPageNumber(nextPageNumber);
    } else {
      pageNumber.value = nextPageNumber;
    }
  }

  function getPlaybackSessionId(): string {
    return currentPlaybackTarget.value?.playbackOptions.sessionId || '';
  }

  /**
   * 获取用于分享回放的 Vid
   * */
  function getPlaybackShareId() {
    if (watchAppStore.isPlaybackWatchUrl || !currentPlaybackTarget.value) return;

    return currentPlaybackTarget.value.playbackId;
  }

  /**
   * 重置回放 Store 数据
   */
  function resetPlaybackStoreData() {
    isPlaybacking.value = false;
    playbackMode.value = undefined;

    playbackListMap.value = { 0: [] };
    playbackList.value = [];
    searchKeyword.value = '';

    currentPlaybackTarget.value = undefined;
  }

  /** 设置搜索关键词 */
  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword;
  }

  /** 搜索回放列表 */
  async function searchPlaybackList() {
    // 如果有关键词，需要清空当前列表并重新加载
    pageNumber.value = 0;
    isLoading.value = false;
    isNoMore.value = false;
    playbackList.value = [];
    playbackListMap.value = { 0: [] };
    await loadNextPlaybackList();
  }

  return {
    isPlaybacking,
    playbackMode,

    pageNumber,
    pageSize,
    totalPages,
    totalItems,
    isLoading,
    isNoMore,

    playbackList,
    currentPagePlaybackList,
    currentPlaybackTarget,

    chapterVisible,
    playbackListVisible,
    chatReplayEnabled,
    chatMsgReplayEnabled,
    productReplayEnabled,
    checkInReplayEnabled,
    answerCardReplayEnabled,
    questionnaireReplayEnabled,

    aiKnowledgeQuizEnabled,

    loopPlayEnabled,
    listLiveStartTimeEnabled,

    syncPlaybackStore,
    updateCurrentPlaybackTarget,
    initCurrentPlaybackTarget,
    initPlaybackList,
    loadNextPlaybackList,
    onPageChange,

    getPlaybackSessionId,
    getPlaybackShareId,
    resetPlaybackStoreData,

    appendPlaybackQueueParams,

    searchKeyword,
    setSearchKeyword,
    searchPlaybackList,

    searchEmpty,
  };
});
