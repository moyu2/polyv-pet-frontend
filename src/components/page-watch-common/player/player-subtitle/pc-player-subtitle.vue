<!-- @file PC 端播放器字幕显示区 -->

<template>
  <!-- 直播实时字幕  -->
  <player-live-subtitle
    v-if="liveSubtitlesEnable"
    :full-screen-selector="PC_PLAYER_FULL_SCREEN_SELECTOR"
    :selector="PC_MAIN_PLAYER_SELECTOR"
    :init-to-player="true"
    :bottom="106"
  />
  <!-- 回放字幕  -->
  <player-replay-subtitle
    v-else-if="replaySubtitleVisible"
    :full-screen-selector="PC_PLAYER_FULL_SCREEN_SELECTOR"
    :selector="PC_MAIN_PLAYER_SELECTOR"
    :init-to-player="true"
    :bottom="106"
  />
</template>

<script setup lang="ts">
import PlayerLiveSubtitle from './_components/player-live-subtitle.vue';
import PlayerReplaySubtitle from './_components/player-replay-subtitle.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import {
  PC_PLAYER_FULL_SCREEN_SELECTOR,
  PC_MAIN_PLAYER_SELECTOR,
} from '@/assets/constants/selector';

const { liveSubtitlesEnable, replaySubtitleVisible } = storeDefinitionToRefs(useSubtitleStore);
</script>
