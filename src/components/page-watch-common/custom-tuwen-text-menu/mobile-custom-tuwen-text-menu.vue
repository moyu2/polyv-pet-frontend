<!-- @file 自定义图文菜单 -->
<template>
  <div class="c-mobile-custom-tuwen-text-menu">
    <div class="c-mobile-custom-tuwen-text-menu__content">
      <mobile-rich-text-render :html-content="htmlContent" />
    </div>

    <mobile-page-footer />
  </div>
</template>

<script setup lang="ts">
import MobileRichTextRender from '@/components/common-base/rich-text-render/mobile-rich-text-render.vue';
import MobilePageFooter from '@/components/common-business/page-footer/mobile-page-footer.vue';
import { PropUtils } from '@polyv/vue-components';

defineProps({
  /** 图文内容 */
  htmlContent: PropUtils.string.def(''),
});
</script>

<style lang="scss">
.c-mobile-custom-tuwen-text-menu {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.c-mobile-custom-tuwen-text-menu__content {
  flex: 1;
}
</style>
