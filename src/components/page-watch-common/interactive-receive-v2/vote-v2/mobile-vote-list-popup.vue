<!-- 移动端投票列表弹层 -->
<template>
  <iar-vote-list-popup
    v-if="targetInited"
    :vote-target="getIarTarget()"
    :max-vote="maxVote"
    :layout="layout"
    :show-rule="!!voteRule"
    :result-show-type="resultShowType"
    :leaderboard-enabled="leaderboardEnabled"
    :leaderboard-show-count="leaderboardShowCount"
    :leaderboard-show-percent="leaderboardShowPercent"
    :send-status="sendStatus"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useVote } from './hooks/use-vote';

const { loadIarUI } = useIarUILoader('iar-vote-ui');

const {
  targetInited,
  getIarTarget,
  maxVote,
  layout,
  voteRule,
  resultShowType,
  leaderboardEnabled,
  leaderboardShowCount,
  leaderboardShowPercent,
  sendStatus,
} = useVote();

const IarVoteListPopup = defineAsyncComponent(() => loadIarUI('vote-list-popup'));
</script>
