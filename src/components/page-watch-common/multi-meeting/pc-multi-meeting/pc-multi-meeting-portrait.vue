<!-- @file PC 端多会场（竖向布局） -->
<template>
  <div class="c-pc-multi-meeting-portrait">
    <div class="c-pc-multi-meeting-portrait__title">
      <span>{{ $lang('multiMeeting.text') }}</span>
      {{ currentMultiMeetingSeat }}/{{ multiMeetingTotal }}
    </div>

    <div class="c-pc-multi-meeting-portrait__content">
      <plv-row :gutter="20">
        <plv-col
          v-for="item in currentPageList"
          :key="item.channelId"
          :span="{
            sm: 6,
            md: 6,
            lg: 6,
            xl: 4.8,
            xxl: 4.8,
          }"
        >
          <a
            class="c-pc-multi-meeting-portrait__item"
            :class="{
              'c-pc-multi-meeting-portrait__item--current': item.isCurrentChannel,
              'pws-next-primary-border-color': item.isCurrentChannel,
            }"
            :href="item.watchUrl"
          >
            <div class="c-pc-multi-meeting-portrait__item__image">
              <div
                class="c-pc-multi-meeting-portrait__item__image__inner"
                :style="{
                  backgroundImage: `url(${resizeOSSImg(item.splashImg, 240, 136)})`,
                }"
              ></div>

              <div
                v-if="isShowLiveIcon(item)"
                class="c-pc-multi-meeting-portrait__item__button"
              >
                {{ $lang('multiMeeting.playing') }}
              </div>
              <div
                v-else-if="item.isCurrentChannel"
                class="c-pc-multi-meeting-portrait__item__button c-pc-multi-meeting-portrait__item__button--hide-icon"
              >
                {{ $lang('multiMeeting.noLive') }}
              </div>
            </div>

            <mini-status-tag
              class="c-pc-multi-meeting-portrait__item__status"
              :live-status="item.liveStatus"
            />

            <div class="c-pc-multi-meeting-portrait__item__content">
              <div class="c-pc-multi-meeting-portrait__item__name">
                <template v-if="item.isMainChannel">
                  [{{ $lang('multiMeeting.mainChannel') }}]
                </template>
                {{ item.multiMeetingName }}
              </div>

              <div class="c-pc-multi-meeting-portrait__item__time">
                {{ item.startTime ? formatDate(item.startTime, DATE_FORMAT_SLASH) : '— —' }}
              </div>

              <div class="c-pc-multi-meeting-portrait__item__pv">
                <pc-icon-page-view class="c-pc-multi-meeting-portrait__item__pv__icon" />
                {{ item.pageView }}
              </div>
            </div>
          </a>
        </plv-col>
      </plv-row>

      <plv-pagination
        class="c-pc-multi-meeting-portrait__page"
        :hide-on-single="true"
        :total="totalPages"
        v-model="pageNumber"
        :layout="['prev', 'pager', 'next', 'jumper']"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DATE_FORMAT_SLASH } from '@/assets/constants/date-format';
import { TAB_NAME_MULTI_MEETING } from '@/assets/constants/tab-name';
import MiniStatusTag from '@/components/common-business/status-tag/mini-status-tag.vue';
import { PcIconPageView } from '@/components/component-icons/pc/map';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { PlvCol, PlvPagination, PlvRow } from '@/plugins/polyv-ui/admin-import';
import { useLayoutStore } from '@/store/use-layout-store';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { formatDate } from '@polyv/utils/date';
import { watch } from 'vue';
import { useMultiMeeting, useMultiMeetingPage } from '../hooks/use-multi-meeting';

const { resizeOSSImg } = useResizeOssImage();

const { pcBottomTabCurrentName } = storeDefinitionToRefs(useLayoutStore);

const { currentMultiMeetingSeat, multiMeetingTotal } = storeDefinitionToRefs(useMultiMeetingStore);

const { isShowLiveIcon, initMultiMeeting } = useMultiMeeting(false);

const { currentPageList, totalPages, pageNumber } = useMultiMeetingPage({
  pageSize: 20,
});

watch(
  () => pcBottomTabCurrentName.value,
  () => {
    if (pcBottomTabCurrentName.value === TAB_NAME_MULTI_MEETING) {
      initMultiMeeting();
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.c-pc-multi-meeting-portrait__title {
  margin-bottom: 16px;
  font-size: 16px;
  color: $text-color;
  span {
    margin-right: 15px;
  }
}

.c-pc-multi-meeting-portrait__item {
  position: relative;
  box-sizing: border-box;
  display: block;
  overflow: hidden;
  text-decoration: none;
  border: 2px solid $border-color;
  border-radius: 8px;
}

.c-pc-multi-meeting-portrait__item--current {
  border-color: #3082fe;
}

.c-pc-multi-meeting-portrait__item__image {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: cover;

  &::after {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 56%;
    content: '';
  }

  .c-pc-multi-meeting-portrait__item__image__inner {
    position: absolute;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    transition: 0.3s;
  }
}
.c-pc-multi-meeting-portrait__item:hover .c-pc-multi-meeting-portrait__item__image__inner {
  transform: scale(1.2);
}

.c-pc-multi-meeting-portrait__item__button {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 20px;
  font-size: 16px;
  color: #fff;
  white-space: nowrap;
  background: rgba(#000, 0.6);
  border-radius: 24px;
  transform: translate(-50%, -50%);

  &::before {
    width: 20px;
    height: 28px;
    margin-right: 8px;
    vertical-align: top;
    content: '';
    background: url(../imgs/playing.gif) no-repeat;
    background-position: center;
    background-size: cover;
  }
}
.c-pc-multi-meeting-portrait__item__button--hide-icon::before {
  display: none;
}

.c-pc-multi-meeting-portrait__item__status {
  position: absolute;
  top: 8px;
  left: 8px;
}

.c-pc-multi-meeting-portrait__item__content {
  position: relative;
  box-sizing: border-box;
  height: 120px;
  padding: 16px 12px 0;
}

.c-pc-multi-meeting-portrait__item__name {
  font-size: 16px;
  line-height: 22px;
  color: $text-color;
  @include multiline-text;
}

.c-pc-multi-meeting-portrait__item__time {
  position: absolute;
  bottom: 16px;
  left: 16px;
  font-size: 14px;
  line-height: 14px;
  color: $text-color-secondary;
}

.c-pc-multi-meeting-portrait__item__pv {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 16px;
  color: $text-color-secondary;
}

.c-pc-multi-meeting-portrait__item__pv__icon {
  display: flex;
  margin-right: 4px;
  font-size: 16px;
}

.c-pc-multi-meeting-portrait__page {
  margin-top: 30px;
}
</style>
