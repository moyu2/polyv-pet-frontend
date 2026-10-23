<!-- @file 移动端多会场（横向布局） -->
<template>
  <div
    v-if="multiMeetingList.length"
    class="c-mobile-multi-meeting-horizontal pws-mobile-multi-meeting"
  >
    <!-- 控制栏 -->
    <div class="c-mobile-multi-meeting-horizontal__control">
      <span class="c-mobile-multi-meeting-horizontal__control__title">
        {{ multiMeetingMenuData.label }}
      </span>
      <span
        class="c-mobile-multi-meeting-horizontal__control__count pws-mobile-multi-meeting-count"
      >
        {{ currentMultiMeetingSeat }}/{{ multiMeetingTotal }}
      </span>
      <span
        class="c-mobile-multi-meeting-horizontal__control__pack-up pws-mobile-multi-meeting-pack-up"
        @click="toggleListVisible"
      >
        {{ listVisible ? $lang('base.packUp') : $lang('base.spreadOut') }}
        <mobile-icon-arrow-up
          v-if="listVisible"
          class="c-mobile-multi-meeting-horizontal__control__pack-up__icon"
        />
        <mobile-icon-arrow-down
          v-else
          class="c-mobile-multi-meeting-horizontal__control__pack-up__icon"
        />
      </span>
    </div>

    <!-- 列表 -->
    <div
      v-show="listVisible"
      class="c-mobile-multi-meeting-horizontal__list"
    >
      <div
        v-for="(item, index) in multiMeetingList"
        :key="index"
        ref="meetingRef"
        class="c-mobile-multi-meeting-horizontal__item"
        :class="{
          'c-mobile-multi-meeting-horizontal__item--current': item.isCurrentChannel,
        }"
      >
        <div class="c-mobile-multi-meeting-horizontal__item__inner">
          <a
            class="c-mobile-multi-meeting-horizontal__item__content"
            :href="item.watchUrl"
          >
            <img
              v-if="item.splashImg"
              :src="resizeOSSImg(item.splashImg, 240, 136)"
              :alt="item.multiMeetingName"
            />

            <mini-status-tag
              class="c-mobile-multi-meeting-horizontal__item__status"
              :live-status="item.liveStatus"
            />

            <div
              class="c-mobile-multi-meeting-horizontal__item__name g-singleline"
              :class="{
                'c-mobile-multi-meeting-horizontal__item__name--icon': isShowLiveIcon(item),
              }"
            >
              {{ item.multiMeetingName }}
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import MiniStatusTag from '@/components/common-business/status-tag/mini-status-tag.vue';
import { MobileIconArrowDown, MobileIconArrowUp } from '@/components/component-icons/mobile/map';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { nextTick, ref, watch } from 'vue';
import { useMultiMeeting } from '../hooks/use-multi-meeting';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const { resizeOSSImg } = useResizeOssImage();

const { multiMeetingMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { multiMeetingList, multiMeetingTotal, currentMultiMeetingSeat } =
  storeDefinitionToRefs(useMultiMeetingStore);

const { getEmitter } = useGlobalInject();

const {
  visible: listVisible,
  toggle: toggleListVisible,
  close: closeList,
} = useSimpleVisible(true, {
  showCallback: () => {
    getEmitter().emit(appEvents.global.MobileLayoutComputedSize);
  },
  hideCallback: () => {
    getEmitter().emit(appEvents.global.MobileLayoutComputedSize);
  },
});

useEventBusListener(appEvents.global.MsgInputFocus, closeList);

const { isShowLiveIcon } = useMultiMeeting();

const { scrollIntoView } = useMultiPolyvWatchApp();

const meetingRef = ref<HTMLElement[]>([]);

watch(
  () => multiMeetingTotal.value,
  async () => {
    await nextTick();
    const elems = meetingRef.value;
    if (elems.length === 0) {
      return;
    }

    multiMeetingList.value.forEach((item, index) => {
      if (item.isCurrentChannel) {
        const elem = elems[index];
        scrollIntoView(elem, {
          block: 'center',
          inline: 'center',
        });
      }
    });
  },
);
</script>

<style lang="scss">
.c-mobile-multi-meeting-horizontal__control {
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  line-height: 36px;
}

.c-mobile-multi-meeting-horizontal__control__count {
  margin-left: 6px;
  font-size: 12px;
}
.c-mobile-multi-meeting-horizontal__control__pack-up {
  display: flex;
  align-items: center;
  margin-left: auto;
  font-size: 12px;
}
.c-mobile-multi-meeting-horizontal__control__pack-up__icon {
  display: flex;
  font-size: 16px !important;
}

.c-mobile-multi-meeting-horizontal__list {
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  padding-bottom: 8px;
  padding-left: 16px;
  overflow-x: auto;
  white-space: nowrap;
}

.c-mobile-multi-meeting-horizontal__item {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 32%;
  margin-right: 8px;

  &:last-of-type {
    margin-right: 16px;
  }
}
.c-mobile-multi-meeting-horizontal__item__inner {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
}
.c-mobile-multi-meeting-horizontal__item__content {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;

  img {
    width: 100%;
    height: 100%;
  }
}
.c-mobile-multi-meeting-horizontal__item__status {
  position: absolute;
  top: 4px;
  left: 4px;
  transform: scale(0.84);
  transform-origin: top left;
}
.c-mobile-multi-meeting-horizontal__item--current {
  .c-mobile-multi-meeting-horizontal__item__content::after {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    border: 1px solid #78a7ed;
    border-radius: 4px;
  }
}

.c-mobile-multi-meeting-horizontal__item__name {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 26px;
  padding: 0 4px;
  padding-top: 4px;
  font-size: 12px;
  line-height: 26px;
  color: $--color-white;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
  border-radius: 0 0 2px 2px;
}
.c-mobile-multi-meeting-horizontal__item__name--icon::before {
  display: inline-block;
  width: 18px;
  height: 24px;
  vertical-align: top;
  content: '';
  background: url(../imgs/playing.gif) no-repeat;
  background-position: center;
  background-size: 18px;
}
</style>
