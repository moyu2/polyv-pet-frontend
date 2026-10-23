<!-- 移动端投票规则说明弹层 -->
<template>
  <iar-vote-rule-popup
    v-if="voteRule"
    :rule-text="voteRule"
    :popup-config="popupConfig"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useVote } from './hooks/use-vote';
import { useVoteRule } from './hooks/use-vote-rule';

const { popupConfig } = useVoteRule();

const { loadIarUI } = useIarUILoader('iar-vote-ui');

const { voteRule } = useVote();

const IarVoteRulePopup = defineAsyncComponent(() => loadIarUI('vote-rule-popup'));
</script>
