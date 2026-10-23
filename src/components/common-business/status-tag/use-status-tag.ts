import { translate } from '@/assets/lang';
import { LiveStatusTagEffect, PropUtils, VueProps } from '@polyv/vue-components';
import { useChannelStore } from '@/store/use-channel-store';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useThemeStore } from '@/store/use-theme-store';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';

export const statusTagProps = () => ({
  liveStatus: PropUtils.enum<LiveStatus>(),
});

/**
 * 直播状态标签 hook
 */
export const useStatusTag = (options: { props: VueProps<typeof statusTagProps> }) => {
  const { props } = options;

  const channelStore = useChannelStore();

  const liveStatus = computed(() => {
    return props.liveStatus ?? channelStore.liveStatus;
  });

  /**
   * 获取直播状态文本
   * @param status 直播状态
   */
  function getLiveStatusText(status: LiveStatus): string {
    const tagTexts: Record<LiveStatus, string> = {
      [LiveStatus.Live]: translate('liveStatus.live'),
      [LiveStatus.Waiting]: translate('liveStatus.waiting'),
      [LiveStatus.End]: translate('liveStatus.end'),
      [LiveStatus.Stop]: translate('liveStatus.stop'),
      [LiveStatus.Playback]: translate('liveStatus.playback'),
      [LiveStatus.UnStart]: translate('liveStatus.unStart'),
    };

    return tagTexts[status];
  }

  /**
   * 直播状态标签文本
   */
  const statusTagText = computed(() => {
    return getLiveStatusText(unref(liveStatus));
  });

  return {
    liveStatus,
    statusTagText,
  };
};

export const useMiniStatusTagStyle = (options: { props: VueProps<typeof statusTagProps> }) => {
  const { props } = options;

  const channelStore = useChannelStore();

  const liveStatus = computed(() => {
    return props.liveStatus ?? channelStore.liveStatus;
  });

  const tagColors: Record<LiveStatus, string> = {
    [LiveStatus.Live]: 'linear-gradient(150deg, #F06E6E 0%, #E63A3A 100%)',
    [LiveStatus.Playback]: 'linear-gradient(152deg, #5ba3ff, #3082fe)',
    [LiveStatus.Waiting]: 'linear-gradient(152deg, #5ba3ff, #3082fe)',
    [LiveStatus.End]: 'linear-gradient(152deg, #abafc0, #73778c)',
    [LiveStatus.Stop]: 'linear-gradient(152deg, #abafc0, #73778c)',
    [LiveStatus.UnStart]: 'linear-gradient(152deg, #abafc0, #73778c)',
  };

  /**
   * 直播状态标签样式
   */
  const minStatusTagStyle = computed(() => {
    const color = tagColors[unref(liveStatus)];

    return {
      background: color,
    };
  });

  return {
    minStatusTagStyle,
  };
};

export const useLiveStatusTagStyle = () => {
  const { currentSkinColorMode } = storeDefinitionToRefs(useThemeStore);

  const tagEffect = computed(() => {
    let effect: LiveStatusTagEffect = 'fill';

    if (currentSkinColorMode.value === ThemeColorMode.Light) {
      effect = 'transparent';
    }
    return effect;
  });

  return {
    tagEffect,
  };
};
