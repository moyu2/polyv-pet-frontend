<!-- @file PC 端观看页主体布局 -->
<template>
  <div class="c-pc-watch-layout g-outside">
    <!-- 顶部固定toast提示 -->
    <pc-connect-mic-tips
      v-if="isDeviceRecoverFailed"
      class="c-pc-watch-layout__tips"
    />

    <!-- 上半部分 -->
    <div
      class="c-pc-watch-layout__main-wrap"
      :class="{
        'c-pc-watch-layout__main-wrap--has-doc': canRenderDoc,
        'c-pc-watch-layout__main-wrap--center': pcAsideSectionIsEmpty && !isFullscreen,
      }"
    >
      <div
        class="c-pc-watch-layout__main g-boundary"
        :class="{
          'c-pc-watch-layout__main--sub-pack-up': subScreenPackUp,
        }"
      >
        <!-- 主体布局左侧 -->
        <div class="c-pc-watch-layout__main__left">
          <!-- 基础信息区域 -->
          <div
            v-if="!iframeMode"
            class="c-pc-watch-layout__main__basic-wrap"
          >
            <pc-basic-info />
          </div>
        </div>

        <!-- 主体布局右侧 -->
        <div
          v-show="!pcAsideSectionIsEmpty"
          class="c-pc-watch-layout__main__right"
        >
          <!-- 右侧顶部占位 -->
          <div
            v-if="canRenderDoc"
            class="c-pc-watch-layout__main__right__top"
          ></div>

          <!-- 右侧主体 -->
          <div class="c-pc-watch-layout__main__right__content">
            <!-- 页面广告 -->
            <pc-page-advert
              v-if="!isPlaybackWatchUrl"
              class="c-pc-watch-layout__main__right__advert"
            />

            <!-- 侧边菜单栏 -->
            <div class="c-pc-watch-layout__main__right__content__inner">
              <pc-watch-aside-menu v-if="layoutLoaded" />
            </div>
          </div>

          <!-- 打赏支付 -->
          <pc-donate-pay-qrcode class="c-pc-watch-layout__main__right__donate-pay" />
        </div>

        <!-- 播放器和文档主体区--包括全屏 -->
        <div
          class="c-pc-watch-layout__main__fullscreen-wrap"
          :class="{
            'c-pc-watch-layout__main__fullscreen-wrap--fullscreened': isFullscreen,
            'c-pc-watch-layout__main__fullscreen-wrap--page-fullscreened': isPcPageFullscreen,
            'c-pc-watch-layout__main__fullscreen-wrap--page-fullscreened--hide-watermark':
              isFullscreenWatermarkVisible,
          }"
          @mousemove="showPlayerControl"
          @mouseenter="showPlayerControl"
          @mouseleave="hidePlayerControl"
        >
          <div class="c-pc-watch-layout__main__fullscreen-wrap__height"></div>

          <!-- 左侧主体固定区域  -->
          <div class="c-pc-watch-layout__main__topic">
            <!-- 聊天室连接异常提示 -->
            <pc-chat-connect-error-tips />
          </div>

          <!-- 播放器层 -->
          <div
            :class="{
              'c-pc-watch-layout__main__player-wrap': true,
              'c-pc-watch-layout__main__player-wrap--right':
                mainScreen !== MainScreenContent.Player,
            }"
          >
            <div class="c-pc-watch-layout__main__player-content">
              <div class="c-pc-watch-layout__main__player-inner">
                <pc-connect-mic-user-item
                  v-if="masterMicItem"
                  :key="`master-stream-${masterMicItem.streamId}`"
                  :mic-item="masterMicItem"
                  :mic-info-visible="mainScreen !== MainScreenContent.Player"
                  :fit-type="connectMicFitType"
                />
                <player-play-button
                  class="c-pc-watch-layout__main__player-inner__mic-btn"
                  v-if="shouldShowPlayButton"
                  :mode="PlayButtonMode.Text"
                  @click="onPlayClick"
                />
                <pc-player-main v-if="canRenderPlayer" />
              </div>
            </div>
          </div>

          <!-- 文档层 -->
          <div
            v-if="canRenderDoc"
            :class="{
              'c-pc-watch-layout__main__player-wrap': true,
              'c-pc-watch-layout__main__player-wrap--right': mainScreen !== MainScreenContent.Doc,
            }"
          >
            <div class="c-pc-watch-layout__main__player-content">
              <div class="c-pc-watch-layout__main__player-inner">
                <pc-doc />
              </div>
            </div>
          </div>

          <!-- 副屏收起控件 -->
          <div
            v-show="!isFullscreen"
            class="c-pc-watch-layout__sub-pack-up-wrap"
          >
            <pc-watch-sub-pack-up v-if="canRenderDoc" />
          </div>

          <!-- 播放器弹幕层 -->
          <div class="c-pc-watch-layout__main-layer c-pc-watch-layout__main__player-barrage">
            <pc-barrage />
          </div>

          <!-- 播放器-公告跑马灯层 -->
          <div
            v-if="managerBulletinMarqueeRenderEnabled"
            v-show="managerBulletinMarqueeEnabled"
            class="c-pc-watch-layout__main-layer c-pc-watch-layout__main__player-bulletin-marquee"
          >
            <pc-bulletin-marquee />
          </div>

          <!-- 播放器侧边 - 互动功能渲染入口 -->
          <div class="c-pc-watch-layout__main-layer">
            <div class="c-pc-watch-layout__main__side-popup-render">
              <pc-iar-render-upper-player v-if="iarSdkLoaded && iarUIV1Loaded && layoutLoaded" />
              <pc-iar-render-upper-player-v2 v-if="iarSdkLoaded && layoutLoaded && !notNeedIar" />
              <pc-live-activity-render v-if="liveActivityLoaded && layoutLoaded" />
              <pc-watch-layout-player-side-popup
                v-if="
                  layoutLoaded &&
                  ((iarSdkLoaded && iarUIV1Loaded) || liveActivityRewardEntranceVisible)
                "
              />
              <pc-product-render v-if="iarSdkLoaded && !isPlaybackWatchUrl" />
            </div>

            <!-- 播放器右下角挂件区 -->
            <div class="c-pc-watch-layout__main__side-pendant-render">
              <!-- 商品推送卡片，沿用播放器挂件位置，位于全部商品入口上方 -->
              <div
                v-if="iarSdkLoaded && layoutLoaded && !isPlaybackWatchUrl"
                class="c-pc-watch-layout__main__product-card-render"
              >
                <pc-product-small-card />
                <div class="c-pc-watch-layout__main__product-bottom-card-render">
                  <pc-product-bottom-card v-if="interactSetting.liveProductEnabled" />
                </div>
              </div>

              <!-- 商品库挂件，开启「播放器是否悬浮商品列表入口开关」显示 -->
              <pc-product-pendant
                v-if="
                  iarSdkLoaded &&
                  !isPlaybackWatchUrl &&
                  layoutLoaded &&
                  interactSetting.productEntryPosition === ProductEntryPosition.Player &&
                  interactSetting.productEnabled
                "
              />

              <!-- AI 答题卡 -->
              <ai-question-card v-if="layoutLoaded && aiKnowledgeQuizEnabled" />
            </div>
          </div>

          <div class="c-pc-watch-layout__main-layer c-pc-watch-layout__main__page-notices">
            <div class="c-pc-watch-layout__main__page-notices__content">
              <!-- 发起转播频道被踢出提示 -->
              <pc-page-notice
                v-if="chatExited"
                :tips="$lang('chat.transformTip')"
              />

              <!-- 聊天重放消息提示 -->
              <pc-chat-msg-replay-tips />
            </div>
          </div>

          <!-- 播放器控制栏层 -->
          <div
            ref="PlayerControlWrapperRef"
            class="c-pc-watch-layout__main-layer c-pc-watch-layout__main__player-control"
          >
            <transition name="fade">
              <pc-player-control
                v-if="canRenderPlayer"
                v-show="playerControlEnabled && playerControlVisible"
              />
            </transition>
          </div>

          <!-- 直播倒计时 + 直播预约层 -->
          <pc-count-down-layer
            class="c-pc-watch-layout__main-layer c-pc-watch-layout__main__count-down"
          />

          <!-- 课堂激励点赞动画 -->
          <motivation-like-animation
            v-if="donateAnimationVisible"
            class="c-pc-watch-layout__main-layer c-pc-watch-layout__main__motivation-like-animation"
            :enable-types="[MotivationLikeType.Mic]"
          />

          <!-- 置顶消息 -->
          <chat-loader-helper>
            <div class="c-pc-watch-layout__main-layer">
              <toping-msg class="c-pc-watch-layout__main__toping-msg" />
            </div>
          </chat-loader-helper>

          <!-- 其他直播预约 -->
          <common-other-live-booking class="c-pc-watch-layout__main__other-live-booking" />

          <!-- 全屏水印 -->
          <fullscreen-watermark />
        </div>
      </div>
    </div>

    <!-- 下半部分 -->
    <div
      v-if="!isPlaybackWatchUrl && !iframeMode"
      class="c-pc-watch-layout__menu-panel-wrap"
    >
      <div class="c-pc-watch-layout__menu-panel-content g-boundary">
        <div
          class="c-pc-watch-layout__menu-panel-inner"
          :class="{
            'c-pc-watch-layout__menu-panel-inner--center': pcAsideSectionIsEmpty,
          }"
        >
          <!-- 多会场（横向布局） -->
          <pc-multi-meeting-horizontal
            class="c-pc-watch-layout__menu-panel-inner__item pws-theme-bg pws-theme-mask-bg"
            v-if="
              multiMeetingEnabled && multiMeetingListLayout === MultiMeetingListLayout.Horizontal
            "
          />

          <!-- 底部菜单栏 -->
          <pc-watch-bottom-menu
            class="c-pc-watch-layout__menu-panel-inner__item pws-theme-bg pws-theme-mask-bg"
          />
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <pc-page-footer />
  </div>
