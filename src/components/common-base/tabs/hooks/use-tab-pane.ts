/**
 * @file 标签页 TabPane hook
 */

import { PropUtils, useProps, VueProps } from '@polyv/vue-components';
import { computed, onBeforeMount, ref, unref, watch } from 'vue';
import { TabNameType, TabPaneDataItem, TabPaneInstance } from './types';
import { useTabsInject } from './use-tabs';

export const tabPaneProps = () => ({
  /** 面板标签名 */
  label: PropUtils.string.def(''),
  /** 面板附加标签名 */
  subLabel: PropUtils.string.def(''),
  /** 面板名称 */
  name: PropUtils.oneOfType<TabNameType>([String, Number]).isRequired,
  /** 是否懒加载，默认：false */
  lazyLoad: PropUtils.bool.def(false),
  /** 切换到当前面板时重新渲染，优先级高于 lazyLoad，默认：false */
  switchToRefresh: PropUtils.bool.def(false),
  /** 显示红点 */
  showReminder: PropUtils.bool.def(false),
  /** 红点显示改为 "新消息" */
  showNewMessage: PropUtils.bool.def(false),
  /** 需要 hack 注入微信按钮 */
  hackWeixinBtn: PropUtils.bool.def(false),
});

/**
 * 判断 vue 实例是否为 <tab-pane>
 * @param instance 实例
 */
export const isTabPaneInstance = (instance: unknown): instance is TabPaneInstance => {
  const _instance = instance as Partial<TabPaneInstance> | undefined;
  return typeof _instance?.getTabPaneData === 'function';
};

export const useTabPane = (options: { props: VueProps<typeof tabPaneProps> }) => {
  const { props } = options;
  const {
    label,
    subLabel,
    name,
    lazyLoad,
    switchToRefresh,
    showReminder,
    showNewMessage,
    hackWeixinBtn,
  } = useProps(props);
  const { currentTabName, currentTabIndex, prevTabIndex } = useTabsInject();

  /** 当前面板是否显示 */
  const paneVisible = computed(() => unref(currentTabName) === unref(name));

  /** 面板进出动画 */
  const transitionName = computed(() => {
    const prevIndexVal = prevTabIndex.value;
    const currentIndexVal = currentTabIndex.value;
    let name = '';

    if (prevIndexVal !== -1 && currentIndexVal !== -1) {
      name = currentIndexVal > prevIndexVal ? 'g-transition-menu-right' : 'g-transition-menu-left';
    }

    return name;
  });

  /** 获取当前标签页面板的数据 */
  function getTabPaneData(): TabPaneDataItem {
    return {
      label: unref(label),
      subLabel: unref(subLabel),
      name: unref(name),
      showReminder: unref(showReminder),
      showNewMessage: unref(showNewMessage),
      hackWeixinBtn: unref(hackWeixinBtn),
    };
  }

  /** 是否渲染 slot */
  const renderSlot = ref(false);

  /** 检查渲染状态 */
  function checkRenderStatus() {
    if (unref(switchToRefresh)) {
      renderSlot.value = unref(currentTabName) === unref(name);
      return;
    }

    if (!unref(lazyLoad) || unref(currentTabName) === unref(name)) {
      renderSlot.value = true;
    }
  }

  onBeforeMount(() => {
    checkRenderStatus();
  });

  watch(
    () => unref(currentTabName),
    () => checkRenderStatus(),
  );

  const tabPaneInstance: TabPaneInstance = {
    getTabPaneData,
  };

  return {
    label,
    name,
    paneVisible,
    transitionName,
    getTabPaneData,
    renderSlot,
    tabPaneInstance,
  };
};
