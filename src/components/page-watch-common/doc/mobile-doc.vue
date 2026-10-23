<!-- @file 移动端文档组件 -->
<template>
  <div class="c-mobile-doc">
    <div
      ref="wrapRef"
      class="c-mobile-doc__wrap"
    ></div>

    <mobile-doc-subtitle
      v-if="!isPortraitWatchLayout && docSetupFinished"
      v-show="mainScreen === MainScreenContent.Doc"
      class="c-mobile-doc__subtitle"
      :class="{
        'c-mobile-doc__subtitle--fullscreen': mobileDocIsPageFullscreen,
      }"
    />

    <mobile-message-box
      class="c-mobile-doc__message-box"
      ref="confirmRef"
      :title="$lang('base.confirm')"
      :content="$lang('doc.deleteConfirm')"
      :confirm-button-text="$lang('base.confirm')"
      :cancel-button-text="$lang('base.cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import { MobileMessageBox } from '@/components/common-base/message-box';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { MainScreenContent } from '@polyv/live-watch-sdk';
import MobileDocSubtitle from '../player/player-subtitle/mobile-doc-subtitle.vue';

import { useDoc } from './use-doc';

const { docSetupFinished, wrapRef, confirmRef } = useDoc();

const { isPortraitWatchLayout, mainScreen, mobileDocIsPageFullscreen } =
  storeDefinitionToRefs(useLayoutStore);
</script>

<style lang="scss">
.c-mobile-doc {
  position: relative;
  z-index: 250;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.c-mobile-doc__wrap {
  position: relative;
  width: 100%;
  height: 100%;

  // 这个在PPT SDK设置了层级2，导致跑马灯被遮挡
  #paintbrush {
    z-index: 0;
  }
}

.c-mobile-doc__subtitle {
  z-index: 0;
  &--fullscreen {
    bottom: 100px !important;
  }
}

@media screen and (min-aspect-ratio: 4/3) {
  .c-mobile-doc__subtitle {
    &--fullscreen {
      bottom: 16px !important;
    }
  }
}

.c-mobile-doc__message-box {
  z-index: $--zIndex-max-top;
}
</style>
