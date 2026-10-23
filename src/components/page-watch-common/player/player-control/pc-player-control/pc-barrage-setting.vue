<!-- @file PC 端弹幕设置面板 -->
<template>
  <div class="c-pc-barrage-setting">
    <!-- 按钮 -->
    <pc-icon-barrage-setting
      class="c-pc-player-control__button c-pc-player-control__button--barrage"
      color="#fff"
    />
    <!-- 悬浮面板 -->
    <div class="c-pc-barrage-setting__panel">
      <!-- 顶部说明操作栏 -->
      <div class="c-pc-barrage-setting__panel__top">
        <span class="c-pc-barrage-setting__panel__top__left">{{ $lang('barrage.setting') }}</span>
        <div
          class="c-pc-barrage-setting__panel__top__right"
          @click="resetAllSetting"
        >
          <span>{{ $lang('barrage.setting.recover') }}</span>
          <img
            class="c-pc-barrage-setting__panel__top__right__img"
            src="../../imgs/icon-danmu-reset.png"
          />
        </div>
      </div>
      <!-- 弹幕位置 -->
      <div
        v-if="barrageLocationButtonVisible"
        class="c-pc-barrage-setting__panel__option"
      >
        <div class="c-pc-barrage-setting__label">
          {{ $lang('barrage.location') }}
        </div>
        <div class="c-pc-barrage-setting__item">
          <div
            v-for="(item, index) in barrageLocationSetting"
            :key="index"
            :class="[
              'c-pc-barrage-setting__item__local',
              {
                'c-pc-barrage-setting__item__local--active': index === currentBarrageLocationIndex,
              },
            ]"
            @click="handleBarrageLocationChange(item)"
          >
            <pc-barrage-location-button :button-type="item.type" />
            <span class="c-pc-barrage-setting__item__local__text">{{
              $lang(`barrage.location.${item.type}`)
            }}</span>
          </div>
        </div>
      </div>
      <!--弹幕字号-->
      <div
        v-if="barrageSizeButtonVisible"
        class="c-pc-barrage-setting__panel__option"
      >
        <div class="c-pc-barrage-setting__label">
          {{ $lang('barrage.size') }}
        </div>
        <div class="c-pc-barrage-setting__item">
          <plv-slider
            show-stops
            :min="1"
            :max="5"
            :step="1"
            :marks="barrageSizeMark"
            :progress-bar-visible="false"
            :hot-area-height="36"
            :value="formattedBarrageSizeToSliderValue"
            @input="handleBarrageSizeChange"
          />
        </div>
      </div>
      <!--弹幕速度-->
      <div
        v-if="barrageSpeedButtonVisible"
        class="c-pc-barrage-setting__panel__option"
      >
        <div class="c-pc-barrage-setting__label">
          {{ $lang('barrage.speed') }}
        </div>
        <div class="c-pc-barrage-setting__item">
          <plv-slider
            show-stops
            :min="1"
            :max="5"
            :step="1"
            :marks="barrageSpeedMark"
            :progress-bar-visible="false"
            :hot-area-height="36"
            :value="formattedBarrageSpeedToSliderValue"
            @input="handleBarrageSpeedChange"
          />
        </div>
      </div>
      <!--弹幕透明度-->
      <div
        v-if="barrageAlphaButtonVisible"
        class="c-pc-barrage-setting__panel__option c-pc-barrage-setting__panel__option__alpha"
      >
        <div class="c-pc-barrage-setting__label">
          {{ $lang('barrage.alpha') }}
        </div>
        <div class="c-pc-barrage-setting__item">
          <plv-slider
            :progress-bar-visible="false"
            :hot-area-height="36"
            :value="barrageAlpha"
            @input="handleBarrageAlphaChange"
          />
          <span class="c-pc-barrage-setting__desc">{{ barrageAlpha }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconBarrageSetting } from '@/components/component-icons/pc/map';
