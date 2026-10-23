<!-- @file PC 端互动二次入口 -->
<template>
  <div
    v-if="entrancesVisible"
    class="c-pc-interactive-entrance"
  >
    <pc-icon-arrow-left
      v-if="leftArrowVisible"
      class="c-pc-interactive-entrance__arrow c-pc-interactive-entrance__arrow__left pws-interactive-entrance-arrow"
      @click="onLeftArrowClick"
    />
    <div
      ref="scrollRef"
      class="c-pc-interactive-entrance__content"
      @scroll="onScrollEvent"
    >
      <div
        v-for="entranceData in interactiveEntrance"
        :key="entranceData.type"
        class="c-pc-interactive-entrance__button pws-interactive-entrance-button"
        @click="openInteractive(entranceData)"
      >
        <span
          class="c-pc-interactive-entrance__button__icon"
          :style="{
            backgroundImage: `url(${entranceData.icon})`,
          }"
        ></span>
        <span>{{ $lang(entranceData.name) }}</span>
      </div>
    </div>
    <pc-icon-arrow-right
      v-if="rightArrowVisible"
      class="c-pc-interactive-entrance__arrow c-pc-interactive-entrance__arrow__right pws-interactive-entrance-arrow"
      @click="onRightArrowClick"
    />
  </div>
</template>

<script setup lang="ts">
import { unref, watch, watchEffect } from 'vue';
import { PcIconArrowLeft, PcIconArrowRight } from '@/components/component-icons/pc/map';
import { useHorizontalScrollArrow } from '@/hooks/behaviors/use-scroll-arrow';
import { useInteractiveEntrance } from './use-interactive-entrance';

import { useLangStore } from '@/store/use-lang-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { interactiveEntrance } = storeDefinitionToRefs(useInteractReceiveStore);

const {
  scrollRef,
  leftArrowVisible,
  rightArrowVisible,
  resetArrowVisible,
  onScrollEvent,
  onLeftArrowClick,
  onRightArrowClick,
} = useHorizontalScrollArrow();

const { entrancesVisible, openInteractive } = useInteractiveEntrance();

watch(
  () => [unref(currentLang), unref(interactiveEntrance)],
  () => resetArrowVisible(),
);

watchEffect(() => {
  console.info('entrancesVisible', entrancesVisible.value, interactiveEntrance.value);
});
</script>

<style lang="scss">
.c-pc-interactive-entrance {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  padding: 8px 24px;
}

.c-pc-interactive-entrance__arrow {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 100%;
  font-size: 24px !important;
  cursor: pointer;
}

.c-pc-interactive-entrance__arrow__left {
  left: 0;
}
.c-pc-interactive-entrance__arrow__right {
  right: 0;
}

.c-pc-interactive-entrance__content {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  overflow-x: scroll;
  scrollbar-width: none;
  scroll-behavior: smooth;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.c-pc-interactive-entrance__button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  margin-right: 8px;
  font-size: 14px;
  line-height: 28px;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 14px;
}

.c-pc-interactive-entrance__button__icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  background-position: center;
  background-size: contain;
}
</style>
