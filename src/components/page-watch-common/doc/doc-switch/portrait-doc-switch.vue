<!-- @file 竖屏文档开关 -->
<template>
  <div
    class="c-portrait-doc-switch g-img-cover"
    :class="{
      'c-portrait-doc-switch--open': !documentSwitch,
      'c-portrait-doc-switch--close': documentSwitch,
    }"
    @click="toggleDocumentSwitch"
  ></div>
</template>

<script setup lang="ts">
import { useDocStore } from '@/store/use-doc-store';
import { storeToRefs } from 'pinia';

const docStore = useDocStore();
const { documentSwitch } = storeToRefs(docStore);
const { toggleDocumentSwitch } = docStore;
</script>

<style lang="scss">
.c-portrait-doc-switch {
  flex-shrink: 0;
  width: 30px;
  height: 20px;
}

.c-portrait-doc-switch--open {
  background-image: url(../imgs/icon-sub-invisible.png);
}
.c-portrait-doc-switch--close {
  background-image: url(../imgs/icon-sub-visible.png);
}
</style>
