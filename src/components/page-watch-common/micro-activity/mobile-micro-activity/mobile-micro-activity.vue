<!-- @file 移动端-横屏-微活动 -->
<template>
  <div class="c-mobile-micro-activity">
    <iframe
      v-if="iframeUrl"
      ref="microActivityIframeRef"
      class="c-mobile-micro-activity__iframe"
      allow="gyroscope; accelerometer; xr"
      :src="iframeUrl"
      :style="{ height: displayIframeHeight }"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, unref, watch, onMounted } from 'vue';
import { $ } from '@polyv/utils/dom';
import { storeToRefs } from 'pinia';

import { PropUtils } from '@polyv/vue-components';
import { useLayoutStore } from '@/store/use-layout-store';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useMicroActivityHook } from '../hooks/use-micro-activity';

const { mobileWatchLayoutHeight } = storeToRefs(useLayoutStore());

const { scrollIntoView, getAppRootElement, getAppBodyElement } = useMultiPolyvWatchApp();

let $watchContainer: HTMLElement | null = null;
/**
 * 更新外部 Watch 根节点高度
 * @param {String} displayHeight
 * */
const updateWatchContainerHeight = (displayHeight: string, overflowHidden?: boolean) => {
  if (!$watchContainer) {
    $watchContainer = getAppRootElement().querySelector('.c-mobile-watch-layout');
  }
  if ($watchContainer) {
    $watchContainer.style.setProperty('height', displayHeight);
    if ($watchContainer.parentElement) {
      if (!overflowHidden) {
        $($watchContainer.parentElement).addClass('c-mobile-watch--no-flex');
      } else {
        $($watchContainer.parentElement).removeClass('c-mobile-watch--no-flex');
      }
    }
    $watchContainer.style.setProperty('overflow-y', overflowHidden ? 'hidden' : 'scroll');
  }
};

const props = defineProps({
  isActive: PropUtils.bool.def(false),
});

/** body 初始高度 */
const originBodyHeight = ref(0);
/** iframe 初始高度 */
const originIframeHeight = ref(0);
/** 用于展示的 iframe 高度 */
const displayIframeHeight = ref('100%');
/** 记录上一次 iframe 改变后的高度 */
const lastIframeHeight = ref(0);
/**
 * 是否需要在激活后支持页面全屏展示
 * @desc 虽然 iframe 默认用当前 Dom 的高度渲染，但在组件激活时需要根据相关的事件，判断当前是否要全屏展示，默认要全屏展示
 */
const needAutoFullHandlerTrigger = ref(true);

const {
  microActivityIframeRef,
  iframeUrl,

  updateIframeUrl,
} = useMicroActivityHook({
  fullScreenMessageHandler,
  halfScreenMessageHandler,
  forceFullScreenMessageHandler,
});

watch(
  () => props.isActive,
  () => {
    if (props.isActive) {
      // eslint-disable-next-line promise/prefer-await-to-then
      updateIframeUrl().then(() => {
        nextTick(() => {
          if (lastIframeHeight.value === 0) {
            // 如果没有上一次 iframe 高度，就重新获取
            const $iframe = unref(microActivityIframeRef);
            if (!$iframe) {
              console.warn('$iframe not found');
              return;
            }
            originIframeHeight.value = $iframe.clientHeight || 0;
            // originBodyHeight.value = document.body.clientHeight;
            originBodyHeight.value = mobileWatchLayoutHeight.value;

            if (needAutoFullHandlerTrigger.value) {
              fullScreenMessageHandler();
            }
          } else {
            updateScreenDomHeight(lastIframeHeight.value);
          }
        });
      });
    } else {
      nextTick(() => {
        recoverScreenDomHeight();
      });
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  updateIframeUrl();
});

/** 还原 DOM 原本状态 */
function recoverScreenDomHeight() {
  getAppBodyElement().style.removeProperty('overflow');
  getAppRootElement().style.removeProperty('overflow');

  updateWatchContainerHeight('100%', true);
  displayIframeHeight.value = '100%';
}

/**
 * 更新屏幕中需要改变的 DOM 高度
 * @param height iframe需要改变的高度
 */
function updateScreenDomHeight(height: number) {
  if (height < originIframeHeight.value) {
    recoverScreenDomHeight();
  } else {
    // console.warn({
    //   height,
    //   originIframeHeight: originIframeHeight.value,
    //   originBodyHeight: originBodyHeight.value,
    // });

    const offset = height - originIframeHeight.value;
    const displayBodyHeight = originBodyHeight.value + offset + 'px';

    displayIframeHeight.value = height + 'px';
    updateWatchContainerHeight(displayBodyHeight);

    getAppBodyElement().style.setProperty('overflow', 'scroll');
    getAppRootElement().style.setProperty('overflow', 'scroll');
  }

  lastIframeHeight.value = height;
}

function fullScreenMessageHandler() {
  needAutoFullHandlerTrigger.value = true;

  if (!props.isActive) {
    return;
  }

  const height = window.innerHeight;
  updateScreenDomHeight(height);
}

function halfScreenMessageHandler() {
  needAutoFullHandlerTrigger.value = false;

  if (!props.isActive) {
    return;
  }

  recoverScreenDomHeight();
  lastIframeHeight.value = 0;
}

function forceFullScreenMessageHandler() {
  if (!props.isActive) return;

  fullScreenMessageHandler();

  const $iframe = unref(microActivityIframeRef);
  if (!$iframe) {
    console.warn('$iframe not found');
    return;
  }

  scrollIntoView($iframe, { block: 'end' });

  // 保证滚动到底部
  document.documentElement.scrollTo({ top: window.innerHeight });
  document.documentElement.scrollTop = window.innerHeight;
  window.scrollTo({ top: window.innerHeight });

  setTimeout(() => {
    document.documentElement.style.setProperty('overflow', 'hidden');
  }, 0);
}
</script>

<style lang="scss">
.c-mobile-micro-activity {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.c-mobile-micro-activity__iframe {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: none;
  -webkit-overflow-scrolling: touch;
}
</style>
