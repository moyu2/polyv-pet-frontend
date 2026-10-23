<!-- @file 移动端横屏实时字幕列表 -->
<template>
  <div
    ref="subtitleScroll"
    class="c-mobile-subtitle"
  >
    <template v-if="liveSubtitlesEnable">
      <div
        v-if="subtitleTranslateEnabled"
        class="c-mobile-subtitle__top pws-mobile-subtitle__top-skin"
      >
        <mobile-subtitle-select
          v-model="subtitleTranslateSelected"
          :options="subtitleTranslateOptions"
        />
      </div>
      <div
        v-if="subtitleDisplayNumberLimitEnabled && subtitleDisplayNumber > 0"
        class="c-mobile-subtitle__limit"
      >
        {{ $lang('subtitle.limit', { limit: String(subtitleDisplayNumber) }) }}
      </div>
      <div class="c-mobile-subtitle__content pws-mobile-subtitle__content-skin c-subtitle__scroll">
        <div
          v-for="(item, index) of subtitleList"
          :key="index"
          class="c-mobile-subtitle__content-item pws-mobile-subtitle__content-item"
        >
          <div
            v-if="
              subtitleTranslateSelected.includes('all') ||
              subtitleTranslateSelected.includes('source')
            "
          >
            {{ item[liveSubtitleSourceLanguage] }}
          </div>
          <div
            v-if="
              subtitleTranslateSelected.includes('all') && item[liveSubtitleSourceTranslateLanguage]
            "
            class="c-mobile-subtitle__content-item-line pws-mobile-subtitle__content-item-line"
          ></div>
          <div
            v-if="
              (subtitleTranslateSelected.includes('all') ||
                subtitleTranslateSelected.includes('translate')) &&
              item[liveSubtitleSourceTranslateLanguage]
            "
            class="c-mobile-subtitle__content-item-translate"
            :class="{
              'c-mobile-subtitle__content-item-translate--force':
                subtitleTranslateSelected.includes('translate'),
            }"
          >
            {{ item[liveSubtitleSourceTranslateLanguage] }}
          </div>
        </div>
        <div
          v-show="
            currentSubtitle &&
            (subtitleTranslateSelected.includes('all') ||
              subtitleTranslateSelected.includes('source'))
          "
          class="c-mobile-subtitle__content-item pws-mobile-subtitle__content-item"
        >
          <div>{{ currentSubtitle }}</div>
        </div>
        <div class="c-mobile-subtitle__footer-tips pws-mobile-subtitle__footer-tips">
          <span>{{ $lang('subtitle.footer.tips') }}</span>
        </div>
        <div
          v-show="hasNewMessage"
          class="c-mobile-subtitle__new pws-subtitle__new"
          @click="scrollToBottom(false)"
        >
          <span>{{ $lang('subtitle.new') }}</span>
          <mobile-icon-arrow-down />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="c-mobile-subtitle__empty pws-subtitle__empty">{{ $lang('subtitle.empty') }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MobileSubtitleSelect from './mobile-subtitle-select/mobile-subtitle-select.vue';

import { MobileIconArrowDown } from '@/components/component-icons/mobile/map';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';

import { useSubtitle } from '@/components/page-watch-common/subtitle/use-subtitle';

const {
  liveSubtitlesEnable,
  subtitleTranslateEnabled,

  liveSubtitleSourceLanguage,
  liveSubtitleSourceTranslateLanguage,
  subtitleDisplayNumberLimitEnabled,
  subtitleDisplayNumber,
} = storeDefinitionToRefs(useSubtitleStore);

const subtitleScroll = ref<HTMLElement>();
const {
  hasNewMessage,
  scrollToBottom,

  subtitleTranslateSelected,
  subtitleTranslateOptions,

  subtitleList,
  currentSubtitle,
  updateMobileSubtitleSkinShow,
} = useSubtitle(subtitleScroll);

onMounted(() => {
  updateMobileSubtitleSkinShow();
});
</script>

<style lang="scss">
.c-mobile-subtitle {
  height: 100%;
  padding: 0 12px;
  overflow: auto;
}

.c-mobile-subtitle__limit {
  margin: 16px 0;
  font-size: 12px;
  color: #adadc0;
  text-align: center;
}

.c-mobile-subtitle__top {
  position: sticky;
  top: 0;
  z-index: 1;
}

.c-mobile-subtitle__footer-tips {
  margin-bottom: 12px;
  font-size: 12px;
  text-align: center;
}

.c-mobile-subtitle__new {
  position: absolute;
  bottom: 32px;
  left: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 103px;
  padding: 6px 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 285px;
  transform: translateX(-50%);
}

.c-mobile-subtitle__content-item {
  padding: 12px;
  margin-bottom: 12px;
  line-height: 22px;
  border-radius: 8px;

  .c-mobile-subtitle__content-item-line {
    margin: 8px 0;
    border-top: 1px solid #d8d8d8;
    opacity: 0.1;
  }

  .c-mobile-subtitle__content-item-translate {
    opacity: 0.6;
  }

  .c-mobile-subtitle__content-item-translate--force {
    opacity: 1 !important;
  }
}

.c-mobile-subtitle__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
