<!-- @file 移动端打赏面板 -->
<template>
  <div class="c-mobile-donate-panel pws-mobile-donate-panel">
    <!-- 道具打赏 -->
    <mobile-donate-panel-good
      v-if="!cashPanelVisible"
      @open-cash="cashPanelVisible = true"
      @donate-success="emit('donate-finish')"
    />
    <!-- 现金打赏 -->
    <mobile-donate-panel-cash
      v-if="cashPanelVisible"
      @back="cashPanelVisible = false"
      @donate-success="emit('donate-finish')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MobileDonatePanelGood from './mobile-donate-panel-good.vue';
import MobileDonatePanelCash from './mobile-donate-panel-cash.vue';
import { emitFunc } from '@polyv/vue-components';

const emit = defineEmits({
  /** 打赏完成 */
  'donate-finish': emitFunc<void>(),
});

/** 现金面板是否显示 */
const cashPanelVisible = ref(false);
</script>

<style lang="scss">
.c-mobile-donate-panel {
  border-radius: 8px 8px 0 0;
  @include iphone-x-pb(0);
}
</style>
