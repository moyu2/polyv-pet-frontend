<!-- @file 移动端文档位置切换 -->
<template>
  <div
    v-if="switchVisible"
    class="c-mobile-doc-side-switch"
    @click="toggleMainScreen"
  ></div>
</template>

<script setup lang="ts">
import { TAB_NAME_DOC_OR_VIDEO } from '@/assets/constants/tab-name';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { computed, unref } from 'vue';

const layoutStore = useLayoutStore();
const { toggleMainScreen } = layoutStore;

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const switchVisible = computed<boolean>(() => {
  if (layoutStore.mobilePlayerIsPageFullscreen) {
    return false;
  }
  return unref(canRenderDoc) && layoutStore.mobileMenuCurrentName === TAB_NAME_DOC_OR_VIDEO;
});
</script>

<style lang="scss">
.c-mobile-doc-side-switch {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 400;
  width: 30px;
  height: 20px;
  background-image: url(./icon-doc-switch.png);
  background-size: 100% 100%;
}
</style>
