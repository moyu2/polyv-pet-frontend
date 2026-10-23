<!-- @file 通用搜索输入框组件 -->
<template>
  <pwc-input
    ref="inputRef"
    :value="value"
    type="text"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :maxlength="maxlength"
    size="small"
    @input="onInputChange"
  >
    <pwc-icon-search slot="prefix" />
  </pwc-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import debounce from 'lodash-es/debounce';
import { PropUtils, emitFunc, PwcIconSearch, PwcInput } from '@polyv/vue-components';

const props = defineProps({
  /** 是否禁用 */
  disabled: PropUtils.bool.def(false),
  /** 双向绑定值 */
  value: PropUtils.string.def(''),
  /** 占位符 */
  placeholder: PropUtils.string.def('搜索'),
  /** 防抖延迟时间（毫秒） */
  debounceDelay: PropUtils.number.def(300),
  /** 是否可清空 */
  clearable: PropUtils.bool.def(true),
  /** 最大字符 */
  maxlength: PropUtils.number.def(50),
});

const emit = defineEmits({
  input: emitFunc<string>(),
  search: emitFunc<string>(),
});

// 引用
const inputRef = ref<any>(null);
const innerSearchValue = ref('');

// 创建防抖函数
const debounceEmitSearch = debounce(() => {
  emit('search', innerSearchValue.value.trim());
}, props.debounceDelay);

// 同步外部 value 到内部 innerSearchValue
watch(
  () => props.value,
  newVal => {
    if (innerSearchValue.value !== newVal) {
      innerSearchValue.value = newVal;
    }
  },
  { immediate: true },
);

watch(
  () => innerSearchValue.value,
  () => {
    debounceEmitSearch();
  },
);

function onInputChange(value: string) {
  innerSearchValue.value = value;
  emit('input', value);
  debounceEmitSearch();
}
// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus?.(),
  blur: () => inputRef.value?.blur?.(),
});
</script>
