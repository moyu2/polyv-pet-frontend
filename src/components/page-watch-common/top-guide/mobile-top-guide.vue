<template>
  <div
    v-if="topGuideSetting && topGuideSetting.topGuideBarEnabled && guideVisible"
    class="c-mobile-top-guide"
  >
    <img
      class="c-mobile-top-guide__logo"
      :src="topGuideSetting.topGuideBarLogo"
    />

    <div class="c-mobile-top-guide__content g-singleline">
      {{ topGuideSetting.topGuideBarContent }}
    </div>

    <normal-button
      :size="ButtonSize.XMini"
      class="c-mobile-top-guide__button"
      @click="onClickButton"
    >
      {{ topGuideSetting.topGuideBarButtonContent }}
    </normal-button>

    <mobile-icon-close
      v-if="topGuideSetting.topGuideBarCloseable"
      class="c-mobile-top-guide__close"
      @click="close"
    />
  </div>
</template>

<script setup lang="ts">
import NormalButton, { ButtonSize } from '@/components/common-base/normal-button';
import { useTopGuide } from './use-top-guide';
import { MobileIconClose } from '@/components/component-icons/mobile/map';

const { topGuideSetting, onClickButton, guideVisible, close } = useTopGuide();
</script>

<style lang="scss">
.c-mobile-top-guide {
  position: relative;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 12px;
  background: #fafafa;
}

.c-mobile-top-guide__logo {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 4px;
}

.c-mobile-top-guide__content {
  flex: 1;
  font-size: 14px;
  line-height: 22px;
  color: #4e5969;
}

.c-mobile-top-guide__button {
  margin-left: 8px;
  border-radius: 2px;
}

.c-mobile-top-guide__close {
  display: flex;
  margin-left: 12px;
  font-size: 20px;
}
</style>
