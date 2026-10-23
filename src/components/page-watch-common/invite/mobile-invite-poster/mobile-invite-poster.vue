<template>
  <div class="c-mobile-invite-poster">
    <iframe
      v-if="iframeUrl"
      v-show="!posterBase64"
      ref="posterIframeRef"
      class="c-mobile-invite-poster__iframe"
      :src="iframeUrl"
      :style="posterIframeStyle"
    />
    <div
      v-show="!loaded"
      class="c-mobile-invite-poster__loading"
    ></div>
    <img
      v-show="posterBase64"
      :src="posterBase64"
      class="c-mobile-invite-poster__img"
    />
  </div>
</template>

<script setup lang="ts">
import { useInvitePoster, invitePosterProps } from './use-invite-poster';

const props = defineProps(invitePosterProps());

const {
  iframeUrl,
  posterIframeRef,
  posterIframeStyle,

  posterBase64,
  loaded,
} = useInvitePoster({ props });
</script>

<style lang="scss">
.c-mobile-invite-poster {
  position: relative;
  width: 100%;
  height: 100%;
}
.c-mobile-invite-poster__iframe {
  position: absolute;
  pointer-events: none;
  border: none;
  opacity: 0;
}

.c-mobile-invite-poster__img {
  width: 100%;
  height: 100%;
}

.c-mobile-invite-poster__loading {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;
  width: 26px;
  height: 26px;
  margin: auto;
  border: 2px solid #2196f3;
  border-bottom-color: transparent;
  border-radius: 100%;
  animation: poster-loading 1s 0s linear infinite;
}

@keyframes poster-loading {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.6);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
