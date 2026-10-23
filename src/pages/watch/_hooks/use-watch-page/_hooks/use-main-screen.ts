import { isMobile } from '@/assets/utils/browser';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useChannelStore } from '@/store/use-channel-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import {
  MainScreenLayoutMode,
  ChannelPlayMode,
  DocEvents,
  DocEventsRelations,
  LiveStatus,
  MainScreenContent,
} from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, watch } from 'vue';

/**
 * 主副屏切换响应逻辑
 */
export const useMainScreen = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();

  const channelStore = useChannelStore();
  const docStore = useDocStore();
  const layoutStore = useLayoutStore();

  /**
   * 重置主屏幕
   * @param opts - 选项
   * @param opts.ignoreFollowTeacher - 是否忽略跟随讲师模式
   */
  function resetMainScreen({ ignoreFollowTeacher = false } = {}) {
    if (!docStore.canRenderDoc) {
      layoutStore.$patch({
        mainScreen: MainScreenContent.Player,
      });
      return;
    }

    const mainScreenLayoutMode = layoutStore.mainScreenLayoutMode;

    if (mainScreenLayoutMode === MainScreenLayoutMode.FollowTeacher && ignoreFollowTeacher) {
      return;
    }

    switch (mainScreenLayoutMode) {
      case MainScreenLayoutMode.Ppt:
      case MainScreenLayoutMode.FollowTeacher:
        layoutStore.$patch({
          mainScreen: MainScreenContent.Doc,
        });
        break;
      case MainScreenLayoutMode.Video:
      case MainScreenLayoutMode.OnlyVideo:
      default:
        layoutStore.$patch({
          mainScreen: MainScreenContent.Player,
        });
        break;
    }
  }

  /**
   * 判断是否需要强制将主屏设置为播放器
   */
  function needForcePlayerMainScreen() {
    const watchCore = getWatchCore();
    const playMode = watchCore.channel.getChannelPlayMode();
    // 如果需要暖场，需要将主屏设置为播放器
    if (playMode === ChannelPlayMode.Warm && channelStore.liveStatus !== LiveStatus.Live) {
      return true;
    }

    return false;
  }

  function initMainScreen() {
    if (!docStore.canRenderDoc) {
      layoutStore.$patch({
        mainScreen: MainScreenContent.Player,
      });
      return;
    }

    if (needForcePlayerMainScreen()) {
      layoutStore.$patch({
        mainScreen: MainScreenContent.Player,
      });
      return;
    }

    resetMainScreen();
  }

  /** ------ 事件响应 ------ */

  watch(
    () => channelStore.liveStatus,
    (newVal, oldVal) => {
      // 从其他状态 => 直播结束
      if (oldVal && newVal === LiveStatus.End) {
        resetMainScreen();
        return;
      }

      // 从非暂停状态 => 直播开始
      if (oldVal && oldVal !== LiveStatus.Stop && newVal === LiveStatus.Live) {
        // 如果跟随讲师，则由 socket 处理，不需要跟随接口配置
        resetMainScreen({ ignoreFollowTeacher: true });
      }
    },
  );

  function onMainScreenChange(evt: DocEventsRelations[DocEvents.MainScreenChange]) {
    const mainScreenLayoutMode = layoutStore.mainScreenLayoutMode;

    if (!docStore.canRenderDoc) {
      layoutStore.$patch({
        mainScreen: MainScreenContent.Player,
      });
      return;
    }

    // 针对移动端，如果后台设置非跟随讲师，则不处理事件
    if (isMobile && mainScreenLayoutMode !== MainScreenLayoutMode.FollowTeacher) {
      return;
    }

    layoutStore.$patch({
      mainScreen: evt.mainScreen,
    });
  }

  onMounted(() => {
    initMainScreen();

    const watchCore = getWatchCore();
    watchCore.doc.eventEmitter.on(DocEvents.MainScreenChange, onMainScreenChange);
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.doc.eventEmitter.off(DocEvents.MainScreenChange, onMainScreenChange);
  });
};
