<!-- @file 连麦麦克风 -->
<template>
  <div
    class="c-connect-microphone g-img-cover"
    :class="{
      'c-connect-microphone--close': isAudioMuted,
    }"
  >
    <div
      class="c-connect-microphone__content"
      :style="{
        height: `${currentVolume * 100}%`,
      }"
    >
      <div class="c-connect-microphone__content__inner g-img-cover"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@polyv/vue-components';

defineProps({
  /** 是否关闭麦克风，默认：false */
  isAudioMuted: PropUtils.bool.def(false),
  /** 当前音量。默认：0 */
  currentVolume: PropUtils.number.def(0),
});
</script>

<style lang="scss">
$--icon-size: 16px;
.c-connect-microphone {
  position: relative;
  width: $--icon-size;
  height: $--icon-size;
  background-image: url(../imgs/item-status-audio-zero.png);
}
.c-connect-microphone--close {
  background-image: url(../imgs/item-status-audio-closed.png);
}
.c-connect-microphone__content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
}

.c-connect-microphone__content__inner {
  position: absolute;
  bottom: 0;
  left: 0;
  width: $--icon-size;
  height: $--icon-size;
  background-image: url(../imgs/item-status-audio-full.png);
}
</style>
