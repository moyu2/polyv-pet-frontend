<template>
  <div class="pet-sprite pet-preview-sprite">
    <!-- 选择器只展示各物种封面，避免同时解码列表和三阶段的完整图集。 -->
    <img
      v-if="hasPetAtlas(species) && !posterFailed"
      :src="petPoster(stage, species)"
      alt=""
      draggable="false"
      @error="posterFailed = true"
    />
    <pet-legacy-sprite
      v-else
      :stage="stage"
      :species="species"
      :animation="animation"
      :satiety="satiety"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import PetLegacySprite from './pet-legacy-sprite.vue';
import { hasPetAtlas, petPoster } from './pet-assets';
import type { PetStage } from './pet-animation';

const props = defineProps<{
  stage: PetStage;
  species?: string;
  animation?: '' | 'eat' | 'evolve';
  satiety?: number;
}>();
const posterFailed = ref(false);
watch(
  () => [props.stage, props.species],
  () => {
    posterFailed.value = false;
  },
);
</script>

<style lang="scss">
.pet-preview-sprite {
  width: 132px;
  height: 132px;

  > img,
  > .pet-legacy-sprite {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &::before {
    display: none;
  }
}
</style>
