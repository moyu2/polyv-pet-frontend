<template>
  <iar-mobile-bulletin-popup
    v-if="targetInited"
    ref="bulletinPopupRef"
    :bulletin-target="getIarTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useBulletin } from '../use-bulletin';

const { loadIarUI } = useIarUILoader('iar-bulletin-ui');

const IarMobileBulletinPopup = defineAsyncComponent(() => loadIarUI('bulletin-popup'));

const { targetInited, bulletinPopupRef, getIarTarget } = useBulletin();
</script>
