<!-- 迷你型状态标签 -->
<template>
  <div
    class="c-mini-status-tag"
    :style="minStatusTagStyle"
  >
    {{ statusTagText }}
  </div>
</template>

<script setup lang="ts">
import { statusTagProps, useStatusTag, useMiniStatusTagStyle } from './use-status-tag';

const props = defineProps(statusTagProps());

const { statusTagText } = useStatusTag({
  props,
});

const { minStatusTagStyle } = useMiniStatusTagStyle({
  props,
});
</script>

<style lang="scss">
.c-mini-status-tag {
  display: inline-block;
  height: 20px;
  padding: 0 4px;
  font-size: 12px;
  line-height: 20px;
  color: $--color-white;
  border-radius: 2px;
}
</style>
