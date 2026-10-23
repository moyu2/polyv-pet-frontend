<!-- @file 移动端-竖屏-微活动挂件 -->
<template>
  <div
    class="c-portrait-micro-activity-pendant"
    @click="showMicroActivity"
    :style="iconStyle"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { appEvents } from '@/app/app-events';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import { CSSProperties } from 'vue/types/jsx';
import { useGlobalInject } from '@/app/use-global-inject';

const microActivityStore = useMicroActivityStore();

const iconStyle = computed<CSSProperties>(() => {
  return {
    'background-image': `url(${microActivityStore.microActivityPendantIcon})`,
  };
});

const { getEmitter } = useGlobalInject();

function showMicroActivity() {
  getEmitter().emit(appEvents.microActivity.OpenPortraitMicroActivity, true);
}
</script>

<style lang="scss">
.c-portrait-micro-activity-pendant {
  z-index: 110;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
