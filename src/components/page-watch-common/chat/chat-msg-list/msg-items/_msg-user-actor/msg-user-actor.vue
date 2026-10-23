<!-- @file 消息用户头衔标签 -->
<template>
  <div
    :class="{
      'c-msg-user-actor': true,
      'c-msg-user-actor--border-img': !actorLabelColor,
    }"
    :style="{ background: actorLabelColor }"
  >
    <span class="c-msg-user-actor__content">
      {{ msgUserActor }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useMsgUserActor, msgUserActorProps } from './use-msg-user-actor';

const props = defineProps(msgUserActorProps());

const { msgUserActor, actorLabelColor } = useMsgUserActor({ props });
</script>

<style lang="scss">
.c-msg-user-actor {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 110px;
  height: 14px;
  margin-right: 4px;
  line-height: 14px;
  color: $--color-white;
  border-radius: 18px;
  transform: translateY(-1px);
}

.c-msg-user-actor--border-img {
  background: none !important;
  border-image-source: url('../_imgs/img-user-actor-bg.png');
  border-image-slice: 0 20 0 20 fill;
  border-image-width: 0 8px 0 8px;
}

.c-msg-user-actor__content {
  padding: 0 3px;
  font-size: 12px;
  white-space: nowrap;
  transform: scale(0.75);
}
</style>
