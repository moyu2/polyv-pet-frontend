<!-- @file PC 端回到顶部按钮 -->
<template>
  <transition name="fade">
    <pwc-tooltip
      v-if="backTopVisible"
      :content="$lang('base.backTop')"
      effect="dark"
      placement="left"
    >
      <div
        class="c-fixed-widget-button"
        @click="toBackTopPage"
      >
        <pc-icon-back-top />
      </div>
    </pwc-tooltip>
  </transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { isFunction } from 'lodash-es';
import { PwcTooltip } from '@polyv/vue-components';
import { PcIconBackTop } from '@/components/component-icons/pc/map';

const { scrollIntoView, getAppRootElement } = useMultiPolyvWatchApp();

/** 回到顶部显示状态 */
const backTopVisible = ref(false);

/** 检查回到顶部显示状态 */
function checkBackTop() {
  const $el = getAppRootElement();
  // console.warn('checkBackTop', $el.scrollHeight, $el.scrollTop);
  if ($el.scrollHeight > window.innerHeight && $el.scrollTop > 0) {
    backTopVisible.value = true;
  } else {
    backTopVisible.value = false;
  }
}

/** 将页面置顶 */
function toBackTopPage() {
  if (isFunction(document.documentElement.scrollIntoView)) {
    scrollIntoView(document.documentElement, { behavior: 'smooth' });
  } else {
    document.documentElement.scrollTop = 0;
  }
}

onMounted(() => {
  document.addEventListener('scroll', checkBackTop);
  checkBackTop();
});

onBeforeUnmount(() => {
  document.removeEventListener('scroll', checkBackTop);
});
</script>
