/**
 * @file 布局 store
 */

import { isMobile } from '@/assets/utils/browser';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { ScreenOrientationMode } from '@/hooks/core/use-screen-orient';
import {
  MainScreenContent,
  MainScreenLayoutMode,
  MobileSplashLayout,
  MobileWatchLayout,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useDocStore } from './use-doc-store';
import { useAdvertStore } from './use-advert-store';
import { usePortraitLayoutStore } from './use-portrait-layout-store';
import { useWatchAppStore } from './use-watch-app-store';

export interface LayoutStoreState {
  // ---------- 公用 ---------- //
  /** 三分屏主屏模式 */
  mainScreenLayoutMode: Ref<MainScreenLayoutMode>;
  /** 主屏的内容 */
  mainScreen: Ref<MainScreenContent>;
  /** 聊天室顶部内容高度 */
  chatTopicHeight: Ref<number>;

  // ---------- PC 端 ---------- //
  /** 副屏是否被收起 */
  subScreenPackUp: Ref<boolean>;
  /** 当前 PC 端是否正在全屏(系统全屏/网页全屏) */
  isFullscreen: Ref<boolean>;
  /** 当前 PC 端是否正在网页全屏 */
  isPcPageFullscreen: Ref<boolean>;
  /** PC 端侧边菜单栏的激活 name */
  pcAsideTabCurrentName: Ref<string>;
  /** PC 端侧边菜单栏是否为空 */
  pcAsideTabIsEmpty: Ref<boolean>;
  /** PC 端侧边区域是否为空 */
  pcAsideSectionIsEmpty: ComputedRef<boolean>;
  /** PC 端底部菜单栏的激活 name */
  pcBottomTabCurrentName: Ref<string>;

  // ---------- 移动端 ---------- //
  /** 观看页移动端布局 */
  mobileWatchLayout: Ref<MobileWatchLayout>;
  /** 是否为竖屏观看页布局 */
  isPortraitWatchLayout: ComputedRef<boolean>;
  /** 屏幕旋转模式 */
  screenOrientationMode: Ref<ScreenOrientationMode>;
  /** 当前屏幕旋转角度是否为纵向 */
  isVerticalScreenOrientation: ComputedRef<boolean>;
  /** 当前屏幕旋转角度是否为横向 */
  isHorizontalScreenOrientation: ComputedRef<boolean>;
  /** 移动端引导页布局 */
  mobileSplashLayout: Ref<MobileSplashLayout>;
  /** 移动端下底部菜单栏的激活 name */
  mobileMenuCurrentName: Ref<string>;
  /** 移动端下底部菜单栏聊天区域已展示 */
  mobileChatTabHasBeenShowed: Ref<boolean>;
  /** 移动端下菜单栏 header 高度 */
  mobileMenuHeaderHeight: Ref<number>;
  /** 移动端布局顶部区域的高度 */
  mobileLayoutTopHeight: Ref<number>;
  /** 移动端布局底部区域的高度 */
  mobileLayoutBottomHeight: Ref<number>;
  /** 移动端布局底部区域到顶部的距离 */
  mobileLayoutBottomTop: Ref<number>;
  /** 移动端横屏观看布局高度 */
  mobileWatchLayoutHeight: Ref<number>;
  /** 移动端下播放器是否正在页面全屏 */
  mobilePlayerIsPageFullscreen: Ref<boolean>;
  /** 移动端下的常规延迟直播播放器是否处于全屏状态 */
  mobileNormalLatencyPlayerIsFullscreen: Ref<boolean>;
  /** 文档是否处于页面全屏 */
  mobileDocIsPageFullscreen: Ref<boolean>;
  /** 当前是页面全屏或者横屏 */
  isPageFullscreenOrHorizontalScreen: ComputedRef<boolean>;
  /** 移动端输入框聚焦中 */
  mobileInputFocusing: Ref<boolean>;
  /** 移动端软件盘抬起高度 */
  mobileKeyboardHeight: Ref<number>;
}

export interface LayoutStoreActions {
  /** 移动端布局退出所有全屏 */
  exitMobileLayoutFullScreen(): void;
  /** 切换文档视频区域 */
  toggleMainScreen(): void;
  /** 同步布局 store */
  syncLayoutStore(): void;
}

export interface LayoutStore extends LayoutStoreState, LayoutStoreActions {}

