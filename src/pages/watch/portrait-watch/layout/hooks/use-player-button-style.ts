import { computed } from 'vue';
import { CSSProperties } from 'vue/types/jsx';

import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { MainScreenContent } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { usePortraitPlayerSize } from '@/components/page-watch-common/player/player-main/portrait-player-main/use-portrait-player-size';

export const usePlayerButtonStyle = () => {
  const { portraitDocWrapHeight, portraitDocSideSwitchVisible } =
    storeDefinitionToRefs(usePortraitLayoutStore);
  const { documentSwitch } = storeDefinitionToRefs(useDocStore);
  const { mainScreen } = storeDefinitionToRefs(useLayoutStore);
  const { masterMicItem } = storeDefinitionToRefs(useConnectMicStore);

  const { playerContainerStyle } = usePortraitPlayerSize();

  const isDocMainScreen = computed(() => {
    if (isBuildForFeedMainMode()) return false;

    return (
      mainScreen.value === MainScreenContent.Doc &&
      portraitDocSideSwitchVisible.value &&
      !masterMicItem.value
    );
  });

  const playerButtonStyle = computed<CSSProperties>(() => {
    if (isDocMainScreen.value && documentSwitch.value) {
      return {
        ...playerContainerStyle.value,
        height: `${portraitDocWrapHeight.value}px`,
      };
    }

    return playerContainerStyle.value;
  });

  return {
    playerButtonStyle,
  };
};
