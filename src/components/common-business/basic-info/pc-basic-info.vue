<!-- @file PC 端基础信息显示 -->
<template>
  <div class="c-pc-basic-info">
    <!-- 频道 logo -->
    <div
      class="c-pc-basic-info__channel__cover g-img-cover"
      :style="{
        backgroundImage: `url(${resizeOSSImg(channelCoverImg, 80, 80)})`,
      }"
    ></div>

    <div class="c-pc-basic-info__main">
      <div class="c-pc-basic-info__main__top">
        <h1 class="c-pc-basic-info__main__title g-text-on-bg">
          <!-- 频道名称 -->
          <span
            class="g-singleline"
            :title="channelTitle"
          >
            {{ channelTitle }}
          </span>
          <!-- 直播状态标签 -->
          <pwc-live-status-tag
            class="c-pc-basic-info__main__status"
            :status="liveStatus"
            effect="fill"
          />
          <!-- 无延迟标签 -->
          <i
            v-if="(isLowLatency || isConnectMicing) && supportLowLatency"
            class="c-pc-basic-info__main__low-latency g-img-cover"
            :class="{
              'c-pc-basic-info__main__low-latency__en': !isChineseLang,
            }"
          ></i>
          <!-- 引导关注按钮 -->
          <pc-follow-btn class="c-pc-basic-info__main__follow" />
        </h1>
      </div>

      <div class="c-pc-basic-info__main__bottom">
        <!-- 主持人 -->
        <div
          class="c-pc-basic-info__main__bottom__data c-pc-basic-info__main__bottom__data--publisher"
        >
          <img
            v-if="channelPublisherPic"
            :src="channelPublisherPic"
            class="c-pc-basic-info__main__bottom__publisher-icon"
          />
          <pc-icon-people
            v-else
            class="c-pc-basic-info__main__bottom__publisher-icon"
          />
          <span
            ref="publisherReferenceRef"
            class="c-pc-basic-info__main__bottom__publisher g-singleline"
          >
            {{ channelPublisher }}
          </span>
          <transition name="fade">
            <div
              v-show="publisherPopperVisible"
              ref="publisherPopperRef"
              class="c-pc-basic-info__main__bottom__publisher__panel"
            >
              {{ channelPublisher }}
            </div>
          </transition>
        </div>

        <div
          v-if="liveShowTime"
          class="c-pc-basic-info__main__bottom__data g-text-nowrap"
        >
          {{ liveShowTimeText }} {{ $lang('base.start.live') }}
        </div>

        <!-- 页面浏览次数 -->
        <div
          v-if="pvShowEnabled"
          class="c-pc-basic-info__main__bottom__data g-text-nowrap"
        >
          {{ shortNumber(pageViewCount) }} {{ $lang('watch.pvSuffix') }}
        </div>

        <div style="margin-right: 24px; margin-left: auto"></div>

        <!--  =========== 右侧  =========== -->

        <!-- 观看时长/学习时长 -->
        <div
          v-if="learningStatsEnabled"
          class="c-pc-basic-info__main__bottom__watch-duration c-pc-basic-info__main__bottom__item-gap"
        >
          <pc-icon-watch-duration class="c-pc-basic-info__main__bottom__watch-duration__icon" />
          {{ $lang('watch.duration.learnTime', { duration: String(viewerWatchDuration) }) }}
        </div>

        <!-- 举报反馈 -->
        <div
          v-if="feedbackEnabled"
          class="c-pc-basic-info__main__bottom__feedback c-pc-basic-info__main__bottom__item-gap"
          @click="onClickFeedback"
        >
          <pc-icon-feedback class="c-pc-basic-info__main__bottom__feedback__icon" />
          {{ $lang('interact.feedback.title') }}
        </div>

        <!-- 分享 -->
        <div
          v-if="shareBtnEnabled"
          class="c-pc-basic-info__main__bottom__share-wrap c-pc-basic-info__main__bottom__item-gap"
        >
          <div
            ref="shareReferenceRef"
            class="c-pc-basic-info__main__bottom__share"
          >
            <pc-icon-share class="c-pc-basic-info__main__bottom__share__icon" />
            <span>{{ $lang('share.title') }}</span>
          </div>
          <transition name="fade">
            <div
              v-show="sharePopperVisible"
              ref="sharePopperRef"
              class="c-pc-basic-info__main__bottom__share__panel"
            >
              <pc-web-share-panel />
            </div>
          </transition>
        </div>

        <!-- 语言切换 -->
        <div
          v-if="langSwitchEnabled && !supportMultiStreamTrack"
          class="c-pc-basic-info__main__bottom__lang-switch c-pc-basic-info__main__bottom__item-gap"
        >
          <pc-lang-switch theme="dark" />
        </div>

        <!-- 双语流切换 -->
        <div
          v-if="supportMultiStreamTrack"
          class="c-pc-basic-info__main__bottom__stream-track c-pc-basic-info__main__bottom__item-gap"
        >
          <pc-stream-track />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PcLangSwitch from '@/components/common-business/lang-switch/pc-lang-switch.vue';
import PcWebSharePanel from '@/components/common-business/web-share-panel/web-share-panel.vue';
import {
  PcIconFeedback,
  PcIconPeople,
  PcIconShare,
  PcIconWatchDuration,
} from '@/components/component-icons/pc/map';
import PcFollowBtn from '@/components/page-watch-common/follow/follow-btn/pc-follow-btn.vue';
import PcStreamTrack from '@/components/page-watch-common/player/player-stream-track/pc-player-stream-track.vue';
import { usePopper } from '@/hooks/components/use-popper';

