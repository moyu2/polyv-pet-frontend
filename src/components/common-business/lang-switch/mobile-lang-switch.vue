<!-- @file 移动端多语言切换 -->
<template>
  <mobile-action-sheet
    class="c-mobile-lang-switch"
    :visible.sync="visible"
    :actions="actionList"
    :action-value="currentLang"
    :close-on-action="false"
    :close-on-click-mask="!langLoading"
    @click-action="onClickAction"
  />
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { LangType } from '@/assets/lang/lang-enum';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import MobileActionSheet from '@/components/common-base/action-sheet/mobile-action-sheet.vue';
import { ActionSheetItem, ActionSheetValue } from '@/components/common-base/action-sheet/types';
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { computed, unref } from 'vue';

const { visible, show: showLangSwitch } = useSimpleVisible();

const langStore = useLangStore();
const { currentLang, langSwitchList, langLoading, pendingLang } =
  storeDefinitionToRefs(useLangStore);

const actionList = computed(() => {
  return unref(langSwitchList).map<ActionSheetItem>(item => {
    return {
      name: item.text,
      value: item.lang,
      loading: item.lang === pendingLang.value,
      disabled: langLoading.value,
    };
  });
});

/** 处理点击选项 */
async function onClickAction(lang: ActionSheetValue) {
  if (langLoading.value) return;
  const success = await langStore.switchLang(lang as LangType);
  if (success) {
    visible.value = false;
  }
}

useEventBusListener(appEvents.global.OpenLanguageSwitch, showLangSwitch);
</script>
