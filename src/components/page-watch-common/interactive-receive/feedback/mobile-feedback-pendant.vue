<!-- @file 投诉反馈挂件 -->
<template>
  <div
    class="c-mobile-feedback-pendant"
    @click="onClickFeedback"
    :style="backgroundStyle"
  ></div>
</template>

<script setup lang="ts">
import { CSSProperties, computed } from 'vue';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useThemeStore } from '@/store/use-theme-store';

const { getEmitter } = useGlobalInject();

/** 点击投诉反馈 */
function onClickFeedback() {
  getEmitter().emit(appEvents.interaction.OpenFeedback, true);
}

const themeStore = useThemeStore();

const backgroundStyle = computed<CSSProperties>(() => {
  if (!themeStore.watchThemeStyleConfig) return {};

  return {
    'background-image': `url(${themeStore.watchThemeStyleConfig.common.pendant.feedback})`,
  };
});
</script>

<style lang="scss">
.c-mobile-feedback-pendant {
  width: $pendant-size;
  height: $pendant-size;
  background-color: transparent;
  background-image: url(./images/icon-feedback.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
