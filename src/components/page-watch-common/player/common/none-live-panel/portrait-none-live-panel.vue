<!-- @file 竖屏暂无直播占位 -->
<template>
  <div
    class="c-portrait-none-live-panel c-portrait-placeholder-panel"
    :class="{
      'c-portrait-placeholder-panel--small-window': isSmallWindow,
    }"
  >
    <div class="c-portrait-placeholder-panel__content">
      <!-- 背景层：底层为高斯模糊的播放器封面图，顶层为 20% 黑色遮罩 -->
      <div class="c-portrait-none-live-panel__bg">
        <div class="c-portrait-none-live-panel__bg-img">
          <channel-splash-img :show-title="false" />
        </div>
      </div>

      <div class="c-portrait-none-live-panel__image g-img-cover"></div>
      <p class="c-portrait-none-live-panel__text">
        {{ getLiveStatusText(liveStatus) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { translate } from '@/assets/lang';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useWebviewStore } from '@/store/use-webview-store';
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import { LiveStatus } from '@polyv/live-watch-sdk';

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const { liveStatus } = storeDefinitionToRefs(useChannelStore);

/**
 * 获取直播状态文本
 * @param status 直播状态
 */
function getLiveStatusText(status: LiveStatus): string {
  const tagTexts: Record<LiveStatus, string> = {
    [LiveStatus.Waiting]: translate('channel.noLive'),
    [LiveStatus.Stop]: translate('liveStatus.waitingText'),

    [LiveStatus.End]: translate('channel.noLive'),
    [LiveStatus.UnStart]: translate('channel.noLive'),

    // 该组件实际不会用到这两个状态
    [LiveStatus.Live]: '',
    [LiveStatus.Playback]: '',
  };

  return tagTexts[status];
}
</script>

<style lang="scss">
.c-portrait-none-live-panel .c-portrait-placeholder-panel__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // 裁掉放大后的模糊封面图
  overflow: hidden;
  // 覆盖占位面板通用底色，不影响音频面板
  background-color: #0f1013;
}

.c-portrait-none-live-panel__bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

// 底层播放器封面图，放大以避免模糊后边缘露出底色
.c-portrait-none-live-panel__bg-img {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  filter: blur(100px);
  transform: translate(-50%, -50%);
}

// 顶层 20% 黑色遮罩，不参与模糊
.c-portrait-none-live-panel__bg::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  content: '';
  background: rgba(0, 0, 0, 0.2);
}

.c-portrait-none-live-panel__image {
  // 定位以垫在背景层之上（背景层是同级绝对定位元素，默认会盖住普通流内容）
  position: relative;
  width: 76px;
  height: 76px;
  margin-bottom: 12px;
  // 透明底 APNG，无需混合模式
  background-image: url(./imgs/end-placeholder.png);
}
.c-portrait-none-live-panel__text {
  // 同上，避免被背景层盖住
  position: relative;
  font-size: 14px;
  color: $--color-white;
}

.c-portrait-placeholder-panel--small-window {
  .c-portrait-none-live-panel__image {
    width: 30px;
    height: 30px;
  }
  .c-portrait-none-live-panel__text {
    font-size: 12px;
  }
}
</style>
