<!-- @file PC 端直播开始提示窗 -->
<template>
  <pc-dialog
    :visible.sync="tipsVisible"
    class="c-pc-live-start-tips"
    :title="$lang('base.warmTips')"
    :width="360"
  >
    <div class="c-pc-live-start-tips__content">
      <div class="c-pc-live-start-tips__content__text">{{ $lang('live.goLive') }}</div>
      <normal-button
        class="c-pc-live-start-tips__content__button"
        :text="buttonText"
        :size="ButtonSize.Small"
        @click="onBtnClick"
      />
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { useLiveStartTips } from './use-live-start-tips';
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue';
import { translate } from '@/assets/lang';

const { tipsVisible, closeTips, fallbackReloadPage } = useLiveStartTips();

const timeCount = ref(3);

const buttonText = computed(() => {
  return `${translate('base.enterLive')}(${unref(timeCount)}s)`;
});

let timer: number | undefined;

/** 初始化定时器 */
function initTimeCount() {
  removeTimerCount();
  timeCount.value = 3;
  timer = window.setInterval(() => {
    timeCount.value -= 1;

    if (timeCount.value === 0) {
      removeTimerCount();
      closeTips();
      fallbackReloadPage();
    }
  }, 1000);
}

/** 移除定时器 */
function removeTimerCount() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

function onBtnClick() {
  closeTips();
  fallbackReloadPage();
}

watch(
  () => unref(tipsVisible),
  () => {
    if (unref(tipsVisible)) {
      initTimeCount();
    } else {
      removeTimerCount();
    }
  },
);

onBeforeUnmount(() => {
  removeTimerCount();
});
</script>

<style lang="scss">
.c-pc-live-start-tips__content {
  padding: 40px 0;
  font-size: 14px;
  color: $--font-color-primary;
  text-align: center;
}
.c-pc-live-start-tips__content__button {
  margin-top: 24px;
}
</style>
