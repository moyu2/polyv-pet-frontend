<!-- @file PC 端多会场（横向布局） -->
<template>
  <div
    v-if="multiMeetingList.length"
    class="c-pc-multi-meeting-horizontal"
  >
    <div class="c-pc-multi-meeting-horizontal__control pws-next-primary-text-color">
      <span class="c-pc-multi-meeting-horizontal__control__title">
        {{ multiMeetingMenuData.label }}
      </span>
      <span class="c-pc-multi-meeting-horizontal__control__count">
        {{ currentMultiMeetingSeat }}/{{ totalItems }}
      </span>

      <template v-if="totalPages > 1">
        <span
          class="c-pc-multi-meeting-horizontal__control__prev"
          :class="{
            'c-pc-multi-meeting-horizontal__control__prev--disabled': prevIsDisabled,
          }"
          @click="toPrevPage"
        >
          <pc-icon-arrow-left class="c-pc-multi-meeting-horizontal__control__page-icon" />
        </span>
        <span
          class="c-pc-multi-meeting-horizontal__control__next"
          :class="{
            'c-pc-multi-meeting-horizontal__control__next--disabled': nextIsDisabled,
          }"
          @click="toNextPage"
        >
          <pc-icon-arrow-right class="c-pc-multi-meeting-horizontal__control__page-icon" />
        </span>
      </template>
    </div>

    <div class="c-pc-multi-meeting-horizontal__list">
      <div class="c-pc-multi-meeting-horizontal__list__wrap">
        <div
          class="c-pc-multi-meeting-horizontal__list__inner"
          :style="wrapStyle"
        >
          <div
            v-for="(item, index) in multiMeetingList"
            :key="index"
            class="c-pc-multi-meeting-horizontal__item"
            :class="{
              'c-pc-multi-meeting-horizontal__item--current': item.isCurrentChannel,
              'pws-next-primary-border-color': item.isCurrentChannel,
            }"
            :style="itemStyle"
          >
            <div class="c-pc-multi-meeting-horizontal__item__inner">
              <a
                class="c-pc-multi-meeting-horizontal__item__content"
                :href="item.watchUrl"
              >
                <img
                  v-if="item.splashImg"
                  :src="resizeOSSImg(item.splashImg, 240, 136)"
                  :alt="item.multiMeetingName"
                />

                <mini-status-tag
                  class="c-pc-multi-meeting-horizontal__item__status"
                  :live-status="item.liveStatus"
                />

                <div
                  class="c-pc-multi-meeting-horizontal__item__name g-singleline"
                  :class="{
                    'c-pc-multi-meeting-horizontal__item__name--icon': isShowLiveIcon(item),
                  }"
                >
                  {{ item.multiMeetingName }}
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MiniStatusTag from '@/components/common-business/status-tag/mini-status-tag.vue';
import { PcIconArrowLeft, PcIconArrowRight } from '@/components/component-icons/pc/map';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { computed, unref } from 'vue';
import { useMultiMeeting, useMultiMeetingPage } from '../hooks/use-multi-meeting';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const { resizeOSSImg } = useResizeOssImage();

const { multiMeetingMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { multiMeetingList, currentMultiMeetingSeat } = storeDefinitionToRefs(useMultiMeetingStore);

const { isShowLiveIcon } = useMultiMeeting();

const {
  pageNumber,
  pageSize,
  totalPages,
  totalItems,
  prevIsDisabled,
  nextIsDisabled,
  toNextPage,
  toPrevPage,
} = useMultiMeetingPage();

const wrapStyle = computed(() => {
  const wrapWidthPercent = unref(totalPages) * 100;
  const wrapLeftPercent = (unref(pageNumber) - 1) * 100;

  return {
    width: `${unref(wrapWidthPercent)}%`,
    left: `-${unref(wrapLeftPercent)}%`,
  };
});

const itemWidPercent = computed(() => {
  const total = unref(multiMeetingList).length;
  return 100 / (unref(pageSize) * Math.ceil(total / unref(pageSize)));
});

const itemStyle = computed(() => {
  return {
    width: `${unref(itemWidPercent)}%`,
  };
});
</script>

<style lang="scss">
.c-pc-multi-meeting-horizontal {
  padding: 16px 24px;
  margin-bottom: 12px;
}
.c-pc-multi-meeting-horizontal__control {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.c-pc-multi-meeting-horizontal__control__title {
  margin-right: 10px;
  font-size: 16px;
}

.c-pc-multi-meeting-horizontal__control__count {
  font-size: 14px;
}
.c-pc-multi-meeting-horizontal__control__prev {
  margin-left: auto;
}
.c-pc-multi-meeting-horizontal__control__next {
  margin-left: 16px;
}
.c-pc-multi-meeting-horizontal__control__prev,
.c-pc-multi-meeting-horizontal__control__next {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  line-height: 24px;
  color: $--color-black;
  text-align: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;

  .c-pc-multi-meeting-horizontal__control__page-icon {
    display: flex;
    font-size: 20px !important;
  }
}

.c-pc-multi-meeting-horizontal__control__prev--disabled,
.c-pc-multi-meeting-horizontal__control__next--disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

$--item-gutter: 24px;

.c-pc-multi-meeting-horizontal__list {
  overflow: hidden;
}
.c-pc-multi-meeting-horizontal__list__inner {
  position: relative;
  display: flex;
  transition: 0.3s;
}
.c-pc-multi-meeting-horizontal__item {
  box-sizing: border-box;
  overflow: hidden;
  border: 2px solid $border-color;
  border-radius: 8px;
}
.c-pc-multi-meeting-horizontal__item + .c-pc-multi-meeting-horizontal__item {
  margin-left: $--item-gutter;
}

.c-pc-multi-meeting-horizontal__item__inner {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
}
.c-pc-multi-meeting-horizontal__item__content {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
  }
}
.c-pc-multi-meeting-horizontal__item__status {
  position: absolute;
  top: 8px;
  left: 8px;
}
.c-pc-multi-meeting-horizontal__item--current {
  border-color: #78a7ed;
}

.c-pc-multi-meeting-horizontal__item__name {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 32px;
  color: $--color-white;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
  border-radius: 0 0 2px 2px;
}
.c-pc-multi-meeting-horizontal__item__name--icon::before {
  display: inline-block;
  width: 18px;
  height: 32px;
  vertical-align: top;
  content: '';
  background: url(../imgs/playing.gif) no-repeat;
  background-position: center;
  background-size: 18px;
}

@media (max-width: 1280px) {
  $--item-gutter: 10px;

  .c-pc-multi-meeting-horizontal__item + .c-pc-multi-meeting-horizontal__item {
    margin-left: $--item-gutter;
  }
}
</style>
