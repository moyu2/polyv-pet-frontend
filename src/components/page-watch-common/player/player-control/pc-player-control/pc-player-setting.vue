<!-- @file PC 端播放器设置面板 -->
<template>
  <div class="c-pc-player-control__setting">
    <div class="c-pc-player-control__button c-pc-player-control__button--setting"></div>

    <div class="c-pc-player-control__setting__panel">
      <!-- 线路选择 -->
      <div
        v-if="lineSettingVisible"
        class="c-pc-player-control__setting__panel__section"
      >
        <div class="c-pc-player-control__setting__panel__title">
          {{ $lang('player.lineSwitch') }}
        </div>
        <ul class="c-pc-player-control__setting__panel__list">
          <li
            v-for="(item, index) in lineSettingList"
            :key="`line-${index}`"
            class="c-pc-player-control__setting__panel__item"
            :class="{
              'c-pc-player-control__setting__panel__item--active': item.active,
            }"
            data-testid="plv-player-control-line-item"
            @click="toChangeLine(item.value)"
          >
            {{ item.text }}
          </li>
        </ul>
      </div>

      <!-- 清晰度选择 -->
      <div
        v-if="qualitySettingVisible"
        class="c-pc-player-control__setting__panel__section"
      >
        <div class="c-pc-player-control__setting__panel__title">{{ $lang('player.quality') }}</div>
        <ul class="c-pc-player-control__setting__panel__list">
          <li
            v-for="(item, index) in qualitySettingList"
            :key="`level-${index}`"
            class="c-pc-player-control__setting__panel__item"
            :class="{
              'c-pc-player-control__setting__panel__item--active': item.active,
            }"
            data-testid="plv-player-control-quality-level-item"
            :data-testid-active="item.active"
            @click="toChangeQualityLevel(item.value)"
          >
            {{ item.text }}
          </li>
        </ul>
      </div>

      <!-- 延迟模式 -->
      <div
        v-if="latencyModeSettingVisible"
        class="c-pc-player-control__setting__panel__section c-pc-player-control__setting__panel__section--latency"
      >
        <div class="c-pc-player-control__setting__panel__title">
          {{ $lang('player.latencyMode.name') }}
        </div>
        <ul class="c-pc-player-control__setting__panel__list">
          <li
            v-for="(item, index) in latencyModeSettingList"
            :key="`latency-${index}`"
            class="c-pc-player-control__setting__panel__item"
            :class="{
              'c-pc-player-control__setting__panel__item--active': item.active,
            }"
            data-testid="plv-player-control-latency-mode-item"
            @click="toSetLowLowLatency(item.value)"
          >
            {{ item.text }}
          </li>
        </ul>
      </div>

      <!-- 字幕配置  -->
      <pc-player-subtitle-setting class="c-pc-player-control__setting__panel__section" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import PcPlayerSubtitleSetting from './pc-player-subtitle-setting.vue';

const {
  lineSettingVisible,
  lineSettingList,
  qualitySettingVisible,
  qualitySettingList,
  latencyModeSettingVisible,
  latencyModeSettingList,
} = usePlayerControl();

const { toChangeLine, toChangeQualityLevel, toSetLowLowLatency } = usePlayerAction();
</script>

<style lang="scss">
.c-pc-player-control__setting {
  position: relative;
}

.c-pc-player-control__button--setting {
  background-image: url(./imgs/pc-player-ui-setting.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-setting-hover.png);
  }
}

.c-pc-player-control__setting__panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  box-sizing: border-box;
  width: 280px;
  padding: 24px;
  color: $--color-white;
  pointer-events: none;
  background: $--player-control-panel-bg;
  border-radius: 2px;
  opacity: 0;
  transition: 0.3s;
  transform: translateX(-50%);
}

.c-pc-player-control__setting:hover {
  .c-pc-player-control__button--setting {
    background-image: url(./imgs/pc-player-ui-setting-hover.png);
  }
  .c-pc-player-control__setting__panel {
    pointer-events: initial;
    opacity: 1;
  }
}

.c-pc-player-control__setting__panel__section + .c-pc-player-control__setting__panel__section {
  margin-top: 24px;
}

.c-pc-player-control__setting__panel__title {
  margin-bottom: 16px;
  font-size: 14px;
}
.c-pc-player-control__setting__panel__list {
  display: flex;
  flex-wrap: wrap;
}
.c-pc-player-control__setting__panel__item {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 24px;
  padding: 0 8px;
  margin-right: 8px;
  font-size: 12px;
  color: rgba($--color-white, 0.72);
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: 0.15s;

  &:last-of-type {
    margin-right: 0;
  }
}
.c-pc-player-control__setting__panel__item:hover,
.c-pc-player-control__setting__panel__item--active {
  color: $--color-white;
  border-color: $--color-white;
}

.c-pc-player-control__setting__panel__section--latency {
  .c-pc-player-control__setting__panel__item {
    min-width: 66px;
  }
}
</style>
