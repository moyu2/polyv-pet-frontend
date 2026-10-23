<!-- @file 新版主题皮肤调试组件 (重构后) -->
<template>
  <div
    ref="containerRef"
    class="c-theme-select"
    :style="{
      top: position.top + 'px',
      left: position.left + 'px',
    }"
    @mousedown="onDragStart"
    @touchstart="onDragStart"
  >
    <!-- 折叠按钮 -->
    <div class="c-theme-select__header">
      <span class="c-theme-select__title">主题调试</span>
      <div
        class="c-theme-select__collapse-btn"
        @click.stop="isCollapsed = !isCollapsed"
        @touchstart.stop
        @mousedown.stop
      >
        {{ isCollapsed ? '▼' : '▲' }}
      </div>
    </div>

    <template v-if="!isCollapsed">
      <!-- StyleType 切换 -->
      <div
        class="c-theme-select__section"
        v-if="supportWatchTheme"
      >
        <div class="c-theme-select__label">样式类型</div>
        <div class="c-theme-select__buttons">
          <div
            v-for="styleType in styleTypeList"
            :key="styleType"
            class="c-theme-select__button"
            :class="{
              'is-active': currentStyleType === styleType,
            }"
            @click="onStyleTypeChange(styleType)"
          >
            {{ styleType }}
          </div>
        </div>
      </div>

      <!-- Mode 切换 -->
      <div class="c-theme-select__section">
        <div class="c-theme-select__label">颜色模式</div>
        <div class="c-theme-select__buttons">
          <div
            v-for="mode in modeList"
            :key="mode"
            class="c-theme-select__button"
            :class="{
              'is-active': currentMode === mode,
            }"
            @click="onModeChange(mode)"
          >
            {{ mode }}
          </div>
        </div>
      </div>

      <!-- ThemeColor 切换 -->
      <color-section
        label="主题色"
        :current-color="customThemeColor"
        :color-list="colorList"
        @color-change="onThemeColorChange"
      />

      <!-- PrimaryColor 切换 -->
      <color-section
        label="主要色"
        :current-color="customPrimaryColor"
        :color-list="colorList"
        @color-change="onPrimaryColorChange"
      />

      <!-- ThemeMaskOpacity 切换 -->
      <div class="c-theme-select__section">
        <div class="c-theme-select__label">蒙层透明度</div>
        <div class="c-theme-select__stepper">
          <div
            class="c-theme-select__stepper-btn"
            @click="onThemeMaskOpacityDecrease"
          >
            -
          </div>
          <div class="c-theme-select__stepper-value">
            <input
              v-model.number="customThemeMaskOpacity"
              type="number"
              class="c-theme-select__input"
              placeholder="0-1"
              min="0"
              max="1"
              step="0.1"
              @change="onCustomThemeMaskOpacityChange"
            />
          </div>
          <div
            class="c-theme-select__stepper-btn"
            @click="onThemeMaskOpacityIncrease"
          >
            +
          </div>
        </div>
      </div>
    </template>

    <!-- 快速皮肤选择 - 仅在 Skin 模式下显示 -->
    <skin-section
      v-if="currentStyleType === ChannelWatchThemeStyleType.Skin"
      :current-skin="currentPageSkin"
      @skin-change="onSkinChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useThemeStore } from '@/store/use-theme-store';
import { ChannelWatchThemeStyleType } from '@polyv/live-watch-sdk';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';
import { useDraggable } from './composables/use-draggable';
import { useThemeConfig } from './composables/use-theme-config';
import { DEBUG_COLOR_LIST } from './constants/debug-colors';
import ColorSection from './components/color-section.vue';
import SkinSection from './components/skin-section.vue';

// refs
const containerRef = ref<HTMLElement | null>(null);

// themeStore
const themeStore = useThemeStore();

// 折叠状态
const isCollapsed = ref(true);

const supportWatchTheme = ref(!!themeStore.watchTheme);

// 拖拽功能
const { position, onDragStart } = useDraggable(containerRef, {
  initialPosition: { top: 0, left: 0 },
  dragHandleSelector: '.c-theme-select__header',
});

// 主题配置功能
const {
  currentStyleType,
  currentMode,
  currentPageSkin,
  styleTypeList,
  customThemeColor,
  customPrimaryColor,
  customThemeMaskOpacity,
  onStyleTypeChange,
  onModeChange,
  onThemeColorChange,
  onPrimaryColorChange,
  onThemeMaskOpacityChange,
  onThemeMaskOpacityDecrease,
  onThemeMaskOpacityIncrease,
  onSkinChange,
} = useThemeConfig();

// 颜色列表
const colorList = DEBUG_COLOR_LIST;

// Mode 列表
const modeList = [ThemeColorMode.Dark, ThemeColorMode.Light];

// 自定义 ThemeMaskOpacity 输入
function onCustomThemeMaskOpacityChange() {
  const value = customThemeMaskOpacity.value;
  if (value === null || value === undefined || isNaN(value)) {
    return;
  }
  // 限制在 0-1 范围内
  const opacity = Math.max(0, Math.min(1, value));
  onThemeMaskOpacityChange(opacity);
}
</script>

<style lang="scss">
// 主容器
.c-theme-select {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  max-width: 80vw;
  padding: 8px;
  font-size: 12px;
  color: #fff;
  user-select: none;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
}

// Header
.c-theme-select__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
  margin-bottom: 4px;
  cursor: move;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.c-theme-select__title {
  font-size: 12px;
  font-weight: bold;
}

.c-theme-select__collapse-btn {
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

// 展平写法
.c-theme-select__collapse-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

// Section
.c-theme-select__section {
  margin-bottom: 8px;
}

.c-theme-select__section:last-child {
  margin-bottom: 0;
}

.c-theme-select__label {
  margin-bottom: 4px;
  font-weight: bold;
  color: #fff;
}

// Buttons
.c-theme-select__buttons {
  display: flex;
  gap: 4px;
}

.c-theme-select__button {
  padding: 2px 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

// 展平写法
.c-theme-select__button:hover {
  background: rgba(255, 255, 255, 0.6);
}

.c-theme-select__button.is-active {
  background: rgba(255, 255, 255, 0.6);
}

// Colors
.c-theme-select__colors {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.c-theme-select__color-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 20px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 2px;
}

// 展平写法
.c-theme-select__color-item:hover {
  border-color: #fff;
}

.c-theme-select__color-item.is-active {
  border-color: #fff;
}

.c-theme-select__color-text {
  font-size: 10px;
  color: #fff;
  text-shadow: 0 0 2px #000;
}

// Skin buttons
.c-theme-select__skin-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.c-theme-select__skin-button {
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

// 展平写法
.c-theme-select__skin-button:hover {
  background: rgba(255, 255, 255, 0.6);
}

.c-theme-select__skin-button.is-active {
  background: rgba(255, 255, 255, 0.6);
}

// Stepper
.c-theme-select__stepper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.c-theme-select__stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.c-theme-select__stepper-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.c-theme-select__stepper-value {
  min-width: 40px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

// Custom input
.c-theme-select__custom-input {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 4px;
}

.c-theme-select__input {
  width: 80px;
  padding: 2px 4px;
  font-size: 10px;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
}

// 展平写法
.c-theme-select__input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.c-theme-select__input:focus {
  border-color: rgba(255, 255, 255, 0.6);
}

.c-theme-select__color-preview {
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>
