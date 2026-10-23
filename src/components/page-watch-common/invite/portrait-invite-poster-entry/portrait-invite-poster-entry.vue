<!-- @file 移动端-竖屏-邀请海报入口(使用在邀请榜中) -->
<template>
  <normal-button
    class="c-portrait-invite-poster-entry"
    @click="onClickInvitePosterEntry"
  >
    {{ $lang('invite.poster.go.invite') }}
  </normal-button>
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { useInvitePosterEntry } from '../hooks/use-invite-poster-entry';

const { onClickInvitePosterEntry } = useInvitePosterEntry();
</script>

<style lang="scss">
.c-portrait-invite-poster-entry {
  min-width: 68px;
  color: #fff;
  background-image: linear-gradient(90deg, #ffc06f 0%, #fd4d3e 100%);
  border-radius: 25px;
}
</style>
