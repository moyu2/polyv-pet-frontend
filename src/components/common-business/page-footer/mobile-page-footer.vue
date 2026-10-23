<!-- @file 移动端页脚 -->
<template>
  <div
    v-if="pageFootSetting.footerEnabled"
    class="c-mobile-page-footer pws-light-black-color-40 pws-dark-white-color-80"
    :style="props.contentStyle"
  >
    <a
      :href="pageFootSetting.footerLink"
      target="_blank"
      rel="noopener"
    >
      - {{ pageFootSetting.footerText }} -
    </a>
  </div>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import { PropUtils } from '@polyv/vue-components';
import { reactive } from 'vue';

const props = defineProps({
  contentStyle: PropUtils.object().def(() => {}),
});

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();
const pageFootSetting = reactive(watchCore.channel.getPageFooterSetting());
</script>

<style lang="scss">
.c-mobile-page-footer {
  margin-top: 24px;
  font-size: 12px;
  line-height: 1;
  text-align: center;
  @include iphone-x-pb(24px, false);
  a {
    color: inherit;
    text-decoration: none;
  }
}
</style>