import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { useShortNumber } from '@/hooks/business/use-short-number';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLangStore } from '@/store/use-lang-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useShareStore } from '@/store/use-share-store';
import { useThemeStore } from '@/store/use-theme-store';
import { PwcLiveStatusTag } from '@polyv/vue-components';

const { resizeOSSImg } = useResizeOssImage();

const { shortNumber } = useShortNumber();

const {
  referenceRef: publisherReferenceRef,
  popperRef: publisherPopperRef,
  popperVisible: publisherPopperVisible,
} = usePopper({
  trigger: 'hover',
  arrow: true,
});

const {
  referenceRef: shareReferenceRef,
  popperRef: sharePopperRef,
  popperVisible: sharePopperVisible,
} = usePopper({
  trigger: 'hover',
  arrow: true,
});

const {
  channelTitle,
  channelPublisher,
  channelPublisherPic,
  liveShowTime,
  liveShowTimeText,

  pageViewCount,
  pvShowEnabled,

  learningStatsEnabled,
  viewerWatchDuration,
} = storeDefinitionToRefs(useChannelInfoStore);

const { supportMultiStreamTrack, liveStatus } = storeDefinitionToRefs(useChannelStore);

const { channelCoverImg } = storeDefinitionToRefs(useThemeStore);

const { isLowLatency, supportLowLatency } = storeDefinitionToRefs(usePlayerStore);

const { isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

const { langSwitchEnabled, isChineseLang } = storeDefinitionToRefs(useLangStore);

const { shareBtnEnabled } = storeDefinitionToRefs(useShareStore);

const { feedbackEnabled } = storeDefinitionToRefs(useInteractReceiveStore);

const { getEmitter } = useGlobalInject();

function onClickFeedback() {
  getEmitter().emit(appEvents.interaction.OpenFeedback, true);
}
</script>

<style lang="scss">
$--basic-logo-size: 50px;

.c-pc-basic-info {
  position: relative;
  padding-left: 66px;
}

.c-pc-basic-info__channel__cover {
  position: absolute;
  top: 0;
  left: 0;
  flex-shrink: 0;
  width: $--basic-logo-size;
  height: $--basic-logo-size;
}

.c-pc-basic-info__main {
  flex: 1;
}

.c-pc-basic-info__main__top {
  width: 100%;
  margin-bottom: 6px;
  overflow: hidden;
}

.c-pc-basic-info__main__title {
  display: flex;
  align-items: center;
  font-size: 18px;
  line-height: 20px;
  color: $--color-white;
}

.c-pc-basic-info__main__status {
  margin-left: 20px;
}

.c-pc-basic-info__main__low-latency {
  flex-shrink: 0;
  width: 68px;
  height: 20px;
  margin-left: 13px;
  background-image: url(./imgs/low-latency-bg-pc.svg);
  background-size: contain;

  &.c-pc-basic-info__main__low-latency__en {
    width: 124px;
    height: 29px;
    margin-left: 8px;
    background-image: url(./imgs/low-latency-bg-pc-en.svg);
  }
}

.c-pc-basic-info__main__follow {
  flex-shrink: 0;
  margin-left: 13px;
}

.c-pc-basic-info__main__bottom {
  display: flex;
  align-items: center;
  overflow-x: hidden;
  font-size: 14px;
  color: $--color-white;
}
.c-pc-basic-info__main__bottom__data {
  display: flex;
  align-items: center;
  line-height: 20px;
}
.c-pc-basic-info__main__bottom__data + .c-pc-basic-info__main__bottom__data {
  margin-left: 16px;

  &::before {
    height: 14px;
    margin-right: 16px;
    content: '';
    border-left: 1px solid #ebebeb;
  }
}
.c-pc-basic-info__main__bottom__data--publisher {
  flex-shrink: 1;
  min-width: 40px;
  overflow: hidden;
}
.c-pc-basic-info__main__bottom__publisher-icon {
  display: flex;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  font-size: 24px !important;
  border-radius: 50%;
}
.c-pc-basic-info__main__bottom__publisher__panel {
  box-sizing: border-box;
  max-width: 300px;
  padding: 10px 16px;
  margin-bottom: 4px;

  font-size: 12px;
  line-height: 1;

  background: #edecec;
  border-radius: 4px;
  box-shadow: 0 0 12px 0 rgba(#000, 0.1);
}

.c-pc-basic-info__main__bottom__item-gap + .c-pc-basic-info__main__bottom__item-gap {
  margin-left: 28px;
}

.c-pc-basic-info__main__bottom__watch-duration {
  display: flex;
  align-items: center;
  height: 20px;
  white-space: nowrap;
}
.c-pc-basic-info__main__bottom__watch-duration__icon {
  display: flex;
  margin-right: 6px;
  font-size: 20px !important;
}

.c-pc-basic-info__main__bottom__feedback {
  display: flex;
  align-items: center;
  height: 20px;
  white-space: nowrap;
  cursor: pointer;
}
.c-pc-basic-info__main__bottom__feedback__icon {
  display: flex;
  margin-right: 6px;
  font-size: 18px;
}

.c-pc-basic-info__main__bottom__share {
  display: flex;
  align-items: center;
  height: 20px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}

.c-pc-basic-info__main__bottom__share__icon {
  display: flex;
  margin-right: 6px;
  font-size: 20px !important;
}

.c-pc-basic-info__main__bottom__lang-switch {
  height: 20px;
}

.c-pc-basic-info__main__bottom__stream-track {
  display: flex;
  align-items: center;
}
</style>
