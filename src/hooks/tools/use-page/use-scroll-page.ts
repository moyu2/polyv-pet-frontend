import { PageContent } from '@polyv/live-watch-sdk';
import { onMounted, ref, type Ref } from 'vue';

export type PaginationRequest<I = unknown> = (params: {
  pageNumber: number;
  pageSize: number;
}) => Promise<PageContent<I>>;

export interface ScrollPaginationHook<I = unknown> {
  scrollRef: Ref<HTMLDivElement | undefined>;
  pageNumber: Ref<number>;
  pageSize: Ref<number>;
  contents: Ref<I[]>;
  refresh: () => void;
  onScroll: (event: Event) => void;
}

/**
 * 滚动分页器 hook
 * @param request 分页请求
 */
export function useScrollPagination<I = unknown>(
  request: PaginationRequest<I>,
): ScrollPaginationHook<I> {
  const pageNumber = ref(1);

  const pageSize = ref(10);

  const contents = ref<unknown[]>([]);

  const isNoMore = ref(false);

  const isLoading = ref(false);

  /**
   * 获取数据
   */
  async function getData() {
    isLoading.value = true;
    try {
      const data = await request({
        pageNumber: pageNumber.value,
        pageSize: pageSize.value,
      });

      if (data.pageNumber === 1) {
        contents.value = data.contents;
      } else {
        contents.value.push(...data.contents);
      }

      isNoMore.value = data.contents.length < pageSize.value;
      isLoading.value = false;
    } catch (e) {
      isLoading.value = false;
    }
  }

  function loadNext() {
    if (isNoMore.value || isLoading.value) {
      return;
    }
    pageNumber.value += 1;
    getData();
  }

  /**
   * 刷新列表
   */
  function refresh() {
    pageNumber.value = 1;
    getData();
  }

  onMounted(() => {
    getData();
  });

  const scrollRef = ref<HTMLDivElement>();

  function onScroll(event: Event) {
    const target = event.target as Element;
    if (!target) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = target;

    if (scrollTop + clientHeight >= scrollHeight - clientHeight * 0.2) {
      loadNext();
    }
  }

  return {
    scrollRef,
    pageNumber,
    pageSize,
    contents: contents as Ref<I[]>,
    refresh,
    onScroll,
  };
}
