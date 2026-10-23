<!-- @file 移动端横屏播放器字幕显示区 -->

<template>
  <!-- 直播实时字幕  -->
  <player-live-subtitle
    v-if="liveSubtitlesShow"
    :full-screen-selector="fullScreenSelector"
    :selector="selector"
    :bottom="16"
    :max-len="80"
    :init-to-player="true"
  />

  <!-- 回放字幕 -->
  <player-replay-subtitle
    v-else-if="replaySubtitleVisible"
    :selector="selector"
    :full-screen-selector="fullScreenSelector"
    :bottom="16"
    :max-len="80"
    :init-to-player="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PlayerLiveSubtitle from './_components/player-live-subtitle.vue';
import PlayerReplaySubtitle from './_components/player-replay-subtitle.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { MOBILE_LIVE_PLAYER_INNER_WRAP } from '@/assets/constants/selector';
import { PropUtils } from '@polyv/vue-components';
import { usePlayerStore } from '@/store/use-player-store';

const props = defineProps({
  /** 挂载选择器 */
  selector: PropUtils.string.def(MOBILE_LIVE_PLAYER_INNER_WRAP),
});

const { liveSubtitlesShow, replaySubtitleVisible } = storeDefinitionToRefs(useSubtitleStore);

const playerStore = usePlayerStore();

const fullScreenSelector = computed(() => {
  // 移动端正常延迟播放器网页全屏时需要用额外的选择器
  return !playerStore.isLowLatency ? MOBILE_LIVE_PLAYER_INNER_WRAP : props.selector;
});
</script>
