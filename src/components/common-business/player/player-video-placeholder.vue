<!-- @file 播放器视频占位图 -->
<template>
  <div
    class="c-player-video-placeholder"
    :class="{
      'c-player-video-placeholder--sip-user': isSipUser,
    }"
  >
    <div class="c-player-video-placeholder__img">
      <div class="c-player-video-placeholder__img__content g-img-cover"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropUtils, useProps } from '@polyv/vue-components';

const props = defineProps({
  /** 是否 sip 电话连麦 */
  isSipUser: PropUtils.bool.def(false),
});

const { isSipUser } = useProps(props);
</script>

<style lang="scss">
.c-player-video-placeholder {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #2d2c34;
}

.c-player-video-placeholder__img {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30%;
  max-width: 92px;
  transform: translate(-50%, -50%);
}
.c-player-video-placeholder__img__content {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  background-image: url(../../../assets/images/player/icon-cam-closed.png);
}

.c-player-video-placeholder--sip-user {
  .c-player-video-placeholder__img__content {
    background-image: url(../../../assets/images/player/icon-sip.png);
  }
}
</style>
