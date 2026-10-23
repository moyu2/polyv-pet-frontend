<!-- @file PC 端字幕相关配置 -->

<template>
  <!-- 直播实时字幕配置 -->
  <div
    v-if="liveSubtitlesEnable"
    class="c-player-subtitle-setting-section"
  >
    <div class="c-player-subtitle-setting-section-title">
      {{ $lang('player.subtitle.text') }}
    </div>
    <plv-switch
      :value="localUerSubtitlesEnable"
      @change="changeSubtitleSwitch"
    ></plv-switch>
  </div>

  <!-- 回放字幕配置 -->
  <div
    v-else-if="replaySubtitleVisible"
    class="c-player-subtitle-setting-section"
  >
    <div class="c-player-subtitle-setting-section-title">
      {{ $lang('player.replaySubtitle.text') }}
    </div>

    <div
      v-if="replaySubtitleSourceLanguageOptions.length"
      class="c-player-subtitle-setting-section__item"
    >
      <plv-checkbox
        class="c-player-subtitle-setting-section__item__check"
        :checked="mainReplaySubtitleShow"
        @change="changeMainReplaySubtitleShow"
      >
        <span>{{ $lang('subtitle.source') }}</span>
      </plv-checkbox>
      <pc-select
        theme="dark"
        class="c-player-subtitle-setting-section__item__select"
        :value="replaySubtitleSourceLanguageOptions[0].value"
        :options="replaySubtitleSourceLanguageOptions"
        :popper-options="{ placement: 'top-start' }"
      />
    </div>

    <div
      v-if="replaySubtitleSourceTranslateLanguageOptions.length"
      class="c-player-subtitle-setting-section__item"
    >
      <plv-checkbox
        class="c-player-subtitle-setting-section__item__check"
        :checked="subReplaySubtitleShow"
        @change="changeSubReplaySubtitleShow"
      >
        <span>{{ $lang('subtitle.translate') }}</span>
      </plv-checkbox>
      <pc-select
        theme="dark"
        class="c-player-subtitle-setting-section__item__select"
        v-model="curSelectedReplaySubtitleItemId"
        :options="replaySubtitleSourceTranslateLanguageOptions"
        :popper-options="{ placement: 'top-start' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlvSwitch } from '@/plugins/polyv-ui/pc-import';
import { PlvCheckbox } from '@/plugins/polyv-ui/admin-import';
import PcSelect from '@/components/common-base/select/pc-select.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useGlobalInject } from '@/app/use-global-inject';

const { getWatchCore } = useGlobalInject();

const {
  liveSubtitlesEnable,
  localUerSubtitlesEnable,

  mainReplaySubtitleShow,
  subReplaySubtitleShow,
  replaySubtitleVisible,
  curSelectedReplaySubtitleItemId,
  replaySubtitleSourceLanguageOptions,
  replaySubtitleSourceTranslateLanguageOptions,
} = storeDefinitionToRefs(useSubtitleStore);

const {
  changeLocalUerSubtitlesEnable,

  changeMainReplaySubtitleShow,
  changeSubReplaySubtitleShow,
} = useSubtitleStore();

function changeSubtitleSwitch() {
  const watchCore = getWatchCore();
  const enable = !localUerSubtitlesEnable.value;
  changeLocalUerSubtitlesEnable(enable);
  watchCore.subtitle.changeViewerSubtitleEnable(enable);
}
</script>

<style lang="scss">
.c-player-subtitle-setting-section {
  .plv-switch {
    background: #545c6b;
  }
  .plv-switch--switched {
    background: #1755ee;
  }
}

.c-player-subtitle-setting-section-title {
  margin-bottom: 16px;
  font-size: 14px;
}

.c-player-subtitle-setting-section__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }

  .c-player-subtitle-setting-section__item__check {
    display: flex;
    align-items: center;
    height: 32px;
    margin-right: 10px;
    .plv-admin-icon-check {
      background: #1755ee;
    }
    .plv-checkbox__label {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      color: #fff;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .c-player-subtitle-setting-section__item__select {
    width: 132px;
    height: 32px;
  }
}
</style>
