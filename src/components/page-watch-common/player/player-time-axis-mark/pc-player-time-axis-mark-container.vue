<!-- @file 播放器时间轴标记-精彩看点业务组件 -->

<template>
  <div class="c-pc-player-time-axis-mark-container">
    <!-- 按钮 -->
    <normal-button
      class="c-pc-player-time-axis-mark-container__button"
      :type="ButtonType.Custom"
      :size="ButtonSize.XMini"
      :text="$lang('player.timeAxisMark.base.text')"
      :icon="PcIconHighlight"
      icon-class="c-pc-player-time-axis-mark-container__button__icon"
    />
    <!-- 悬浮面板 -->
    <div class="c-pc-player-time-axis-mark-container__panel">
      <div
        v-for="markPoint in timeAxisMarkList"
        :key="markPoint.id"
        class="c-pc-player-time-axis-mark-container__panel-item"
        @click="toSeekByTimeAxisMark(markPoint)"
      >
        <img
          class="c-pc-player-time-axis-mark-container__panel-item__img"
          :src="markPoint.markMessage.previewUrl"
        />
        <div class="c-pc-player-time-axis-mark-container__panel-item__desc">
          <div
            class="c-pc-player-time-axis-mark-container__panel-item__desc__title g-singleline"
            :title="markPoint.markMessage.title"
          >
            {{ markPoint.markMessage.title }}
          </div>
          <span class="c-pc-player-time-axis-mark-container__panel-item__desc__time">{{
            formatSeconds(markPoint.markTime, { segments: 3 })
          }}</span>
        </div>
      </div>
      <p
        v-if="timeAxisMarkList.length === 0"
        class="c-pc-player-time-axis-mark-container__panel-empty"
      >
        {{ $lang('player.timeAxisMark.empty.text') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatSeconds } from '@polyv/utils/date';

import NormalButton, { ButtonSize, ButtonType } from '@/components/common-base/normal-button';
import { PcIconHighlight } from '@/components/component-icons/pc/map';

import { useTimeAxisMarkHook } from './use-time-axis-mark';

const { timeAxisMarkList, toSeekByTimeAxisMark } = useTimeAxisMarkHook();
</script>

<style lang="scss">
.c-pc-player-time-axis-mark-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.c-pc-player-time-axis-mark-container:hover {
  color: #3082fe;
  .c-pc-player-time-axis-mark-container__panel {
    pointer-events: initial;
    opacity: 1;
  }
}

.c-pc-player-time-axis-mark-container__button {
  padding: 0 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.c-pc-player-time-axis-mark-container__button__icon {
  margin-top: -2px;
  font-size: 14px;
}

.c-pc-player-time-axis-mark-container__panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  box-sizing: border-box;
  width: 280px;
  max-height: 336px;
  padding: 16px;
  overflow: auto;
  color: $--color-white;
  pointer-events: none;
  cursor: pointer;
  user-select: none;
  background-color: rgba(0, 0, 0, 0.85);
  // background: $--player-control-panel-bg;
  opacity: 0;
  transition: 0.3s;
  @include scrollbar(rgba(170, 173, 199, 0.2));
}

.c-pc-player-time-axis-mark-container__panel-item {
  display: flex;
  margin-bottom: 18px;
  &:last-child {
    margin-bottom: 0;
  }
}

.c-pc-player-time-axis-mark-container__panel-item__img {
  width: 84px;
  height: 48px;
  margin-right: 8px;
  border-radius: 2px;
}

.c-pc-player-time-axis-mark-container__panel-item__desc {
  overflow: hidden;
}
.c-pc-player-time-axis-mark-container__panel-item__desc__title {
  margin-bottom: 2px;
  font-size: 12px;
  font-weight: bold;
  line-height: 22px;
}

.c-pc-player-time-axis-mark-container__panel-item__desc__time {
  font-size: 12px;
  line-height: 1;
  opacity: 0.6;
}

.c-pc-player-time-axis-mark-container__panel-empty {
  color: $--color-white;
}
</style>
