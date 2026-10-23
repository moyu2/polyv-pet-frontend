<template>
  <p
    v-if="rewards.hint"
    class="pet-comment-reward-hint"
    :title="rewards.hint"
  >
    {{ rewards.hint }}
  </p>
</template>

<script setup lang="ts">
import { useCommentRewardStore } from './use-comment-rewards';
const rewards = useCommentRewardStore();
</script>

<style>
.pet-comment-reward-hint {
  padding: 6px 10px;
  margin: 0;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.8;
}
</style>
