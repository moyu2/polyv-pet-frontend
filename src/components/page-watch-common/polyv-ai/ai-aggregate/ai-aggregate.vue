<template>
  <ai-aggregate-feature-panel
    class="c-ai-aggregate"
    :tab-enabled-setting="tabEnabledSetting"
    :show-color="false"
    :outline-data="outlineData"
    :current-time="currentTime"
    :srt-auto-scroll="true"
    :srt-data="srtData"
    :question-data="questionData"
    @seek="onSeekVideo"
  />
</template>

<script setup lang="ts">
import { useLiveWatchAIUILoader } from '@/plugins/external-lib-loaders/load-ai-ui';
import { useAIAggregate } from './use-ai-aggregate';
import { defineAsyncComponent } from 'vue';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { loadLiveWatchAIUIComponent } = useLiveWatchAIUILoader();

const { currentTime } = storeDefinitionToRefs(usePlayerStore);

const AiAggregateFeaturePanel = defineAsyncComponent(() =>
  loadLiveWatchAIUIComponent('AiAggregateFeaturePanel'),
);

const {
  tabEnabledSetting,

  outlineData,
  srtData,
  questionData,
  onSeekVideo,
} = useAIAggregate();
</script>

<style lang="scss">
.c-ai-aggregate {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent !important;
}
</style>
