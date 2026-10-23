import { computed, ref, watch } from 'vue';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { appEvents, useEventBusListener } from '@/app/app-events';

export const useSmallClassPlay = () => {
  const watchAppStore = useWatchAppStore();
  const { isSmallClassChannel, liveStatus } = storeDefinitionToRefs(useChannelStore);
  const connectMicStore = useConnectMicStore();
  const watchCore = watchAppStore.getWatchCore();

  /** 是否正在加入 */
  const isJoining = ref(false);

  /** 是否显示播放按钮 */
  const shouldShowPlayButton = computed(() => {
    return (
      // 小班课场景
      isSmallClassChannel.value &&
      // 直播中才显示
      liveStatus.value === LiveStatus.Live &&
      // 连麦中不显示
      !connectMicStore.isConnectMicing &&
      // 支持连麦
      connectMicStore.supportConnectMic &&
      // 连麦已初始化
      connectMicStore.micSetupSuccess &&
      // 已经是观众模式时不显示
      !connectMicStore.isAudience &&
      // 加入中不显示
      !isJoining.value
    );
  });

  /** 点击播放按钮 */
  const onPlayClick = async () => {
    if (isJoining.value) return;
    if (!shouldShowPlayButton.value) return;

    isJoining.value = true;

    try {
      const result = await watchCore.connectMic.joinAsAudience();

      if (result.success) {
        console.log('[小班课] 成功加入观众模式');
      } else {
        console.error('[小班课] 加入观众模式失败:', result.failReason);
      }
    } catch (error) {
      console.error('[小班课] 加入观众模式异常:', error);
    } finally {
      isJoining.value = false;
    }
  };

  const addPortraitClickEvent = () => {
    useEventBusListener(appEvents.portrait.ClickPlayerRegion, onPlayClick);
  };

  if (isSmallClassChannel.value) {
    watch(
      () => liveStatus.value,
      async () => {
        // 下课时停止 view-log, 并停止订阅讲师流
        if (liveStatus.value !== LiveStatus.Live) {
          await watchCore.connectMic.leaveAudience();
          watchCore.connectMic.stopSmallClassStat();
        }
      },
    );
  }

  return {
    shouldShowPlayButton,
    isJoining,
    onPlayClick,
    addPortraitClickEvent,
  };
};
