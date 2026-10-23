import { useSubtitleStore } from '@/store/use-subtitle-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { onBeforeMount, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
import { translate } from '@/assets/lang';
import { useLangStore } from '@/store/use-lang-store';
import { TreeSelectDataValue } from '@/components/common-base/tree-select/tree-select-types';
import { isString } from '@/assets/utils/string';
import { useGlobalInject } from '@/app/use-global-inject';

export function useMobilePlaybackSubtitle(options: { openSelectAction: () => void }) {
  const {
    replaySubtitleSourceTranslateLanguageOptions,
    curSelectedReplaySubtitleItemId,
    replaySubtitleSourceLanguageOptions,
  } = storeDefinitionToRefs(useSubtitleStore);

  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const langStore = useLangStore();

  const pbSubtitleOptions = ref([
    {
      label: translate('subtitle.translate'),
      value: 'translate',
      children: replaySubtitleSourceTranslateLanguageOptions.value,
    },
  ]);

  const pbSubtitleTranslateLanguage = ref(['translate', curSelectedReplaySubtitleItemId.value]);

  watch(
    () => curSelectedReplaySubtitleItemId.value,
    newId => {
      pbSubtitleTranslateLanguage.value[1] = newId;
    },
  );

  watch(
    () => langStore.currentLang,
    () => {
      pbSubtitleOptions.value[0].label = translate('subtitle.translate');
    },
  );

  watchEffect(() => {
    pbSubtitleOptions.value[0].children = replaySubtitleSourceTranslateLanguageOptions.value;
    updatePlayerSubtitleSelect();
  });

  // 更新播放器字幕的select选项的文案
  function updatePlayerSubtitleSelect() {
    const targetSubtitle = replaySubtitleSourceTranslateLanguageOptions.value.find(
      item => item.value === curSelectedReplaySubtitleItemId.value,
    );

    // 原生字幕不存在时，翻译字幕的index为0
    const translateSelectIndex = replaySubtitleSourceLanguageOptions.value.length > 0 ? 1 : 0;

    window.setTimeout(() => {
      watchCore.player.setPlayerReplaySubtitleSelectConfig({
        index: translateSelectIndex,
        text: targetSubtitle?.label,
        show: !!targetSubtitle,
      });
    }, 1000);
  }

  function handleSubtitleSelectBtnClick() {
    options.openSelectAction();
  }

  function handleSelectSubtitle(selectItems: TreeSelectDataValue[]) {
    if (isString(selectItems[1])) {
      curSelectedReplaySubtitleItemId.value = selectItems[1];
      updatePlayerSubtitleSelect();
    } else {
      console.warn('not exist subtitleSelect', selectItems);
    }
  }

  onBeforeMount(() => {
    watchCore.player.eventEmitter.on(
      PlayerEvents.PlayerUIReplaySubtitleSelectBtnClick,
      handleSubtitleSelectBtnClick,
    );

    watchCore.player.eventEmitter.on(
      PlayerEvents.PlayerSetupPanelSkinInit,
      updatePlayerSubtitleSelect,
    );
  });

  onBeforeUnmount(() => {
    watchCore.player.eventEmitter.off(
      PlayerEvents.PlayerUIReplaySubtitleSelectBtnClick,
      handleSubtitleSelectBtnClick,
    );

    watchCore.player.eventEmitter.off(
      PlayerEvents.PlayerSetupPanelSkinInit,
      updatePlayerSubtitleSelect,
    );
  });

  return {
    pbSubtitleOptions,
    pbSubtitleTranslateLanguage,
    handleSelectSubtitle,
  };
}
