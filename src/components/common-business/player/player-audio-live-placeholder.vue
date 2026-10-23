<!-- @file 播放器音频直播占位图 -->
<template>
  <div
    ref="wrapRef"
    class="c-player-audio-live-placeholder"
  >
    <div
      v-if="useSplashImg"
      class="c-player-audio-live-placeholder__splash"
    >
      <channel-splash-img />
    </div>

    <div
      v-else
      class="c-player-audio-live-placeholder__content"
    >
      <img src="@/assets/images/player/player-audio-mode.png" />
      <span
        :style="{
          fontSize: `${fontSize}px`,
        }"
        >{{ $lang('live.audioLive') }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@polyv/vue-components';
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { useThemeStore } from '@/store/use-theme-store';
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue';

const props = defineProps({
  /** 是否使用引导页封面图作为占位图 */
  useSplashImg: PropUtils.bool.def(false),
});

const { hasSplash } = storeDefinitionToRefs(useThemeStore);

const useSplashImg = computed(() => {
  if (props.useSplashImg && unref(hasSplash)) {
    return true;
  }
  return false;
});

const fontSize = ref(22);

const wrapRef = ref<HTMLDivElement>();

async function computeFontSize() {
  await nextTick();

  const wrapELem = unref(wrapRef);
  if (!wrapELem) return;

  if (wrapELem.clientWidth > 300) {
    fontSize.value = 22;
  } else {
    fontSize.value = 14;
  }
}

onMounted(() => {
  computeFontSize();
});

const { mainScreen } = storeDefinitionToRefs(useLayoutStore);
watch(
  () => unref(mainScreen),
  () => {
    computeFontSize();
  },
);
</script>

<style lang="scss">
.c-player-audio-live-placeholder {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.c-player-audio-live-placeholder__splash {
  width: 100%;
  height: 100%;
}

.c-player-audio-live-placeholder__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 22px;
  color: $--color-white;
  background-color: rgb(43, 48, 69);

  img {
    width: 42%;
  }

  span {
    margin-top: -5%;
  }
}
</style>