</template>

<script setup lang="ts">
import PcPageNotice from '@/components/common-base/page-notice/pc-page-notice.vue';
import PcBasicInfo from '@/components/common-business/basic-info/pc-basic-info.vue';
import CommonOtherLiveBooking from '@/components/common-business/live-booking/common-other-live-booking/common-other-live-booking.vue';
import PcPageFooter from '@/components/common-business/page-footer/pc-page-footer.vue';
import FullscreenWatermark from '@/components/common-business/watermark/fullscreen-watermark.vue';
import PcBarrage from '@/components/page-watch-common/barrage/pc-barrage.vue';
import PcBulletinMarquee from '@/components/page-watch-common/bulletin-marquee/pc-bulletin-marquee.vue';
import PcChatConnectErrorTips from '@/components/page-watch-common/chat/chat-connect-error/chat-connect-error-tips/pc-chat-connect-error-tips.vue';
import PcChatMsgReplayTips from '@/components/page-watch-common/chat/chat-msg-replay-tips/pc-chat-msg-replay-tips.vue';
import PcConnectMicUserItem from '@/components/page-watch-common/connect-mic/pc-connect-mic/pc-connect-mic-user-item.vue';
import PcCountDownLayer from '@/components/page-watch-common/count-down-layer/pc-count-down-layer.vue';
import PcDoc from '@/components/page-watch-common/doc/pc-doc.vue';
import PcDonatePayQrcode from '@/components/page-watch-common/donate/donate-panel/pc-donate-panel/pc-donate-pay-qrcode.vue';
import PcIarRenderUpperPlayerV2 from '@/components/page-watch-common/interactive-receive-v2/pc-iar-render-upper-player-v2.vue';
import PcLiveActivityRender from '@/components/page-watch-common/live-activity/pc-live-activity-render.vue';
import PcIarRenderUpperPlayer from '@/components/page-watch-common/interactive-receive/pc-iar-render-upper-player.vue';
import MotivationLikeAnimation from '@/components/page-watch-common/motivation/motivation-like-animation/motivation-like-animation.vue';
import PcMultiMeetingHorizontal from '@/components/page-watch-common/multi-meeting/pc-multi-meeting/pc-multi-meeting-horizontal.vue';
import PcPageAdvert from '@/components/page-watch-common/page-advert/pc-page-advert.vue';
import PlayerPlayButton from '@/components/page-watch-common/player/common/player-play-button/player-play-button.vue';
import PcPlayerControl from '@/components/page-watch-common/player/player-control/pc-player-control/pc-player-control.vue';
import PcPlayerMain from '@/components/page-watch-common/player/player-main/pc-player-main/pc-player-main.vue';
import AiQuestionCard from '@/components/page-watch-common/polyv-ai/ai-question/ai-question-card.vue';
import PcProductRender from '@/components/page-watch-common/product/pc-product-render.vue';
import PcProductBottomCard from '@/components/page-watch-common/product/product-bottom-card/pc-product-bottom-card.vue';
import PcProductPendant from '@/components/page-watch-common/product/product-pendant/pc-product-pendant.vue';
import PcProductSmallCard from '@/components/page-watch-common/product/product-small-card/pc-product-small-card.vue';
import { $ } from '@polyv/utils/dom';
import { onMounted, ref, watch } from 'vue';
import PcWatchAsideMenu from './pc-watch-aside-menu.vue';
import PcWatchBottomMenu from './pc-watch-bottom-menu.vue';
import PcWatchLayoutPlayerSidePopup from './pc-watch-layout-player-side-popup.vue';
import PcWatchSubPackUp from './pc-watch-sub-pack-up.vue';

