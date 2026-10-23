import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerStore } from '@/store/use-player-store';
import { computed, watch } from 'vue';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { useLayoutStore } from '@/store/use-layout-store';
import { MainScreenContent } from '@polyv/live-watch-sdk';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDocStore } from '@/store/use-doc-store';

export function usePortraitCopyrightStyle() {
  const { portraitDocSideSwitchVisible, portraitDocWrapHeight, channelInfoSeat } =
    storeDefinitionToRefs(usePortraitLayoutStore);

  const { masterMicItem } = storeDefinitionToRefs(useConnectMicStore);

  const { mainScreen } = storeDefinitionToRefs(useLayoutStore);

  const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

  const isMiniAvatar = computed(() => {
    return channelInfoSeat.value === 0;
  });

  const { resolutionWidth, resolutionHeight } = storeDefinitionToRefs(usePlayerStore);

  // 针对特殊分辨率（流比例超过 4:3（高：宽），才修改播放器的版权声明， 9:16需要
  const resolutionCopyrightFit = computed(() => {
    let resolutionProportion = 0;

    if (resolutionHeight.value && resolutionWidth.value) {
      resolutionProportion = resolutionHeight.value / resolutionWidth.value;
    }

    // 流比例超过 4:3（高：宽）
    return resolutionProportion && resolutionProportion > 1.3;
  });

  const isDocMainScreen = computed(() => {
    if (isBuildForFeedMainMode()) return false;

    return (
      mainScreen.value === MainScreenContent.Doc &&
      portraitDocSideSwitchVisible.value &&
      !masterMicItem.value
    );
  });

  /**
   * ppt场景样式调整
   */
  const updateDocCssVar = () => {
    const top = isDocMainScreen.value === false && portraitDocWrapHeight.value > 0 ? -30 : 0;

    document.documentElement.style.setProperty('--plv-cr-doc-rule', `${top}px`);
  };

  const portraitCopyRightExtraClassEnabled = computed(() => {
    return resolutionCopyrightFit.value || (canRenderDoc.value && portraitDocWrapHeight.value > 0);
  });

  watch(
    () => portraitDocWrapHeight.value,
    () => {
      updateDocCssVar();
    },
    {
      immediate: true,
    },
  );

  // 主副屏时样式适配
  watch(
    () => isDocMainScreen.value,
    () => {
      updateDocCssVar();
    },
    {
      immediate: true,
    },
  );

  return {
    isMiniAvatar,
    resolutionCopyrightFit,
    portraitCopyRightExtraClassEnabled,
  };
}
