<!-- @file 移动端直播倒计时 -->
<template>
  <div class="c-live-count-down">
    <div
      v-if="showTitle"
      class="c-live-count-down__title pws-dark-white-color-80 pws-light-black-color-40"
    >
      {{ $lang('watch.liveTimeTitle') }}
    </div>
    <count-down
      :end-timestamp="liveStartTime"
      size="small"
      :theme="theme"
      :count-style="countStyle"
      :hide-zero-days="theme === 'text'"
      @count-down-change="onCountDownChange"
      @count-down-finish="onCountDownFinish"
    />
  </div>
</template>

<script setup lang="ts">
import { type CSSProperties } from 'vue';
import { PropUtils } from '@polyv/vue-components';
import CountDown from '@/components/common-base/count-down/count-down.vue';
import { countdownThemes } from '@/components/common-base/count-down/types';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveCountDown } from './use-live-count-down';

defineProps({
  /** 倒计时样式，square-方形，text-文本，默认：square */
  theme: PropUtils.oneOf(countdownThemes).def('square'),
  /** 显示标题 */
  showTitle: PropUtils.bool.def(false),

  countStyle: PropUtils.object<CSSProperties>().def({}),
});

const { liveStartTime } = storeDefinitionToRefs(useChannelInfoStore);

const { onCountDownChange, onCountDownFinish } = useLiveCountDown();
</script>

<style lang="scss">
.c-live-count-down__title {
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 18px;
  text-align: left;
}
</style>
