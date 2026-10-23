<!-- @file 手机区号选择器 -->
<template>
  <div class="c-pc-phone-code">
    <div class="c-pc-phone-code__search">
      <form-input
        v-model="searchKey"
        :placeholder="$lang('form.placeholder.enterCountry')"
        :size="FormSize.Medium"
        :validate-form="false"
      />
    </div>
    <div class="c-pc-phone-code__main">
      <div
        ref="codeListRef"
        class="c-pc-phone-code__main__list"
      >
        <div
          v-for="(item, index) in phoneCodeList"
          :key="`code-${index}`"
          class="c-pc-phone-code__main__list__item"
        >
          <div
            v-if="item.letter"
            class="c-pc-phone-code__main__list__item__letter"
            :date-letter="item.letter"
          >
            {{ item.letter }}
          </div>
          <div
            v-else
            class="c-pc-phone-code__main__list__item__code"
            @click="onClickCountry(item)"
          >
            {{ item.country }}
            <span>{{ item.code }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormSize } from '../form/types/enums';
import { phoneCodeEmits, phoneCodeProps, usePhoneCode } from './use-phone-code';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';

const emit = defineEmits(phoneCodeEmits());

const props = defineProps(phoneCodeProps());

const { searchKey, phoneCodeList, codeListRef, onClickCountry } = usePhoneCode({
  props,
  emit,
});
</script>

<style lang="scss">
.c-pc-phone-code {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: $--color-white;
}

.c-pc-phone-code__search {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 100%;
  padding: 12px 12px;
}

.c-pc-phone-code__main {
  position: relative;
  box-sizing: border-box;
  flex: 1;
  overflow: hidden;
}

.c-pc-phone-code__main__list {
  height: 100%;
  padding: 0 12px;
  overflow-y: auto;
}

.c-pc-phone-code__main__list__item {
  color: $--font-color-primary;
  border-bottom: 1px solid #f6f6f6;
}

.c-pc-phone-code__main__list__item__letter {
  font-size: 12px;
  line-height: 32px;
  color: #666;
}

.c-pc-phone-code__main__list__item__code {
  display: flex;
  align-items: center;
  height: 48px;
  cursor: pointer;
  span {
    margin-left: auto;
  }
}

.c-pc-phone-code__main__letter {
  position: absolute;
  top: 50%;
  right: 6px;
  font-size: 12px;
  line-height: 18px;
  color: #3082fe;
  text-align: center;
  transform: translateY(-50%);
}

.c-pc-phone-code__main__letter__item {
  cursor: pointer;
}
</style>
