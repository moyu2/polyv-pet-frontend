<template>
  <div
    ref="scrollRef"
    class="c-anchor-channel"
    @scroll="onScroll"
  >
    <div
      v-for="(item, index) in contents"
      :key="item.channelId"
      class="c-anchor-channel__item"
      :class="{
        'is-current': String(item.channelId) === String(channelId),
      }"
      @click="onAnchorChannelItemClick(item)"
    >
      <div class="c-anchor-channel__item__cover">
        <div class="c-anchor-channel__item__cover__content">
          <channel-splash-img
            :cover-img="item.splashImg || ''"
            :splash-img-background-id="item.splashImgBackgroundId || 0"
            :channel-name="item.name"
            :channel-id="item.channelId"
          />
        </div>
        <div class="c-anchor-channel__item__index pwc-font-din-pro-regular">{{ index + 1 }}</div>

        <pwc-live-status-tag
          :status="item.liveStatus"
          class="c-anchor-channel__item__status"
          effect="fill"
        />
      </div>

      <div class="c-anchor-channel__item__content">
        <div class="c-anchor-channel__item__title g-singleline">{{ item.name }}</div>

        <div
          v-if="item.startTime"
          class="c-anchor-channel__item__time pwc-font-din-pro-regular"
        >
          <pwc-icon-clock />
          <span>{{ $lang('base.start.live') }}：</span>
          <span style="font-size: 14px">{{
            formatDate(item.startTime, DATE_FORMAT_COMPLETE)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import { DATE_FORMAT_COMPLETE } from '@/assets/constants/date-format';
import ChannelSplashImg from '@/components/common-business/channel-splash-img/index.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { AnchorChannelItem } from '@polyv/live-watch-sdk';
import {
  PwcIconClock,
  PwcLiveStatusTag,
  emitFunc,
  useScrollPagination,
} from '@polyv/vue-components';
import { formatDate } from '@polyv/utils/date';
import { ref } from 'vue';

const emit = defineEmits({
  scroll: emitFunc<number>(),
  total: emitFunc<number>(),
});

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const { channelId } = storeDefinitionToRefs(useChannelStore);

const { contents, scrollRef } = useScrollPagination<AnchorChannelItem>(
  async params => {
    const data = await watchCore.channel.getAnchorChannelList(params);

    emit('total', data.totalItems);

    return data;
  },
  {
    pageSize: ref(20),
  },
);

function onAnchorChannelItemClick(item: AnchorChannelItem) {
  if (String(item.channelId) === String(channelId)) {
    return;
  }
  const link = watchCore.channel.generateWatchUrl(item.channelId);
  window.open(link, '_blank', 'noopener,noreferrer');
}

function onScroll() {
  if (!scrollRef.value) {
    return;
  }
  const scrollTop = scrollRef.value.scrollTop;
  emit('scroll', scrollTop);
}
</script>

<style lang="scss">
.c-anchor-channel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  padding: 0 16px 24px;
  overflow-y: auto;
}

.c-anchor-channel__item {
  display: flex;
  flex-shrink: 0;
  height: 58px;
}

.c-anchor-channel__item__cover {
  position: relative;
  width: 104px;
  height: 58px;
  margin-right: 8px;
  overflow: hidden;
  border-radius: 4px;
}

.c-anchor-channel__item__cover__content {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.c-anchor-channel__item__index {
  position: absolute;
  top: 0;
  left: 0;
  width: 14px;
  height: 14px;
  font-size: 10px;
  line-height: 14px;
  color: #fff;
  text-align: center;
  background-color: rgba(#000, 0.6);
  border-radius: 0 0 4px 0;
}

.c-anchor-channel__item__status {
  position: absolute !important;
  right: 0;
  bottom: 0;
  border-radius: 4px 0 0 0 !important;
}

.c-anchor-channel__item__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.c-anchor-channel__item__title {
  font-size: 14px;
  line-height: 20px;
}

.c-anchor-channel__item__time {
  display: flex;
  align-items: center;
  margin-top: 12px;
  font-size: 12px;
  line-height: 16px;
  color: rgba(#000, 0.4);

  .polyv-icon {
    display: flex;
    margin-right: 4px;
  }
}

.c-anchor-channel__item.is-current {
  .c-anchor-channel__item__cover__content {
    &::after {
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      content: '';
      border: 2px solid #3f76fc;
      border-radius: 4px;
    }
  }
  .c-anchor-channel__item__title {
    color: #3f76fc;
  }
}
</style>
