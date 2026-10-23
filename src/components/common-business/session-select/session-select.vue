<!-- @file 场次选择业务组件 -->
<template>
  <div class="c-session-select">
    <div
      v-if="categoryList.length && activeCategoryItem"
      class="c-session-select__filter"
      :class="{
        'c-session-select__filter--pc': inDeskTopViewAdapterMode,
      }"
    >
      <template v-if="inDeskTopViewAdapterMode">
        <pc-select
          class="c-session-select__select"
          :value="activeCategoryItem.value"
          :options="categoryList"
          @input="onCategoryIdChange"
        />
        <pc-select
          v-if="hasChapter"
          class="c-session-select__select"
          :value="activeChapterItem?.value"
          :options="chapterOptionList"
          @input="onChapterIdChange"
        />
      </template>
      <template v-else>
        <mobile-select
          class="c-session-select__select"
          :value="activeCategoryItem.value"
          :options="categoryList"
          @input="onCategoryIdChange"
        />
        <mobile-select
          v-if="hasChapter"
          class="c-session-select__select"
          :value="activeChapterItem?.value"
          :options="chapterOptionList"
          @input="onChapterIdChange"
        />
      </template>
    </div>
    <div
      class="c-session-select__list"
      ref="scrollRef"
    >
      <div
        v-show="loading"
        class="c-session-select__list__loading-container"
      >
        <div class="c-session-select__list__loading-wrapper">
          <list-loading class="c-session-select__list__loading" />
        </div>
      </div>

      <session-list
        :in-desk-top-view-adapter-mode="inDeskTopViewAdapterMode"
        :component-layout="computedComponentLayout"
        :data-list="sessionDataList"
        :get-scroll-ref="getInnerScrollRef"
        @load-more-list="loadMoreChannelSessionDataList"
        @session-booking-change="onSessionBookingChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import PcSelect from '@/components/common-base/select/pc-select.vue';
import MobileSelect from '@/components/common-base/select/mobile-select.vue';
import SessionList from './session-list/session-list.vue';
import { useSessionSelect } from './use-session-select';
import { Ref, computed, onBeforeMount, ref } from 'vue';
import { ComponentLayoutType } from '@/components/common-base/component-layout-container/type';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';
import ListLoading from '@/components/common-base/list-loading/list-loading.vue';
import { PropUtils } from '@polyv/vue-components';

const props = defineProps({
  getScrollRef: PropUtils.func<() => Ref<HTMLElement | undefined>>().def(),
});

const inDeskTopViewAdapterMode = ref(false);

const computedComponentLayout = computed(() => {
  if (inDeskTopViewAdapterMode.value) {
    return ComponentLayoutType.RowWrap;
  }

  return ComponentLayoutType.DetailListHorizontal;
});

const scrollRef = ref<HTMLElement>();

function getInnerScrollRef() {
  return (props.getScrollRef && props.getScrollRef()) || scrollRef;
}

const {
  loading,

  categoryList,
  activeCategoryItem,
  onCategoryIdChange,

  hasChapter,
  chapterOptionList,
  activeChapterItem,
  onChapterIdChange,

  sessionDataList,

  initData,
  loadMoreChannelSessionDataList,
  onSessionBookingChange,
} = useSessionSelect({
  getVirtualPageSize: () => {
    return inDeskTopViewAdapterMode.value ? 20 : 10;
  },
});

onBeforeMount(() => {
  initData();
});

useWindowResizeListener(
  () => {
    inDeskTopViewAdapterMode.value = window.innerWidth >= 1024;
  },
  {
    autoListen: true,
    immediately: true,
  },
);
</script>

<style lang="scss">
.c-session-select__filter {
  position: sticky;
  top: 0;
  z-index: 10;
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #f5f5f6;
}

.c-session-select__select {
  width: 50%;
}

.c-session-select__select {
  .c-mobile-select__body {
    background-color: #fff;
  }
  .c-mobile-select__body__input {
    width: 0;
    @include singleline-text;
  }
}

.c-session-select__filter--pc {
  padding: 12px 0;

  .c-session-select__select {
    width: 33%;
  }
}

.c-session-select__list {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f5f6;
}

.c-session-select__list__loading-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 12px;

  .c-session-select__list__loading-wrapper {
    display: flex;
    width: 100%;
    // height: 300px;
    height: 100%;
    background: rgba(255, 255, 255, 1);
    border-radius: 12px;
  }

  .c-session-select__list__loading {
    position: relative;
    top: 30%;
    margin: 0 auto;
  }
}
</style>
