/**
 * @file 手机区号选择 hook
 */

import { isUndefined } from 'lodash-es';
import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { computed, ref, unref } from 'vue';
import { useLangStore } from '@/store/use-lang-store';
import zhCodeList from './phone-code-data';
import enCodeList from './phone-code-data-en';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { LangType } from '@/assets/lang/lang-enum';

export const PhoneCodeEmits = ['input'];

export type PhoneCodeDataItem = typeof zhCodeList[number];

export const phoneCodeProps = () => ({
  value: PropUtils.string.def(''),
});

export const phoneCodeEmits = () => ({
  input: emitFunc<string>(),
});

export const usePhoneCode = (options: {
  props: VueProps<typeof phoneCodeProps>;
  emit: VueEmit<typeof phoneCodeEmits>;
}) => {
  const { props, emit } = options;

  const { currentLang } = storeDefinitionToRefs(useLangStore);
  /** 搜索的关键词 */
  const searchKey = ref('');

  const codeList = computed(() => {
    return currentLang.value === LangType.ZH_CN ? zhCodeList : enCodeList;
  });

  /** 所有首字母列表 */
  const letterList = computed(() => {
    return codeList.value.filter(item => item.letter);
  });

  const phoneCodeList = computed(() => {
    // 英文codeList的letter值为'', 需过滤，不然列表会显示空白的item
    if (!unref(searchKey)) {
      return codeList.value.filter(item => {
        return item.letter !== '';
      });
    }

    return codeList.value.filter(item => {
      if (item.letter) {
        return false;
      }

      if (item.code && item.code.indexOf(unref(searchKey)) !== -1) {
        return true;
      }

      if (item.country && item.country.indexOf(unref(searchKey)) !== -1) {
        return true;
      }

      return false;
    });
  });

  /** 区号选择列表 ref */
  const codeListRef = ref();

  /** 滚动到某个字母中 */
  function scrollToLetter(letter: string | undefined) {
    const codeListElem = unref(codeListRef);
    if (!codeListElem || !letter) {
      return;
    }

    const targetLetterEl = codeListElem.querySelector(`[date-letter=${letter}]`);

    targetLetterEl && targetLetterEl.scrollIntoView();
  }

  /** 处理点击区号 */
  function onClickCountry(item: PhoneCodeDataItem) {
    if (isUndefined(item.code)) return;
    if (props.value === item.code) return;

    emit('input', item.code);
  }

  return {
    searchKey,
    phoneCodeList,
    letterList,
    codeListRef,
    scrollToLetter,
    onClickCountry,
    currentLang,
  };
};