import { useFullscreenWatermark } from '@/components/common-business/watermark/use-fullscreen-watermark';
import { PlayButtonMode } from '@/components/page-watch-common/player/common/player-play-button/use-player-play-button';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDocStore } from '@/store/use-doc-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { SwitchTipsStatus, usePlayerStore } from '@/store/use-player-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

import { useGlobalInject } from '@/app/use-global-inject';
import { ChatLoaderHelper } from '@/components/page-watch-common/chat-v2/chat-loader-helper';
import TopingMsg from '@/components/page-watch-common/chat-v2/toping-msg/index.vue';
import { useSmallClassPlay } from '@/components/page-watch-common/connect-mic/hooks/use-small-class-play';
import PcConnectMicTips from '@/components/page-watch-common/connect-mic/pc-connect-mic/pc-connect-mic-tips.vue';
import { useHoverVisible } from '@/hooks/behaviors/use-hover-visible';
import { useLayoutLoad } from '@/hooks/core/use-layout-load';
import { useChatStore } from '@/store/use-chat-store';
import {
  MainScreenContent,
  MotivationLikeType,
  MultiMeetingListLayout,
  ProductEntryPosition,
} from '@polyv/live-watch-sdk';

const { layoutLoaded } = useLayoutLoad('pc-watch-layout');

