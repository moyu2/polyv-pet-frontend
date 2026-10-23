import { ref, computed } from 'vue';

import {
  SelectOptionItem,
  SelectValueType,
} from '@/components/common-base/select/types/select-types';
import { useGlobalInject } from '@/app/use-global-inject';
import { ChannelSessionStatus } from '@polyv/live-watch-sdk';
import type {
  ChannelSessionDataItem,
  ChannelSessionChapter,
  PageContent,
} from '@polyv/live-watch-sdk';
import { translate } from '@/assets/lang';
import type { SessionBookingChangeData } from './session-list/type';
// import { getMockChannelSessionList } from './_mock/session-list-mock';

// 调试用：改为 true 使用 mock 数据，无需后端接口
// const USE_MOCK = false;

interface CategoryItem extends SelectOptionItem {
  status?: ChannelSessionStatus;
  order?:
    | 'planStartTimeDesc'
    | 'planStartTimeAsc'
    | 'charterPlanStartTimeDesc'
    | 'charterPlanStartTimeAsc';
  visible: boolean;
}

interface ChapterOptionItem extends SelectOptionItem {
  chapterId?: number;
}

export const useSessionSelect = (opts: { getVirtualPageSize: () => number }) => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const loading = ref(false);

  const categoryList = ref<CategoryItem[]>([]);

  const activeCategoryItem = ref<CategoryItem>();

  const chapterList = ref<ChannelSessionChapter[]>([]);

  const chapterOptionList = computed<ChapterOptionItem[]>(() => {
    if (!chapterList.value.length) return [];
    return [
      { label: translate('channel.session.allChapter'), value: 'all' },
      ...chapterList.value.map(item => ({
        label: item.name,
        value: item.id,
        chapterId: item.id,
      })),
    ];
  });

  const activeChapterItem = ref<ChapterOptionItem>();

  const sessionDataList = ref<ChannelSessionDataItem[]>([]);

  const totalSessionDataList = ref<ChannelSessionDataItem[]>([]);

  let dataSource: Omit<PageContent<ChannelSessionDataItem>, 'contents'> = {
    pageNumber: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
  };

  const hasChapter = computed(() => {
    return chapterList.value.length > 0;
  });

  /**
   * 获取列表数据
   */
  async function fetchChannelSessionDataList() {
    // 章节场景下，按时间升序处理
    const order = hasChapter.value ? 'charterPlanStartTimeAsc' : activeCategoryItem.value?.order;

    const requestParams = {
      pageNumber: dataSource.pageNumber,
      pageSize: dataSource.pageSize,
      status: activeCategoryItem.value?.status,
      order,
      chapterId: activeChapterItem.value?.chapterId,
    };

    // const result = USE_MOCK
    //   ? await getMockChannelSessionList(requestParams)
    //   : await watchCore.channel.getChannelSessionList(requestParams);
    const result = await watchCore.channel.getChannelSessionList(requestParams);

    const { contents: data, ..._dataSource } = result;
    dataSource = _dataSource;

    return data.filter(item => item.name !== null);
  }

  async function setChannelSessionDataList() {
    totalSessionDataList.value = await fetchChannelSessionDataList();

    const result = sessionDataList.value.concat(
      totalSessionDataList.value.splice(0, opts.getVirtualPageSize()),
    );

    sessionDataList.value = result;
  }

  async function onCategoryIdChange(categoryId: SelectValueType | SelectValueType[]) {
    try {
      loading.value = true;
      const categoryItem = categoryList.value.find(i => i.value === categoryId);
      if (activeCategoryItem.value?.value === categoryItem?.value) return;

      activeCategoryItem.value = categoryItem;

      dataSource = {
        pageNumber: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
      };
      totalSessionDataList.value = [];
      sessionDataList.value = [];
      await setChannelSessionDataList();
    } catch (error) {
      console.error('onCategoryIdChange', error);
    } finally {
      loading.value = false;
    }
  }

  async function onChapterIdChange(chapterValue: SelectValueType | SelectValueType[]) {
    try {
      loading.value = true;
      const chapterItem = chapterOptionList.value.find(i => i.value === chapterValue);
      if (activeChapterItem.value?.value === chapterItem?.value) return;

      activeChapterItem.value = chapterItem;

      dataSource = {
        pageNumber: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
      };
      totalSessionDataList.value = [];
      sessionDataList.value = [];
      await setChannelSessionDataList();
    } catch (error) {
      console.error('onChapterIdChange', error);
    } finally {
      loading.value = false;
    }
  }

  function loadMoreChannelSessionDataList() {
    // 总数据为空时，翻页请求接口
    if (totalSessionDataList.value.length === 0 && dataSource.pageNumber < dataSource.totalPages) {
      dataSource.pageNumber = dataSource.pageNumber + 1;
      setChannelSessionDataList();
      return;
    }

    // 总数据不为空时，前端自行分页
    sessionDataList.value = sessionDataList.value.concat(
      totalSessionDataList.value.splice(0, opts.getVirtualPageSize()),
    );
  }

  function patchSessionBookingState(data: SessionBookingChangeData) {
    return (item: ChannelSessionDataItem) => {
      if (item.sessionId !== data.sessionId) return item;

      return {
        ...item,
        ...data,
      };
    };
  }

  function onSessionBookingChange(data: SessionBookingChangeData) {
    sessionDataList.value = sessionDataList.value.map(patchSessionBookingState(data));
    totalSessionDataList.value = totalSessionDataList.value.map(patchSessionBookingState(data));
  }

  function setCategoryList() {
    const enabledPlayback = watchCore.channel.getEnablePlayback();
    const data: CategoryItem[] = [
      {
        label: translate('base.all'),
        value: 'all',
        visible: true,
      },
      {
        label: translate('liveStatus.live'),
        value: 'live',
        status: ChannelSessionStatus.Live,
        order: 'planStartTimeDesc',
        visible: true,
      },
      {
        label: translate('liveStatus.unStart'),
        value: 'notStart',
        status: ChannelSessionStatus.UnStart,
        order: 'planStartTimeAsc',
        visible: true,
      },
      {
        label: translate('liveStatus.playback'),
        value: 'playback',
        status: ChannelSessionStatus.Playback,
        order: 'planStartTimeDesc',
        visible: enabledPlayback,
      },
      {
        label: translate('liveStatus.end'),
        value: 'end',
        status: ChannelSessionStatus.End,
        order: 'planStartTimeDesc',
        visible: !enabledPlayback,
      },
    ];
    categoryList.value = data.filter(i => i.visible);
    activeCategoryItem.value = data[0];
  }

  async function fetchChapterList() {
    try {
      chapterList.value = await watchCore.channel.getChannelSessionChapterList();
      if (chapterOptionList.value.length) {
        activeChapterItem.value = chapterOptionList.value[0];
      }
    } catch (error) {
      console.error('fetchChapterList', error);
      chapterList.value = [];
    }
  }

  async function initData() {
    try {
      loading.value = true;
      setCategoryList();
      await fetchChapterList();
      await setChannelSessionDataList();
    } catch (error) {
      console.error('initData', error);
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,

    categoryList,
    activeCategoryItem,
    onCategoryIdChange,

    hasChapter,
    chapterOptionList,
    activeChapterItem,
    onChapterIdChange,

    totalSessionDataList,
    sessionDataList,

    initData,
    loadMoreChannelSessionDataList,
    onSessionBookingChange,
  };
};
