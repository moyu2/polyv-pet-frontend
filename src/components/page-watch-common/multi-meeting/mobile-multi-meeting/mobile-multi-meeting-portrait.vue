<!-- @file 移动端多会场（竖向布局） -->
<template>
  <div
    ref="scrollRef"
    class="c-mobile-multi-meeting-portrait"
  >
    <div
      class="c-mobile-multi-meeting-portrait__container pws-mobile-multi-meeting-portrait-container"
    >
      <div class="c-mobile-multi-meeting-portrait__title pws-mobile-multi-meeting-portrait-title">
        <span>{{ $lang('multiMeeting.text') }}</span>
        {{ currentMultiMeetingSeat }}/{{ multiMeetingTotal }}
      </div>

      <a
        v-for="item in multiMeetingList"
        :key="item.channelId"
        class="c-mobile-multi-meeting-portrait__item"
        :href="item.watchUrl"
      >
        <div
          class="c-mobile-multi-meeting-portrait__item__image"
          :class="{
            'is-current': item.isCurrentChannel,
          }"
        >
          <div
            class="c-mobile-multi-meeting-portrait__item__image__inner"
            :style="{
              backgroundImage: `url(${resizeOSSImg(item.splashImg, 134, 76)})`,
            }"
          ></div>

          <mini-status-tag
            class="c-mobile-multi-meeting-portrait__item__status"
            :live-status="item.liveStatus"
          />

          <div
            v-if="isShowLiveIcon(item)"
            class="c-mobile-multi-meeting-portrait__item__button"
          >
            {{ $lang('multiMeeting.playing') }}
          </div>
          <div
            v-else-if="item.isCurrentChannel"
            class="c-mobile-multi-meeting-portrait__item__button c-mobile-multi-meeting-portrait__item__button--hide-icon"
          >
            {{ $lang('multiMeeting.noLive') }}
          </div>
        </div>

        <div class="c-mobile-multi-meeting-portrait__item__content">
          <div
            class="c-mobile-multi-meeting-portrait__item__name pws-mobile-multi-meeting-portrait-name"
          >
            <template v-if="item.isMainChannel">
              [{{ $lang('multiMeeting.mainChannel') }}]
            </template>
            {{ item.multiMeetingName }}
          </div>

          <div
            class="c-mobile-multi-meeting-portrait__item__time pws-mobile-multi-meeting-portrait-time"
          >
            {{ item.startTime ? formatDate(item.startTime, DATE_FORMAT_SLASH) : '— —' }}
          </div>

          <div
            class="c-mobile-multi-meeting-portrait__item__pv pws-mobile-multi-meeting-portrait-pv"
          >
            <mobile-icon-page-view class="c-mobile-multi-meeting-portrait__item__pv__icon" />
            {{ item.pageView }}
          </div>
        </div>
      </a>

      <div
        v-if="scrollBarVisible"
        class="c-mobile-multi-meeting-portrait__no-more pws-mobile-meeting-portrait-no-more"
      >
        {{ $lang('base.noMore') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DATE_FORMAT_SLASH } from '@/assets/constants/date-format';
import MiniStatusTag from '@/components/common-business/status-tag/mini-status-tag.vue';
import { MobileIconPageView } from '@/components/component-icons/mobile/map';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { formatDate } from '@polyv/utils/date';
import { useMultiMeeting } from '../hooks/use-multi-meeting';
import { useScrollBar } from '@/hooks/behaviors/use-scroll-bar';
import { nextTick, ref, unref, watch, watchEffect } from 'vue';
import { useLayoutStore } from '@/store/use-layout-store';
import { TAB_NAME_MULTI_MEETING } from '@/assets/constants/tab-name';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';

const { resizeOSSImg } = useResizeOssImage();

const { currentMultiMeetingSeat, multiMeetingTotal, multiMeetingList } =
  storeDefinitionToRefs(useMultiMeetingStore);

const { mobileMenuCurrentName } = storeDefinitionToRefs(useLayoutStore);

const { isShowLiveIcon, initMultiMeeting } = useMultiMeeting(false);

const scrollRef = ref<HTMLElement>();
const { scrollBarVisible, checkScrollBarVisible } = useScrollBar(scrollRef);

watchEffect(() => {
  if (unref(multiMeetingTotal)) {
    nextTick(() => {
      checkScrollBarVisible();
    });
  }
});

watch(
  () => mobileMenuCurrentName.value,
  () => {
    if (mobileMenuCurrentName.value === TAB_NAME_MULTI_MEETING) {
      initMultiMeeting();
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.c-mobile-multi-meeting-portrait {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
.c-mobile-multi-meeting-portrait__container {
  padding: 16px;
  margin: 16px 12px;
  border-radius: 10px;
}

.c-mobile-multi-meeting-portrait__title {
  margin-bottom: 16px;
  font-size: 12px;
}

.c-mobile-multi-meeting-portrait__item {
  display: flex;
  margin-bottom: 18px;
  text-decoration: none;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.c-mobile-multi-meeting-portrait__item__image {
  position: relative;
  margin-right: 8px;
  overflow: hidden;
  border-radius: 8px;
}

.c-mobile-multi-meeting-portrait__item__image__inner {
  width: 134px;
  height: 76px;
  background-repeat: no-repeat;
  background-size: cover;
}
.c-mobile-multi-meeting-portrait__item__image.is-current {
  border: 1px solid #78a7ed;
}
.c-mobile-multi-meeting-portrait__item__status {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 0 0 8px 0;
}

.c-mobile-multi-meeting-portrait__item__button {
  position: absolute;
  top: 50%;
  left: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 16px;
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  background: rgba(#000, 0.6);
  border-radius: 16px;
  transform: translate(-50%, -50%);

  &::before {
    width: 10px;
    height: 14px;
    margin-right: 8px;
    vertical-align: top;
    content: '';
    background: url(../imgs/playing.gif) no-repeat;
    background-position: center;
    background-size: cover;
  }
}
.c-mobile-multi-meeting-portrait__item__button--hide-icon::before {
  display: none;
}

.c-mobile-multi-meeting-portrait__item__content {
  position: relative;
  flex: 1;
}

.c-mobile-multi-meeting-portrait__item__name {
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 18px;
  @include multiline-text;
}

.c-mobile-multi-meeting-portrait__item__time {
  font-size: 12px;
}

.c-mobile-multi-meeting-portrait__item__pv {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  font-size: 12px;
}
.c-mobile-multi-meeting-portrait__item__pv__icon {
  display: flex;
  margin-right: 4px;
  font-size: 16px;
}

.c-mobile-multi-meeting-portrait__no-more {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
}
</style>
