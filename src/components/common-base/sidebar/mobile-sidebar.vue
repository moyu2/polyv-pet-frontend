<template>
  <div
    role="tablist"
    class="c-mobile-sidebar"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { PropUtils } from '@polyv/vue-components';
import { useChildren } from '@/hooks/core/use-vue/use-children';
import { SIDEBAR_KEY } from './use-sidebar';

const props = defineProps({
  modelValue: PropUtils.number.def(0),
});
const emit = defineEmits(['change', 'update:modelValue']);

const { linkChildren } = useChildren(SIDEBAR_KEY);

const getActive = () => +props.modelValue;

const setActive = (value: number) => {
  if (value !== getActive()) {
    emit('update:modelValue', value);
    emit('change', value);
  }
};

linkChildren({
  getActive,
  setActive,
});
</script>

<style lang="scss">
.c-mobile-sidebar {
  width: 80px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
