<!-- @file PC 端音量设置 -->
<template>
  <div class="c-pc-player-control__volume-setting">
    <div class="c-pc-player-control__volume-setting__content">
      <div
        class="c-pc-player-control__button"
        :class="{
          'c-pc-player-control__button--volume-setting': !isVolumeMute,
          'c-pc-player-control__button--volume-mute': isVolumeMute,
        }"
        data-testid="plv-player-volume-toggle-btn"
        @click="onClickVolumeButton"
      ></div>

      <div class="c-pc-player-control__volume-setting__panel">
        <div class="c-pc-player-control__volume-setting__panel__percent">{{ volumeText }}</div>
        <div class="c-pc-player-control__volume-setting__panel__slider-bar">
          <slider-bar
            :data-test-id="'plv-player-volume-slide-bar'"
            direction="vertical"
            :min="0"
            :max="1"
            :value="currentVolume"
            @drag-change="onVolumeChange"
          />
        </div>
      </div>
    </div>

    <div
      v-if="muteTipsVisible && isVolumeMute"
      class="c-pc-player-control__tips c-pc-player-control__tips--volume"
    >
      {{ $lang('player.volumeTips1') }}
      <span
        class="c-pc-player-control__tips__highlight"
        @click="onClickVolumeTips"
      >
        {{ $lang('player.volumeTips2') }}
      </span>
      <pc-icon-close
        class="c-pc-player-control__tips__close"
        @click.native="closeMuteTips"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconClose } from '@/components/component-icons/pc/map';
import SliderBar from '@/components/common-base/slider-bar/slider-bar.vue';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { computed, unref } from 'vue';
import { numberToFixed } from '@/assets/utils/number';

const { currentVolume } = storeDefinitionToRefs(usePlayerStore);

const { toChangeVolume } = usePlayerAction();

const volumeText = computed(() => {
  return `${numberToFixed(unref(currentVolume) * 100, 0)}%`;
});

/** 当前是否处于静音状态 */
const isVolumeMute = computed(() => {
  return unref(currentVolume) === 0;
});

function onVolumeChange(volume: number) {
  toChangeVolume(volume);
}

let recordVolume: number | undefined;

/** 设为静音 */
function toMuteVolume() {
  recordVolume = unref(currentVolume);
  toChangeVolume(0);
}

/** 取消静音 */
function toCancelMuteVolume() {
  const volume = recordVolume || 0.5;
  toChangeVolume(volume);
}

function onClickVolumeButton() {
  if (unref(isVolumeMute)) {
    toCancelMuteVolume();
  } else {
    toMuteVolume();
  }
}

const { visible: muteTipsVisible, close: closeMuteTips } = useSimpleVisible(true);

function onClickVolumeTips() {
  toCancelMuteVolume();
  closeMuteTips();
}
</script>

<style lang="scss">
.c-pc-player-control__volume-setting__content {
  position: relative;
}
.c-pc-player-control__button--volume-setting {
  background-image: url(./imgs/pc-player-ui-sound.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-sound-hover.png);
  }
}

.c-pc-player-control__button--volume-mute {
  background-image: url(./imgs/pc-player-ui-sound-mute.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-sound-mute-hover.png);
  }
}

.c-pc-player-control__volume-setting__panel {
  position: absolute;
  bottom: 100%;
  left: 50%;
  z-index: 10;
  width: 62px;
  height: 182px;
  pointer-events: none;
  background: $--player-control-panel-bg;
  border-radius: 2px;
  opacity: 0;
  transition: 0.3s;
  transform: translateX(-50%);
}
.c-pc-player-control__volume-setting__panel__percent {
  position: absolute;
  top: 16px;
  width: 100%;
  font-size: 14px;
  color: #fff;
  text-align: center;
  user-select: none;
}
.c-pc-player-control__volume-setting__panel__slider-bar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  height: 120px;
  transform: translateX(-50%);
}
.c-pc-player-control__volume-setting__content:hover {
  .c-pc-player-control__button--volume-setting {
    background-image: url(./imgs/pc-player-ui-sound-hover.png);
  }
  .c-pc-player-control__button--volume-mute {
    background-image: url(./imgs/pc-player-ui-sound-mute-hover.png);
  }
  .c-pc-player-control__volume-setting__panel {
    pointer-events: initial;
    opacity: 1;
  }
}

.c-pc-player-control__tips--volume {
  position: absolute;
  right: 0;
  bottom: 100%;
  transform: translateY(-8px);
  span {
    cursor: pointer;
  }
}
</style>
