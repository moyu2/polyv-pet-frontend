<!-- @file PC 端页面固定挂件 -->
<template>
  <div
    class="c-page-fixed-widgets"
    :class="{
      'c-page-fixed-widgets--absolute': isInjectByExternalApp(),
    }"
  >
    <!-- 回到顶部 -->
    <fixed-back-top />

    <!-- 分享 -->
    <fixed-web-share v-if="!hideWebShare && shareBtnEnabled" />

    <!-- 多语言 -->
    <fixed-lang-switch v-if="!hideLangSwitch && langSwitchEnabled" />
  </div>
</template>

<script setup lang="ts">
import { PropUtils, useProps } from '@polyv/vue-components';
import FixedWebShare from './fixed-web-share.vue';
import FixedBackTop from './fixed-back-top.vue';
import FixedLangSwitch from './fixed-lang-switch.vue';
import { useShareStore } from '@/store/use-share-store';
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { isInjectByExternalApp } from '@/assets/utils/utils';

const props = defineProps({
  /** 是否隐藏分享 */
  hideWebShare: PropUtils.bool.def(false),
  /** 是否隐藏多语言 */
  hideLangSwitch: PropUtils.bool.def(false),
});

const { hideWebShare } = useProps(props);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const { shareBtnEnabled } = storeDefinitionToRefs(useShareStore);
</script>

<style lang="scss">
.c-page-fixed-widgets {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 200;

  display: flex;
  flex-direction: column;
  gap: 12px;

  &--absolute {
    position: absolute;
  }
}

// 子组件样式
.c-fixed-widget-button {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.5);
  // background: rgba(255, 255, 255, 0.2);
  border-radius: 40px;
  opacity: 0.5;
  transition: all 0.15s ease-in;
  backdrop-filter: blur(8.33px);

  &:hover {
    opacity: 1;
  }

  .polyv-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
