<!-- @file PC端-课堂激励点赞动画 -->

<template>
  <div
    class="c-motivation-like-animation"
    ref="likeAnimationRef"
  >
    <div
      ref="likeAnimationRef"
      class="c-motivation-like-animation__content"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import {
  useMotivationLikeAnimation,
  MotivationLikeAnimationProps,
} from './use-motivation-like-animation';

const props = defineProps(MotivationLikeAnimationProps());

const { likeAnimationRef } = useMotivationLikeAnimation({ props });
</script>

<style lang="scss">
.c-motivation-like-animation {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  padding-bottom: 120%;
  pointer-events: none;
}

.c-motivation-like-animation__content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}
</style>
