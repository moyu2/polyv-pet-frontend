<template>
  <div
    class="c-component-layout-container"
    ref="contentRef"
    :class="{
      'c-component-layout-container--desktop-adapter': inDeskTopViewAdapterMode,
      // prettier-ignore
      'c-component-layout-container--row-wrap': componentLayout === ComponentLayoutType.RowWrap,
      // prettier-ignore
      'c-component-layout-container--column-2': componentLayout === ComponentLayoutType.TwoPerRow,
      // prettier-ignore
      'c-component-layout-container--column-3': componentLayout === ComponentLayoutType.ThreePerRow,
      // prettier-ignore
      'c-component-layout-container--column-4': componentLayout === ComponentLayoutType.FourPerRow,
      // prettier-ignore
      'c-component-layout-container--column-5': componentLayout === ComponentLayoutType.FivePerRow,
      // prettier-ignore
      'c-component-layout-container--horizontal': componentLayout === ComponentLayoutType.HorizontalScroll,
      // prettier-ignore
      'c-component-layout-container--waterfall': componentLayout === ComponentLayoutType.Waterfall,
    }"
  >
    <component-layout-container-item
      ref="containerItemList"
      v-for="item in dataSources"
      :key="item[idKey]"
      :id="item[idKey]"
      :monitor-slot-resize="monitorSlotResize"
      @load="onContainerItemLoad"
    >
      <slot :item="item"></slot>
    </component-layout-container-item>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { Ref } from 'vue';
import ComponentLayoutContainerItem from './component-layout-container-item.vue';
import { PropUtils } from '@polyv/vue-components';
import { useLazyLoad } from '@/hooks/behaviors/use-lazy-load';
import { ComponentInstance } from '@/hooks/core/use-vue';
import { ComponentLayoutType } from './type';

const props = defineProps({
  lazyLoadEnabled: PropUtils.bool.def(true),
  /** 是否处于桌面端适配模式 */
  inDeskTopViewAdapterMode: PropUtils.bool.def(false),
  /** 组件布局 */
  componentLayout: PropUtils.enum<ComponentLayoutType>().def(ComponentLayoutType.LargeImage),
  /** 数据源 */
  dataSources: PropUtils.array<any>().def([]),
  /** 唯一Id 的 Key 值 */
  idKey: PropUtils.string.def('id'),
  /** 获取滚动元素 */
  getScrollRef: PropUtils.func<() => Ref<HTMLElement | undefined>>().def(),
  /** 是否监听slot的变化, 监听后会重新计算瀑布流的行跨度 */
  monitorSlotResize: PropUtils.bool.def(false),
});

const emits = defineEmits(['load-more']);

const contentRef = ref<HTMLElement>();

const scrollRef = ref(document.documentElement);

function __getScrollRef() {
  return props.getScrollRef ? props.getScrollRef() : scrollRef;
}

if (props.lazyLoadEnabled) {
  // 注：这里面没有写反，横向滚动的布局时，滚动区域是 contentRef
  useLazyLoad(__getScrollRef(), contentRef, {
    direction: 'horizontal',
    buffer: () => Math.min(window.innerWidth, 1024),
    loadMore: () => {
      if (props.componentLayout === ComponentLayoutType.HorizontalScroll) {
        emits('load-more');
      }
    },
  });

  useLazyLoad(contentRef, __getScrollRef(), {
    direction: 'vertical',
    buffer: () => {
      return (() => {
        const el = __getScrollRef().value;
        return el ? el.scrollHeight * 0.6 : 600;
      })();
    },
    loadMore: () => {
      if (props.componentLayout !== ComponentLayoutType.HorizontalScroll) {
        emits('load-more');
      }
    },
  });
}

const containerItemList = ref<Array<ComponentInstance<typeof ComponentLayoutContainerItem>>>([]);

function onContainerItemLoad({ id, height }: { id: number; height: number }) {
  const index = props.dataSources.findIndex(i => i[props.idKey] === id);
  if (index === -1) {
    return;
  }

  if (containerItemList.value && containerItemList.value[index]) {
    const $containerItem = containerItemList.value[index].$el as HTMLElement;

    // 计算行跨度
    const gap = 12;
    const rowSpan = Math.ceil(height / gap);

    if (props.componentLayout === ComponentLayoutType.Waterfall) {
      $containerItem.style.gridRowEnd = `span ${rowSpan}`; // 动态设置行跨度
    } else {
      $containerItem.style.gridRowEnd = 'auto';
    }
  }
}
</script>

<style lang="scss">
@import './media-query-adapter.scss';

.c-component-layout-container {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 12px;
}

.c-component-layout-container--desktop-adapter {
  .c-component-layout-container__item {
    padding-top: 10px;
    border-radius: 8px;
    transition: all ease 0.3s;

    &:hover {
      box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.1);
      transition: all ease 0.3s;
      transform: translateY(-10px);
    }
  }
}

.c-component-layout-container--row-wrap {
  flex-direction: row;
  flex-wrap: wrap;
  overflow: hidden;

  .c-component-layout-container__item {
    width: auto;
  }
}

.c-component-layout-container--horizontal {
  flex-direction: row;
  flex-wrap: nowrap;
  padding-bottom: 6px;

  overflow-x: scroll;
  @include scrollbar(rgba(#333333, 0.2), 8px);

  .c-component-layout-container__item {
    width: auto;
  }
}

.c-component-layout-container--column-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  .c-component-layout-container__item {
    grid-row-start: auto;
    overflow: hidden;
  }
}

.c-component-layout-container--column-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  .c-component-layout-container__item {
    grid-row-start: auto;
    overflow: hidden;
  }
}

.c-component-layout-container--column-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  .c-component-layout-container__item {
    grid-row-start: auto;
    overflow: hidden;
  }
}

.c-component-layout-container--column-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);

  .c-component-layout-container__item {
    grid-row-start: auto;
    overflow: hidden;
  }
}

.c-component-layout-container--waterfall {
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  .c-component-layout-container__item {
    grid-row-start: auto;
    height: fit-content;
    overflow: hidden;
    transition: transform 0.3s;
  }
}
</style>
