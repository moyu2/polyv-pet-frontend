<!--
  @file 快速皮肤选择区块组件
-->
<template>
  <div class="c-theme-select__section">
    <div class="c-theme-select__label">快速皮肤</div>
    <div class="c-theme-select__skin-buttons">
      <div
        v-for="skin in skinList"
        :key="skin"
        class="c-theme-select__skin-button"
        :class="{ 'is-active': currentSkin === skin }"
        @click="onSkinClick(skin)"
      >
        {{ formatSkinLabel(skin) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChannelWatchPageSkin } from '@polyv/live-watch-sdk';
import { skinSectionProps, skinSectionEmits } from './hooks/use-skin-section';

type SkinType = ChannelWatchPageSkin | 'custom';

defineProps(skinSectionProps());

const emit = defineEmits(skinSectionEmits());

/** 皮肤列表 */
const skinList: SkinType[] = [
  ChannelWatchPageSkin.Black,
  ChannelWatchPageSkin.Blue,
  ChannelWatchPageSkin.Freshblue,
  ChannelWatchPageSkin.Green,
  ChannelWatchPageSkin.Golden,
  ChannelWatchPageSkin.Red,
  ChannelWatchPageSkin.White,
  'custom',
];

/** 格式化皮肤标签 */
function formatSkinLabel(skin: SkinType): string {
  if (skin === 'custom') {
    return '自定义';
  }
  return skin;
}

/** 皮肤点击 */
function onSkinClick(skin: SkinType) {
  emit('skin-change', skin);
}
</script>
