<template>
  <div class="c-member-list-v2">
    <polyv-member-list :key="refreshKey" />
  </div>
</template>

<script setup lang="ts">
import { TAB_NAME_MEMBERS } from '@/assets/constants/tab-name';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { useBrowser } from '@polyv/vue-components';
import { ref, watch } from 'vue';

const PolyvChatUI = getChatUIV2Pkg();

const { MemberList: PolyvMemberList } = PolyvChatUI;

const refreshKey = ref(Date.now());

const { isMobile } = useBrowser();

const { mobileMenuCurrentName, pcAsideTabCurrentName } = storeDefinitionToRefs(useLayoutStore);

watch(
  () => {
    if (isMobile) {
      return mobileMenuCurrentName.value;
    }
    return pcAsideTabCurrentName.value;
  },
  val => {
    if (val === TAB_NAME_MEMBERS) {
      refreshKey.value = Date.now();
    }
  },
);
</script>

<style lang="scss">
.c-member-list-v2 {
  height: 100%;
  overflow: hidden;
}
</style>
