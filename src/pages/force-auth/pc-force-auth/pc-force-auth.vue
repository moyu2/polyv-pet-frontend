<!-- @file PC 端-强制授权页 -->

<template>
  <div class="c-pc-force-auth-page">
    <pc-force-wx-auth />
  </div>
</template>

<script lang="ts" setup>
import PcForceWxAuth from '../components/force-wx-auth/pc-force-wx-auth.vue';
</script>

<style>
.c-pc-force-auth-page {
  width: 100%;
  height: 100%;
}
</style>