import { PlvSlider } from '@/plugins/polyv-ui/admin-import';
import { useBarrageSetting } from '../../hooks/use-barrage-setting';
import { usePlayerControl } from '../../hooks/use-player-control';
import PcBarrageLocationButton from './pc-barrage-location-button.vue';

const {
  barrageSizeButtonVisible,
  barrageSpeedButtonVisible,
  barrageAlphaButtonVisible,
  barrageLocationButtonVisible,
} = usePlayerControl();

const {
  barrageSpeedMark,
  formattedBarrageSpeedToSliderValue,
  handleBarrageSpeedChange,
  formattedBarrageSizeToSliderValue,
  barrageSizeMark,
  handleBarrageSizeChange,
  barrageAlpha,
  handleBarrageAlphaChange,
  handleBarrageLocationChange,
  barrageLocationSetting,
  currentBarrageLocationIndex,
  resetAllSetting,
} = useBarrageSetting();
</script>

<style lang="scss">
.c-pc-barrage-setting {
  position: relative;
}
.c-pc-barrage-setting:hover {
  color: #3082fe;
  .c-pc-barrage-setting__panel {
    pointer-events: initial;
    opacity: 1;
  }
}
.c-pc-barrage-setting__panel {
  position: absolute;
  bottom: 100%;
  left: 50%;
  box-sizing: border-box;
  width: 360px;
  padding: 24px;
  color: $--color-white;
  pointer-events: none;
  cursor: default;
  background: $--player-control-panel-bg;
  border-radius: 2px;
  opacity: 0;
  transition: 0.3s;
  transform: translateX(-50%);
}
.c-pc-barrage-setting__panel__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 29px;
}
.c-pc-barrage-setting__panel__top__left {
  font-size: 16px;
}
.c-pc-barrage-setting__panel__top__right {
  position: relative;
  cursor: pointer;

  span {
    margin-right: 8px;
  }

  .c-pc-barrage-setting__panel__top__right__img {
    width: 16px;
    height: 16px;
  }
}
.c-pc-barrage-setting__panel__option:not(:last-child) {
  margin-bottom: 20px;
}
.c-pc-barrage-setting__panel__option:nth-child(3) {
  margin-bottom: 28px;
}
.c-pc-barrage-setting__panel__option:nth-child(4) {
  margin-bottom: 28px;
}
.c-pc-barrage-setting__label {
  margin-bottom: 12px;
}
.c-pc-barrage-setting__item {
  display: inline-flex;
  width: 100%;
}
.c-pc-barrage-setting__item__local {
  display: flex;
  flex-direction: column;
  margin-right: 28px;
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;
  opacity: 0.5;
}
.c-pc-barrage-setting__item__local--active {
  color: #2196f3;
  opacity: 1;
}
.c-pc-barrage-setting__item__local__text {
  margin-top: 4px;
  font-size: 12px;
}
.c-pc-barrage-setting__panel {
  .plv-slider {
    flex-grow: 1;
    padding: 5px 7px;
  }
  .plv-slider__runway {
    background: #666;
  }
  .plv-slider .plv-slider__runway .plv-slider__runway__dot {
    z-index: 10;
    opacity: 0.5;
  }
  .plv-slider__button .plv-slider__button__inner {
    background-color: #2196f3;
    border-color: #2196f3;
  }
  .plv-slider__runway::before,
  .plv-slider__runway::after {
    position: absolute;
    z-index: 1;
    width: 4px;
    height: 4px;
    pointer-events: none;
    content: '';
    background: #fff;
    border-radius: 50%;
    opacity: 0.5;
    -webkit-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    transform: translateX(-50%);
  }
  .plv-slider__runway::before {
    left: 2px;
  }
  .plv-slider__runway::after {
    right: -2px;
  }
  .plv-slider__marks__item {
    font-size: 12px;
  }
}
.c-pc-barrage-setting__panel__option__alpha {
  .plv-slider {
    padding: 5px 7px 5px 0;
  }
}
.c-pc-barrage-setting__desc {
  box-sizing: border-box;
  width: 38px;
  font-size: 12px;
  text-align: right;
}
</style>
