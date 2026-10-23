<!-- @file 通用 loading 覆盖层（用于解决组件/SDK 未渲染前的短暂空白） -->
<template>
  <div
    v-if="visible"
    class="c-loading-overlay"
    :style="rootStyle"
  >
    <img
      class="c-loading-overlay__img"
      :src="loadingIcon"
      alt=""
      :style="spinnerStyle"
    />
    <div
      v-if="displayText"
      class="c-loading-overlay__text"
    >
      {{ displayText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CSSProperties } from 'vue/types/jsx';
import { loadingOverlayProps } from './use-loading-overlay';
import { translate } from '@/assets/lang';
import loadingIcon from './assets/loading.png';

const props = defineProps(loadingOverlayProps());

const rootStyle = computed<CSSProperties>(() => {
  return {
    ...props.overlayStyle,
    zIndex: props.zIndex,
    background: props.background,
  };
});

const spinnerStyle = computed<CSSProperties>(() => {
  const size = props.spinnerSize;
  return {
    width: `${size}px`,
    height: `${size}px`,
  };
});

const displayText = computed(() => {
  if (!props.showText) return '';
  return props.text || translate('base.loading') || '加载中';
});
</script>

<style lang="scss">
.c-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.c-loading-overlay__img {
  animation: plv-loading-overlay-spin 0.9s linear infinite;
}

.c-loading-overlay__text {
  margin-top: 12px;
  font-size: 12px;
  line-height: 17px;
  color: #fff;
  text-align: center;
}

@keyframes plv-loading-overlay-spin {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
