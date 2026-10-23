<template>
  <mobile-popup
    class="c-portrait-player-stream-track-popup"
    :visible.sync="trackVisible"
    :theme="PopupTheme.Portrait"
    :use-transition.sync="useTransition"
    :title="isMultiLanguageTrack ? $lang('player.streamTrack') : $lang('player.streamTrack.normal')"
    backable
    @click-back="onClickBack"
  >
    <ul
      class="c-portrait-player-control__select-list c-portrait-player-control__select-list--large"
    >
      <li
        v-for="(trackItem, idx) in streamTrackList"
        :key="idx"
        class="c-portrait-player-control__select-item"
        :class="{
          'c-portrait-player-control__select-item--active': isActiveStreamTrack(trackItem),
        }"
        @click="onClickItem(trackItem)"
      >
        <span>{{ getTrackItemName(trackItem) }}</span>
      </li>
    </ul>
  </mobile-popup>
</template>

<script setup lang="ts">
import { PopupTheme } from '@/components/common-base/popup/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { appEvents } from '@/app/app-events';
import { usePortraitSettingPopup } from '../player-control/portrait-player-control/use-portrait-setting-popup';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { useStreamTrack } from './use-stream-track';
import { ChannelStreamTrackItem, ChannelStreamTrackType } from '@polyv/live-watch-sdk';

const {
  visible: trackVisible,
  useTransition,
  onClickBack,
  closePopup,
} = usePortraitSettingPopup(appEvents.portrait.OpenLangStreamPopup);

const { japLangEnabled } = storeDefinitionToRefs(useLangStore);

const {
  isMultiLanguageTrack,
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

  return '中文音频';
}

function onClickItem(trackItem: ChannelStreamTrackItem) {
  switchStreamTrack(trackItem);
  closePopup();
}
</script>
