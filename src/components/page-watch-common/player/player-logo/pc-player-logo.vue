<!-- @file PC 端播放器 logo -->
<template>
  <div
    class="c-pc-player-logo"
    :class="{
      [`c-pc-player-logo--${logoSetting.logoPosition}`]: true,
    }"
    :style="{
      opacity: logoSetting.logoOpacity,
    }"
  >
    <img
      class="c-pc-player-logo__img"
      :src="logoSetting.logoImage"
    />

    <a
      v-if="logoSetting.logoHref"
      :href="logoSetting.logoHref"
      class="c-pc-player-logo__href"
      target="_blank"
    ></a>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { logoSetting } = storeDefinitionToRefs(usePlayerStore);
</script>

<style lang="scss">
.c-pc-player-logo {
  position: absolute;
  z-index: 10;
  min-width: 10%;
  max-width: 20%;
}
.c-pc-player-logo__img {
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 100%;
}
.c-pc-player-logo--tl {
  top: 20px;
  left: 20px;
}
.c-pc-player-logo--tr {
  top: 20px;
  right: 20px;
}
.c-pc-player-logo--bl {
  bottom: 20px;
  left: 20px;
}
.c-pc-player-logo--br {
  right: 20px;
  bottom: 20px;
}
.c-pc-player-logo__href {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
