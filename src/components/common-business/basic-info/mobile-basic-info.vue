<!-- @file 移动端基础信息显示 -->
<template>
  <div class="c-mobile-basic-info">
    <div
      v-if="descInfoCardEnabled"
      class="c-mobile-basic-info__top"
      :style="basicInfoTopStyle"
    >
      <!-- 基础信息 -->
      <div class="c-mobile-basic-info__channel">
        <!-- 频道 logo -->
        <div
          class="c-mobile-basic-info__channel__cover g-img-cover"
          :style="{
            backgroundImage: `url(${resizeOSSImg(channelCoverImg, 80, 80)})`,
          }"
        ></div>
        <div class="c-mobile-basic-info__channel__inner">
          <!-- 频道标题 + 频道状态 -->
          <div class="c-mobile-basic-info__channel__inner__top">
            <div class="c-mobile-basic-info__channel__inner__title">
              {{ channelTitle }}
              <pwc-live-status-tag
                class="c-mobile-basic-info__channel__inner__status"
                :status="liveStatus"
                :effect="tagEffect"
              />

              <!-- 无延迟标签 -->
              <span
                v-if="(isLowLatency || isConnectMicing) && supportLowLatency"
                class="c-mobile-basic-info__channel__inner__low-latency"
                :class="{
                  'c-mobile-basic-info__channel__inner__low-latency__en': !isChineseLang,
                }"
              ></span>
            </div>
          </div>
          <!-- 直播时间 + 浏览次数 + 无延迟标记 -->
          <div class="c-mobile-basic-info__channel__inner__bottom">
            <span class="c-mobile-basic-info__channel__inner__start-time">
              {{ pageViewVisible ? '' : `${$lang('watch.liveTime')}：` }}
              {{ liveShowTimeText }}
            </span>
            <span
              v-if="pageViewVisible"
              class="c-mobile-basic-info__channel__inner__page-view"
            >
              {{ shortNumber(pageViewCount) }} {{ $lang('watch.pvSuffix') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 主持人信息 -->
      <div class="c-mobile-basic-info__author">
        <!-- 主持人 -->
        <div
          class="c-mobile-basic-info__author__publisher"
          @click="onClickPublisher"
        >
          <img
            v-if="channelPublisherPic"
            :src="channelPublisherPic"
            class="c-mobile-basic-info__author__publisher__icon"
          />
          <mobile-icon-people
            v-else
            class="c-mobile-basic-info__author__publisher__icon c-mobile-basic-info__author__publisher__icon-people"
          />
          <span
            :class="{
              'g-multiline': !publisherFullVisible,
            }"
          >
            {{ channelPublisher }}
          </span>
        </div>
        <section class="c-mobile-basic-info__author__right">
          <!-- 点赞数 -->
          <div
            v-if="showLikeCount"
            class="c-mobile-basic-info__author__right-item c-mobile-basic-info__author__like-count g-text-nowrap"
          >
            <mobile-icon-like class="c-mobile-basic-info__author__like-count__icon" />
            <span>{{ realtimeLikes }}</span>
          </div>
          <!-- 观看时长/学习时长 -->
          <div
            v-if="learningStatsEnabled"
            class="c-mobile-basic-info__author__right-item c-mobile-basic__author__watch-duration g-text-nowrap"
          >
            <mobile-icon-watch-duration class="c-mobile-basic__author__watch-duration__icon" />
            <span>
              {{ $lang('watch.duration.learnTime', { duration: String(viewerWatchDuration) }) }}
            </span>
          </div>
        </section>
      </div>
    </div>

    <!-- 频道介绍 -->
    <div
      v-if="showDesc"
      class="c-mobile-basic-info__desc"
    >
      <mobile-rich-text-render
        :html-content="channelDescription"
        :should-compress-imgs="compressImageEnabled"
      />
    </div>

    <!-- 页脚 -->
    <mobile-page-footer v-if="showPageFooter" />
  </div>
</template>

<script setup lang="ts">
import {
  MobileIconPeople,
  MobileIconLike,
  MobileIconWatchDuration,
} from '@/components/component-icons/mobile/map';
import MobileRichTextRender from '@/components/common-base/rich-text-render/mobile-rich-text-render.vue';
import MobilePageFooter from '@/components/common-business/page-footer/mobile-page-footer.vue';

import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelStore } from '@/store/use-channel-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { PropUtils, useProps, PwcLiveStatusTag } from '@polyv/vue-components';
import { CSSProperties, computed, unref } from 'vue';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { useChatStore } from '@/store/use-chat-store';
import { useThemeStore } from '@/store/use-theme-store';
import { generateBgStyle } from '@/themes/utils/theme-config';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { PageViewShowLocation } from '@polyv/live-watch-sdk';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { useShortNumber } from '@/hooks/business/use-short-number';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useLiveStatusTagStyle } from '../status-tag/use-status-tag';
import { storeToRefs } from 'pinia';

const props = defineProps({
  /** 是否显示页面浏览次数，默认：true */
  showPageView: PropUtils.bool.def(true),
  /** 是否显示点赞数，默认：true */
  showLikeCount: PropUtils.bool.def(true),
  /** 是否渲染频道介绍，默认：true */
  showDesc: PropUtils.bool.def(true),
  /** 是否渲染页脚，默认：true */
  showPageFooter: PropUtils.bool.def(true),
  /** 是否忽略基础信息顶部的样式，默认：false */
  ignoreBasicInfoTopStyle: PropUtils.bool.def(false),
});

