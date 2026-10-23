<template>
  <div
    ref="popupRef"
    class="c-pc-bulletin-popup"
  >
    <iar-pc-bulletin-popup
      v-if="targetInited"
      ref="bulletinPopupRef"
      :bulletin-target="getIarTarget()"
      :popup-config="popupConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, unref, computed } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useBulletin } from '../use-bulletin';

const { loadIarUI } = useIarUILoader('iar-bulletin-ui');

const IarPcBulletinPopup = defineAsyncComponent(() => loadIarUI('bulletin-popup'));

const { targetInited, bulletinPopupRef, getIarTarget } = useBulletin();

const popupRef = ref<HTMLElement>();

const popupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(popupRef),
    showModal: false,
  };
});
</script>
