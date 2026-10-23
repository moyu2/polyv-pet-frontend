<!-- @file 移动端竖屏多会场（竖向布局） -->
<template>
  <div class="c-portrait-multi-meeting">
    <div class="c-portrait-multi-meeting__container">
      <div class="c-portrait-multi-meeting__title">
        <span>{{ $lang('multiMeeting.text') }}：</span>{{ multiMeetingTotal }}
      </div>

      <a
        v-for="(item, index) in multiMeetingList"
        :key="item.channelId"
        class="c-portrait-multi-meeting__item"
        :href="item.watchUrl"
      >
        <div
          class="c-portrait-multi-meeting__item__image"
          :class="{
            'is-current': item.isCurrentChannel,
          }"
        >
          <div
            class="c-portrait-multi-meeting__item__image__inner"
            :style="{
              backgroundImage: `url(${resizeOSSImg(item.splashImg, 104, 58)})`,
            }"
          ></div>

          <div class="c-portrait-multi-meeting__item__rank">
            {{ index + 1 }}
          </div>

          <capsule-live-status-tag
            class="c-portrait-multi-meeting__item__status"
            :class="{
              'is-current': item.isCurrentChannel,
            }"
            :live-status="item.liveStatus"
          />

          <div
            v-if="isShowLiveIcon(item)"
            class="c-portrait-multi-meeting__item__button"
          >
            {{ $lang('multiMeeting.playing') }}
          </div>
          <div
            v-else-if="item.isCurrentChannel"
            class="c-portrait-multi-meeting__item__button c-portrait-multi-meeting__item__button--hide-icon"
          >
            {{ $lang('multiMeeting.noLive') }}
          </div>
        </div>

        <div
          class="c-portrait-multi-meeting__item__content"
          :class="{
            'is-current': item.isCurrentChannel,
          }"
        >
          <div class="c-portrait-multi-meeting__item__content__name">
            <template v-if="item.isMainChannel">
              [{{ $lang('multiMeeting.mainChannel') }}]
            </template>
            {{ item.multiMeetingName }}
          </div>
          <div class="c-portrait-multi-meeting__item__content__other">
            <span v-if="item.startTime">{{ formatStartTime(item.startTime) }}</span
            >{{ shortNumber(item.pageView) }}{{ $lang('multiMeeting.viewCount') }}
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DATE_FORMAT_SLASH } from '@/assets/constants/date-format';
import { formatDate } from '@polyv/utils/date';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import CapsuleLiveStatusTag from '@/components/common-business/status-tag/capsule-live-status-tag.vue';
import { translate } from '@/assets/lang';
import { useShortNumber } from '@/hooks/business/use-short-number';
import { useMultiMeeting } from '../hooks/use-multi-meeting';

const { resizeOSSImg } = useResizeOssImage();

const { multiMeetingTotal, multiMeetingList } = storeDefinitionToRefs(useMultiMeetingStore);

const { isShowLiveIcon } = useMultiMeeting(false);

function formatStartTime(data: number | Date | null) {
  if (!data) return '--';
  return formatDate(data, DATE_FORMAT_SLASH) + translate('base.start.live');
}

const { shortNumber } = useShortNumber();
</script>

<style lang="scss">
.c-portrait-multi-meeting {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.c-portrait-multi-meeting__container {
  padding: 12px 16px 16px;
}

.c-portrait-multi-meeting__title {
  padding: 6px 0;
  margin-bottom: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  > span {
    color: rgba(0, 0, 0, 0.4);
  }
}

.c-portrait-multi-meeting__item {
  display: flex;
  margin-bottom: 18px;
  text-decoration: none;
}

.c-portrait-multi-meeting__item__image {
  position: relative;
  margin-right: 8px;
  overflow: hidden;
  border-radius: 6px;
}
.c-portrait-multi-meeting__item__image.is-current {
  border: 2px solid #3f76fc;
}

.c-portrait-multi-meeting__item__image__inner {
  width: 104px;
  height: 58px;
  background-repeat: no-repeat;
  background-size: cover;
}

.c-portrait-multi-meeting__item__status {
  position: absolute;
  right: 0;
  bottom: 0;
  border-radius: 8px 0 0 0 !important;
  transform: scale(0.833);
  transform-origin: 100% 100%;
}
.c-portrait-multi-meeting__item__status.is-current {
  bottom: -2px;
}

.c-portrait-multi-meeting__item__rank {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: bold;
  line-height: 20px;
  color: #fff;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 0 0 8px 0;
  transform: scale(0.833);
  transform-origin: 0 0;
}

.c-portrait-multi-meeting__item__content {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 0;
}
.c-portrait-multi-meeting__item__content__name {
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #3d3d3d;
  @include multiline-text(1);
}
.c-portrait-multi-meeting__item__content__other {
  font-size: 12px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.4);
  text-decoration: none;
  > span {
    &::after {
      display: inline-block;
      padding: 0 4px;
      content: '|';
    }
  }
}
.c-portrait-multi-meeting__item__content.is-current {
  .c-portrait-multi-meeting__item__content__name,
  .c-portrait-multi-meeting__item__content__other {
    color: #3f76fc;
  }
}

.c-portrait-multi-meeting__item__button {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  gap: 2px;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 3px 6px;
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  background: rgba(#000, 0.8);
  border-radius: 4px;
  transform: translate(-50%, -50%) scale(0.833);

  &::before {
    width: 10px;
    height: 12px;
    margin-right: 2px;
    vertical-align: top;
    content: '';
    background: url(../imgs/playing.gif) no-repeat;
    background-position: center;
    background-size: cover;
  }
}
.c-portrait-multi-meeting__item__button--hide-icon::before {
  display: none;
}
</style>
