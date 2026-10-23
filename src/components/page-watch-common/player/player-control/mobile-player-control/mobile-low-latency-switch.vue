<!-- @file 移动端延迟模式切换 -->
<template>
  <div
    ref="wrapRef"
    class="c-mobile-low-latency-switch"
    @click.stop
  >
    <div
      class="c-mobile-low-latency-switch__btn"
      @click="togglePopup"
    >
      <span>
        {{ isLowLatency ? $lang('player.latencyMode.low') : $lang('player.latencyMode.normal') }}
      </span>
    </div>

    <div
      v-show="popupVisible"
      class="c-mobile-low-latency-switch__popper"
    >
      <div
        v-for="(item, index) in latencyModeSettingList"
        :key="index"
        class="c-mobile-low-latency-switch__popper__item"
        :class="{
          'c-mobile-low-latency-switch__popper__item--active': item.active,
        }"
        @click="clickItem(item.value)"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { ref } from 'vue';
import { usePlayerAction } from '../../hooks/use-player-action';
import { usePlayerControl } from '../../hooks/use-player-control';

const { isLowLatency } = storeDefinitionToRefs(usePlayerStore);

const { visible: popupVisible, close: closePopup, toggle: togglePopup } = useSimpleVisible(false);

const { latencyModeSettingList } = usePlayerControl();

const { toSetLowLowLatency } = usePlayerAction();

function clickItem(isLowLatency: boolean) {
  toSetLowLowLatency(isLowLatency);
  closePopup();
}

const wrapRef = ref<HTMLDivElement>();

useClickOutside(wrapRef, () => {
  closePopup();
});
</script>

<style lang="scss">
.c-mobile-low-latency-switch {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 400;
  color: $--color-white;
}

.c-mobile-low-latency-switch__btn {
  box-sizing: border-box;
  height: 24px;
  padding-right: 24px;
  padding-left: 12px;
  line-height: 22px;
  border: 1px solid $--color-white;
  border-radius: 12px;

  &::after {
    position: absolute;
    top: 10px;
    right: 11px;
    content: '';
    border: 3px solid transparent;
    border-top: 5px solid $--color-white;
  }
}

.c-mobile-low-latency-switch__popper {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 2px;

  &::before {
    position: absolute;
    right: 31px;
    bottom: 100%;
    content: '';
    border: 4px solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.6);
  }
}

.c-mobile-low-latency-switch__popper__item {
  position: relative;
  padding: 10px 16px 10px 24px;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
}

.c-mobile-low-latency-switch__popper__item--active::before {
  position: absolute;
  top: 50%;
  left: 8px;
  width: 12px;
  height: 12px;
  content: '';
  background-image: url(./imgs/low-latency-active.png);
  background-size: 100% 100%;
  transform: translateY(-50%);
}
</style>
