import {
  computed,
  CSSProperties,
  nextTick,
  onBeforeUnmount,
  onMounted,
  Ref,
  ref,
  unref,
  watch,
} from 'vue';
import { tabsHeaderProps, useTabsInject } from './use-tabs';
import { useLangStore } from '@/store/use-lang-store';
import { TabPaneDataItem } from './types';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';
import { isIOS } from '@/assets/utils/browser';
import { VueProps } from '@polyv/vue-components';
import { generateBgStyle } from '@/themes/utils/theme-config';

export const useTabHeader = (
  props: VueProps<typeof tabsHeaderProps>,
  options: {
    /** 点击后滚动到当前 tab，默认：false */
    scrollCurrent?: boolean;
  } = {},
) => {
  const { scrollCurrent = false } = options;
  const langStore = useLangStore();

  const {
    tabPaneData,
    currentTabName,
    currentTabIndex,
    setCurrentTab,
    toEmitCurrentTabClick,
    toNextTab,
    toPrevTab,
  } = useTabsInject();

  const scrollRef = ref<HTMLDivElement>();
  const itemRef = ref<HTMLDivElement[]>([]);

  /** 处理点击节点 */
  function onClickHeaderItem(paneData: TabPaneDataItem) {
    if (paneData.name === unref(currentTabName)) {
      return;
    }
    setCurrentTab(paneData.name);
    toEmitCurrentTabClick();
    if (scrollCurrent) {
      scrollToCurrent();
    }
  }

  /** 处理点击 next 箭头 */
  async function onClickNext() {
    toNextTab();
    await nextTick();
    if (scrollCurrent) {
      scrollToCurrent();
      toEmitCurrentTabClick();
    }
  }

  /** 处理点击 prev 箭头 */
  async function onClickPrev() {
    toPrevTab();
    await nextTick();
    if (scrollCurrent) {
      scrollToCurrent();
      toEmitCurrentTabClick();
    }
  }

  /** 当前节点的下横线 left 定位 */
  const currentLineLeft = ref<number>();
  const currentLineRef = ref<HTMLDivElement>();

  /** 滚动到当前 tab */
  function scrollToCurrent() {
    const currentItemElem = itemRef.value[currentTabIndex.value];
    const scrollElem = scrollRef.value;
    if (currentItemElem && scrollElem) {
      const maxScroll = scrollElem.scrollWidth - scrollElem.clientWidth;
      if (maxScroll <= 0) {
        scrollElem.scrollTo({ top: 0, left: 0 });
        return;
      }
      const scrollLeft = Math.max(
        0,
        currentItemElem.offsetLeft - (scrollElem.offsetWidth - currentItemElem.offsetWidth) / 2,
      );
      scrollElem.scrollTo({
        top: 0,
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }

  /** 计算下横线 left 定位 */
  async function computeCurrentLineLeft() {
    await nextTick();
    const currentLineElem = unref(currentLineRef);
    const itemElements = unref(itemRef);
    const currentIndex = unref(currentTabIndex);

    if (!Array.isArray(itemElements) || !currentLineElem || currentIndex === -1) {
      return;
    }

    const currentItemElem = itemElements[currentIndex];
    if (!currentItemElem) {
      return;
    }

    const left =
      currentItemElem.offsetLeft + (currentItemElem.offsetWidth - currentLineElem.offsetWidth) / 2;

    if (left !== unref(currentLineLeft)) {
      currentLineLeft.value = left;
    }
  }

  useWindowResizeListener(
    () => {
      setTimeout(() => {
        computeCurrentLineLeft();
      }, 5);
    },
    {
      autoListen: true,
    },
  );

  watch(
    () => [unref(currentTabIndex), unref(tabPaneData), langStore.currentLang],
    async () => {
      computeCurrentLineLeft();
      await nextTick();
      scrollToCurrent();
    },
    {
      immediate: true,
    },
  );

  if (isIOS) {
    onMounted(() => {
      setTimeout(() => {
        computeCurrentLineLeft();
      }, 200);
    });
  }

  const showUnderLine = computed(() => {
    const styleConfig = props.headerConfig.activeItem;
    if (styleConfig && !styleConfig.underline) {
      return false;
    }

    return tabPaneData.value.length > 1;
  });

  function getTabItemStyle(isActive: boolean): CSSProperties {
    if (!props.headerConfig.activeItem || !props.headerConfig.item) return {};

    if (!isActive) {
      return {
        color: props.headerConfig.item.fontColor,
      };
    }

    const styleConfig = props.headerConfig.activeItem;
    return {
      ...generateBgStyle(styleConfig.bgConfig),
      borderColor: styleConfig.borderColor,
      color: styleConfig.fontColor,
    };
  }

  return {
    scrollRef,
    itemRef,
    tabPaneData,
    currentTabName,
    scrollToCurrent,
    onClickHeaderItem,
    onClickNext,
    onClickPrev,
    currentLineLeft,
    currentLineRef,

    showUnderLine,
    getTabItemStyle,
  };
};

/**
 * Tab 左右箭头 hook
 */
export const useTabHeaderArrow = (options: {
  scrollRef: Ref<HTMLDivElement | undefined>;
  tabPaneData: Ref<TabPaneDataItem[]>;
  buffer?: number;
}) => {
  const { scrollRef, tabPaneData, buffer = 0 } = options;

  const leftArrowVisible = ref(false);
  const rightArrowVisible = ref(false);

  /** 计算箭头显示 */
  function computedArrowVisible() {
    const scrollElem = unref(scrollRef);

    if (!scrollElem) return;

    const scrollLeft = Math.ceil(scrollElem.scrollLeft);
    if (scrollLeft > buffer) {
      leftArrowVisible.value = true;
    } else {
      leftArrowVisible.value = false;
    }

    if (scrollLeft < Math.floor(scrollElem.scrollWidth - scrollElem.clientWidth - buffer)) {
      rightArrowVisible.value = true;
    } else {
      rightArrowVisible.value = false;
    }
  }

  watch(
    () => unref(tabPaneData),
    async () => {
      await nextTick();
      computedArrowVisible();
    },
  );

  onMounted(() => {
    computedArrowVisible();
    if (scrollRef.value) {
      scrollRef.value.addEventListener('scroll', computedArrowVisible);
    }
  });

  onBeforeUnmount(() => {
    if (scrollRef.value) {
      scrollRef.value.removeEventListener('scroll', computedArrowVisible);
    }
  });

  return {
    scrollRef,
    leftArrowVisible,
    rightArrowVisible,
    computedArrowVisible,
  };
};
