<!-- @file 直播广场 -->
<template>
  <div
    v-if="isShowLiveSquare"
    class="c-live-square"
  >
    <div
      class="c-live-square-entry"
      @click="handleLiveSquareClick"
    >
      <mobile-icon-live-square />
      <span class="c-live-square-entry__text">{{ liveSquareTitle }}</span>
      <mobile-icon-arrow-right />

      <!-- 微信按钮占位容器 -->
      <div
        v-if="isWeixin && shouldShowWeixinBtn"
        ref="weixinBtnRef"
        class="plv-watch-live-square-hack-weixin-btn"
      ></div>
    </div>

    <!-- 直播广场弹窗 -->
    <mobile-popup
      :visible="popupVisible"
      @update:visible="popupVisible = $event"
      class="c-live-square-popup"
      :title="liveSquareTitle"
      fill-body-section
      :closable="true"
    >
      <mobile-iframe-render
        v-if="iframeUrl"
        :src="iframeUrl"
        :auto-height="true"
      />
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  MobileIconLiveSquare,
  MobileIconArrowRight,
} from '@/components/component-icons/mobile/map';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileIframeRender from '@/components/common-base/iframe-render/mobile-iframe-render.vue';
import useLiveSquare from './use-live-square';
import { isWeixin } from '@/assets/utils/browser';

// Props 定义
// const props = defineProps<{
//   /** 微信按钮选择器 */
//   weixinBtnSelector?: string;
// }>();

const {
  liveSquareTitle,
  handleLiveSquareClick,
  iframeUrl,
  isOpenInPopup,
  resetPopupState,
  isShowLiveSquare,

  // 微信按钮相关
  getWeixinBtnSetupEnabled,
  weixinBtnRef,
  hackWeixinBtnSetup,
} = useLiveSquare();

const popupVisible = ref(false);
const shouldShowWeixinBtn = ref(false);

// 当需要在弹窗中打开时，显示弹窗
watch(isOpenInPopup, newValue => {
  if (newValue) {
    popupVisible.value = true;
  }
});

// 当弹窗关闭时，清理状态
watch(popupVisible, newValue => {
  if (!newValue) {
    // 延迟清理，确保动画完成
    setTimeout(() => {
      if (!popupVisible.value) {
        resetPopupState();
      }
    }, 300);
  }
});

// 微信按钮设置
onMounted(async () => {
  shouldShowWeixinBtn.value = await getWeixinBtnSetupEnabled();
});

// 暴露给父组件的方法和属性
defineExpose({
  // 微信按钮相关
  getWeixinBtnSetupEnabled,
  weixinBtnRef,
  hackWeixinBtnSetup,

  // 其他功能
  handleLiveSquareClick,
  resetPopupState,
});
</script>

<style lang="scss">
.c-live-square-entry {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  flex-shrink: 0;
  gap: 4px;
  align-items: center;
  height: 20px;
  padding: 4px 8px;

  font-size: 12px;
  color: $--color-white;
  white-space: nowrap;
  cursor: pointer;
  background-color: rgba(#000, 0.2);
  border-radius: 20px;

  .polyv-icon-live-square {
    width: 12px;
    height: 12px;
    font-size: 12px;
  }

  .polyv-icon-arrow-right {
    width: 12px;
    height: 12px;
    font-size: 12px;
  }
}

.c-live-square-popup {
  .c-mobile-iframe-render {
    min-height: 400px;
  }
}

.plv-watch-live-square-hack-weixin-btn {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 11;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
