<template>
  <div
    class="c-session-list"
    ref="contentRef"
  >
    <template v-if="dataList.length">
      <div
        v-for="(chapter, idx) in sessionChapters"
        :key="chapter.chapterId ?? 'uncategorized'"
        class="c-session-list__chapter"
        :class="{
          'c-session-list__chapter--uncategorized': !chapter.chapterId,
          'c-session-list__chapter--first': idx === 0,
        }"
      >
        <div
          v-if="chapter.chapterId"
          class="c-session-list__chapter__header"
        >
          <span class="c-session-list__chapter__name">{{ chapter.chapterName }}</span>
          <span
            v-if="chapter.sessionCount"
            class="c-session-list__chapter__count"
          >
            {{ chapter.sessionCount }}{{ $lang('channel.session.sessionCountSuffix') }}
          </span>
        </div>

        <component-layout-container
          :lazy-load-enabled="false"
          :in-desk-top-view-adapter-mode="inDeskTopViewAdapterMode"
          :component-layout="componentLayout"
          :data-sources="chapter.sessions"
          id-key="sessionId"
          v-slot="{ item }"
        >
          <session-list-item
            :session-data="item"
            :size="sessionListItemSize"
            @item-click="toRedirectTargetSessionWatchPage"
            @booking-change="onSessionBookingChange"
          />
        </component-layout-container>
      </div>
    </template>
    <div
      v-else
      class="c-session-list__empty-container"
    >
      <div class="c-session-list__empty-wrapper">
        <mobile-icon-video-recorder class="c-session-list__empty-wrapper__icon" />
        <div>{{ $lang('channel.session.notFound') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, ref } from 'vue';

import { PropUtils, emitFunc } from '@polyv/vue-components';
import type { ChannelSessionDataItem } from '@polyv/live-watch-sdk';

import { ComponentLayoutType } from '@/components/common-base/component-layout-container/type';
import ComponentLayoutContainer from '@/components/common-base/component-layout-container/component-layout-container.vue';
import { MobileIconVideoRecorder } from '@/components/component-icons/mobile/map';
import SessionListItem from './session-list-item.vue';
import type { SessionBookingChangeData, SessionChapter, SessionListItemSize } from './type';
import {
  isBuildForFeedMainMode,
  isInjectByExternalApp,
  isStaticBuildMode,
} from '@/assets/utils/utils';
import { extractChannelAndSessionId, useQueryParams } from '@/hooks/core/use-query-params';
import { concat as appendToURL } from '@polyv/utils/querystring';
import { useToastManager } from '@/hooks/components/use-toast';
import { useLazyLoad } from '@/hooks/behaviors/use-lazy-load';

const { paramGetter, getQueryParams } = useQueryParams();

const { toast } = useToastManager();

const props = defineProps({
  lazyLoadEnabled: PropUtils.bool.def(true),
  /** 是否处于桌面端适配模式 */
  inDeskTopViewAdapterMode: PropUtils.bool.def(false),
  /** 组件布局 */
  componentLayout: PropUtils.enum<ComponentLayoutType>().def(ComponentLayoutType.LargeImage),
  /** 频道列表数据 */
  dataList: PropUtils.array<ChannelSessionDataItem>().def(() => []),
  /** 获取滚动区域 */
  getScrollRef: PropUtils.func<() => Ref<HTMLElement | undefined>>().def(),
});

const emits = defineEmits({
  'load-more-list': emitFunc<void>,
  'session-booking-change': emitFunc<SessionBookingChangeData>(),
});

const sessionListItemSize = computed<SessionListItemSize>(() => {
  switch (props.componentLayout) {
    case ComponentLayoutType.LargeImage:
      return 'normal';
    case ComponentLayoutType.RowWrap:
      return props.inDeskTopViewAdapterMode ? 'large' : 'medium';
    case ComponentLayoutType.HorizontalScroll:
      return 'small';
    case ComponentLayoutType.DetailList:
      return 'detail_list';
    case ComponentLayoutType.DetailListHorizontal:
      return 'detail_list_horizontal';
    default:
      return props.inDeskTopViewAdapterMode ? 'large_auto' : 'medium_auto';
  }
});

const sessionChapters = computed<SessionChapter[]>(() => {
  const chapterMap = new Map<string, SessionChapter>();
  const uncategorizedSessions: ChannelSessionDataItem[] = [];

  for (const item of props.dataList) {
    if (item.chapterId) {
      let chapter = chapterMap.get(item.chapterId);
      if (!chapter) {
        chapter = {
          chapterId: item.chapterId,
          chapterName: item.chapterName ?? '',
          sessionCount: item.sessionCount ?? 0,
          sessions: [],
        };
        chapterMap.set(item.chapterId, chapter);
      }
      chapter.sessions.push(item);
    } else {
      uncategorizedSessions.push(item);
    }
  }

  const chapters = Array.from(chapterMap.values());
  if (uncategorizedSessions.length > 0) {
    chapters.push({
      chapterId: null,
      chapterName: '',
      sessionCount: 0,
      sessions: uncategorizedSessions,
    });
  }

  return chapters;
});

const contentRef = ref<HTMLElement>();

if (props.lazyLoadEnabled) {
  const scrollElRef = props.getScrollRef ? props.getScrollRef() : ref(document.documentElement);
  useLazyLoad(contentRef, scrollElRef, {
    direction: 'vertical',
    buffer: () => {
      const el = scrollElRef.value;
      return el ? el.scrollHeight * 0.6 : 600;
    },
    loadMore: () => emits('load-more-list'),
  });
}

function toRedirectTargetSessionWatchPage(item: ChannelSessionDataItem) {
  const { origin, pathname, search } = window.location;

  // 暂时不处理信息流模式
  if (isBuildForFeedMainMode()) {
    toast.error('not support');
    return;
  }

  /** 非 SaaS 正常观看页使用场景 */
  const isNotSaasPage = isInjectByExternalApp() || isStaticBuildMode() || paramGetter().channelId();

  const searchParams = getQueryParams();

  if (isNotSaasPage) {
    const redirectUrl = appendToURL(`${location.origin}${location.pathname}`, {
      ...searchParams,
      targetSessionId: item.sessionId,
    });
    window.location.href = redirectUrl;
    return;
  }

  // SaaS 正常观看页使用场景
  const { channelId, targetSessionId } = extractChannelAndSessionId();
  if (!channelId) {
    toast.error('异常链接');
    return;
  }

  if (!targetSessionId) {
    // pathname = /watch/channelId
    window.location.href = `${origin}${pathname}/${item.sessionId}${search}`;
    return;
  }

  // pathname = /watch/channelId/sessionId
  const pathnameList = pathname.split('/');
  pathnameList.splice(-1);
  const newPathname = pathnameList.join('/');
  window.location.href = `${origin}${newPathname}/${item.sessionId}${search}`;
}

function onSessionBookingChange(data: SessionBookingChangeData) {
  emits('session-booking-change', data);
}
</script>

<style lang="scss">
.c-session-list {
  padding: 0 12px 12px;
}

.c-session-list__chapter {
  position: relative;
  padding-top: 12px;
  margin-top: 8px;
}

.c-session-list__chapter::before {
  position: absolute;
  top: 2px;
  right: 0;
  left: 0;
  height: 1px;
  content: '';
  background-color: #dcdfe6;
}

.c-session-list__chapter--uncategorized {
  padding-top: 16px;
  margin-top: 16px;
}

.c-session-list__chapter--first {
  padding-top: 0;
  margin-top: 0;
}

.c-session-list__chapter--first::before {
  display: none;
}

.c-session-list__chapter__header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 0 12px;
}

.c-session-list__chapter__name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.c-session-list__chapter__count {
  font-size: 12px;
  color: #999;
}

.c-session-list__empty-container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 12px;
  font-size: 14px;
  color: #999999;
  background: #ffffff;
  border-radius: 12px;

  .c-session-list__empty-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 300px;
    border-radius: 12px;
  }

  .c-session-list__empty-wrapper__icon {
    color: #e1e5e8;
    svg {
      width: 90px;
      height: 64px;
    }
  }
}
</style>
