<!-- @file 评论氛围 -->
<template>
  <polyv-comment-atmosphere
    v-if="commentAtmosphereEnabled"
    :left="left"
  />
</template>

<script setup lang="ts">
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { PropUtils } from '@polyv/vue-components';
import { useChatTarget } from '../hooks/use-chat-target';

defineProps({
  left: PropUtils.number.def(12),
});

const { chatTarget } = useChatTarget();
const commentAtmosphereEnabled = chatTarget.getEffectSetting().commentAtmosphereEnabled;

const PolyvChatUI = getChatUIV2Pkg();
const { CommentAtmosphere: PolyvCommentAtmosphere } = PolyvChatUI;
</script>
