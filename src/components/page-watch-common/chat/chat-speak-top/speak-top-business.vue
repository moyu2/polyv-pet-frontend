<template>
  <div
    :class="[
      'c-speak-top-business',
      `c-speak-top-business--${layout}`,
      isMobileWebPageFullscreen && 'c-speak-top-business--mobile-fullscreen',
    ]"
    v-if="speakTopLayerShow"
    @touchmove.stop
  >
    <plv-carousel
      :slide-index="slideIndex"
      @change="handleChange"
    >
      <plv-carousel-item
        v-for="data in messageList"
        :key="data.id"
      >
        <speak-top
          class="c-speak-top-business__comp"
          :message="data"
          @close="handleClose"
        />
      </plv-carousel-item>
    </plv-carousel>
    <div
      v-if="messageList.length > 1"
      class="c-speak-top-business__indicator"
    >
      <div
        v-for="num in messageList.length"
        :key="num"
        class="c-speak-top-business__indicator__item"
        :class="{
          'c-speak-top-business__indicator__item--active': num - 1 === slideIndex,
        }"
        @click="handleChange(num - 1)"
      ></div>
    </div>
    <span
      class="c-chat-speak-top__close"
      @click="handleClose"
    >
      ×
    </span>
  </div>
</template>

<script lang="ts" setup>
import { tupleString } from '@/assets/utils/array';
import { useWebPageFullscreen } from '@/components/page-watch-common/player/hooks/use-web-page-fullscreen';
import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/pc-import';
import { usePlaybackStore } from '@/store/use-playback-store';
import { PropUtils } from '@polyv/vue-components';
import { computed, ref, watch } from 'vue';
import SpeakTop from './speak-top.vue';
import { useSpeakTop } from './use-speak-top';

const playbackStore = usePlaybackStore();

const slideIndex = ref(0);

defineProps({
  layout: PropUtils.oneOf(tupleString('pc', 'mobile', 'portrait')).isRequired,
});

const { showSpeakTop, messageList, isSetupPanelShow } = useSpeakTop();
const { isMobileWebPageFullscreen } = useWebPageFullscreen();

watch(
  messageList,
  () => {
    if (messageList.value.length - 1 < slideIndex.value) {
      slideIndex.value = 0;
    }
  },
  { deep: true },
);

const handleClose = () => {
  showSpeakTop.value = false;
};

const handleChange = (index: number) => {
  slideIndex.value = index;
};

const speakTopLayerShow = computed(() => {
  return (
    showSpeakTop.value === true && playbackStore.chatMsgReplayEnabled && !isSetupPanelShow.value
  );
});
</script>

<style lang="scss">
.c-speak-top-business {
  height: 66px;
  pointer-events: initial;
  background: rgba(29, 33, 41, 0.48);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}
.c-speak-top-business--pc {
  position: absolute;
  top: 8%;
  left: 38.1%;
  z-index: 320;
  width: 450px;
  height: 96px;
  transform: translateX(-50%);

  .c-speak-top-business__comp {
    width: 450px;
  }

  .c-speak-top-business__indicator {
    bottom: 16px;
  }

  .c-speak-top-business__indicator__item {
    width: 8px;
    height: 8px;
    margin: 0 3px;
    border-radius: 4px;

    &.c-speak-top-business__indicator__item--active {
      width: 14px;
    }
  }
}

.c-pc-watch-layout__main__fullscreen-wrap--fullscreened {
  .c-speak-top-business--pc {
    left: 50%;
  }
}

.c-speak-top-business--mobile {
  position: absolute;
  top: 24px;
  left: 50%;
  width: 311px;
  transform: translateX(-50%);
}

.c-mobile-main .c-speak-top-business--mobile-fullscreen {
  position: fixed;
  top: calc((var(--plv-fullscreen-vh, 100vh) - 100vw) / 2);
  left: 43%;
  z-index: 2024;
  // overflow: inherit !important;
  transform: rotate(90deg) translateX(50%);
}

.c-speak-top-business--portrait {
  position: absolute;
  top: 75px;
  left: 50%;
  width: 311px;
  transform: translateX(-50%);
}

.c-speak-top-business__indicator {
  position: absolute;
  bottom: 8px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.c-chat-speak-top__close {
  position: absolute;
  top: 50%;
  right: 16px;
  width: 24px;
  margin-top: -12px;
  font-size: 20px;
  line-height: 24px;
  color: white;
  text-align: center;
  cursor: pointer;
  background: none;
  border: none;
}

.c-speak-top-business__indicator__item {
  width: 4px;
  height: 4px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;

  &.c-speak-top-business__indicator__item--active {
    width: 8px;
  }
}
</style>
