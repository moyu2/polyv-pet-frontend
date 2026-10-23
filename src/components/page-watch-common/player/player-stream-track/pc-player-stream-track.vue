<!-- @file PC 端音轨流切换 -->
<template>
  <div class="c-pc-player-stream-track">
    <div
      v-for="(trackItem, idx) in streamTrackList"
      :key="idx"
      class="c-pc-player-stream-track__item"
      :class="{
        'c-pc-player-stream-track__item--active': isActiveStreamTrack(trackItem),
      }"
      @click="switchStreamTrack(trackItem)"
    >
      <span>{{ getTrackItemName(trackItem) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { ChannelStreamTrackItem, ChannelStreamTrackType } from '@polyv/live-watch-sdk';
import { useStreamTrack } from './use-stream-track';

const { japLangEnabled } = storeDefinitionToRefs(useLangStore);

const {
  streamTrackType,
  streamTrackList,

  isActiveStreamTrack,
  switchStreamTrack,
} = useStreamTrack();

function getTrackItemName(trackItem: ChannelStreamTrackItem) {
  if (streamTrackType.value === ChannelStreamTrackType.Normal) return trackItem.name;

  if (trackItem.key === 'en') {
    return japLangEnabled.value ? 'Jpn track' : 'Eng track';
  }

  return '中文音轨';
}
</script>

<style lang="scss">
.c-pc-player-stream-track {
  display: flex;
  align-items: center;
  overflow: hidden;
}
.c-pc-player-stream-track__item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 32px;
  font-size: 14px;
  color: #e4e4e4;
  text-align: center;
  cursor: pointer;
  background: #000;
  border: 1px solid #3e3e4e;

  &:first-of-type {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  &:last-of-type {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
}
.c-pc-player-stream-track__item--active {
  color: #141518;
  background: #ffcc1d;
  border-color: #ffcc1d;
}
</style>
