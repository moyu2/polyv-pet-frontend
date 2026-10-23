<template>
  <div
    v-if="askReminderVisible"
    class="c-portrait-ask-icon__news"
    @click.stop="onClickIcon(PortraitChatTabName.Ask)"
  >
    <span>{{ $lang('ask.news') }}</span>
  </div>
</template>

<script lang="ts" setup>
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useAskStore } from '@/store/use-ask-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const { askReminderVisible } = storeDefinitionToRefs(useAskStore);

const { chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const portraitLayoutStore = usePortraitLayoutStore();

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
.c-portrait-ask-icon__news {
  position: absolute;
  top: -8px;
  left: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
  white-space: nowrap;
  background: #ff5252;
  border-radius: 8px 8px 8px 0;
}
</style>
