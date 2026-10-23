<template>
  <button
    class="c-mobile-more-entrance"
    :class="{
      'c-mobile-more-entrance--dark': isDarkSkinMode,
      'c-mobile-more-entrance--light': !isDarkSkinMode,
    }"
    :style="backgroundStyle"
    @click="onClickMore"
  />
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useThemeStore } from '@/store/use-theme-store';
import { CSSProperties, computed } from 'vue';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';
import { PropUtils } from '@polyv/vue-components';

const { getEmitter } = useGlobalInject();

const props = defineProps({
  theme: PropUtils.enum<ThemeColorMode>().def(undefined),
});

const themeStore = useThemeStore();

const isDarkSkinMode = computed(() => {
  if (props.theme) {
    return props.theme === ThemeColorMode.Dark;
  }

  return themeStore.isDarkSkinMode;
});

const backgroundStyle = computed<CSSProperties>(() => {
  if (
    !themeStore.watchThemeStyleConfig ||
    !themeStore.watchThemeStyleConfig.common.chat.btn.more.iconUrl
  )
    return {};

  return {
    'background-image': `url(${themeStore.watchThemeStyleConfig.common.chat.btn.more.iconUrl})`,
  };
});

function onClickMore() {
  getEmitter().emit(appEvents.global.OpenMobileMorePopup, true);
}
</script>

<style lang="scss">
.c-mobile-more-entrance {
  width: 36px;
  min-width: 36px;
  height: 36px;
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.c-mobile-more-entrance--light {
  background-image: url('./images/more-icon-light.png');
}

.c-mobile-more-entrance--dark {
  background-image: url('./images/more-icon-dark.png');
}
</style>
