<!-- @file 竖屏端回放+章节弹层 -->
<template>
  <mobile-popup
    class="c-portrait-playback-chapter-popup pws-mobile-popup"
    :visible.sync="visible"
    fill-body-section
    :theme="PopupTheme.Portrait"
    :title="popupTitle"
  >
    <template
      v-if="playbackMode === PlaybackMode.List && chapterVisible"
      #title
    >
      <portrait-normal-tabs
        class="c-portrait-playback-chapter-popup__tabs"
        v-model="listVal"
        :border="false"
        :tabs="tabList"
      />
    </template>

    <!-- 回放列表 -->
    <mobile-playback-list v-if="listVal === 'playback'" />
    <!-- 章节列表 -->
    <mobile-chapter
      v-if="chapterVisible"
      v-show="listVal === 'chapter'"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePlaybackList from '@/components/page-watch-common/playback-list/mobile-playback-list/mobile-playback-list.vue';
import MobileChapter from '@/components/page-watch-common/chapter/mobile-chapter.vue';
import PortraitNormalTabs from '@/components/common-base/tabs/portrait-normal-tabs/portrait-normal-tabs.vue';
import { PopupTheme } from '@/components/common-base/popup/types';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { computed, ref } from 'vue';
import { SimpleTabItem } from '@/components/common-base/tabs/hooks/use-simple-tabs';
import { translate } from '@/assets/lang';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlaybackStore } from '@/store/use-playback-store';
import { PlaybackMode } from '@polyv/live-watch-sdk';

const listVal = ref('playback');

const { visible, setVisible } = useSimpleVisible();

const { chapterVisible, playbackMode } = storeDefinitionToRefs(usePlaybackStore);

const tabList = computed<SimpleTabItem[]>(() => {
  return [
    { label: translate('playback.list'), value: 'playback' },
    { label: translate('playback.chapter'), value: 'chapter' },
  ];
});

const popupTitle = computed<string>(() => {
  if (playbackMode.value === PlaybackMode.List) {
    return translate('playback.list');
  }
  return translate('playback.chapter');
});

useEventBusListener(appEvents.portrait.OpenPlaybackChapter, (_visible = true) => {
  if (playbackMode.value === PlaybackMode.List) {
    listVal.value = 'playback';
  } else if (chapterVisible) {
    listVal.value = 'chapter';
  }

  setVisible(_visible);
});
</script>

<style lang="scss">
.c-portrait-playback-chapter-popup__tabs {
  margin-top: 4px;
}
</style>
