<!-- @file PC端抢答 -->
<template>
  <iar-pc-rush-answer
    class="c-pc-rush-answer"
    :lang="currentLang"
    :internal="true"
    :rush-answer-sdk="rushAnswerSdk"
    @entry-visible-changed="handleEntryVisibleChanged"
  />
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { getIarComponent } from '../load-iar-ui';
import { useRushAnswer } from './hooks/use-rush-answer';

const IarPcRushAnswer = getIarComponent('PcRushAnswer');

const { rushAnswerSdk, handleEntryVisibleChanged } = useRushAnswer();

const { currentLang } = storeDefinitionToRefs(useLangStore);
</script>
