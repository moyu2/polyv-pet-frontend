<!-- @file 移动端回放列表 -->
<template>
  <div
    class="c-mobile-playback-list"
    @scroll="debounceHandlePlaybackListScroll"
  >
    <!-- 搜索框 -->
    <div class="c-mobile-playback-list__search">
      <search-input
        v-model="searchKeyword"
        :placeholder="$lang('playback.search.placeholder')"
        :debounce-delay="500"
        @search="onSearch"
      />
    </div>
    <div class="c-mobile-playback-list__main">
      <div
        v-for="(item, index) in playbackList"
        :key="index"
        class="c-mobile-playback-list__item pws-mobile-playback-list-item"
        :class="{
          'is-active': item.playbackId === currentPlaybackTarget?.playbackId,
        }"
        @click="onClickPlaybackItem(item)"
      >
        <div class="c-mobile-playback-list__item__cover-wrap">
          <div
            class="c-mobile-playback-list__item__cover g-img-cover"
            :style="{
              backgroundImage: `url(${item.firstImage})`,
            }"
          ></div>

          <div
            v-if="item.playbackId === currentPlaybackTarget?.playbackId"
            class="c-mobile-playback-list__item__playing pws-mobile-playback-list-playing"
          >
            <mobile-icon-media class="c-mobile-playback-list__item__playing__icon" />
            <span>{{ $lang('playback.playing') }}</span>
          </div>

          <div class="c-mobile-playback-list__item__bottom">
            <span class="c-mobile-playback-list__item__bottom__duration">
              {{ formatDuration(item.duration) }}
            </span>
          </div>
        </div>

        <p class="c-mobile-playback-list__item__title g-multiline pws-mobile-playback-list-title">
          {{ item.title }}
        </p>
        <p
          v-if="item.startTime && listLiveStartTimeEnabled"
          class="c-mobile-playback-list__item__start-time pws-mobile-playback-list-time"
        >
          {{ formatDate(item.startTime, DATE_FORMAT_COMPLETE) }}
        </p>
      </div>
      <div
        v-if="isLoading"
        class="c-mobile-playback-list__loading c-mobile-playback-list__tips pws-mobile-playback-list-tips"
      >
        <list-loading />
      </div>
      <div
        v-if="playbackList.length > 0 && isNoMore"
        class="c-mobile-playback-list__tips pws-mobile-playback-list-tips"
      >
        {{ $lang('playback.no.more') }}
      </div>
      <div
        v-if="searchEmpty"
        class="c-mobile-playback-list__tips pws-mobile-playback-list-tips"
      >
        {{ $lang('playback.search.empty') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash-es/debounce';

import { MobileIconMedia } from '@/components/component-icons/mobile/map';
import ListLoading from '@/components/common-base/list-loading/list-loading.vue';
import SearchInput from '@/components/common-base/search-input/search-input.vue';

import { DATE_FORMAT_COMPLETE } from '@/assets/constants/date-format';
import { formatDate } from '@polyv/utils/date';
import { formatDuration } from '@/assets/utils/date-time';

import { usePlaybackStore } from '@/store/use-playback-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlaybackList } from '../use-playback-list';
import { ref } from 'vue';

const playbackStore = usePlaybackStore();
const {
  listLiveStartTimeEnabled,

  playbackList,
  currentPlaybackTarget,

  isLoading,
  isNoMore,
  searchEmpty,
} = storeDefinitionToRefs(usePlaybackStore);

const { onClickPlaybackItem } = usePlaybackList();

// 搜索关键词
const searchKeyword = ref('');

// 搜索（防抖由 SearchInput 组件处理）
function onSearch(keyword: string) {
  playbackStore.setSearchKeyword(keyword);
  playbackStore.searchPlaybackList();
}

function handlePlaybackListScroll(e: UIEvent) {
  const target = e.target as HTMLElement;
  const scrollHeight = Math.floor(target.scrollHeight);
  const scrollTop = Math.floor(target.scrollTop);
  const clientHeight = Math.floor(target.clientHeight);
  if (scrollTop >= scrollHeight - clientHeight - 100) {
    playbackStore.loadNextPlaybackList();
  }
}

const debounceHandlePlaybackListScroll = debounce(handlePlaybackListScroll, 300);
</script>

<style lang="scss">
.c-mobile-playback-list {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: none;
}

.c-mobile-playback-list__search {
  padding: 12px 16px;
}

.c-mobile-playback-list__main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 16px 34px;
}

.c-mobile-playback-list__item {
  flex: 0 0 calc(50% - 8px);
  margin-top: 16px;
}

.c-mobile-playback-list__item__cover-wrap {
  position: relative;
  width: 100%;
  margin-bottom: 12px;
  overflow: hidden;
  border-radius: 10px;

  &::before {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
    content: '';
  }
}

.c-mobile-playback-list__item__cover {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transition: 0.3s;
  transform: translate(-50%, -50%);
}

.c-mobile-playback-list__item__playing {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 12;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  height: 40px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 40px;
  color: $--color-white;
  text-align: center;
  white-space: nowrap;
  border-radius: 20px;
  opacity: 0.9;
  transform: translate(-50%, -50%);
}
.c-mobile-playback-list__item__playing__icon {
  display: flex;
  margin-right: 6px;
  font-size: 14px !important;
}

.c-mobile-playback-list__item__bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 0;
  padding-top: 47%; // 92 / 164
  color: $--color-white;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
}
.c-mobile-playback-list__item__bottom__duration {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 12px;
  line-height: 1;
  color: #e4e4e4;
}

.c-mobile-playback-list__item__title {
  height: 40px;
  font-size: 16px;
  line-height: 20px;
}

.c-mobile-playback-list__item__start-time {
  width: 100%;
  font-size: 12px;
  line-height: 20px;
}

.c-mobile-playback-list__tips {
  width: 100%;
  margin-top: 40px;
  font-size: 12px;
  color: #adadc0;
  text-align: center;
}

.c-mobile-playback-list__loading {
  margin-top: 4px;
}
</style>
