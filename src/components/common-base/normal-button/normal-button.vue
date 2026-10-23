<!-- @file 常规按钮 -->
<template>
  <button
    class="c-normal-button pws-normal-button"
    :class="[
      ...buttonClass,
      {
        'c-normal-button--block': block,
        'c-normal-button--disabled': disabled,
        'is-disabled': disabled,
        'is-mobile': isMobile,
      },
    ]"
    :type="nativeType"
    :disabled="buttonDisabled"
    @click="onClick"
  >
    <slot>
      <component
        v-if="icon"
        class="c-normal-button__icon"
        :class="iconClass"
        :is="icon"
      />
      {{ text }}
    </slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isMobile } from '@/assets/utils/browser';
import { normalButtonProps, normalButtonEmits } from './use-normal-button';
import { ButtonType } from './types';

const props = defineProps(normalButtonProps());

const emit = defineEmits(normalButtonEmits());

const buttonClass = computed(() => {
  const classes = [];
  const clsPrefix = 'c-normal-button';

  const type = props.type;

  if (type) {
    classes.push(`${clsPrefix}--${type}`);
  }

  if (type === ButtonType.Primary) {
    classes.push('pws-normal-button-primary');
  }

  if (type === ButtonType.AsideMenu) {
    classes.push('pws-normal-button-aside-menu');
  }

  if (type === ButtonType.Gray) {
    classes.push('pws-dark-white-bg-20 pws-light-black-bg-20');
  }

  if (props.size) {
    classes.push(`${clsPrefix}--${props.size}`);
  }

  return classes;
});

const buttonDisabled = computed(() => {
  return props.disabled && !props.allowDisabledClick;
});

const onClick = (event: MouseEvent) => {
  if (buttonDisabled.value) {
    return;
  }

  if (props.stopClickEvent) {
    event.stopPropagation();
  }

  emit('click');
};
</script>

<style lang="scss">
.c-normal-button {
  box-sizing: border-box;
  display: inline-flex; // 不要改动该布局，会影响到按钮在其他弹窗中的布局
  align-items: center;
  justify-content: center;
  min-width: 96px;
  padding: 0 16px;
  overflow: hidden;
  line-height: 1;
  cursor: pointer;
  border: none;
  outline: 0;
  transition: all 0.15s ease-in;
}

.c-normal-button__icon {
  display: flex;
  margin-right: 4px;
  font-size: 16px;
}

.c-normal-button.is-disabled {
  cursor: not-allowed;
}

.c-normal-button--info {
  color: $--font-color-primary;
  background-color: $--color-white;
  border: 1px solid #b0bec5;

  &.is-disabled {
    color: $--font-color-disabled;
    background-color: #e9ecee;
    border: none;
  }
}

.c-normal-button--aggravate {
  color: $--color-white;
  background-color: #f06e6e;

  &.is-disabled {
    color: $--color-white;
    opacity: 0.5;
  }
}

.c-normal-button--gray {
  color: $--color-white;

  &.is-disabled {
    color: $--color-white;
  }
}

.c-normal-button--large {
  height: 56px;
  font-size: 18px;
  border-radius: 28px;

  .c-normal-button__icon {
    font-size: 16px;
  }
}

.c-normal-button--medium {
  height: 48px;
  font-size: 16px;
  border-radius: 24px;

  .c-normal-button__icon {
    font-size: 16px;
  }
}

.c-normal-button--default {
  height: 40px;
  font-size: 14px;
  border-radius: 20px;

  .c-normal-button__icon {
    font-size: 16px;
  }
}

.c-normal-button--small {
  height: 32px;
  font-size: 14px;
  border-radius: 16px;
}

.c-normal-button--mini {
  min-width: 68px;
  height: 28px;
  padding: 0 8px;
  font-size: 14px;
  border-radius: 14px;
}

.c-normal-button--x-mini {
  min-width: 60px;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 12px;
}

.c-normal-button--block {
  width: 100%;
}
</style>
