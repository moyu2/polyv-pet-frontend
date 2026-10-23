<!-- @file 竖屏输入框提问icon -->
<template>
  <div
    v-if="askMenuData.visible"
    class="c-portrait-ask-icon"
  >
    <mobile-icon-question-next
      v-show="portraitMessageTabCurrentName === PortraitChatTabName.Chat"
      class="c-portrait-ask-icon__emotion pws-portrait-msg-input-icon"
      @click="onClickIcon(PortraitChatTabName.Ask)"
    />
    <mobile-icon-question-next-active
      v-show="portraitMessageTabCurrentName === PortraitChatTabName.Ask"
      class="c-portrait-ask-icon__emotion pws-portrait-msg-input-icon"
      @click="onClickIcon(PortraitChatTabName.Chat)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePortraitLayoutStore, PortraitChatTabName } from '@/store/use-portrait-layout-store';
import { PropUtils } from '@polyv/vue-components';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import {
  MobileIconQuestionNext,
  MobileIconQuestionNextActive,
} from '@/components/component-icons/mobile/map';

const props = defineProps({
  fontSize: PropUtils.number.def(24),
});

const iconFontSize = computed(() => `${props.fontSize}px`);

const { askMenuData, chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const portraitLayoutStore = usePortraitLayoutStore();

const { portraitMessageTabCurrentName } = storeDefinitionToRefs(usePortraitLayoutStore);

function onClickIcon(name: PortraitChatTabName) {
  if (name === PortraitChatTabName.Chat && !chatMenuData.value.visible) {
    return;
  }

  portraitLayoutStore.$patch({
    portraitMessageTabCurrentName: name,
  });
}
</script>

<style lang="scss">
.c-portrait-ask-icon {
  position: relative;
  display: flex;
  align-items: center;
}
.c-portrait-ask-icon__emotion {
  display: flex;
  align-items: center;
  /* stylelint-disable-next-line */
  font-size: v-bind(iconFontSize) !important;
  color: $--color-white;
}
</style>
