<template>
  <div
    class="c-portrait-mic-container"
    :class="{ 'c-portrait-mic-container__center': micListIsCenter }"
  >
    <div
      ref="micScroll"
      class="c-portrait-mic-container__scroll"
      :class="[containerStyle]"
      :style="transformStyle"
    >
      <div
        class="c-portrait-mic-container__item"
        :style="calcItemWidth"
      >
        <!--  主画面  -->
        <portrait-connect-mic-user-item
          v-if="masterMicItem"
          :key="`master-stream-${masterMicItem.streamId}`"
          :mic-item="masterMicItem"
          :fit-type="connectMicFitType"
        />
      </div>
      <div
        v-for="(micItem, index) in filterConnectMicList"
        :key="micItem.streamId"
        class="c-portrait-mic-container__item"
        :class="[`c-portrait-mic-container__item-${index + 1}`]"
        :style="calcItemWidth"
      >
        <portrait-connect-mic-user-item
          :mic-item="micItem"
          :fit-type="connectMicFitType"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { usePageStore } from '@/store/use-page-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PortraitConnectMicUserItem from '@/components/page-watch-common/connect-mic/portrait-connect-mic/portrait-connect-mic-user-item.vue';
import Momentum from '@/assets/utils/momentum';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useChannelStore } from '@/store/use-channel-store';

const channelStore = useChannelStore();

const momentum = new Momentum();
const { pageClientHeight, pageClientWidth } = usePageStore();

const containerHeight = Math.ceil((pageClientWidth * 16) / 9 / 3);

const { filterConnectMicList, masterMicItem, connectMicFitType } =
  storeDefinitionToRefs(useConnectMicStore);
const { portraitDocWrapHeight } = storeDefinitionToRefs(usePortraitLayoutStore);
const canMove = ref(false);
// 实时移动的距离
const lastMove = ref(-9999);
// 最大的偏移距离
const maxMove = ref(0);
// 当前配置的Y移动距离
const currentMove = ref(0);
// touch开始的时候触碰的Y点
const pointStartY = ref(0);
// touch结束的时候触碰的Y点
const pointEndY = ref(0);
// 使用的样式
const transformStyle = ref('transform: translate3d(0, 0, 0)');

const containerStyle = computed(() => {
  if (filterConnectMicList.value.length === 2) {
    return 'c-portrait-mic-container-3';
  }
  return '';
});

// 每个元素的宽度和高度
const calcItemWidth = computed(() => {
  if (filterConnectMicList.value.length === 0 && masterMicItem.value) {
    return `width: 100%; height: ${(pageClientWidth * 9) / 16}px;`;
  }

  switch (filterConnectMicList.value.length) {
    // switch (len.value) {
    case 1:
    case 2:
    case 3:
      return `width: 50%; height: ${pageClientHeight / 2}px;`;
    default:
      return `width: 33.33%; height: ${containerHeight}px;`;
  }
});

// 是否要居中显示
const micListIsCenter = computed(() => {
  if (channelStore.isPptChannel) return false;
  if (masterMicItem.value && filterConnectMicList.value.length === 1) {
    return true;
  } else if (!masterMicItem.value && filterConnectMicList.value.length === 2) {
    return true;
  } else {
    return maxMove.value === 0;
  }
});

// 计算最大可拖动像素
const calcMaxMove = () => {
  let result;
  switch (filterConnectMicList.value.length) {
    case 1:
    case 2:
    case 3:
      result =
        Math.ceil((filterConnectMicList.value.length + 1) / 2) * (pageClientHeight / 2) -
        pageClientHeight +
        portraitDocWrapHeight.value;
      maxMove.value = result < 0 ? 0 : result;
      break;
    default:
      result =
        Math.ceil((filterConnectMicList.value.length + 1) / 3) * containerHeight -
        pageClientHeight +
        portraitDocWrapHeight.value;
      maxMove.value = result < 0 ? 0 : result;
      break;
  }
};

const setTransformStyleValue = () => {
  transformStyle.value = `transform: translate3d(0, ${currentMove.value}px, 0);`;
};
const wrapHeightChange = (val: number) => {
  if (val === undefined) return;
  // 说明是已经超出边界了
  if (-currentMove.value > maxMove.value) {
    currentMove.value = -maxMove.value;
    setTransformStyleValue();
  }
};

const calcTransform = (move: number) => {
  if (!canMove.value) return;
  if (lastMove.value === -9999) {
    lastMove.value = move;
    return;
  }

  // 计算和上一次移动的距离
  const alreadyMoves = move - lastMove.value;
  lastMove.value = move;
  // 如果总移动小于20px，不触发位移
  if (Math.abs(pointEndY.value - move) < 20) return;
  currentMove.value = currentMove.value + alreadyMoves;
  // 是否超出边界
  if (-currentMove.value > maxMove.value) {
    currentMove.value = -maxMove.value;
    setTransformStyleValue();
    return;
  }
  if (currentMove.value > 0) {
    currentMove.value = 0;
    setTransformStyleValue();
    return;
  }
  setTransformStyleValue();
};

const startMomentum = (Y: number, time: number, style: string) => {
  let result = currentMove.value + Y;
  if (-result > maxMove.value) {
    result = -maxMove.value;
  }
  if (result > 0) {
    result = 0;
  }
  transformStyle.value = `
    transform: translate3d(0, ${result}px, 0);
    transition: transform ${time}ms ${style};
  `;
  currentMove.value = result;
};

const micScroll = ref<HTMLElement>();
const onTouchStart = (value: number) => {
  if (micScroll.value) {
    const viewHeight = pageClientHeight - portraitDocWrapHeight.value;
    const eleHeight = micScroll.value?.offsetHeight;
    if (viewHeight < eleHeight) {
      canMove.value = true;
    }
  }
  pointStartY.value = value;
  momentum.onMomentumStart(0, value);
};
const onTouchEnd = (endY: number) => {
  pointEndY.value = endY;
  lastMove.value = -9999;
  if (Math.abs(pointStartY.value - endY) < 20) return;
  const result = momentum.onMomentumEnd(0, endY);
  if (result) {
    const { _centerDiffY, momentumTransitionDuration, momentumBezier } = result;
    startMomentum(_centerDiffY, momentumTransitionDuration, momentumBezier);
  }
  canMove.value = false;
};

watch(
  () => portraitDocWrapHeight.value,
  val => {
    calcMaxMove();
    wrapHeightChange(val);
  },
);

watch(
  () => filterConnectMicList.value.length,
  () => {
    calcMaxMove();
    wrapHeightChange(portraitDocWrapHeight.value);
  },
  {
    immediate: true,
  },
);

defineExpose({
  calcTransform,
  onTouchEnd,
  onTouchStart,
});
</script>

<style lang="scss">
.c-portrait-mic-container {
  width: 100%;
  height: 100%;

  .c-portrait-mic-container__scroll {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
  }

  .c-portrait-mic-container__item {
    width: 100%;
    height: 100%;
  }
}

.c-portrait-mic-container-3 {
  justify-content: center;
}

.c-portrait-mic-container__center {
  display: flex;
  align-items: center;
}
</style>