const { resizeOSSImg } = useResizeOssImage();

const { showPageView, showLikeCount, showDesc } = useProps(props);

const { shortNumber } = useShortNumber();

const { liveStatus, compressImageEnabled, teacherInfo } = storeDefinitionToRefs(useChannelStore);

const { tagEffect } = useLiveStatusTagStyle();

const {
  channelTitle,
  channelPublisher,
  channelPublisherPic,
  pvShowEnabled,
  pageViewCount,
  pageViewCountLocation,
  channelDescription,
  liveShowTimeText,

  learningStatsEnabled,
  viewerWatchDuration,
} = storeDefinitionToRefs(useChannelInfoStore);

const themeStore = useThemeStore();

const { channelCoverImg, descInfoCardEnabled } = storeToRefs(themeStore);

const { realtimeLikes } = storeDefinitionToRefs(useChatStore);

const { isLowLatency, supportLowLatency } = storeDefinitionToRefs(usePlayerStore);

const { isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

const { isChineseLang } = storeDefinitionToRefs(useLangStore);

/** 页面浏览次数显示状态 */
const pageViewVisible = computed(() => {
  return (
    unref(pvShowEnabled) &&
    unref(showPageView) &&
    pageViewCountLocation.value === PageViewShowLocation.Desc
  );
});

/** 主持人是否显示完整 */
const { visible: publisherFullVisible, toggle: togglePublisherFullVisible } =
  useSimpleVisible(false);

const { getEmitter } = useGlobalInject();
function onClickPublisher() {
  togglePublisherFullVisible();

  if (teacherInfo.value?.anchorEnabled) {
    getEmitter().emit(appEvents.global.OpenAnchorPopup);
  }
}

const basicInfoTopStyle = computed<CSSProperties>(() => {
  if (props.ignoreBasicInfoTopStyle) {
    return {};
  }

  if (!themeStore.watchThemeStyleConfig) return {};

  const bgConfig = themeStore.watchThemeStyleConfig.common.introArea.bgConfig;
  return generateBgStyle(bgConfig);
});
</script>

<style lang="scss">
.c-mobile-basic-info {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.c-mobile-basic-info__top {
  padding: 0 16px;
  margin: 12px 16px 0;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  border-radius: 8px;
  @include set-skin-style(
    (
      light: (
        background-color: rgba(#fff, 0.4),
      ),
      dark: (
        background-color: rgba(#fff, 0.1),
      ),
    )
  );
}

.c-mobile-basic-info__channel {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 16px 0;
}

.c-mobile-basic-info__channel__cover {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 8px;
}

.c-mobile-basic-info__channel__inner {
  flex: 1;
}

.c-mobile-basic-info__channel__inner__top {
  display: flex;
  align-items: center;
}
.c-mobile-basic-info__channel__inner__title {
  font-size: 16px;
  line-height: 22px;
  word-break: break-word;
  @include set-skin-style(
    (
      light: (
        color: rgba(#000, 0.8),
      ),
      dark: (
        color: #fff,
      ),
    )
  );
}

.c-mobile-basic-info__channel__inner__status {
  margin-left: 8px;
  vertical-align: middle;
  transform: translateY(-1px);
}

.c-mobile-basic-info__channel__inner__bottom {
  display: flex;
  align-items: center;
  height: 18px;
  margin-top: 3px;
  font-size: 14px;
  color: rgba($neutral-color-dark-rgb, 0.6);
}

.c-mobile-basic-info__channel__inner__page-view {
  height: 10px;
  padding-left: 8px;
  margin-left: 8px;
  line-height: 10px;
  vertical-align: top;
  border-left: 1px solid rgba($neutral-color-dark-rgb, 0.1);
}

.c-mobile-basic-info__channel__inner__low-latency {
  display: inline-block;
  width: 58px;
  height: 16px;
  margin-left: 8px;
  vertical-align: middle;
  background-image: url(./imgs/low-latency-bg-mobile.svg);
  background-repeat: no-repeat;
  background-size: contain;
  transform: translateY(-1px);

  &.c-mobile-basic-info__channel__inner__low-latency__en {
    width: 100px;
    background-image: url(./imgs/low-latency-bg-mobile-en.svg);
  }
}

.c-mobile-basic-info__author {
  display: flex;
  align-items: center;
  padding: 12px 0;

  font-size: 14px;
  color: rgba($neutral-color-dark-rgb, 0.6);

  border-top: 1px solid rgba($neutral-color-dark-rgb, 0.1);
}

.c-mobile-basic-info__author__publisher {
  display: flex;
  align-items: center;
  margin-right: 16px;
  line-height: 16px;
}

.c-mobile-basic-info__author__right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.c-mobile-basic-info__author__right-item {
  display: flex;
  align-items: center;
}

.c-mobile-basic-info__author__right-item + .c-mobile-basic-info__author__right-item {
  margin-left: 8px;
}

.c-mobile-basic-info__author__publisher__icon {
  display: flex;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  font-size: 16px !important;
  border-radius: 50%;

  &.c-mobile-basic-info__author__publisher__icon-people {
    width: auto;
    height: auto;
    margin-right: 4px;
  }
}

.c-mobile-basic-info__author__like-count__icon,
.c-mobile-basic__author__watch-duration__icon {
  display: flex;
  margin-right: 4px;
  font-size: 16px !important;
}

.c-mobile-basic-info__desc {
  flex: 1;
}
</style>
