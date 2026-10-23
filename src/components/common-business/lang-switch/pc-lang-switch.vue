<!-- @file PC 端多语言选择 -->
<template>
  <div
    class="c-pc-lang-switch"
    :class="{
      'c-pc-lang-switch--dark': theme === 'dark',
      'c-pc-lang-switch--open': visible,
    }"
  >
    <div
      ref="langReferenceRef"
      class="c-pc-lang-switch__content"
    >
      <pc-icon-lang class="c-pc-lang-switch__content__prefix-icon" />
      <span>{{ currentLangText }}</span>
      <div class="c-pc-lang-switch__content__icon">
        <pc-icon-arrow-down class="c-pc-lang-switch__content__icon__arrow" />
      </div>
    </div>

    <transition name="fade">
      <div
        v-show="visible"
        class="c-pc-lang-switch__popper"
        :class="{
          'c-pc-lang-switch__popper--dark': theme === 'dark',
        }"
        ref="langPopperRef"
      >
        <div
          v-for="(item, index) in langSwitchList"
          :key="index"
          class="c-pc-lang-switch__popper__item"
          :class="{
            'c-pc-lang-switch__popper__item--active': item.lang === currentLang,
            'c-pc-lang-switch__popper__item--loading': item.lang === pendingLang,
            'c-pc-lang-switch__popper__item--disabled': langLoading,
          }"
          @click="onClickLangItem(item)"
        >
          <span
            v-if="item.lang === pendingLang"
            class="c-pc-lang-switch__popper__item__spinner"
          />
          {{ item.text }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PcIconLang, PcIconArrowDown } from '@/components/component-icons/pc/map';

import { LangSwitchItem, useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { PropUtils, useProps } from '@polyv/vue-components';
import { usePopper } from '@/hooks/components/use-popper';

const props = defineProps({
  /** 主题 */
  theme: PropUtils.string.def(''),
});

const { theme } = useProps(props);

const langStore = useLangStore();
const { currentLang, currentLangText, langSwitchList, langLoading, pendingLang } =
  storeDefinitionToRefs(useLangStore);

const {
  referenceRef: langReferenceRef,
  popperRef: langPopperRef,
  popperVisible: visible,
} = usePopper({
  trigger: 'click',
  arrow: false,
  popperOffset: [0, 10],
});

async function onClickLangItem(item: LangSwitchItem) {
  if (langLoading.value) return;
  const success = await langStore.switchLang(item.lang);
  if (success) {
    visible.value = false;
  }
}
</script>

<style lang="scss">
$--lang-width: 106px !default;
$--light-bg-color: #ededef !default;
$--light-bg-active-color: #d6dff1 !default;
$--light-font-color: $--font-color-primary !default;
$--light-font-active-color: #3082fe !default;

.c-pc-lang-switch {
  position: relative;
  z-index: 21; // 不被底部面板遮挡
  font-size: 14px;
  color: $--light-font-color;
}

.c-pc-lang-switch__content {
  position: relative;
  box-sizing: border-box;
  display: block;
  width: $--lang-width;
  padding: 0 0 0 26px;
  line-height: 20px;
  cursor: pointer;
  user-select: none;
}

.c-pc-lang-switch__content__prefix-icon {
  position: absolute;
  top: 50%;
  left: 0;
  display: flex;
  font-size: 16px !important;
  transform: translateY(-50%);
}

.c-pc-lang-switch__content__icon {
  position: absolute;
  top: 50%;
  right: 5px;
  height: 16px;
  color: #adadc0;
  transform: translateY(-50%);

  .c-pc-lang-switch__content__icon__arrow {
    display: flex;
    font-size: 16px !important;
    transition: 0.3s;
  }
}

.c-pc-lang-switch--open {
  .c-pc-lang-switch__content__icon__arrow {
    transform: rotateZ(180deg);
  }
}

.c-pc-lang-switch__popper {
  position: absolute;
  top: 100%;
  left: 0;
  width: $--lang-width;
  margin-top: 10px;
  background: $--light-bg-color;
}

.c-pc-lang-switch__popper__item {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 0 8px;
  line-height: 32px;
  cursor: pointer;
  user-select: none;
  transition: 0.3s;

  &.c-pc-lang-switch__popper__item--active {
    color: $--light-font-active-color;
    background: $--light-bg-active-color;
  }

  &.c-pc-lang-switch__popper__item--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover:not(.c-pc-lang-switch__popper__item--disabled) {
    background: $--light-bg-active-color;
  }
}

.c-pc-lang-switch__popper__item__spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: lang-switch-spin 0.6s linear infinite;
}

@keyframes lang-switch-spin {
  to {
    transform: rotate(360deg);
  }
}

.c-pc-lang-switch--dark {
  color: $--color-white;

  .c-pc-lang-switch__content__icon {
    color: $--color-white;
  }
}

.c-pc-lang-switch__popper--dark {
  &.c-pc-lang-switch__popper {
    background: #2b2c35;
  }

  .c-pc-lang-switch__popper__item {
    color: #adadc0;
    &.c-pc-lang-switch__popper__item--active {
      color: $--color-white;
      background: #3e3e4e;
    }

    &:hover {
      background: #3e3e4e;
    }
  }
}
</style>
