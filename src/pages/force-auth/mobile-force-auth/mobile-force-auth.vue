<!-- @file 移动端-强制授权页 -->

<template>
  <div class="c-mobile-force-auth-page">
    <mobile-force-wx-auth />
  </div>
</template>

<script lang="ts" setup>
import MobileForceWxAuth from '../components/force-wx-auth/mobile-force-wx-auth.vue';
</script>

<style lang="scss">
.c-mobile-force-auth-page {
  width: 100%;
  height: 100%;
}
</style>