const { notNeedIar, iframeMode, isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { aiKnowledgeQuizEnabled } = storeDefinitionToRefs(usePlaybackStore);
const { liveActivityLoaded, liveActivityRewardEntranceVisible } =
  storeDefinitionToRefs(useLiveActivityStore);

const { chatExited } = storeDefinitionToRefs(useChatStore);

const { canRenderPlayer, playerControlEnabled, switchQualityTipStatus, showControl } =
  storeDefinitionToRefs(usePlayerStore);

const { managerBulletinMarqueeEnabled, managerBulletinMarqueeRenderEnabled } =
  storeDefinitionToRefs(useChannelStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const { mainScreen, subScreenPackUp, isFullscreen, isPcPageFullscreen, pcAsideSectionIsEmpty } =
  storeDefinitionToRefs(useLayoutStore);

const { masterMicItem, isDeviceRecoverFailed, connectMicFitType } =
  storeDefinitionToRefs(useConnectMicStore);

const { multiMeetingListLayout, multiMeetingEnabled } = storeDefinitionToRefs(useMultiMeetingStore);

const { donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);

const { iarSdkLoaded, iarUIV1Loaded, interactSetting } =
  storeDefinitionToRefs(useInteractReceiveStore);

const PlayerControlWrapperRef = ref<HTMLDivElement>();

const {
  hoverItemVisible: playerControlVisible,
  showHoverItem: showPlayerControlItem,
  forceShowHoverItem: forceShowPlayerControlItem,
  hideHoverItem: hidePlayerControl,
} = useHoverVisible();

const { isFullscreenWatermarkVisible } = useFullscreenWatermark();

function showPlayerControl(e: MouseEvent) {
  // 聚焦在播放器控制栏上时，不需要自动隐藏
  if (
    PlayerControlWrapperRef.value &&
    e.target &&
    PlayerControlWrapperRef.value.contains(e.target as HTMLElement)
  ) {
    forceShowPlayerControlItem();
    return;
  }

  showPlayerControlItem();
}

const { displayPcWatchBackgroundImage } = storeDefinitionToRefs(useThemeStore);

const { getAppBodyElement } = useGlobalInject();

onMounted(() => {
  // 需要在 body 设置全局背景
  $(getAppBodyElement()).addClass(['plv-pc-watch-bg', 'pws-pc-watch-bg']);
  if (displayPcWatchBackgroundImage.value) {
    getAppBodyElement().style.setProperty(
      'background-image',
      `url("${displayPcWatchBackgroundImage.value}")`,
      'important',
    );
  }
});

// switchQualityTipStatus 状态改变时显示控制栏
watch(switchQualityTipStatus, () => {
  if (
    [SwitchTipsStatus.Finish, SwitchTipsStatus.Switching].includes(switchQualityTipStatus.value)
  ) {
    showPlayerControlItem();
  }
});

watch(showControl, val => {
  if (val === true) {
    showPlayerControlItem();
    showControl.value = false;
  }
});

const { shouldShowPlayButton, onPlayClick } = useSmallClassPlay();
</script>

<style lang="scss">
// 直播倒计时层
$--layer-zIndex-count-down: 310;
// 课堂激励动画层
$--layer-zIndex-motivation-like-animation: 310;

// 左侧占比
$--layout-left-width-percent: 76.2% !default;

$--layout-gap-percent: 12px !default;

// 右侧宽度占比
$--layout-right-width-percent: calc(
  100% - $--layout-left-width-percent - $--layout-gap-percent
) !default;

// 播放器比例
$--layout-player-percent: 56.25% !default;
// 副屏收起时的高度
$--layout-sub-pack-up-height: 40px !default;

.plv-pc-watch-bg {
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: top;
  background-size: cover;
}

.c-pc-watch-layout {
  width: 100%;
  height: 100%;
}

.c-pc-watch-layout__tips {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
}

.c-pc-watch-layout__main-wrap {
  position: relative;
  padding-top: 3%;
  padding-bottom: 12px;
}

.c-pc-watch-layout__main-wrap--center {
  .c-pc-watch-layout__main__player-wrap,
  .c-pc-watch-layout__main-layer {
    left: 50%;
    transform: translateX(-50%);
  }

  .c-pc-watch-layout__main__left {
    margin: 0 auto;
  }
}

.c-pc-watch-layout__main {
  position: relative;
  // color: #fff;
}

.c-pc-watch-layout__main__fullscreen-wrap {
  position: absolute;
  top: 0;
  left: 0;
  // z-index: 90;
  width: 100%;
  pointer-events: none;
}
.c-pc-watch-layout__main__fullscreen-wrap__height {
  width: $--layout-left-width-percent;
  pointer-events: none;
  &::before {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: $--layout-player-percent;
    content: '';
  }
}

.c-pc-watch-layout__main__topic {
  position: absolute;
  top: 8%;
  left: 0;
  z-index: $--zIndex-dialog-base;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: $--layout-left-width-percent;
  padding: 0 20px;
  pointer-events: none;
}

.c-pc-watch-layout__main__player-wrap {
  position: absolute;
  top: 0;
  left: 0;
  // z-index: 200;
  z-index: 0;
  width: $--layout-left-width-percent;
  height: 100%;
  pointer-events: initial;
}
.c-pc-watch-layout__main__player-content,
.c-pc-watch-layout__main__player-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.c-pc-watch-layout__main__player-inner {
  @include pc-watch-card-radius-top;
  overflow: hidden;
}
.c-pc-watch-layout__main__player-wrap--right {
  right: 0;
  bottom: initial;
  left: initial;
  z-index: 100;
  width: $--layout-right-width-percent;
  height: initial;

  .c-pc-watch-layout__main__player-content {
    position: relative;
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: $--layout-player-percent;
  }
}

.c-pc-watch-layout__main-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: $--layout-left-width-percent;
  height: 100%;
  pointer-events: none;

  &:empty {
    display: none;
  }
}

.c-pc-watch-layout__sub-pack-up-wrap {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 110;
  width: $--layout-right-width-percent;
  height: $--layout-sub-pack-up-height;
  @include pc-watch-card-radius-top;
}

.c-pc-watch-layout__main__player-barrage {
  z-index: 0;
  height: 100%;
  pointer-events: none;
}

.c-pc-watch-layout__main__player-bulletin-marquee {
  z-index: 0;
  height: 100%;
  pointer-events: none;
}

.c-pc-watch-layout__main__player-control {
  bottom: 0;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
}
.c-pc-watch-layout__main__count-down {
  z-index: $--layer-zIndex-count-down;
}
.c-pc-watch-layout__main__motivation-like-animation {
  top: 25%;
  z-index: $--layer-zIndex-motivation-like-animation;
  height: 50%;
  padding-bottom: 0;
}

.c-pc-watch-layout__main__fullscreen-wrap--fullscreened {
  pointer-events: initial;

  .c-pc-watch-layout__main__topic {
    width: 100%;
  }

  .c-pc-watch-layout__main-layer {
    width: 100%;
  }
  .c-pc-watch-layout__main__player-wrap {
    width: 100%;
  }
  .c-pc-watch-layout__main__player-wrap--right {
    display: none;
  }
}

.c-pc-watch-layout__main__fullscreen-wrap--page-fullscreened {
  position: fixed;
  z-index: $--zIndex-max-top;
  width: $--plv-pc-watch-full-screen-vw;
  height: $--plv-pc-watch-full-screen-vh;
  // 增加背景色防止网页全屏后底下的内容被显现出来
  background-color: #212121;
}

.c-pc-watch-layout__main__left {
  position: relative;
  width: $--layout-left-width-percent;
  @include pc-watch-card-radius-top;

  &::before {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: $--layout-player-percent;
    content: '';
    background: #212121;
    @include pc-watch-card-radius-top;
  }
}

.c-pc-watch-layout__main__basic-wrap {
  padding: 22px 20px;
  background-color: rgba(#000000, 0.4);
  @include pc-watch-card-radius-bottom;
}

.c-pc-watch-layout__main__right {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: $--layout-right-width-percent;
  height: 100%;
  pointer-events: none;

  @include pc-watch-card-radius-top;

  &:has(.c-pc-watch-layout__main__right__top) {
    .c-pc-watch-layout__main__right__advert {
      border-radius: 0;
    }

    .c-pc-watch-layout__main__right__content__inner {
      border-radius: 0;
    }
  }

  &:has(.c-pc-watch-layout__main__right__advert) {
    .c-pc-watch-layout__main__right__content__inner {
      border-radius: 0;
    }
  }
}
.c-pc-watch-layout__main__right__top {
  width: 100%;
  border-radius: inherit;
  &::after {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: $--layout-player-percent;
    content: '';
    background: #212121;
    border-radius: inherit;
  }
}

.c-pc-watch-layout__main__right__advert {
  border-radius: inherit;
}

.c-pc-watch-layout__main__right__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  pointer-events: initial;
  border-radius: inherit;
}
.c-pc-watch-layout__main__right__content__inner {
  flex: 1;
  border-radius: inherit;
}
.c-pc-watch-layout__main__right__donate-pay {
  pointer-events: initial;
}

.c-pc-watch-layout__main--sub-pack-up {
  .c-pc-watch-layout__main__player-wrap--right {
    height: $--layout-sub-pack-up-height;
    overflow: hidden;
  }
  .c-pc-watch-layout__main__right__top::after {
    height: $--layout-sub-pack-up-height;
    padding-bottom: initial;
  }
}

.c-pc-watch-layout__menu-panel-inner {
  box-sizing: border-box;
  // padding: 0 32px;

  &.c-pc-watch-layout__menu-panel-inner--center {
    width: $--layout-left-width-percent;
    margin: 0 auto;
  }
}

.c-pc-watch-layout__menu-panel-inner__item {
  position: relative;
  background-color: $--color-white;
  @include pc-watch-card-radius;
  &::before {
    @include pc-watch-card-radius;
  }
}

.c-pc-watch-layout__main__side-popup-render {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 3000;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.c-pc-watch-layout__main__side-pendant-render {
  position: absolute;
  right: 16px;
  bottom: 60px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  max-width: calc(100% - 32px);
}

.c-pc-watch-layout__main__product-card-render {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 100%;
}

.c-pc-watch-layout__main__product-bottom-card-render {
  box-sizing: border-box;
  width: 308px;
  max-width: 100%;
  pointer-events: initial;
}

.c-pc-watch-layout .plv-product-bottom-card-animation-enter,
.c-pc-watch-layout .plv-product-bottom-card-animation-leave-active {
  transform: translateX(100%);
}

.c-pc-watch-layout__main__other-live-booking {
  position: absolute;
  top: 32px;
  left: 32px;
  z-index: $--layer-zIndex-count-down;
  pointer-events: initial;
}

.c-pc-watch-layout__main__page-notices__content {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 350px;
  transform: translateX(-50%);

  .c-pc-page-notice {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
}

.c-pc-watch-layout__main__toping-msg {
  position: absolute;
  top: 8%;
  left: 50%;
  width: 450px;
  pointer-events: initial;
  transform: translateX(-50%);
}

.c-pc-watch-layout__main__fullscreen-wrap--page-fullscreened--hide-watermark {
  & #pptAndPaintDiv [data-type='watermark'] {
    display: none;
  }
}

.c-pc-watch-layout__main__player-inner__mic-btn {
  pointer-events: auto !important;
}
</style>
