<template>
  <div
    ref="scrollRef"
    class="c-anchor-popup__description"
    @scroll="onScroll"
  >
    <mobile-basic-info
      :show-like-count="false"
      :show-page-footer="false"
      ignore-basic-info-top-style
    />
  </div>
</template>

<script setup lang="ts">
import MobileBasicInfo from '@/components/common-business/basic-info/mobile-basic-info.vue';
import { emitFunc } from '@polyv/vue-components';
import { ref } from 'vue';

const emit = defineEmits({
  scroll: emitFunc<number>(),
});

const scrollRef = ref<HTMLDivElement>();

function onScroll() {
  if (scrollRef.value) {
    emit('scroll', scrollRef.value.scrollTop);
  }
}
</script>

<style lang="scss">
.c-anchor-popup__description {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
</style>
