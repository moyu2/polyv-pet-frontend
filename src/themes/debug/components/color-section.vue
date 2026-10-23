<!--
  @file 颜色选择区块组件
  用于主题色和主要色的选择
-->
<template>
  <div class="c-theme-select__section">
    <div class="c-theme-select__label">{{ label }}</div>
    <div class="c-theme-select__colors">
      <div
        v-for="color in colorList"
        :key="color.value"
        class="c-theme-select__color-item"
        :class="{ 'is-active': currentColor === color.value }"
        :style="{ backgroundColor: color.value }"
        :title="color.label"
        @click="onColorSelect(color.value)"
      >
        <span class="c-theme-select__color-text">{{ color.label }}</span>
      </div>
    </div>
    <div class="c-theme-select__custom-input">
      <input
        :value="currentColor"
        type="text"
        class="c-theme-select__input"
        placeholder="#000000"
        @change="onCustomInput"
      />
      <div
        class="c-theme-select__color-preview"
        :style="{ backgroundColor: currentColor || '#000000' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useColorValidation } from '../composables/use-color-validation';
import { colorSectionProps, colorSectionEmits } from './hooks/use-color-section';

defineProps(colorSectionProps());

const emit = defineEmits(colorSectionEmits());

const { validateColorWithAlert } = useColorValidation();

function onColorSelect(value: string) {
  emit('color-change', value);
}

function onCustomInput(e: Event) {
  const input = e.target as HTMLInputElement;
  const color = input.value.trim();

  if (!color) {
    return;
  }

  if (!validateColorWithAlert(color)) {
    // 恢复原值
    return;
  }

  emit('color-change', color);
}
</script>
