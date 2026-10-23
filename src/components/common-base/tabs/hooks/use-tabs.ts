/**
 * @file 标签页 Tabs hook
 */

import { useVue } from '@/hooks/core/use-vue';
import { PropUtils, useProps, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import {
  computed,
  inject,
  InjectionKey,
  nextTick,
  onMounted,
  onUpdated,
  provide,
  ref,
  unref,
  watch,
} from 'vue';
import {
  TabNameType,
  TabPaneDataItem,
  TabPaneInstance,
  TabsInjectContext,
  TabsInstance,
} from './types';
import { isTabPaneInstance } from './use-tab-pane';
import { useGlobalInject } from '@/app/use-global-inject';
import { BgConfig } from '@/themes/utils/theme-config';

export const generateHackWeixinBtnId = (menuName: string | number, needSelectorKey?: boolean) => {
  const id = `plv-watch-menu-hack-weixin-btn-${menuName}`;
  return needSelectorKey ? `#${id}` : id;
};

export interface TabHeaderConfig {
  bgConfig?: BgConfig;
  item?: {
    fontColor: string;
  };
  activeItem?: {
    bgConfig: BgConfig;
    borderColor: string;
    icon: string;
    fontColor: string;
    underline: boolean;
  };
}

export const tabsHeaderProps = () => ({
  headerConfig: PropUtils.object<TabHeaderConfig>().def({}),
});

export const tabsProps = () => ({
  ...tabsHeaderProps(),
  /** 激活的面板 name */
  value: PropUtils.oneOfType<TabNameType>([String, Number]).def(''),
});

export const tabsEmits = () => ({
  input: emitFunc<TabNameType>(),
  /** 只有点击 Tab 行为才会触发该事件 */
  'tab-click': emitFunc<TabNameType>(),
  'is-empty-callback': emitFunc<boolean>(),
});

export const TABS_PROVIDE_KEY: InjectionKey<TabsInjectContext> = Symbol('tabsProvideKey');

export const useTabsProvide = (context: TabsInjectContext) => {
  provide(TABS_PROVIDE_KEY, context);
};

export const useTabsInject = (): TabsInjectContext => {
  return inject(TABS_PROVIDE_KEY) as TabsInjectContext;
};

/** 标签页 tabs hook */
export const useTabs = (options: {
  props: VueProps<typeof tabsProps>;
  emit: VueEmit<typeof tabsEmits>;
  switchEvent?: string;
}) => {
  const { getEmitter } = useGlobalInject();
  const { props, emit } = options;
  const { value } = useProps(props);
  const { getSlot } = useVue();

  /** 默认激活的面板 name */
  const defaultTabName = ref<TabNameType>('');
  /** 上一次激活的面板 name */
  const prevTabName = ref<TabNameType>('');
  /** 当前激活的面板 name */
  const currentTabName = ref<TabNameType>('');
  /** 上一刻激活的面板索引 */
  const prevTabIndex = ref(-1);
  /** 当前激活的面板索引 */
  const currentTabIndex = ref(-1);
  /** 面板数据列表 */
  const tabPaneData = ref<TabPaneDataItem[]>([]);
  /** 是否为空菜单 */
  const isEmptyMenu = computed(() => {
    return unref(tabPaneData).length === 0;
  });

  watch(
    () => unref(isEmptyMenu),
    () => {
      emit('is-empty-callback', unref(isEmptyMenu));
    },
    {
      immediate: true,
    },
  );

  function clearDefaultTabName() {
    defaultTabName.value = '';
  }

  function setDefaultTabName(name: TabNameType) {
    defaultTabName.value = name;
    const firstTabName = tabPaneData.value.length > 0 ? tabPaneData.value[0].name : '';
    setCurrentTab(name || firstTabName);
  }

  /** 设置当前激活的面板 */
  function setCurrentTab(name: TabNameType) {
    if (tabPaneData.value.length === 0) {
      return;
    }

    const newIndex = unref(tabPaneData).findIndex(paneData => paneData.name === name);

    prevTabName.value = unref(currentTabName);
    prevTabIndex.value = unref(currentTabIndex);

    currentTabName.value = name;
    currentTabIndex.value = newIndex;

    if (prevTabName.value === currentTabName.value) {
      return;
    }

    emit('input', name);

    if (options.switchEvent) {
      getEmitter().emit(options.switchEvent, name);
    }
  }

  function toEmitCurrentTabClick() {
    if (tabPaneData.value.length === 0) {
      return;
    }

    emit('tab-click', currentTabName.value);
  }

  /** 切到下一个 tab */
  function toNextTab() {
    // 已是最后一个
    if (currentTabIndex.value >= tabPaneData.value.length - 1) {
      return;
    }
    const nextTabData = tabPaneData.value[currentTabIndex.value + 1];
    nextTabData && setCurrentTab(nextTabData.name);
  }

  /** 切到上一个 tab */
  function toPrevTab() {
    // 已是第一个
    if (currentTabIndex.value <= 0) {
      return;
    }
    const prevTabData = tabPaneData.value[currentTabIndex.value - 1];
    prevTabData && setCurrentTab(prevTabData.name);
  }

  watch(
    () => unref(value),
    () => setCurrentTab(unref(value)),
  );

  /** 获取面板实例对象 */
  function getTabPaneInstances() {
    const defaultSlot = getSlot();

    const instances: TabPaneInstance[] = [];

    defaultSlot.forEach(vNode => {
      const instance = vNode.componentInstance;
      if (isTabPaneInstance(instance)) {
        instances.push(instance);
      }
    });

    return instances;
  }

  /** 获取标签面板数据 */
  function getTabPaneData() {
    const panes: TabPaneDataItem[] = [];
    const instances = getTabPaneInstances();

    instances.forEach(instance => {
      const panelData = instance.getTabPaneData();
      panes.push(panelData);
    });

    return panes;
  }

  /**
   * 是否需要更新 tab 面板数据
   */
  function __shouldUpdateTabPaneData() {
    const panes = getTabPaneData();
    const paneDataVal = unref(tabPaneData);

    // 是否需要更新 tab 面板数据
    let shouldUpdateTabPaneData = false;

    if (panes.length !== paneDataVal.length) {
      shouldUpdateTabPaneData = true;
    } else {
      for (let index = 0; index < panes.length; index++) {
        const paneData = panes[index];
        const oldItem = paneDataVal[index];
        for (const key in paneData) {
          const field = key as keyof TabPaneDataItem;
          if (paneData[field] !== oldItem[field]) {
            shouldUpdateTabPaneData = true;
          }
        }
      }
    }

    return shouldUpdateTabPaneData;
  }

  /** 更新标签面板数据 */
  async function updateTabPaneData() {
    await nextTick();
    const panes = getTabPaneData();
    const paneDataVal = unref(tabPaneData);

    // 是否需要重置到第一个 tab
    let shouldSetFirstTab = false;

    if (__shouldUpdateTabPaneData()) {
      if (
        panes.length !== paneDataVal.length ||
        (panes.length === paneDataVal.length &&
          panes.length > 0 &&
          panes[0].label !== paneDataVal[0].label)
      ) {
        shouldSetFirstTab = true;
      }
      tabPaneData.value = panes;
    }

    const currentIndex = panes.findIndex(paneData => paneData.name === unref(currentTabName));
    if (currentIndex === -1 && panes.length) {
      shouldSetFirstTab = true;
    }

    if (shouldSetFirstTab && panes.length) {
      setCurrentTab(defaultTabName.value || panes[0].name);
    }
  }

  onMounted(() => {
    updateTabPaneData();
  });

  onUpdated(() => {
    updateTabPaneData();
  });

  useTabsProvide({
    prevTabName,
    currentTabName,
    prevTabIndex,
    currentTabIndex,
    tabPaneData,
    setCurrentTab,
    toEmitCurrentTabClick,
    toNextTab,
    toPrevTab,
  });

  const tabsInstance: TabsInstance = {
    currentTabName,
    setCurrentTab,
    setDefaultTabName,
    clearDefaultTabName,
  };

  return {
    prevTabName,
    currentTabName,
    prevTabIndex,
    currentTabIndex,
    isEmptyMenu,
    setCurrentTab,
    setDefaultTabName,
    toNextTab,
    toPrevTab,

    tabPaneData,
    getTabPaneData,
    updateTabPaneData,
    tabsInstance,
  };
};
