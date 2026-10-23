<!-- @file PC 端引导页 -->
<template>
  <div
    class="c-pc-splash"
    ref="splashRef"
    :class="{
      'c-pc-splash--theme': useNewTheme,
    }"
  >
    <header class="c-pc-splash__header g-outside">
      <custom-teleport :to="getAppBodyElement()">
        <div
          class="c-pc-splash__header__bg__teleport__wrapper g-outside"
          :class="{
            'pws-pc-watch-bg': useNewTheme,
            'c-pc-splash__header__bg__teleport__wrapper--legacy': !useNewTheme,
          }"
          :style="[bgStyle, themeBackgroundStyle]"
        >
          <div
            v-if="!useNewTheme && supportsFilterStyle && hasSplash"
            class="c-pc-splash__header__bg"
          >
            <channel-splash-img />
          </div>
          <!-- 遮罩层 -->
          <div class="c-pc-splash__header__mask"></div>
        </div>
      </custom-teleport>
      <!-- 头部内容层 -->
      <div class="c-pc-splash__header__inner g-boundary">
        <div class="c-pc-splash__header__cover">
          <channel-splash-img />
        </div>
        <div class="c-pc-splash__header__main">
          <!-- 频道标题 -->
          <plv-text-ellipsis
            class="c-pc-splash__header__title"
            :max-row="3"
            :line-height="36"
          >
            {{ channelTitle }}

            <template #suffix>
              <!-- 直播状态 -->
              <pwc-live-status-tag
                class="c-pc-splash__header__status__tag"
                :status="liveStatus"
                effect="fill"
              />
            </template>
          </plv-text-ellipsis>

          <!-- 主持人 -->
          <div class="c-pc-splash__header__author">
            <img
              v-if="channelPublisherPic"
              class="c-pc-splash__header__author__icon"
              :src="channelPublisherPic"
            />
            <pc-icon-people
              v-else
              class="c-pc-splash__header__author__icon"
            />
            <span
              ref="publisherReferenceRef"
              class="c-pc-splash__header__author__publisher g-singleline g-vmid"
            >
              {{ channelPublisher }}
            </span>
            <transition name="fade">
              <div
                v-show="publisherPopperVisible"
                ref="publisherPopperRef"
                class="c-pc-splash__header__author__publisher__panel"
              >
                {{ channelPublisher }}
              </div>
            </transition>
          </div>

          <div class="c-pc-splash__header__status">
            <!-- 直播时间 -->
            <span class="c-pc-splash__header__status__time g-vmid">
              {{ $lang('watch.liveTime') }}：{{ liveShowTimeText }}
            </span>

            <!-- 直播预约 -->
            <pc-live-booking-button
              v-if="showLiveBookingButton"
              class="c-pc-splash__header__status__booking"
            />
          </div>

          <!-- 直播倒计时 -->
          <pc-live-count-down
            v-if="showLiveCountDown"
            class="c-pc-splash__header__countdown"
            theme="number-square"
          />

          <!-- 观看条件 -->
          <pc-auth
            v-if="!isAuthorized || forceSplashPage"
            class="c-pc-splash__header__auth"
          />
          <!-- 报名观看 -->
          <pc-enroll
            v-else-if="needEnrollByEnter"
            class="c-pc-splash__header__enroll"
          />
        </div>
      </div>
    </header>

    <div
      v-if="useNewTheme"
      class="c-pc-splash-split-line g-boundary"
    ></div>

    <div class="c-pc-splash__main">
      <div class="c-pc-splash__main__inner g-boundary">
        <pc-normal-tabs>
          <template v-for="(menu, index) in channelMenus">
            <!-- 直播介绍 -->
            <pc-normal-tab-pane
              v-if="menu.menuType === ChannelMenuType.Desc"
              :key="`desc-${index}`"
              :label="menu.name"
              :name="ChannelMenuType.Desc"
              lazy-load
            >
              <pc-rich-text-render
                :html-content="channelDescription"
                :should-compress-imgs="compressImageEnabled"
                :follow-page-skin="false"
              />
            </pc-normal-tab-pane>
          </template>
        </pc-normal-tabs>

        <!-- <pc-lang-switch
          v-if="langSwitchEnabled"
          class="c-pc-splash__main__inner__lang-switch"
        /> -->
      </div>
    </div>

    <!-- 右下角固定挂件 -->
    <pc-page-fixed-widgets />

    <!-- 页脚 -->
    <pc-page-footer class="c-pc-splash__footer" />
  </div>
