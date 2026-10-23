<template>
  <div
    v-if="trialPlaying || trialEnded"
    class="c-external-trial"
    :style="containerStyle"
  >
    <custom-teleport :to="trialCountdownRenderParent">
      <!-- 试看播放中：剩余时间 + 引导入口（按钮接在剩余时长后，同行展示） -->
      <div
        v-if="trialPlaying"
        class="c-external-trial__countdown"
        :class="{
          'c-external-trial__countdown--portrait-topic': isPortraitWatchLayout,
        }"
        @click="redirectToTrialUrl"
      >
        {{
          $lang('externalTrial.remainingTime', {
            time: formatTrialRemainingTime(remainingSeconds),
          })
        }}
        <!-- data-trial-redirect 供竖屏点击事件转发识别，机制同下文到期按钮；
             trialPlaying 与 trialEnded 互斥，任一时刻仅一个 data-trial-redirect 元素存在于 DOM 内。
             stop-click-event 阻止冒泡，避免与外层 countdown 的 @click 重复触发跳转 -->
        <normal-button
          data-trial-redirect
          class="c-external-trial__playing-redirect-btn"
          :text="$lang('externalTrial.playingRedirectBtn')"
          :type="ButtonType.Primary"
          :size="ButtonSize.XMini"
          :stop-click-event="true"
          @click="redirectToTrialUrl"
        />
      </div>
    </custom-teleport>

    <!-- 试看已结束：遮罩 + 引导跳转 -->
    <div
      v-if="trialEnded"
      class="c-external-trial__ended-mask"
    >
      <p class="c-external-trial__ended-tip g-multiline">{{ $lang('externalTrial.endedTip') }}</p>
      <!-- data-trial-redirect 供竖屏点击事件转发识别（参考 data-warmup-img 范式，绕过轮播屏 z-index 遮挡）：
           竖屏下点击事件由轮播屏转发到 appEvents.portrait.ClickPlayerRegion，use-portrait-click-player 通过
           checkDomClick 坐标判定是否落在 [data-trial-redirect] 区域内，命中则调用试看跳转 -->
      <normal-button
        data-trial-redirect
        class="c-external-trial__redirect-btn"
        :text="$lang('externalTrial.redirectBtn')"
        :type="ButtonType.Primary"
        @click="redirectToTrialUrl"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  getTimeContents,
  secondsToCountDownSurplus,
} from '@/components/common-base/count-down/use-count-down';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import CustomTeleport from '@/components/common-base/custom-teleport/custom-teleport';
import { useExternalTrial } from './use-external-trial';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { computed } from 'vue';
import type { CSSProperties } from 'vue';

const PortraitTrialCountdownSelector = '.c-portrait-carousel-main-topic__external-trial-countdown';

/** 容器样式：竖屏传 playerContainerStyle 以精确对齐视频实际区域（视频有 letterbox 内缩）；mobile/pc 不传默认全屏铺满 */
defineProps<{ containerStyle?: CSSProperties }>();

/**
 * 将剩余秒数格式化为「时分秒」倒计时文案，与直播预约倒计时展示口径一致。
 * 复用 count-down 组件的时分秒拆分逻辑与多语言单位（时/分/秒），例如 3900 -> "01时05分00秒"。
 */
function formatTrialRemainingTime(seconds: number): string {
  const surplus = secondsToCountDownSurplus(Math.max(0, seconds));
  return getTimeContents(surplus, { hideZeroDays: true, hideZeroHours: false })
    .map(item => `${item.text}${item.unit}`)
    .join('');
}

const { trialPlaying, trialEnded, remainingSeconds, redirectToTrialUrl } = useExternalTrial();

const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);

const trialCountdownRenderParent = computed(() => {
  return isPortraitWatchLayout.value ? PortraitTrialCountdownSelector : undefined;
});
</script>

<style lang="scss">
.c-external-trial {
  // 显式 top/left + width/height:100%；不传 containerStyle 时（mobile/pc）默认铺满。
  // 竖屏传 playerContainerStyle（含 width/height/top/left）时精确盖在视频区域上，
  // 与 portrait-player-cover-img 子项保持一致，避免 letterbox 内缩后遮罩盖到黑边。
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.c-external-trial__countdown {
  position: absolute;
  bottom: 46px;
  left: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 8px 8px 16px;
  font-size: 12px;
  color: #fff;
  pointer-events: auto;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 32px;
}

.c-external-trial__countdown--portrait-topic {
  position: relative;
  bottom: auto;
  left: auto;
  display: inline-flex;
}

.c-external-trial__ended-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  color: #fff;
  // 竖屏布局中 __carousel-wrap（轮播屏，z-index:20）整体高于 __player-wrap（z-index:10），
  // overlay 位于 __player-wrap 内部，无论内部 z-index 多高都会被轮播屏盖住，按钮无法直接点击。
  // 采用与暖场图（data-warmup-img）一致的范式：点击事件由轮播屏转发到 appEvents.portrait.ClickPlayerRegion，
  // use-portrait-click-player 通过 checkDomClick 坐标判定是否落在 [data-trial-redirect] 区域内，命中则调用试看跳转。
  // PC/mobile 下到期遮罩按钮需要直接响应点击；竖屏若被轮播层遮挡，则仍由 ClickPlayerRegion 转发兜底。
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.85);
}

.c-external-trial__ended-tip {
  padding: 0 24px;
  margin: 0;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
}

// 按钮主体样式由 normal-button 接管，此处仅做微调
.c-external-trial__redirect-btn {
  min-width: 120px;
}

// 移动端横屏「网页全屏」兼容：播放器容器（.c-mobile-player-main--page-fullscreen）整体旋转 90°，
// 试看覆盖层作为其子元素随之旋转（内容朝向与播放器 UI 一致，无需额外自旋转）。
// 旋转后内容坐标轴与屏幕坐标互换，需对倒计时胶囊重定位、到期遮罩补安全区内边距，
// 避免文案/按钮落入屏幕刘海、圆角或安全区被裁切（偏移量沿用项目网页全屏约定：控制栏 padding 50px）。
.c-mobile-player-main--page-fullscreen {
  .c-external-trial__countdown {
    right: auto;
    bottom: 50px;
    left: 20px;
  }

  .c-external-trial__ended-mask {
    padding: 50px;
  }
}
</style>
