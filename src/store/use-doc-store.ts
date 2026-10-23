import { isMobile } from '@/assets/utils/browser';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { useWatchAppStore } from './use-watch-app-store';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { useFeedInjectStore } from './use-feed-inject-store';

export interface DocStoreState {
  /** 配置是否使用文档 */
  docEnabled: Ref<boolean>;
  /** 能否创建文档 */
  canRenderDoc: ComputedRef<boolean>;
  /** 文档比例 */
  documentProportion: Ref<number | undefined>;
  /** 文档开关 */
  documentSwitch: Ref<boolean>;
  /** 是否具有画笔权限 */
  hasPaintAuth: Ref<boolean>;
  /** 是否处于画笔模式 */
  paintMode: Ref<boolean>;
  /** 翻页开关 */
  viewerPptTurningEnabled: Ref<boolean>;
}

export interface DocStoreActions {
  /** 切换文档开关 */
  toggleDocumentSwitch(): void;
  /** 同步文档 store */
  syncDocStore(): void;
}

export interface DocStore extends DocStoreState, DocStoreActions {}

/**
 * 文档 store
 */
export const useDocStore = defineStore<'doc', DocStore>('doc', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const feedInjectStore = useFeedInjectStore();

  /** 配置是否使用文档 */
  const docEnabled = ref(true);

  /** 能否创建文档 */
  const canRenderDoc = computed(() => {
    // 移动端下，只有在直播中、直播暂停、处于回放状态才能显示
    const supportStatus = [LiveStatus.Live, LiveStatus.Playback, LiveStatus.Stop];
    if (isMobile && !supportStatus.includes(channelStore.liveStatus)) {
      return false;
    }

    // 会议模式下不支持创建文档
    if (watchAppStore.meetingMode) {
      return false;
    }

    if (isBuildForFeedMainMode() && feedInjectStore.inFirstFeedLayout) {
      return false;
    }

    // 研讨会需后台开启白板课件才展示文档
    if (channelStore.isSeminarChannel) {
      return channelStore.seminarWhiteboardCoursewareEnabled;
    }

    return channelStore.isPptChannel;
  });

  /** 文档比例，宽/高 */
  const documentProportion = ref<number>();

  /** 文档开关 */
  const documentSwitch = ref(true);

  /** 切换文档开关 */
  function toggleDocumentSwitch() {
    documentSwitch.value = !documentSwitch.value;
  }

  /** 是否具有画笔权限 */
  const hasPaintAuth = ref(false);

  /** 是否处于画笔模式 */
  const paintMode = ref(false);

  /** 翻页开关 */
  const viewerPptTurningEnabled = ref(true);

  function syncDocStore() {
    const watchCore = watchAppStore.getWatchCore();
    const docInfo = watchCore.doc.getDocInfo();
    hasPaintAuth.value = docInfo.hasPaintAuth;
    paintMode.value = docInfo.paintMode;
    viewerPptTurningEnabled.value = docInfo.viewerPptTurningEnabled;
  }

  return {
    docEnabled,
    canRenderDoc,
    documentProportion,
    documentSwitch,
    toggleDocumentSwitch,
    hasPaintAuth,
    paintMode,
    viewerPptTurningEnabled,
    syncDocStore,
  };
});