</template>

<script setup lang="ts">
import { supportsFilterStyle } from '@/assets/utils/dom';
import { ChannelMenuType } from '@polyv/live-watch-sdk';

import CustomTeleport from '@/components/common-base/custom-teleport/custom-teleport';
import PcRichTextRender from '@/components/common-base/rich-text-render/pc-rich-text-render.vue';
import PcNormalTabPane from '@/components/common-base/tabs/pc-normal-tabs/pc-normal-tab-pane.vue';
import PcNormalTabs from '@/components/common-base/tabs/pc-normal-tabs/pc-normal-tabs.vue';
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import PcEnroll from '@/components/common-business/enroll/pc-enroll.vue';
// import PcLangSwitch from '@/components/common-business/lang-switch/pc-lang-switch.vue';
import PcLiveBookingButton from '@/components/common-business/live-booking/pc-live-booking-button.vue';
import PcLiveCountDown from '@/components/common-business/live-count-down/pc-live-count-down.vue';
import PcPageFixedWidgets from '@/components/common-business/page-fixed-widgets/page-fixed-widgets.vue';
import PcPageFooter from '@/components/common-business/page-footer/pc-page-footer.vue';
import { PcIconPeople } from '@/components/component-icons/pc/map';
import PcAuth from '@/components/page-splash-common/auth/pc-auth.vue';
import { useLoginReturnAuthPopup } from '@/components/page-splash-common/hooks/use-login-return-auth-popup';
import { usePopper } from '@/hooks/components/use-popper';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { PlvTextEllipsis } from '@/plugins/polyv-ui/admin-import';
import { useAuthStore } from '@/store/use-auth-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useEnrollStore } from '@/store/use-enroll-store';
// import { useLangStore } from '@/store/use-lang-store';

import { useGlobalInject } from '@/app/use-global-inject';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { useThemeStore } from '@/store/use-theme-store';

import { PwcLiveStatusTag, useResizeObserver } from '@polyv/vue-components';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { computed, ref } from 'vue';

const { getAppBodyElement } = useGlobalInject();

const { forceSplashPage, useNewTheme } = storeDefinitionToRefs(useWatchAppStore);

const { isAuthorized } = storeDefinitionToRefs(useAuthStore);

const { needEnrollByEnter } = storeDefinitionToRefs(useEnrollStore);

const {
  channelTitle,
  channelPublisher,
  channelPublisherPic,
  channelDescription,
  showLiveCountDown,
  liveShowTimeText,
} = storeDefinitionToRefs(useChannelInfoStore);

const { hasSplash, displayPcWatchBackgroundImage } = storeDefinitionToRefs(useThemeStore);

const { compressImageEnabled, liveStatus } = storeDefinitionToRefs(useChannelStore);

const {
  referenceRef: publisherReferenceRef,
  popperRef: publisherPopperRef,
  popperVisible: publisherPopperVisible,
} = usePopper({
  trigger: 'hover',
  arrow: true,
});

const splashRef = ref<HTMLElement>();
const bgStyle = ref({});

const themeBackgroundStyle = computed(() => ({
  backgroundImage:
    useNewTheme.value && displayPcWatchBackgroundImage.value
      ? `url("${displayPcWatchBackgroundImage.value}")`
      : undefined,
}));

useResizeObserver(splashRef, () => {
  bgStyle.value = {
    height: `${getAppBodyElement().scrollHeight}px`,
  };
});

// const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { channelMenus } = storeDefinitionToRefs(useChannelMenuStore);

const { showLiveBookingButton } = storeDefinitionToRefs(useLiveBookingStore);

useLoginReturnAuthPopup();
</script>

<style lang="scss">
$--splash-header-padding-height: 80px;
$--splash-header-content-height: 406px;

.c-pc-splash {
  position: relative;
  min-height: 100vh;
}
.c-pc-splash__header {
  position: relative;
  padding: $--splash-header-padding-height 0;
}

