<!-- @file 移动端横屏暂无直播占位 -->
<template>
  <div class="c-mobile-none-live-panel">
    <!-- 背景层：底层为高斯模糊的播放器封面图，顶层为 20% 黑色遮罩 -->
    <div class="c-mobile-none-live-panel__bg">
      <div class="c-mobile-none-live-panel__bg-img">
        <channel-splash-img :show-title="false" />
      </div>
    </div>

    <div class="c-mobile-none-live-panel__content">
      <div class="c-mobile-none-live-panel__image g-img-cover"></div>
      <p class="c-mobile-none-live-panel__text">
        {{ noneLiveText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { translate } from '@/assets/lang';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import { usePlayerStreamStopText } from '../../hooks/use-player-stream-stop-text';
import { LiveStatus } from '@polyv/live-watch-sdk';

const { liveStatus } = storeDefinitionToRefs(useChannelStore);

const { getStreamStopText } = usePlayerStreamStopText();

/** 暂无直播提示文案 */
const noneLiveText = computed<string>(() => {
  // 直播休息/中断，与竖屏保持一致的提示
  if (liveStatus.value === LiveStatus.Stop) {
    return translate('liveStatus.waitingText');
  }

  // 其余场景（无直播 / 回放待生成 / 私有研讨会）沿用播放器流停止文案
  return getStreamStopText();
});
</script>

<style lang="scss">
.c-mobile-none-live-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 309;
  display: flex;
  align-items: center;
  justify-content: center;
  // 裁掉放大后的模糊封面图
  overflow: hidden;
  // 不拦截播放器区域的点击，保持控制栏的唤起逻辑
  pointer-events: none;
  background-color: #0f1013;
}

.c-mobile-none-live-panel__bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

// 底层播放器封面图，放大以避免模糊后边缘露出底色
.c-mobile-none-live-panel__bg-img {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  filter: blur(100px);
  transform: translate(-50%, -50%);
}

// 顶层 20% 黑色遮罩，不参与模糊
.c-mobile-none-live-panel__bg::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  content: '';
  background: rgba(0, 0, 0, 0.2);
}

.c-mobile-none-live-panel__content {
  // 定位以垫在背景层之上（背景层是同级绝对定位元素，默认会盖住普通流内容）
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.c-mobile-none-live-panel__image {
  width: 76px;
  height: 76px;
  margin-bottom: 12px;
  // 与竖屏占位面板共用同一张占位图（透明底 APNG，无需混合模式）
  background-image: url(./imgs/end-placeholder.png);
}
.c-mobile-none-live-panel__text {
  font-size: 14px;
  color: $--color-white;
}
</style>
