<template>
  <div
    :class="{
      'c-mobile-weixin-snapshot-tips': true,
      'c-mobile-weixin-snapshot-tips__hide': !snapshotTipsImgLoaded,
    }"
  >
    <!-- 提示用户进入快照页操作指示 -->
    <div class="c-mobile-weixin-snapshot-tips__image-wrapper">
      <img
        class="c-mobile-weixin-snapshot-tips__image"
        :src="snapshotTipsImgUrl"
        :alt="$lang('weixin.snapshot.tips')"
        @load="handleImageLoad"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LangType } from '@/assets/lang/lang-enum';
import { useLangStore } from '@/store/use-lang-store';
import { computed, ref } from 'vue';

const langStore = useLangStore();

const snapshotTipsImgLoaded = ref(false);

const snapshotTipsImgUrl = computed(() => {
  return langStore.currentLang === LangType.ZH_CN
    ? require('./imgs/weixin-snapshot-tips.png')
    : require('./imgs/weixin-snapshot-tips-en.png');
});

function handleImageLoad() {
  snapshotTipsImgLoaded.value = true;
}
</script>

<style lang="scss">
/* 快照页 提示动画 */
@keyframes weixin-snapshot-tips-animate {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(30px);
  }
  100% {
    transform: translateY(0);
  }
}

.c-mobile-weixin-snapshot-tips {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: $--zIndex-top;
  background: rgba(0, 0, 0, 0.6);
}
.c-mobile-weixin-snapshot-tips__hide {
  display: none;
}
.c-mobile-weixin-snapshot-tips__image-wrapper {
  position: fixed;
  right: 12px;
  bottom: 30px;
  z-index: $--zIndex-top + 1;
  animation: weixin-snapshot-tips-animate 2s linear infinite;
}
.c-mobile-weixin-snapshot-tips__image {
  width: 237px;
}
</style>
