<!-- @file 移动端-竖屏-微活动主体组件 -->
<template>
  <mobile-popup
    ref="popupRef"
    class="c-portrait-micro-activity"
    :theme="PopupTheme.PortraitLight"
    :title="microActivityTitle"
    :visible="popupVisible"
    :draggable="true"
    :content-percent-top="popupContentPercentTop"
    @drag-vertical="popupTranslateHandler"
    @after-leave="handlePortraitMicroActivityVisible(false)"
  >
    <div class="c-portrait-micro-activity__inner">
      <iframe
        v-if="iframeUrl"
        ref="microActivityIframeRef"
        class="c-portrait-micro-activity__iframe"
        allow="gyroscope; accelerometer; xr"
        :src="iframeUrl"
        :style="{ height: displayIframeHeight }"
      ></iframe>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PopupTheme } from '@/components/common-base/popup/types';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { useMicroActivityHook } from '../hooks/use-micro-activity';

const { microActivityTitle } = storeDefinitionToRefs(useMicroActivityStore);

const popupRef = ref<InstanceType<typeof MobilePopup>>();
const popupVisible = ref(false);
const popupContentPercentTop = ref(0.2);
const displayIframeHeight = ref('100%');

const {
  iframeUrl,
  microActivityIframeRef,

  updateIframeUrl,
} = useMicroActivityHook({});

useEventBusListener(
  appEvents.microActivity.OpenPortraitMicroActivity,
  handlePortraitMicroActivityVisible,
);

onMounted(() => {
  updateIframeUrl();
  displayIframeHeight.value = getDefaultDisplayIframeHeight();
});

/** 微活动主体显示/隐藏钩子 */
async function handlePortraitMicroActivityVisible(visible = true) {
  popupVisible.value = visible;
  if (visible) {
    updateIframeUrl();
    displayIframeHeight.value = getDefaultDisplayIframeHeight();
  }
}

/** 获取 iframe 默认高度 */
function getDefaultDisplayIframeHeight() {
  return `${(1 - popupContentPercentTop.value) * 100}%`;
}

/** popup translate emit 钩子 */
function popupTranslateHandler({ translateY }: { translateY: number }) {
  displayIframeHeight.value = `calc(${getDefaultDisplayIframeHeight()} - ${translateY}px)`;
}
</script>

<style lang="scss">
.c-portrait-micro-activity__inner {
  width: 100%;
  height: 100%;
}
.c-portrait-micro-activity__iframe {
  width: 100%;
  overflow: auto;
  border: none;
  transition: all 0.3s ease;
  -webkit-overflow-scrolling: touch;
}
</style>
