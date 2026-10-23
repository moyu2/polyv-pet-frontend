import { computed, reactive } from 'vue';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * 关注设置 hook
 */
export const useFollowSetting = () => {
  const { getWatchCore } = useGlobalInject();

  const watchAppStore = useWatchAppStore();
  const watchCore = getWatchCore();

  /** 关注设置 */
  const followSetting = reactive(watchCore.channel.getFollowSetting());

  /** 是否自动打开 */
  const followAutoShow = computed<boolean>(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;

    return followSetting.followAutoShow;
  });

  /** 关注开关 */
  const followEnabled = computed<boolean>(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;

    return followSetting.followEnabled;
  });

  /** 关注入口文案 */
  const followEntrance = computed<string>(() => {
    return followSetting.followEntrance;
  });

  /** 关注图片 */
  const followImage = computed(() => {
    return followSetting.followImage;
  });

  /** 移动端关注提示文案 */
  const followTips = computed(() => {
    return followSetting.followTips;
  });

  /** PC端关注提示文案 */
  const pcFollowTips = computed(() => {
    return followSetting.pcFollowTips;
  });

  return {
    followAutoShow,
    followEnabled,
    followEntrance,
    followImage,
    followTips,
    pcFollowTips,
  };
};
