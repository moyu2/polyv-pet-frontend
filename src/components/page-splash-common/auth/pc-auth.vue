<template>
  <div class="c-pc-auth">
    <div class="c-pc-auth__button-list">
      <div
        v-for="(item, index) in authButtonList"
        :key="index"
        class="c-pc-auth__button-item"
      >
        <pc-auth-button :auth-item="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PcAuthButton from './pc-auth-button.vue';
import { useAuthStore } from '@/store/use-auth-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { authButtonList } = storeDefinitionToRefs(useAuthStore);
</script>

<style lang="scss">
.c-pc-auth__button-list {
  display: flex;
}
.c-pc-auth__button-item {
  margin-right: 40px;

  &:empty {
    display: none;
  }
}
</style>
