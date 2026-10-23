<script lang="ts" setup>
import { computed } from 'vue';
import { PropUtils } from '@polyv/vue-components';
import { SIDEBAR_KEY } from '../sidebar/use-sidebar';
import { useParent } from '@/hooks/core/use-vue/use-parent';

const props = defineProps({
  title: PropUtils.string,
  disabled: PropUtils.bool.def(false),
});

const emit = defineEmits<{
  (e: 'click', index: number): void;
}>();

const { parent, index } = useParent(SIDEBAR_KEY);

if (!parent) {
  // 组件未被正确嵌套，直接返回
  // 这里不能 return，setup 必须返回一个对象或 undefined
}

const selected = computed(() => index.value === parent?.getActive());
const isActiveNextSibling = computed(() => index.value - 1 === parent?.getActive());
const isActivePreviousSibling = computed(() => index.value + 1 === parent?.getActive());

function onClick() {
  if (props.disabled) return;
  emit('click', index.value);
  parent?.setActive(index.value);
}
</script>

<template>
  <div
    role="tab"
    class="c-mobile-sidebar-item"
    :class="{
      'c-mobile-sidebar-item--select': selected,
      'c-mobile-sidebar-item--disabled': props.disabled,
    }"
    :tabindex="props.disabled ? undefined : 0"
    :aria-selected="selected"
    @click="onClick"
  >
    <template v-if="isActiveNextSibling">
      <svg
        class="c-mobile-sidebar-item__corner c-mobile-sidebar-item__corner__top"
        viewBox="0 0 30 30"
      >
        <g
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <path
            d="M30,0 C13.4314575,3.04359188e-15 -2.02906125e-15,13.4314575 0,30 L0,30 L0,0 Z"
            fill="#fff"
            transform="translate(15.000000, 15.000000) scale(-1, -1) translate(-15.000000, -15.000000) "
          />
        </g>
      </svg>
    </template>
    <template v-if="isActivePreviousSibling">
      <svg
        class="c-mobile-sidebar-item__corner c-mobile-sidebar-item__corner__bottom"
        viewBox="0 0 30 30"
      >
        <g
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <path
            d="M30,0 C13.4314575,3.04359188e-15 -2.02906125e-15,13.4314575 0,30 L0,30 L0,0 Z"
            fill="#fff"
            transform="translate(15.000000, 15.000000) scale(-1, -1) translate(-15.000000, -15.000000) "
          />
        </g>
      </svg>
    </template>
    <slot name="title">{{ props.title }}</slot>
  </div>
</template>

<style lang="scss">
$--c-mobile-sidebar-font-size: 16px;
$--c-mobile-sidebar-line-height: 24px;
$--c-mobile-sidebar-text-color: #323233;
$--c-mobile-sidebar-disabled-text-color: #c8c9cc;
$--c-mobile-sidebar-padding: 16px;
$--c-mobile-sidebar-active-color: $--color-primary;
$--c-mobile-sidebar-background: #f2f3f5;
$--c-mobile-sidebar-selected-font-weight: 600;
$--c-mobile-sidebar-selected-text-color: $--color-primary;
$--c-mobile-sidebar-selected-border-width: 4px;
$--c-mobile-sidebar-selected-border-height: 16px;
$--c-mobile-sidebar-selected-border-color: $--color-primary;
$--c-mobile-sidebar-selected-background: #fff;

.c-mobile-sidebar-item {
  position: relative;
  box-sizing: border-box;
  display: block;
  padding: $--c-mobile-sidebar-padding;
  overflow: hidden;
  font-size: $--c-mobile-sidebar-font-size;
  line-height: $--c-mobile-sidebar-line-height;
  color: $--c-mobile-sidebar-text-color;
  cursor: pointer;
  user-select: none;
  background: $--c-mobile-sidebar-background;

  &:not(:last-child)::after {
    border-bottom-width: 1px;
  }

  &__text {
    word-break: break-all;
  }

  &--select {
    font-weight: $--c-mobile-sidebar-selected-font-weight;
    color: $--c-mobile-sidebar-selected-text-color;

    &,
    &:active {
      background-color: $--c-mobile-sidebar-selected-background;
    }

    &::before {
      position: absolute;
      top: 50%;
      left: 0;
      width: $--c-mobile-sidebar-selected-border-width;
      height: $--c-mobile-sidebar-selected-border-height;
      content: '';
      background-color: $--c-mobile-sidebar-selected-border-color;
      transform: translateY(-50%);
    }
  }

  &--disabled {
    color: $--c-mobile-sidebar-disabled-text-color;
    cursor: not-allowed;

    &:active {
      background-color: $--c-mobile-sidebar-background;
    }
  }

  &__corner {
    position: absolute;
    right: 0;
    z-index: 100;
    width: 8px;
    height: 8px;
    pointer-events: none;
    user-select: none;
    &__top {
      top: 0;
      transform: rotate(-90deg);
    }
    &__bottom {
      bottom: 0;
    }
  }
}
</style>
