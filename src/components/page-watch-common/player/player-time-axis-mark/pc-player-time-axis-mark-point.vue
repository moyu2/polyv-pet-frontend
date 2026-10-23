<!-- @file PC 端播放器时间轴-进度条标记点列表 -->

<template>
  <div
    v-if="mergeTimeAxisMarkList.length"
    class="c-pc-player-time-axis-mark-point__list"
    @mouseover="setMarkPointListHover(true)"
    @mouseout="setMarkPointListHover(false)"
  >
    <!-- 时间轴标记点-点位 -->
    <div
      v-for="markPoint in mergeTimeAxisMarkList"
      :key="markPoint.id"
      class="c-pc-player-time-axis-mark-point"
      :class="{
        'c-pc-player-time-axis-mark-point__activated':
          markPointListHover && isActivateMarkPoint(markPoint),
        'c-pc-player-time-axis-mark-point__hover': props.forceHover,
      }"
      :style="{
        left: `${getFirstMarkPointDetail(markPoint).percents * 100}%`,
      }"
      @mouseover="setActiveMarkPoint(markPoint)"
      @click.stop="markPointClickHandler(markPoint)"
    >
      <!-- 当前标记点只有一条详情数据时，展示占位点 -->
      <span
        v-if="markPoint.details.length === 1"
        class="c-pc-player-time-axis-mark-point__inner_dot"
      ></span>
      <!-- 当前标记点有多条详情数据时，展示数字 -->
      <span
        v-else
        class="c-pc-player-time-axis-mark-point__num"
      >
        {{ markPoint.details.length }}
      </span>
      <!-- 时间轴/滚动条 上的分割线 -->
      <span class="c-pc-player-time-axis-mark-point__splitLine"></span>
    </div>
    <!-- 时间轴标记点-详情面板 -->
    <div
      v-if="activeMarkPoint && activeMarkPoint.activeMarkPointDetail"
      class="c-pc-player-time-axis-mark-point__panel"
      :class="{
        'c-pc-player-time-axis-mark-point__panel__multi': !activeMarkPoint.single,
      }"
      :style="markPointPanelStyle"
      @mousedown.stop
    >
      <!-- 面板顶部 -->
      <div class="c-pc-player-time-axis-mark-point__panel__top">
        <img :src="activeMarkPoint.activeMarkPointDetail.markMessage.previewUrl" />
      </div>
      <!-- 面板底部 -->
      <div class="c-pc-player-time-axis-mark-point__panel__bottom">
        <span>
          {{ formatSeconds(activeMarkPoint.activeMarkPointDetail.markTime, { segments: 3 }) }}
        </span>
        {{ activeMarkPoint.activeMarkPointDetail.markMessage.title }}
      </div>
      <!-- 当详情数据有多条时，需要支持导航切换 -->
      <div
        v-if="!activeMarkPoint.single"
        class="c-pc-player-time-axis-mark-point__panel__nav"
        :class="{
          'c-pc-player-time-axis-mark-point__panel__nav-point6': activeMarkPoint.details.length > 5,
        }"
      >
        <span
          v-for="(markPointDetail, idx) in activeMarkPoint.details"
          @mouseover="updateActiveMarkPointDetail(markPointDetail)"
          @click="emitMarkPoint(markPointDetail)"
          :key="markPointDetail.id"
          :class="{
            'c-pc-player-time-axis-mark-point__activated':
              activeMarkPoint.activeMarkPointDetail.id === markPointDetail.id,
          }"
        >
          {{ idx + 1 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { CSSProperties } from 'vue/types/jsx';
import { PropUtils, emitFunc } from '@polyv/vue-components';
import { formatSeconds } from '@polyv/utils/date';

import { TimeAxisMarkInfo } from '@polyv/live-watch-sdk';
import {
  useTimeAxisMarkHook,
  TimeAxisMarkMergedListItem,
} from '@/components/page-watch-common/player/player-time-axis-mark/use-time-axis-mark';

interface MarkPoint extends TimeAxisMarkMergedListItem {
  single?: boolean;
  activeMarkPointDetail?: TimeAxisMarkInfo;
}

const props = defineProps({
  forceHover: PropUtils.bool.def(false),
  containerEl: PropUtils.oneOfType<HTMLElement>([HTMLElement]).def(),
});

const emits = defineEmits({
  'mark-point-hover': emitFunc<boolean>(),
  'mark-point-update': emitFunc<TimeAxisMarkInfo>(),
});

/** 时间轴标记列表是否处于 hover 状态 */
const markPointListHover = ref(false);

function setMarkPointListHover(isHover: boolean) {
  markPointListHover.value = isHover;
  emits('mark-point-hover', isHover);
}

const {
  mergeTimeAxisMarkList,

  getFirstMarkPointDetail,
  toSeekByTimeAxisMark,
} = useTimeAxisMarkHook({
  getContainerWidth: () => props.containerEl.clientWidth || 0,
  getContainerEl: () => props.containerEl,
});

/** 当前激活的标记点 */
const activeMarkPoint = ref<MarkPoint>();

function isActivateMarkPoint(markPoint?: TimeAxisMarkMergedListItem) {
  if (!activeMarkPoint.value || !markPoint) return false;

  return activeMarkPoint.value.id === markPoint.id;
}

function setActiveMarkPoint(markPoint: TimeAxisMarkMergedListItem) {
  activeMarkPoint.value = {
    ...markPoint,
    single: markPoint.details.length === 1,
    activeMarkPointDetail: getFirstMarkPointDetail(markPoint),
  };
}

function updateActiveMarkPointDetail(markPointDetail: TimeAxisMarkInfo) {
  if (!activeMarkPoint.value) return;

  activeMarkPoint.value.activeMarkPointDetail = markPointDetail;
}

function emitMarkPoint(markPointDetail: TimeAxisMarkInfo) {
  updateActiveMarkPointDetail(markPointDetail);
  toSeekByTimeAxisMark(markPointDetail);
  emits('mark-point-update', markPointDetail);
}

function markPointClickHandler(markPoint: TimeAxisMarkMergedListItem) {
  const markPointDetail = getFirstMarkPointDetail(markPoint);
  emitMarkPoint(markPointDetail);
}

/** 标记点面板样式 */
const markPointPanelStyle = computed(() => {
  if (!activeMarkPoint.value || !props.containerEl) return {};

  const percents = getFirstMarkPointDetail(activeMarkPoint.value).percents;
  const width = props.containerEl.clientWidth;
  const translateX = Math.max(percents * width - 80, 0);

  const styles: CSSProperties = {
    opacity: markPointListHover.value ? 1 : 0,
    transform: `translateX(${translateX}px)`,
  };

  return styles;
});
</script>

<style lang="scss">
.c-pc-player-time-axis-mark-point__list {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  margin-bottom: -12px;
}

.c-pc-player-time-axis-mark-point {
  position: absolute;
  bottom: 100%;
  width: 16px;
  height: 19px;
  margin-bottom: 2px;
  margin-left: -8px;
  text-align: center;
  background-image: url(./imgs/pc-player-time-axis-mark-point.png);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100% 100%;
  opacity: 0.8;

  &.c-pc-player-time-axis-mark-point__activated {
    background-image: url(./imgs/pc-player-time-axis-mark-point-activated.png);

    .c-pc-player-time-axis-mark-point__inner_dot {
      background-color: #fff;
    }

    .c-pc-player-time-axis-mark-point__num {
      color: #fff;
    }
  }

  &.c-pc-player-time-axis-mark-point__hover {
    margin-bottom: 5px;

    .c-pc-player-time-axis-mark-point__splitLine {
      height: 10px;
      margin-top: 7px;
    }
  }

  .c-pc-player-time-axis-mark-point__inner_dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-top: 5px;
    vertical-align: top;
    background-color: #333;
    border-radius: 50%;
  }

  .c-pc-player-time-axis-mark-point__num {
    font-size: 12px;
    line-height: 16px;
    color: #333;
  }

  .c-pc-player-time-axis-mark-point__splitLine {
    position: absolute;
    top: 100%;
    left: 50%;
    width: 2px;
    height: 4px;
    margin-top: 4px;
    background-color: #fff;
    transform: translate(-50%, -50%);
  }
}

.c-pc-player-time-axis-mark-point__panel {
  position: absolute;
  bottom: 30px;
  width: 160px;
  pointer-events: none;
  transition: opacity 0.3s;
  transform: translateX(-50%);

  > div {
    background-color: rgba(0, 0, 0, 0.85);
  }

  &.c-pc-player-time-axis-mark-point__panel__multi {
    text-align: center;
    pointer-events: all;
  }
}

.c-pc-player-time-axis-mark-point__panel__top {
  overflow: hidden;
  font-size: 0;
  border-radius: 2px 2px 0 0;
  > img {
    width: 100%;
    height: auto;
  }
}

.c-pc-player-time-axis-mark-point__panel__bottom {
  position: relative;
  padding: 9px 13px;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
  word-break: break-all;
  border-radius: 0 0 2px 2px;

  > span {
    position: absolute;
    right: 0;
    bottom: 100%;
    left: 0;
    padding-top: 4px;
    padding-left: 7px;
    line-height: 24px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 7%, #000 100%);
  }
}

.c-pc-player-time-axis-mark-point__panel__nav {
  left: 50%;
  box-sizing: border-box;
  display: inline-block;
  max-width: 112px;
  padding: 6px 6px;
  margin-top: 4px;
  font-size: 0;
  text-align: left;
  border-radius: 16px;

  &.c-pc-player-time-axis-mark-point__panel__nav-point6 {
    border-radius: 4px;
  }

  > span {
    display: inline-block;
    width: 16px;
    margin: 2px;
    font-size: 12px;
    line-height: 16px;
    color: #333;
    text-align: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;

    &.c-pc-player-time-axis-mark-point__activated {
      color: #fff;
      background-color: #3082fe;
    }
  }
}
</style>
