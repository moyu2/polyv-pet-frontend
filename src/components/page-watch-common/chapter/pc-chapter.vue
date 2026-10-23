<!-- @file PC 端章节 -->
<template>
  <div class="c-pc-chapter pws-main-tab-body-scrollbar">
    <div
      v-for="(item, index) in chapterList"
      :key="index"
      class="c-pc-chapter__item pws-chapter-item"
      :class="{
        'is-active': currentIndex === index,
      }"
      @click="onClickChapter(item)"
    >
      <div class="c-pc-chapter__item__cover-wrap">
        <div
          class="c-pc-chapter__item__cover g-img-cover"
          :style="getChapterCoverStyle(item)"
        ></div>

        <div
          v-if="currentIndex === index"
          class="c-pc-chapter__item__playing pws-chapter-item-playing"
        >
          <pc-icon-media class="c-pc-chapter__item__playing__icon" />
          <span>{{ $lang('playback.playing') }}</span>
        </div>
      </div>
      <div class="c-pc-chapter__item__info">
        <span
          class="c-pc-chapter__item__title g-multiline"
          :title="item.title"
          >{{ item.title }}</span
        >
        <span class="c-pc-chapter__item__duration">
          {{ formatSeconds(item.duration, { segments: 2 }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSeconds } from '@polyv/utils/date';
import { useChapter } from './hooks/use-chapter';
import { PcIconMedia } from '@/components/component-icons/pc/map';

const {
  getChapterCoverStyle,

  chapterList,
  currentIndex,
  onClickChapter,
} = useChapter();
</script>

<style lang="scss">
.c-pc-chapter {
  height: 100%;
  overflow: auto;
  @include scrollbar;
}
.c-pc-chapter__item {
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

.c-pc-chapter__item__cover-wrap {
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

.c-pc-chapter__item__cover {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transition: 0.3s;
  transform: translate(-50%, -50%);
}

.c-pc-chapter__item__playing {
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

.c-pc-chapter__item__playing__icon {
  display: flex;
  margin-right: 6px;
  font-size: 14px !important;
}

.c-pc-chapter__item__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  justify-items: center;
  width: 100%;
  height: 100%;
  padding: 4px;
}

.c-pc-chapter__item__title {
  font-size: 14px;
  line-height: 16px;
}

.c-pc-chapter__item__duration {
  font-size: 12px;
}

.c-pc-chapter__item.is-active {
  color: #3082fe;
}
</style>