// teleport 背景层
.c-pc-splash__header__bg__teleport__wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: top;
  background-size: cover;
}

.c-pc-splash__header__bg__teleport__wrapper--legacy {
  background: #1a1b1f;
}

.c-pc-splash__header__bg,
.c-pc-splash__header__mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.c-pc-splash__header__bg {
  filter: blur(18px);
  transform: scale(1.2);
}
.c-pc-splash__header__mask {
  background: #000;
  opacity: 0.6;
}

.c-pc-splash__header__inner {
  position: relative;
  display: flex;
  align-items: center;
  height: $--splash-header-content-height;
}

.c-pc-splash__header__main {
  position: relative;
  width: 500px;
  font-size: 16px;
  color: #e4e4e4;
}

.c-pc-splash__header__cover {
  width: 720px;
  height: $--splash-header-content-height;
  margin-right: 60px;
  overflow: hidden;
  background-color: #ccc;
  border-radius: 8px;
}

.c-pc-splash__header__title {
  font-size: 26px;
  color: $--color-white;
  word-break: break-word;
}

.c-pc-splash__header__author {
  display: flex;
  align-items: center;
  margin-top: 16px;
}

.c-pc-splash__header__author__icon {
  display: flex;
  width: 24px;
  height: 24px;
  margin-right: 2px;
  font-size: 24px !important;
  border-radius: 50%;
}

.c-pc-splash__header__author__publisher {
  display: inline-block;
  max-width: 100%;
  line-height: 20px;
  color: rgba(#fff, 0.6);
}

.c-pc-splash__header__author__publisher__panel {
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

.c-pc-splash__header__status {
  display: flex;
  align-items: center;
  margin-top: 25px;
}
.c-pc-splash__header__status__time {
  font-size: 16px;
  color: rgba(#fff, 0.6);
  white-space: nowrap;
}
.c-pc-splash__header__status__tag {
  margin-left: 4px;
  transform: translateY(-2px);
}
.c-pc-splash__header__status__booking {
  margin-left: 24px;
}

.c-pc-splash__header__countdown {
  margin-top: 24px;
}

.c-pc-splash__header__auth,
.c-pc-splash__header__enroll {
  margin-top: 40px;
}

.c-pc-splash-split-line {
  position: relative;
  top: -20px;
  height: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.c-pc-splash__main__inner {
  position: relative;
  min-height: 200px;
  background-color: #fff;
}

// .c-pc-splash__main__inner__lang-switch.c-pc-lang-switch {
//   position: absolute;
//   top: 14px;
//   right: 12px;
// }

.c-pc-splash__footer a {
  color: #aaaaaa;
  text-shadow: none;
}

.c-pc-splash--theme .c-pc-splash__main__inner {
  background: none;
}

.c-pc-splash--theme .c-pc-splash__header__main,
.c-pc-splash--theme .c-pc-splash__header__title,
.c-pc-splash--theme .c-pc-rich-text-render__content {
  color: rgba($--color-white, 1);
}

.c-pc-splash--theme .c-pc-splash__header__author__publisher,
.c-pc-splash--theme .c-pc-splash__header__status__time,
.c-pc-splash--theme .c-pc-splash__footer a {
  color: rgba($--color-white, 0.6);
}

.c-pc-splash--theme .c-pc-splash-split-line {
  border-color: rgba($--color-white, 0.2);
}

.c-pc-splash--theme .pws-next-pc-normal-tab-header {
  background: none !important;
  backdrop-filter: blur(10px);
}

.c-pc-splash--theme .pws-next-pc-normal-tab-header::before {
  display: none;
}

.c-pc-splash--theme .pws-next-pc-normal-tab-header__item {
  color: rgba($--color-white, 0.6) !important;
}

.c-pc-splash--theme .pws-next-pc-normal-tab-header__item--current {
  color: rgba($--color-white, 1) !important;
}

@media (max-width: 1679px) {
  .c-pc-splash__header__inner {
    min-height: 360px;
  }
  .c-pc-splash__header__cover {
    width: 640px;
    height: 360px;
    margin-right: 40px;
  }
}
</style>
