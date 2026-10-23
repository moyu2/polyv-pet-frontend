<!-- eslint-disable vue/v-on-event-hyphenation -->
<!-- @file PC 端回放列表 -->
<template>
  <div class="c-pc-playback-list">
    <!-- 顶部栏：总数和搜索框 -->
    <div class="c-pc-playback-list__header">
      <div class="c-pc-playback-list__header__total">
        {{ $lang('playback.total.count', { count: totalItems }) }}
      </div>
      <div class="c-pc-playback-list__header__search">
        <search-input
          v-model="searchKeyword"
          :placeholder="$lang('playback.search.placeholder')"
          :debounce-delay="500"
          @search="onSearch"
        />
      </div>
    </div>
    <div
      class="c-pc-playback-list__body"
      v-new-loading="{
        loading: isLoading,
        size: 36,
        background: 'none',
      }"
    >
      <plv-row
        class="c-pc-playback-list__main"
        :gutter="20"
      >
        <plv-col
          v-for="(item, index) in currentPagePlaybackList"
          :key="index"
          :span="{
            sm: 6,
            md: 6,
            lg: 6,
            xl: 4.8,
            xxl: 4.8,
          }"
          class="c-pc-playback-list__item"
          :class="{
            'c-pc-playback-list__item--current':
              item.playbackId === currentPlaybackTarget?.playbackId,
          }"
          @click.native="onClickPlaybackItem(item)"
        >
          <div class="c-pc-playback-list__item__cover-wrap">
            <div
              class="c-pc-playback-list__item__cover g-img-cover"
              :style="{
                backgroundImage: `url(${item.firstImage})`,
              }"
            ></div>

            <div
              v-if="item.playbackId === currentPlaybackTarget?.playbackId"
              class="c-pc-playback-list__item__playing pws-pc-playback-list-playing"
            >
              <pc-icon-media class="c-pc-playback-list__item__playing__icon" />
              <span>{{ $lang('playback.playing') }}</span>
            </div>

            <div class="c-pc-playback-list__item__bottom">
              <pc-icon-play-round class="c-pc-playback-list__item__bottom__icon" />
              <span class="c-pc-playback-list__item__bottom__duration">
                {{ formatDuration(item.duration) }}
              </span>
            </div>
          </div>

          <p class="c-pc-playback-list__item__title g-singleline">{{ item.title }}</p>
          <p
            v-if="item.startTime && listLiveStartTimeEnabled"
            class="c-pc-playback-list__item__start-time"
          >
            {{ $lang('playback.startTime') }}
            <span>{{ formatDate(item.startTime, DATE_FORMAT_COMPLETE) }}</span>
          </p>
        </plv-col>
      </plv-row>
      <div
        v-if="searchEmpty"
        class="c-pc-playback-list__empty"
      >
        {{ $lang('playback.search.empty') }}
      </div>
    </div>

    <div
      v-show="currentPagePlaybackList.length"
      class="c-pc-playback-list__footer"
    >
      <pwc-pagination
        :hide-on-single-page="true"
        :value="pageContent"
        :layout="['prev', 'pager', 'next']"
        @change="onPaginationChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatDate } from '@polyv/utils/date';
import { DATE_FORMAT_COMPLETE } from '@/assets/constants/date-format';
import { PcIconMedia, PcIconPlayRound } from '@/components/component-icons/pc/map';
import SearchInput from '@/components/common-base/search-input/search-input.vue';
import { usePlaybackStore } from '@/store/use-playback-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { formatDuration } from '@/assets/utils/date-time';
import { usePlaybackList } from '../use-playback-list';
import { PlvRow, PlvCol } from '@/plugins/polyv-ui/admin-import';
import { PwcPagination } from '@polyv/vue-components';

const playbackStore = usePlaybackStore();

const {
  listLiveStartTimeEnabled,

  pageNumber,
  pageSize,
  totalPages,
  totalItems,

  currentPagePlaybackList,
  currentPlaybackTarget,

  isLoading,
  searchEmpty,
} = storeDefinitionToRefs(usePlaybackStore);

// 搜索关键词
const searchKeyword = ref('');

const pageContent = computed(() => {
  return {
    pageNumber: pageNumber.value,
    pageSize: pageSize.value,
    totalPages: totalPages.value,
    totalItems: totalItems.value,
  };
});

// 搜索（防抖由 SearchInput 组件处理）
function onSearch(keyword: string) {
  playbackStore.setSearchKeyword(keyword);
  playbackStore.searchPlaybackList();
}

function onPaginationChange({ pageNumber }: { pageNumber: number }) {
  playbackStore.onPageChange(pageNumber);
}

const { onClickPlaybackItem } = usePlaybackList();
</script>

<style lang="scss">
.c-pc-playback-list {
  margin-top: -20px;
}

.c-pc-playback-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.c-pc-playback-list__header__total {
  font-size: 16px;
  color: $text-color;
}

.c-pc-playback-list__header__search {
  flex-shrink: 0;
  width: 320px;
  max-width: 320px;
}

.c-pc-playback-list__main {
  display: flex;
  flex-wrap: wrap;
}

.c-pc-playback-list__item {
  box-sizing: border-box;
  flex-shrink: 0;
  margin-bottom: 6px;
  cursor: pointer;
}

.c-pc-playback-list__item__cover-wrap {
  position: relative;
  width: 100%;
  margin-bottom: 16px;
  overflow: hidden;

  &::before {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
    content: '';
  }
}

.c-pc-playback-list__item__cover {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transition: 0.3s;
  transform: translate(-50%, -50%);
}

.c-pc-playback-list__item:hover {
  .c-pc-playback-list__item__cover {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.c-pc-playback-list__item__playing {
  position: absolute;
  top: 50%;
  left: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  height: 48px;
  padding: 0 8px;
  line-height: 48px;
  color: $--color-white;
  text-align: center;
  white-space: nowrap;
  background-color: $--color-primary;
  border-radius: 28px;
  opacity: 0.9;
  transform: translate(-50%, -50%);
}
.c-pc-playback-list__item__playing__icon {
  display: flex;
  margin-right: 4px;
  font-size: 24px !important;
}

.c-pc-playback-list__item__bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 40px;
  padding: 0 8px 8px;
  line-height: 20px;
  color: $--color-white;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
}
.c-pc-playback-list__item__bottom__icon {
  display: flex;
  height: 20px;
  font-size: 16px !important;
}
.c-pc-playback-list__item__bottom__duration {
  margin-left: 6px;
  font-size: 16px;
}

.c-pc-playback-list__item__title {
  margin-bottom: 8px;
  font-size: 18px;
  color: $text-color;
}

.c-pc-playback-list__item__start-time {
  width: 100%;
  margin-top: 8px;
  font-size: 14px;
  color: $text-color-secondary;
}

.c-pc-playback-list__body {
  position: relative;
}

.c-pc-playback-list__empty {
  width: 100%;
  padding: 40px 0;
  font-size: 16px;
  color: $text-color-secondary;
  text-align: center;
}

.c-pc-playback-list__footer {
  display: flex;
  justify-content: center;
}

// @media only screen and(max-width: 1280px) {
//   .c-pc-playback-list {
//     width: 1180px;
//   }

//   .c-pc-playback-list__item {
//     margin-right: 50px;
//   }
// }
</style>
