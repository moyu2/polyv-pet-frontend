<template>
  <div
    v-if="showDonateFunction"
    class="c-mobile-donate-entrance"
    :class="{
      'c-mobile-donate-entrance--dark': isDarkSkinMode,
      'c-mobile-donate-entrance--light': !isDarkSkinMode,
    }"
    :style="backgroundStyle"
    @click="onClickDonateEnter"
  ></div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useDonateStore } from '@/store/use-donate-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useThemeStore } from '@/store/use-theme-store';
import { storeToRefs } from 'pinia';
import { CSSProperties, computed } from 'vue';

const { getEmitter } = useGlobalInject();
const { toInterruptUserClick } = useInterruptUserClick();

const { showDonateFunction } = storeDefinitionToRefs(useDonateStore);

const { isDarkSkinMode, watchThemeStyleConfig } = storeToRefs(useThemeStore());

const backgroundStyle = computed<CSSProperties>(() => {
  if (!watchThemeStyleConfig.value || !watchThemeStyleConfig.value.common.chat.btn.donate.iconUrl)
    return {};

  return {
    'background-image': `url(${watchThemeStyleConfig.value.common.chat.btn.donate.iconUrl})`,
  };
});

function onClickDonateEnter() {
  const result = toInterruptUserClick({
    triggerSource: 'donate',
    ignoreSetNick: true,
  });

  if (result) {
    return;
  }

  getEmitter().emit(appEvents.donate.OpenDonatePopup, true);
}
</script>

<style lang="scss">
.c-mobile-donate-entrance {
  width: 36px;
  min-width: 36px;
  height: 36px;
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.c-mobile-donate-entrance--light {
  background-image: url('./images/gift-light.png');
}

.c-mobile-donate-entrance--dark {
  background-image: url('./images/gift-dark.png');
}
</style>
