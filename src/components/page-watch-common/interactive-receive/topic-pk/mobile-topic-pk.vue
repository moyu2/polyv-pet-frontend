<!-- @file 移动端话题 PK -->
<template>
  <iar-mobile-topic-pk
    class="c-mobile-topic-pk"
    :topic-sdk="topicPkSdk"
    :custom-img-config="customImgConfig"
    :before-choose-topic-pk-answer="beforeChooseTopicPkAnswer"
    @visible-changed="onTopicPKVisibleChanged"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '../load-iar-ui';
import { useTopicPk } from './hook/use-topic-pk';

const IarMobileTopicPk = getIarComponent('MobileTopic');

const { topicPkSdk, customImgConfig, onTopicPKVisibleChanged, beforeChooseTopicPkAnswer } =
  useTopicPk();
</script>
