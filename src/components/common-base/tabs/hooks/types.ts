import { Ref } from 'vue';

export type TabNameType = string | number;

export interface TabPaneDataItem {
  /** tab 的标签 */
  label: string;
  /** tab 的名称 */
  name: TabNameType;
  /** tab 的附加标签 */
  subLabel: string;
  /** 是否显示红点 */
  showReminder: boolean;
  /** 红点显示改为 "新消息" */
  showNewMessage: boolean;
  /** 需要 hack 注入微信按钮 */
  hackWeixinBtn: boolean;
}

export interface TabsInstance {
  currentTabName: Ref<TabNameType>;
  /** 设置当前激活的面板 */
  setCurrentTab(name: TabNameType): void;
  /** 设置默认激活的面板 */
  setDefaultTabName(name: TabNameType): void;
  /** 清除默认激活的面板 */
  clearDefaultTabName(): void;
}

export interface TabsInjectContext {
  /** 上一次的 tab 激活 name */
  prevTabName: Ref<TabNameType>;
  /** 当前激活的 tab name */
  currentTabName: Ref<TabNameType>;
  /** 上一次的 tab 激活 index */
  prevTabIndex: Ref<number>;
  /** 当前激活的 tab index */
  currentTabIndex: Ref<number>;
  /** tab 面板数据列表 */
  tabPaneData: Ref<TabPaneDataItem[]>;
  /** 设置当前激活面板 */
  setCurrentTab: (name: TabNameType) => void;
  /** 触发当前激活面板点击事件 */
  toEmitCurrentTabClick: () => void;
  /** 切到下一个 tab */
  toNextTab: () => void;
  /** 切到上一个 tab */
  toPrevTab: () => void;
}

/**
 * tab 面板对象
 */
export interface TabPaneInstance {
  /** 获取面板数据 */
  getTabPaneData: () => TabPaneDataItem;
}
