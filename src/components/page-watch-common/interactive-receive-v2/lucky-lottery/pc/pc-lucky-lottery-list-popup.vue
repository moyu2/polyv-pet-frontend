<!-- PC 平台抽奖活动列表 -->
<template>
  <div
    ref="popupRef"
    class="c-pc-lucky-lottery-list-popup"
  >
    <iar-pc-lucky-lottery-list-popup
      v-if="targetInited"
      :lucky-lottery-target="getIarTarget()"
      :popup-config="popupConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, unref } from 'vue';
import { useLotteryTarget } from '../use-lucky-lottery';
import { useIarUILoader } from '../../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarPcLuckyLotteryListPopup = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-list'),
);
const { targetInited, getIarTarget } = useLotteryTarget();

const popupRef = ref<HTMLElement>();

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
  .c-pc-lucky-lottery-list-popup {
    .plv-iar-mobile-lucky-lottery-list {
      display: block;
    }
  }
}
</style>
