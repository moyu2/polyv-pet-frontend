<!-- @file 移动端播放器弹幕设置面板 -->
<template>
  <div
    class="c-mobile-player-barrage-setting"
    @click.self="closeBarrageSetting"
  >
    <div
      class="c-mobile-player-barrage-setting__wrap"
      @click.self="closeBarrageSetting"
    >
      <div class="c-mobile-player-barrage-setting__content">
        <!-- 顶部说明操作栏 -->
        <div class="c-mobile-player-barrage-setting__content__top">
          <span class="c-mobile-player-barrage-setting__content__top__left">
            {{ $lang('barrage.setting') }}
          </span>
          <div
            class="c-mobile-player-barrage-setting__content__top__right"
            @click="resetAllSetting"
          >
            <span>{{ $lang('barrage.setting.recover') }}</span>
            <img
              class="c-mobile-player-barrage-setting__content__top__right__img"
              src="../../imgs/icon-danmu-reset.png"
            />
          </div>
        </div>
        <!-- 弹幕位置 -->
        <div
          v-if="barrageLocationButtonVisible"
          class="c-mobile-player-barrage-setting__content__option"
        >
          <div class="c-mobile-player-barrage-setting__label">
            {{ $lang('barrage.location') }}
          </div>
          <div
            class="c-mobile-player-barrage-setting__item c-mobile-player-barrage-setting__item--location"
          >
            <div
              v-for="(item, index) in barrageLocationSetting"
              :key="index"
              class="c-mobile-player-barrage-setting__item__local"
              :class="{
                'c-mobile-player-barrage-setting__item__local--active':
                  index === currentBarrageLocationIndex,
              }"
              @click="handleBarrageLocationChange(item)"
            >
              {{ $lang(`barrage.location.${item.type}`) }}
            </div>
          </div>
        </div>
        <!-- 弹幕字号 -->
        <div
          v-if="barrageSizeButtonVisible"
          class="c-mobile-player-barrage-setting__content__option"
        >
          <div class="c-mobile-player-barrage-setting__label">{{ $lang('barrage.size') }}</div>
          <div class="c-mobile-player-barrage-setting__item">
            <plv-slider
              show-stops
              :css-rotate-angle="isVerticalScreenOrientation && isPlayerFullscreen ? 90 : 0"
              :min="1"
              :max="5"
              :step="1"
              :progress-bar-visible="false"
              :hot-area-height="44"
              :value="formattedBarrageSizeToSliderValue"
              @input="handleBarrageSizeChange"
            />
            <span class="c-mobile-player-barrage-setting__desc">{{
              formattedBarrageSizeToText
            }}</span>
          </div>
        </div>
        <!-- 弹幕速度 -->
        <div
          v-if="barrageSpeedButtonVisible"
          class="c-mobile-player-barrage-setting__content__option"
        >
          <div class="c-mobile-player-barrage-setting__label">{{ $lang('barrage.speed') }}</div>
          <div class="c-mobile-player-barrage-setting__item">
            <plv-slider
              show-stops
              :css-rotate-angle="isVerticalScreenOrientation && isPlayerFullscreen ? 90 : 0"
              :min="1"
              :max="5"
              :step="1"
              :progress-bar-visible="false"
              :hot-area-height="44"
              :value="formattedBarrageSpeedToSliderValue"
              @input="handleBarrageSpeedChange"
            />
            <span class="c-mobile-player-barrage-setting__desc">{{
              formattedBarrageSpeedToText
            }}</span>
          </div>
        </div>
        <!--弹幕透明度-->
        <div
          v-if="barrageAlphaButtonVisible"
          class="c-mobile-player-barrage-setting__content__option"
        >
          <div class="c-mobile-player-barrage-setting__label">
            {{ $lang('barrage.alpha') }}
          </div>
          <div class="c-mobile-player-barrage-setting__item">
            <plv-slider
              :progress-bar-visible="false"
              :hot-area-height="36"
              :value="barrageAlpha"
              :css-rotate-angle="isVerticalScreenOrientation && isPlayerFullscreen ? 90 : 0"
              @input="handleBarrageAlphaChange"
            />
            <span
              class="c-mobile-player-barrage-setting__desc c-mobile-player-barrage-setting__desc--alpha"
            >
              {{ barrageAlpha }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { PlvSlider } from '@/plugins/polyv-ui/admin-import';
import { useBarrageSetting } from '../../hooks/use-barrage-setting';
import { usePlayerAction } from '../../hooks/use-player-action';
import { usePlayerControl } from '../../hooks/use-player-control';

const { toToggleBarrageMobileSettingVisible } = usePlayerAction();

const {
  barrageSizeButtonVisible,
  barrageSpeedButtonVisible,
  barrageAlphaButtonVisible,
  barrageLocationButtonVisible,
} = usePlayerControl();

const {
  formattedBarrageSpeedToSliderValue,
  formattedBarrageSpeedToText,
  handleBarrageSpeedChange,
  formattedBarrageSizeToSliderValue,
  formattedBarrageSizeToText,
  handleBarrageSizeChange,
  barrageAlpha,
  handleBarrageAlphaChange,
  handleBarrageLocationChange,
  barrageLocationSetting,
  currentBarrageLocationIndex,
  resetAllSetting,
} = useBarrageSetting();

const {
  mobilePlayerIsPageFullscreen,
  isVerticalScreenOrientation,
  mobileNormalLatencyPlayerIsFullscreen,
} = storeDefinitionToRefs(useLayoutStore);

const isPlayerFullscreen = computed(() => {
  return mobilePlayerIsPageFullscreen.value || mobileNormalLatencyPlayerIsFullscreen.value;
});

watch(isVerticalScreenOrientation, newVal => {
  if (newVal && !isPlayerFullscreen.value) {
    toToggleBarrageMobileSettingVisible(false);
  }
});

function closeBarrageSetting() {
  toToggleBarrageMobileSettingVisible(false);
}
</script>

<style lang="scss">
.c-mobile-player-barrage-setting {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2003;
  width: 100%;
  height: 100%;
  color: #fff;
  pointer-events: initial;
}
// .c-mobile-player-barrage-setting--force-horizontal {
//   position: fixed;
//   top: calc((100vh - 100vw) / 2);
//   left: calc((100vw - 100vh) / 2);
//   z-index: 2003;
//   width: 100vh;
//   height: 100vw;
//   overflow: inherit;
//   transform: rotate3d(0, 0, 1, 90deg);
//   transform-origin: center center;
// }
.c-mobile-player-barrage-setting__wrap {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 393px;
  max-width: 90%;
  height: 100%;
  color: #fff;
  background: rgba(#000, 0.8);
  filter: blur(0);
}
.c-mobile-player-barrage-setting__content {
  width: 100%;
  padding: 0 58px 0 32px;
  font-size: 14px;
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
}
.c-mobile-player-barrage-setting__content__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 29px;
}
.c-mobile-player-barrage-setting__content__top__left {
  font-size: 16px;
}
.c-mobile-player-barrage-setting__content__top__right {
  position: relative;
  cursor: pointer;

  span {
    margin-right: 2px;
  }

  .c-mobile-player-barrage-setting__content__top__right__img {
    width: 16px;
    height: 16px;
  }
}
.c-mobile-player-barrage-setting__content__option:not(:last-child) {
  margin-bottom: 20px;
}
.c-mobile-player-barrage-setting__label {
  margin-bottom: 20px;
  font-size: 14px;
}
.c-mobile-player-barrage-setting__item {
  display: inline-flex;
  width: 100%;
}
.c-mobile-player-barrage-setting__item--location {
  justify-content: space-around;
}
.c-mobile-player-barrage-setting__item__local {
  box-sizing: border-box;
  padding: 5px 20px;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 13px;
}
.c-mobile-player-barrage-setting__item__local--active {
  color: #2196f3;
  border: 1px solid #2196f3;
}
.c-mobile-player-barrage-setting__desc {
  box-sizing: border-box;
  width: 40px;
  padding-left: 8px;
  text-align: center;
  white-space: nowrap;
}
.c-mobile-player-barrage-setting__desc--alpha {
  width: 50px;
}
@media screen and (max-height: 374px) {
  .c-mobile-player-barrage-setting__wrap {
    align-items: flex-start;
    overflow: auto;
  }

  .c-mobile-player-barrage-setting__content__top {
    padding-top: 24px;
  }

  .c-mobile-player-barrage-setting__content:last-child {
    padding-bottom: 24px;
  }
}
</style>
