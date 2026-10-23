<!-- @file mobile 端播放器时间轴-进度条标记点列表 -->

<template>
  <div
    v-if="mergeTimeAxisMarkList.length"
    class="c-mobile-player-time-axis-mark-point__list"
  >
    <!-- 时间轴标记点-点位 -->
    <div
      v-for="markPoint in mergeTimeAxisMarkList"
      :key="markPoint.id"
      class="c-mobile-player-time-axis-mark-point"
      :class="{
        'c-mobile-player-time-axis-mark-point__hideBg': !props.topDotVisible,
      }"
      :style="{
        left: `${getFirstMarkPointDetail(markPoint).percents * 100}%`,
      }"
      @click.stop="markPointClickHandler(markPoint)"
    >
      <template v-if="props.topDotVisible">
        <!-- 当前标记点只有一条详情数据时，展示占位点 -->
        <span
          v-if="markPoint.details.length === 1"
          class="c-mobile-player-time-axis-mark-point__inner_dot"
        ></span>
        <!-- 当前标记点有多条详情数据时，展示数字 -->
        <span
          v-else
          class="c-mobile-player-time-axis-mark-point__num"
        >
          {{ markPoint.details.length }}
        </span>
      </template>

      <!-- 时间轴/滚动条 上的分割线 -->
      <span class="c-mobile-player-time-axis-mark-point__splitLine"></span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropUtils, emitFunc } from '@polyv/vue-components';

import {
  TimeAxisMarkMergedListItem,
  useTimeAxisMarkHook,
} from '@/components/page-watch-common/player/player-time-axis-mark/use-time-axis-mark';
import { TimeAxisMarkInfo } from '@polyv/live-watch-sdk';

const props = defineProps({
  topDotVisible: PropUtils.bool.def(false),
  containerEl: PropUtils.oneOfType<HTMLElement>([HTMLElement]).def(),
});

const emits = defineEmits({
  'mark-point-update': emitFunc<TimeAxisMarkInfo>(),
});

const {
  mergeTimeAxisMarkList,

  getFirstMarkPointDetail,
  toSeekByTimeAxisMark,
} = useTimeAxisMarkHook({
  getContainerWidth: () => props.containerEl.clientWidth || 0,
  getContainerEl: () => props.containerEl,
});

function emitMarkPoint(markPointDetail: TimeAxisMarkInfo) {
  toSeekByTimeAxisMark(markPointDetail);
  emits('mark-point-update', markPointDetail);
}

function markPointClickHandler(markPoint: TimeAxisMarkMergedListItem) {
  const markPointDetail = getFirstMarkPointDetail(markPoint);
  emitMarkPoint(markPointDetail);
}
</script>

<style lang="scss">
.c-mobile-player-time-axis-mark-point__list {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  margin-bottom: -12px;
}

.c-mobile-player-time-axis-mark-point {
  position: absolute;
  bottom: 100%;
  width: 16px;
  height: 19px;
  margin-bottom: 2px;
  margin-left: -8px;
  text-align: center;
  background-image: url(./imgs/mobile-player-time-axis-mark-point.png);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100% 100%;
  opacity: 0.8;

  &.c-mobile-player-time-axis-mark-point__hideBg {
    background-size: 0;
  }

  .c-mobile-player-time-axis-mark-point__inner_dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-top: 5px;
    vertical-align: top;
    background-color: #333;
    border-radius: 50%;
  }

  .c-mobile-player-time-axis-mark-point__num {
    font-size: 12px;
    line-height: 16px;
    color: #333;
  }

  .c-mobile-player-time-axis-mark-point__splitLine {
    position: absolute;
    top: 100%;
    left: 50%;
    width: 2px;
    height: 2px;
    margin-top: 4px;
    background-color: #fff;
    transform: translate(-50%, -50%);
  }
}
</style>
