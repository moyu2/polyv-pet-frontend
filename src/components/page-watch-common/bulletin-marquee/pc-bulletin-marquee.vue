<template>
  <div
    v-show="content"
    class="c-pc-bulletin-marquee"
  >
    <div
      class="c-pc-bulletin-marquee__wrap g-clearfix"
      :style="{ animation: animation }"
    >
      <div
        ref="MarqueeContentRef"
        class="c-pc-bulletin-marquee__content"
        v-html="content"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBulletinMarquee } from './use-bulletin-marquee';

const {
  MarqueeContentRef,

  content,
  animation,
} = useBulletinMarquee();
</script>

<style lang="scss">
$marquee-width: 280px;
$marquee-height: 26px;

.c-pc-bulletin-marquee {
  position: absolute;
  top: 18px;
  left: 50%;

  width: $marquee-width;
  height: $marquee-height;
  overflow: hidden;
  font-size: 12px;
  line-height: $marquee-height;
  color: #fff;
  background: #000;
  border-radius: 12px;
  opacity: 0.8;

  transform: translate(-50%, 0);
}

.c-pc-bulletin-marquee__wrap {
  position: absolute;
  top: 0;
  left: $marquee-width;
  width: fit-content;
}

.c-pc-bulletin-marquee__content {
  float: left;
  margin-right: 0;
  white-space: nowrap;
}

@keyframes marquee {
  100% {
    left: 0;
    transform: translate(-100%, 0);
  }
}
</style>
