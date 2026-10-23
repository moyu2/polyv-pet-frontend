<!-- @file 直播实时字幕 -->
<template>
  <div
    v-show="localUerSubtitlesEnable"
    class="c-player-live-subtitle"
    :style="{
      bottom: `${bottom}px`,
      height: `${subtitleHeight}px`,
      fontSize: `${fontsize}`,
    }"
  >
    <div
      v-show="receivedSubtitleText"
      class="c-player-live-subtitle__inner"
    >
      {{ receivedSubtitleText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import { SubtitleRealTimeCC } from '@polyv/live-watch-sdk';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { usePlayerSubtitle, useSubtitleProps } from '../_hooks/_use-player-subtitle';

const { liveSubtitlesEnable, localUerSubtitlesEnable } = storeDefinitionToRefs(useSubtitleStore);

const props = defineProps(useSubtitleProps());
const {
  fontsize,
  subtitleHeight,

  init,
  destroy,
} = usePlayerSubtitle({ props });

const receivedSubtitleText = ref('');

let debounceTimer: null | number = null;

const onSubtitleRealTimeCC = (data: SubtitleRealTimeCC) => {
  receivedSubtitleText.value = data.text;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(() => {
    receivedSubtitleText.value = '';
  }, 3000);
};

watch(
  () => liveSubtitlesEnable.value,
  val => {
    if (!val) {
      receivedSubtitleText.value = '';
    }
  },
);

useEventBusListener(appEvents.player.SubtitleRealTimeCC, onSubtitleRealTimeCC);

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<style lang="scss">
.c-player-live-subtitle {
  position: absolute;
  bottom: 150px;
  left: 10%;
  z-index: 8;
  width: 80%;
  overflow: hidden;
  line-height: 1.5;
  color: #fff;
  text-align: left;
  // prettier-ignore
  text-shadow: rgb(0, 0, 0) 1px 0 1px,
    rgb(0, 0, 0) 0 1px 1px,
    rgb(0, 0, 0) 0 -1px 1px,
    rgb(0, 0, 0) -1px 0 1px;
  pointer-events: none;
}

.c-player-live-subtitle__inner {
  position: absolute;
  bottom: 0;
  padding: 5px 8px;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
}
</style>
