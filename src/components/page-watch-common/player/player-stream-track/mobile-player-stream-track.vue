<template>
  <div class="c-mobile-player-stream-track">
    <div
      v-show="streamTrackType === ChannelStreamTrackType.MultiLanguageTrack"
      class="c-mobile-player-stream-track__ico"
      :class="{
        'c-mobile-player-stream-track__ico--cn': currentLang === LangType.ZH_CN,
        'c-mobile-player-stream-track__ico--en': currentLang !== LangType.ZH_CN && !japLangEnabled,
        'c-mobile-player-stream-track__ico--jp': currentLang !== LangType.ZH_CN && japLangEnabled,
      }"
    ></div>

    <div
      v-show="streamTrackType === ChannelStreamTrackType.MultiLanguageTrack"
      class="c-mobile-player-stream-track__desc"
    >
      <template v-if="currentLang === LangType.ZH_CN">
        <span>中文音频</span>
        <span>ZH_CN Track</span>
      </template>

      <template v-if="currentLang !== LangType.ZH_CN && !japLangEnabled">
        <span>英文音频</span>
        <span>English Track</span>
      </template>

      <template v-if="currentLang !== LangType.ZH_CN && japLangEnabled">
        <span>日文音频</span>
        <span>Japanese Track</span>
      </template>
    </div>

    <div class="c-mobile-player-stream-track__radio">
      <div
        v-for="(trackItem, idx) in streamTrackList"
        :key="idx"
        class="c-mobile-player-stream-track__radio__item"
        :class="{
          'c-mobile-player-stream-track__radio__item--active': isActiveStreamTrack(trackItem),
        }"
        @click="switchStreamTrack(trackItem)"
      >
        <span>{{ getTrackItemName(trackItem) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LangType } from '@/assets/lang/lang-enum';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { ChannelStreamTrackItem, ChannelStreamTrackType } from '@polyv/live-watch-sdk';
import { useStreamTrack } from './use-stream-track';

const { currentLang, japLangEnabled } = storeDefinitionToRefs(useLangStore);

const {
  streamTrackType,
  streamTrackList,

  isActiveStreamTrack,
  switchStreamTrack,
} = useStreamTrack();

function getTrackItemName(trackItem: ChannelStreamTrackItem) {
  if (streamTrackType.value === ChannelStreamTrackType.Normal) return trackItem.name;

  if (trackItem.key === 'en') {
    return japLangEnabled.value ? 'Jpn' : 'Eng';
  }

  return '中文';
}
</script>

<style lang="scss">
.c-mobile-player-stream-track {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  font-size: 16px;
  background-image: url(./imgs/bg.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.c-mobile-player-stream-track__ico {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  background-size: contain;
}
.c-mobile-player-stream-track__ico--cn {
  background-image: url(./imgs/zh-cn.png);
}
.c-mobile-player-stream-track__ico--en {
  background-image: url(./imgs/en.png);
}
.c-mobile-player-stream-track__ico--jp {
  background-image: url(./imgs/jp.png);
}

.c-mobile-player-stream-track__desc {
  color: #ffcc1d;

  span + span {
    margin-left: 8px;
  }
}

.c-mobile-player-stream-track__radio {
  display: flex;
  align-items: center;
  margin-left: auto;
  overflow: hidden;
}
.c-mobile-player-stream-track__radio__item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 24px;
  font-size: 12px;
  color: #e4e4e4;
  text-align: center;
  cursor: pointer;
  background: #000;
  border: 1px solid #3e3e4e;

  &:first-of-type {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }

  &:last-of-type {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
}
.c-mobile-player-stream-track__radio__item--active {
  color: #141518;
  background: #ffcc1d;
  border-color: #ffcc1d;
}
</style>
