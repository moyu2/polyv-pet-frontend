<!-- @file 移动端抢答 -->
<template>
  <iar-mobile-rush-answer
    class="c-mobile-rush-answer"
    :lang="currentLang"
    :internal="true"
    :rush-answer-sdk="rushAnswerSdk"
    :is-full-screen="isIarFullScreen"
    :is-landscape="isIarFullScreen"
    @entry-visible-changed="handleEntryVisibleChanged"
    @visible-changed="onRushAnswerVisibleChanged"
  />
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { getIarComponent } from '../load-iar-ui';
import { useRushAnswer } from './hooks/use-rush-answer';

const IarMobileRushAnswer = getIarComponent('MobileRushAnswer');

const { rushAnswerSdk, handleEntryVisibleChanged, onRushAnswerVisibleChanged } = useRushAnswer();

const { currentLang } = storeDefinitionToRefs(useLangStore);
const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
