<template>
  <div class="c-mobile-auth">
    <div class="c-mobile-auth__button-list">
      <div
        v-for="(item, index) in authButtonList"
        :key="index"
        class="c-mobile-auth__button-item"
      >
        <mobile-auth-button :auth-item="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileAuthButton from './mobile-auth-button.vue';
import { useAuthStore } from '@/store/use-auth-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { authButtonList } = storeDefinitionToRefs(useAuthStore);
</script>

<style lang="scss">
.c-mobile-auth__button-list {
  display: flex;
  padding: 0 16px;
}
.c-mobile-auth__button-item {
  flex: 1;

  &:empty {
    display: none;
  }
}
.c-mobile-auth__button-item + .c-mobile-auth__button-item {
  margin-left: 15px;
}
</style>
