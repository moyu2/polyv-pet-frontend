<!-- PC 投票规则说明弹层 -->
<template>
  <div
    ref="popupRef"
    class="c-pc-vote-rule-popup"
  >
    <iar-vote-rule-popup
      v-if="voteRule"
      :rule-text="voteRule"
      :popup-config="popupConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, unref } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useVote } from '../hooks/use-vote';

const { loadIarUI } = useIarUILoader('iar-vote-ui');

const { voteRule } = useVote();

const IarVoteRulePopup = defineAsyncComponent(() => loadIarUI('vote-rule-popup'));

const popupRef = ref<HTMLElement>();

const popupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(popupRef),
    showModal: false,
  };
});
</script>

<style lang="scss">
@media screen and (min-aspect-ratio: 4/3) {
  .c-pc-vote-rule-popup {
    .plv-iar-vote-rule-popup {
      display: block;
    }
  }
}
</style>
