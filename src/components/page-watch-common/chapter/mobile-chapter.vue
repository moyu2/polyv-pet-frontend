<!-- @file 移动端章节 -->
<template>
  <div class="c-mobile-chapter">
    <div
      v-for="(item, index) in chapterList"
      :key="index"
      class="c-mobile-chapter__item pws-chapter-item"
      :class="{
        'is-active': currentIndex === index,
      }"
      @click="onClickChapter(item)"
    >
      <div class="c-mobile-chapter__item__cover-wrap">
        <div
          class="c-mobile-chapter__item__cover g-img-cover"
          :style="getChapterCoverStyle(item)"
        ></div>

        <div
          v-if="currentIndex === index"
          class="c-mobile-chapter__item__playing pws-chapter-item-playing"
        >
          <mobile-icon-media class="c-mobile-chapter__item__playing__icon" />
          <span>{{ $lang('playback.playing') }}</span>
        </div>
      </div>
      <div class="c-mobile-chapter__item__info">
        <p class="c-mobile-chapter__item__title">{{ item.title }}</p>
        <span class="c-mobile-chapter__item__duration">
          {{ formatSeconds(item.duration, { segments: 2 }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSeconds } from '@polyv/utils/date';
import { MobileIconMedia } from '@/components/component-icons/mobile/map';
import { useChapter } from './hooks/use-chapter';

const {
  getChapterCoverStyle,

  chapterList,
  currentIndex,
  onClickChapter,
} = useChapter();
</script>

<style lang="scss">
.c-mobile-chapter {
  height: 100%;
  padding: 12px 0;
  overflow: auto;
}

.c-mobile-chapter__item {
  position: relative;
  box-sizing: border-box;
  display: flex;
  gap: 10px;
  padding: 8px 16px;
  font-size: 14px;
  color: #adadc0;
  cursor: pointer;
  border-bottom: 1px solid #000;
}

.c-mobile-chapter__item__cover-wrap {
  position: relative;
  gap: 10px;
  width: 30%;
  min-width: 136px;
  height: 76px;
  overflow: hidden;
  border-radius: 4px;

  &::before {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
    content: '';
  }
}

.c-mobile-chapter__item__cover {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transition: 0.3s;
  transform: translate(-50%, -50%);
}

.c-mobile-chapter__item__playing {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 12;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 32px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 32px;
  color: $--color-white;
  text-align: center;
  white-space: nowrap;
  border-radius: 20px;
  opacity: 0.9;
  transform: translate(-50%, -50%);
}

.c-mobile-chapter__item__playing__icon {
  display: flex;
  margin-right: 6px;
  font-size: 14px !important;
}

.c-mobile-chapter__item__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  justify-items: center;
  width: 100%;
  height: 100%;
  padding: 4px;
}

.c-mobile-chapter__item__title {
  font-size: 14px;
  line-height: 16px;
}

.c-mobile-chapter__item__duration {
  font-size: 12px;
}

.c-mobile-chapter__item.is-active {
  color: #3082fe;
}
</style>
