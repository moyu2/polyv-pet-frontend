<!-- PC 平台抽奖活动详情 -->
<template>
  <div
    ref="popupRef"
    class="c-pc-lucky-lottery-detail-popup"
  >
    <iar-pc-lucky-lottery-detail-popup
      v-if="targetInited"
      :lucky-lottery-target="getIarTarget()"
      :popup-config="popupConfig"
      append-to-class=".c-pc-lucky-lottery-detail-popup"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, computed, unref, watchEffect } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useLotteryTarget } from '../use-lucky-lottery';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarPcLuckyLotteryDetailPopup = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-detail'),
);

const { targetInited, getIarTarget } = useLotteryTarget();

const popupRef = ref<HTMLElement>();

watchEffect(() => {
  console.info('unref(popupRef)', unref(popupRef), Object.prototype.toString.call(unref(popupRef)));
});

const popupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(popupRef),
    showModal: false,
  };
});
</script>

<style lang="scss">
@media screen and (min-aspect-ratio: 4/3) {
  .c-pc-lucky-lottery-detail-popup {
    .plv-iar-lucky-lottery-detail-popup {
      display: block;
    }
  }
}
</style>
