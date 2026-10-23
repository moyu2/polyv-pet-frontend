<!-- @file 移动端表单组件：下拉选择 -->
<template>
  <div class="c-mobile-subtitle-select">
    <div
      class="c-mobile-subtitle-select__body pws-mobile-subtitle-select__body"
      @click="openOption"
    >
      <span
        class="c-mobile-subtitle-select__body__input pws-mobile-subtitle-select__body__input"
        readonly
        >{{ inputValue }}</span
      >
      <mobile-icon-arrow-down
        class="c-mobile-subtitle-select__body__icon pws-mobile-subtitle-select__body__icon"
      />
    </div>

    <mobile-popup
      :title="$lang('subtitle.change')"
      :theme="PopupTheme.PortraitLight"
      update-on-resize
      :visible.sync="optionVisible"
      :force-horizontal-screen="isMobileWebPageFullscreen"
    >
      <mobile-tree-select
        v-if="optionVisible"
        :active-values.sync="innerValue"
        :items="optionList"
        @finish="onOptionSelectFinish"
      />
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import MobileTreeSelect from '@/components/common-base/tree-select/mobile-tree-select.vue';
import { MobileIconArrowDown } from '@/components/component-icons/mobile/map';
import MobilePopup, { PopupTheme } from '@/components/common-base/popup/index';
import { subtitleSelectProps, subtitleSelectEmits, useSubtitleSelect } from './use-subtitle-select';
import { useWebPageFullscreen } from '@/components/page-watch-common/player/hooks/use-web-page-fullscreen';

const props = defineProps(subtitleSelectProps());

const emit = defineEmits(subtitleSelectEmits());

const {
  inputValue,

  innerValue,
  optionList,
  optionVisible,
  openOption,
  onOptionSelectFinish,
} = useSubtitleSelect({
  props,
  emit,
});

const { isMobileWebPageFullscreen } = useWebPageFullscreen();

defineExpose({
  openOption,
});
</script>

<style lang="scss">
.c-mobile-subtitle-select__body {
  display: flex;
  align-items: center;

  height: map.get($--mobile-form-input-sizes, 'default', 'height');
  color: map.get($--mobile-form-input-themes, 'default', 'font-color');
  background: map.get($--mobile-form-input-themes, 'default', 'background');
}

.c-mobile-subtitle-select__body__input {
  @include clear-input-style;
  box-sizing: border-box;
  display: block;
  padding-right: 4px;
  font-size: 14px;
  color: inherit;
}

.c-mobile-subtitle-select__body__icon {
  display: flex;
  margin-right: 16px;
  font-size: 20px !important;
  color: #9e9e9e;
}

.c-mobile-subtitle-select__header {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  width: 100%;
  height: 50px;
  padding: 0 16px;
  font-size: 16px;
  line-height: 50px;
  border-bottom: 1px solid $--border-color-primary;
}

.c-mobile-subtitle-select__header__cancel {
  color: #9195a1;
}
.c-mobile-subtitle-select__header__confirm {
  color: #3082fe;
}
</style>
