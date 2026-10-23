<template>
  <div class="c-bulletin-topping">
    <iar-bulletin-topping
      v-if="targetInited"
      :bulletin-target="getIarTarget()"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { useBulletin } from './use-bulletin';

const { loadIarUI } = useIarUILoader('iar-bulletin-ui');

const IarBulletinTopping = defineAsyncComponent(() => loadIarUI('bulletin-topping'));

const { targetInited, getIarTarget } = useBulletin();
</script>

<style lang="scss">
.c-bulletin-topping {
  padding: 0 70px 0 12px;
  margin-top: 8px !important;
}
</style>
