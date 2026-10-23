<template>
  <div
    ref="wrapRef"
    class="c-ai-question-card"
    :class="{
      'is-pc': !isMobile,
      'is-mobile': isMobile,
    }"
  >
    <playback-question-card
      v-if="watchAICoreSetuped"
      :question-data="questionData"
      :current-time="currentTime"
      @seek-video="toSeekVideo"
    />
  </div>
</template>

<script setup lang="ts">
import { useLiveWatchAIUILoader } from '@/plugins/external-lib-loaders/load-ai-ui';
import { defineAsyncComponent, ref } from 'vue';
import { useAIPlaybackQuestion } from '../hooks/use-ai-playback-question';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerStore } from '@/store/use-player-store';
import { usePlayerAction } from '../../player/hooks/use-player-action';
import { useBrowser } from '@polyv/vue-components';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { usePolyvAIStore } from '@/store/use-polyv-ai-store';

const { watchAICoreSetuped } = storeDefinitionToRefs(usePolyvAIStore);

const { loadLiveWatchAIUIComponent } = useLiveWatchAIUILoader();
const PlaybackQuestionCard = defineAsyncComponent(() =>
  loadLiveWatchAIUIComponent('PlaybackQuestionCard'),
);

const { currentTime } = storeDefinitionToRefs(usePlayerStore);

const { questionData } = useAIPlaybackQuestion();

const { toSeekVideo } = usePlayerAction();

const { isMobile } = useBrowser();

const wrapRef = ref<HTMLDivElement>();

if (isMobile) {
  useAppendTo(wrapRef);
}
</script>

<style lang="scss">
.c-ai-question-card {
  pointer-events: initial;

  &.is-pc {
    position: absolute;
    right: 16px;
    bottom: 0;
    z-index: 10;
    width: 300px;
  }

  &.is-mobile {
    position: fixed;
    right: 32px;
    bottom: 46px;
    z-index: 999;
    width: 278px;
  }
}
</style>
