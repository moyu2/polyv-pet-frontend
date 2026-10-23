<template>
  <div
    class="c-background-section"
    :class="{
      'is-live-screenshot': backgroundType === BackgroundType.LiveScreenshot,
      'c-background-section--dark': currentSkinColorMode === 'dark',
      'c-background-section--light': currentSkinColorMode === 'light',
    }"
  >
    <div
      v-if="bgUrl"
      key="image-bg"
      class="c-background-section__img"
    >
      <div
        ref="wrapRef"
        class="c-background-section__img-wrap"
      ></div>
    </div>

    <!-- 如果没有图片地址，且是直播截图，则显示引导页封面 -->
    <div
      v-else-if="backgroundType === BackgroundType.LiveScreenshot"
      key="live-screenshot-bg"
      class="c-background-section__img"
    >
      <div class="c-background-section__img-wrap">
        <channel-splash-img :show-title="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import { useLiveScreenshot } from '@/hooks/business/use-live-screenshot';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useThemeStore } from '@/store/use-theme-store';
import { BackgroundType } from '@polyv/live-watch-sdk';
import { PropUtils } from '@polyv/vue-components';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  backgroundType: PropUtils.enum<BackgroundType>(),
  defaultUrl: PropUtils.string,
  customUrl: PropUtils.string,
});

const { currentSkinColorMode } = storeDefinitionToRefs(useThemeStore);

const { liveScreenshotUrl } = useLiveScreenshot();

const bgUrl = computed(() => {
  if (props.backgroundType === BackgroundType.Custom) {
    return props.customUrl;
  }

  if (props.backgroundType === BackgroundType.LiveScreenshot) {
    return liveScreenshotUrl.value;
  }

  return props.defaultUrl;
});

const wrapRef = ref<HTMLDivElement>();

function refreshImage() {
  if (!bgUrl.value) {
    return;
  }

  const imageElem = new Image();

  imageElem.onload = () => {
    if (wrapRef.value) {
      wrapRef.value.innerHTML = '';
      wrapRef.value.append(imageElem);
    }
  };
  imageElem.src = bgUrl.value;
}

watch(
  bgUrl,
  () => {
    refreshImage();
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.c-background-section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.c-background-section__img {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
}

.c-background-section__img-wrap {
  width: 100%;
  height: 100%;

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.c-background-section.is-live-screenshot {
  .c-background-section__img {
    width: 150%;
    height: 150%;

    &::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
    }
  }

  .c-background-section__img-wrap {
    filter: blur(36px);
  }

  &.c-background-section--dark {
    .c-background-section__img::after {
      background: rgba(0, 0, 0, 0.4);
    }
  }

  &.c-background-section--light {
    .c-background-section__img::after {
      background: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>
