import { ref, computed, unref } from 'vue';

export interface UsePageDataOptions<RefItem = unknown> {
  /** 当前页，默认：1 */
  pageNumber?: number;
  /** 每页数量，默认：10 */
  pageSize?: number;
  /** 响应式列表对象 */
  listRef: ResponsiveRef<RefItem[]>;
}

/**
 * 将一个总列表进行响应式分页
 */
export const usePageList = <RefItem = unknown>(options: UsePageDataOptions<RefItem>) => {
  const { listRef } = options;

  /** 当前页 */
  const pageNumber = ref(options.pageNumber ?? 1);

  /** 每页大小 */
  const pageSize = ref(options.pageSize ?? 10);

  /** 总页数 */
  const totalPages = computed(() => {
    return Math.ceil(unref(listRef).length / unref(pageSize));
  });

  /** 总条目数 */
  const totalItems = computed(() => {
    return unref(listRef).length;
  });

  /** 当前页的列表 */
  const currentPageList = computed<RefItem[]>(() => {
    const pageNumberVal = unref(pageNumber);
    const pageSizeVal = unref(pageSize);
    return unref(listRef).slice((pageNumberVal - 1) * pageSizeVal, pageNumberVal * pageSizeVal);
  });

  /** 下一页是否禁用 */
  const nextIsDisabled = computed(() => {
    return unref(pageNumber) >= unref(totalPages);
  });

  /** 上一页是否禁用 */
  const prevIsDisabled = computed(() => {
    return unref(pageNumber) <= 1;
  });

  /** 切到指定页数 */
  function toPage(pageNum: number): void {
    if (pageNum <= unref(totalPages)) {
      pageNumber.value = pageNum;
    }
  }

  /** 切到下一页 */
  function toNextPage() {
    if (unref(nextIsDisabled)) {
      return;
    }
    pageNumber.value += 1;
  }

  /** 切到上一页 */
  function toPrevPage() {
    if (unref(prevIsDisabled)) {
      return;
    }

    pageNumber.value -= 1;
  }

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