export const useLayoutStore = defineStore<'layout', LayoutStore>('layout', () => {
  const watchAppStore = useWatchAppStore();
  const docStore = useDocStore();
  const pageAdvertStore = useAdvertStore();
  const portraitLayoutStore = usePortraitLayoutStore();

  const { paramGetter } = useQueryParams();

  // ---------- 公用 ---------- //
  /** 三分屏主屏模式 */
  const mainScreenLayoutMode = ref(MainScreenLayoutMode.Ppt);

  /** 主屏的内容 */
  const mainScreen = ref(MainScreenContent.Player);

  /** 切换文档视频区域 */
  function toggleMainScreen(): void {
    if (mainScreen.value === MainScreenContent.Doc) {
      mainScreen.value = MainScreenContent.Player;
    } else {
      mainScreen.value = MainScreenContent.Doc;
    }
  }

  /** 聊天室顶部内容高度 */
  const chatTopicHeight = ref(0);

  // ---------- PC 端 ---------- //
  /** 副屏是否被收起 */
  const subScreenPackUp = ref(false);

  /** 当前 PC 端是否正在系统全屏 */
  const isFullscreen = ref(false);

  /** 当前 PC 端是否正在网页全屏 */
  const isPcPageFullscreen = ref(false);

  /** PC 端侧边菜单栏的激活 name */
  const pcAsideTabCurrentName = ref('');

  /** PC 端侧边菜单栏是否为空 */
  const pcAsideTabIsEmpty = ref(false);

  /** PC 端侧边区域是否为空 */
  const pcAsideSectionIsEmpty = computed(() => {
    // 有文档
    if (docStore.canRenderDoc) {
      return false;
    }

    // 有页面广告
    if (pageAdvertStore.pageAdvertVisible) {
      return false;
    }

    // 有菜单栏
    if (!unref(pcAsideTabIsEmpty)) {
      return false;
    }

    return true;
  });

  /** PC 端底部菜单栏的激活 name */
  const pcBottomTabCurrentName = ref('');

  // ---------- 移动端 ---------- //
  /** 观看页移动端布局 */
  const mobileWatchLayout = ref(MobileWatchLayout.Normal);

  /** 是否为竖屏观看页布局 */
  const isPortraitWatchLayout = computed<boolean>(() => {
    return unref(mobileWatchLayout) === MobileWatchLayout.Portrait && isMobile;
  });

  /** 屏幕旋转模式 */
  const screenOrientationMode = ref(ScreenOrientationMode.Vertical);

  /** 当前屏幕旋转角度是否为纵向 */
  const isVerticalScreenOrientation = computed(() => {
    return screenOrientationMode.value === ScreenOrientationMode.Vertical;
  });

  /** 当前屏幕旋转角度是否为横向 */
  const isHorizontalScreenOrientation = computed(() => {
    return screenOrientationMode.value === ScreenOrientationMode.Horizontal;
  });

  /** 移动端引导页布局 */
  const mobileSplashLayout = ref(MobileSplashLayout.Normal);

  /** 移动端下底部菜单栏的激活 name */
  const mobileMenuCurrentName = ref('');

  /** 移动端下底部菜单栏聊天区域已展示 */
  const mobileChatTabHasBeenShowed = ref(false);

  /** 移动端下菜单栏 header 高度 */
  const mobileMenuHeaderHeight = ref(40);

  /** 移动端布局顶部区域的高度 */
  const mobileLayoutTopHeight = ref(0);

  /** 移动端布局底部区域的高度 */
  const mobileLayoutBottomHeight = ref(0);

  /**
   * 移动端下是否正在页面全屏
   * @desc 正常延迟的页面全屏 / 无延迟的页面全屏
   *  */
  const mobilePlayerIsPageFullscreen = ref(false);

  /**
   * 移动端下的常规延迟直播播放器是否处于全屏状态
   * @desc 正常延迟的页面全屏 / 正常延迟的系统全屏
   */
  const mobileNormalLatencyPlayerIsFullscreen = ref(false);

  /** 文档是否处于页面全屏 */
  const mobileDocIsPageFullscreen = ref(false);

  /** 移动端布局底部区域到顶部的距离 */
  const mobileLayoutBottomTop = ref(0);

  /** 移动端横屏观看布局高度 */
  const mobileWatchLayoutHeight = ref(0);

  /** 当前是页面全屏或者横屏 */
  const isPageFullscreenOrHorizontalScreen = computed(() => {
    return unref(mobilePlayerIsPageFullscreen) || unref(isHorizontalScreenOrientation);
  });

  const mobileInputFocusing = ref(false);
  const mobileKeyboardHeight = ref(0);

  /** 移动端布局退出所有全屏 */
  function exitMobileLayoutFullScreen() {
    mobilePlayerIsPageFullscreen.value = false;
    mobileNormalLatencyPlayerIsFullscreen.value = false;
    mobileDocIsPageFullscreen.value = false;

    if (mobileWatchLayout.value === MobileWatchLayout.Portrait) {
      portraitLayoutStore.$patch({
        portraitPlayerIsPageFullscreen: false,
      });
    }
  }

  function syncLayoutStore() {
    const watchCore = watchAppStore.getWatchCore();
    const layoutSetting = watchCore.channel.getLayoutSetting();
    mainScreenLayoutMode.value = layoutSetting.mainScreenLayoutMode;
    mobileSplashLayout.value = layoutSetting.mobileSplashLayout;

    const watchLayout = paramGetter().watchLayout();
    mobileWatchLayout.value = watchLayout || layoutSetting.mobileWatchLayout;

    if (mobileWatchLayout.value === MobileWatchLayout.Portrait) {
      const playerSetting = watchCore.player.getPlayerSetting();
      portraitLayoutStore.$patch({
        portraitPlayerFullscreenEnabled: playerSetting.portraitPlayerFullscreenEnabled,
      });
    }
  }

  return {
    mainScreenLayoutMode,
    mainScreen,
    toggleMainScreen,
    chatTopicHeight,

    isFullscreen,
    isPcPageFullscreen,
    pcAsideTabCurrentName,
    pcAsideTabIsEmpty,
    pcAsideSectionIsEmpty,
    pcBottomTabCurrentName,

    mobileWatchLayout,
    isPortraitWatchLayout,
    screenOrientationMode,
    isVerticalScreenOrientation,
    isHorizontalScreenOrientation,
    mobileSplashLayout,
    subScreenPackUp,
    mobileMenuCurrentName,
    mobileChatTabHasBeenShowed,
    mobileMenuHeaderHeight,
    mobileLayoutTopHeight,
    mobileLayoutBottomHeight,
    mobileLayoutBottomTop,
    mobileWatchLayoutHeight,
    mobilePlayerIsPageFullscreen,
    mobileNormalLatencyPlayerIsFullscreen,
    mobileDocIsPageFullscreen,
    isPageFullscreenOrHorizontalScreen,
    mobileInputFocusing,
    mobileKeyboardHeight,

    exitMobileLayoutFullScreen,
    syncLayoutStore,
  };
});
