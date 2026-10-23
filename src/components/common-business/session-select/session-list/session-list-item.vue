<template>
  <div
    :class="['c-session-list-item', `c-session-list-item__${size}`]"
    @click="onSessionListItemClick"
  >
    <!-- 封面 -->
    <plv-channel-cover
      class="c-session-list-item__cover"
      :class="{
        'c-session-list-item__cover--not-panel-desc': panelDescVisible,
        'c-session-list-item__cover--mobile': isMobile,
      }"
      channel-id="0"
      :title="title"
      :splash-img="ossCompress(channelCover, 960)"
      :text-cover-bg-id="sessionData.splashImgBackgroundId"
    ></plv-channel-cover>

    <div class="c-session-list-item__float-left">
      <!-- 直播状态 -->
      <normal-status-tag
        :live-status="liveStatus"
        class="c-session-list-item__live-status"
      ></normal-status-tag>
    </div>

    <div
      v-show="panelDescVisible"
      class="c-session-list-item__desc"
    >
      <div class="c-session-list-item__desc__content">
        <!-- 直播标题 -->
        <div class="c-session-list-item__desc__top">
          <span
            v-if="channelNameDisplay !== ChannelNameDisplayType.Hide"
            class="c-session-list-item__desc__title"
            :class="{
              'c-session-list-item__desc__title--one-row':
                channelNameDisplay === ChannelNameDisplayType.OneRow,
              'c-session-list-item__desc__title--two-row':
                channelNameDisplay === ChannelNameDisplayType.TwoRow,
            }"
            >{{ title }}</span
          >
        </div>

        <div class="c-session-list-item__desc__bottom">
          <div>
            <!-- 开播时间 -->
            <div
              v-if="isShowTime"
              class="c-session-list-item__desc__bottom__time"
            >
              <span>
                {{ displayTime }}
                <span v-if="size !== 'small'">
                  {{ $lang('base.start.live') }}
                </span>
              </span>
            </div>
          </div>
          <session-list-booking-button
            :session-data="sessionData"
            @booking-change="onBookingChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { ossCompress } from '@polyv/utils/image';
import { PropUtils, emitFunc } from '@polyv/vue-components';
import { ChannelNameDisplayType, SessionListItemSizeList } from './type';
import type { SessionBookingChangeData } from './type';
import { LiveStatus } from '@polyv/live-watch-sdk';
import type { ChannelSessionDataItem } from '@polyv/live-watch-sdk';
import { formatDate } from '@polyv/utils/date';

import NormalStatusTag from '@/components/common-business/status-tag/normal-status-tag.vue';
import { PlvChannelCover } from '@/plugins/polyv-ui/admin-import';
import { isMobile } from '@/assets/utils/browser';
import SessionListBookingButton from './session-list-booking-button.vue';

const props = defineProps({
  /** 场次数据 */
  sessionData: PropUtils.object<ChannelSessionDataItem>().isRequired,
  /** 尺寸 */
  size: PropUtils.oneOf(SessionListItemSizeList).def('normal'),
  /** 直播名称处理方式 */
  channelNameDisplay: PropUtils.enum<ChannelNameDisplayType>().def(ChannelNameDisplayType.TwoRow),
});

const emits = defineEmits({
  'item-click': emitFunc<ChannelSessionDataItem>(),
  'booking-change': emitFunc<SessionBookingChangeData>(),
});

function onSessionListItemClick(event: MouseEvent) {
  const target = event.target;
  if (target instanceof Element && target.closest('.c-session-list-booking-button')) {
    return;
  }

  emits('item-click', props.sessionData);
}

function onBookingChange(data: SessionBookingChangeData) {
  emits('booking-change', data);
}

const displayTime = ref('');

const isShowTime = computed(() => {
  return displayTime.value;
});

const title = computed(() => {
  return props.sessionData.name;
});

const channelCover = computed(() => {
  if (props.size === 'detail_list') {
    return props.sessionData.splashLargeImg;
  }
  return props.sessionData.splashImg;
});

const liveStatus = computed(() => {
  return props.sessionData.status as unknown as LiveStatus;
});

watch(
  () => props.sessionData,
  () => {
    if (!props.sessionData.planStartTime) {
      displayTime.value = '';
      return;
    }

    displayTime.value = formatDate(props.sessionData.planStartTime, 'YYYY.MM.DD hh:mm');
  },
  {
    deep: true,
    immediate: true,
  },
);

const panelDescVisible = computed(() => {
  return props.channelNameDisplay !== ChannelNameDisplayType.Hide || isShowTime.value;
});
</script>

<style lang="scss">
$--text-primary-color: #333 !default;
$--text-third-color: #999 !default;

@mixin mediumStyle {
  .c-session-list-item__cover {
    height: 96px;
  }

  .c-session-list-item__desc {
    flex: 1;
  }

  .c-session-list-item__desc__content {
    justify-content: center;
    height: 100%;
    text-align: center;
  }

  .c-session-list-item__desc__top {
    text-align: center;

    .c-session-list-item__desc__title {
      margin-bottom: 6px;
    }
  }

  .c-session-list-item__desc__bottom {
    flex: 1;
    flex-direction: column;
    .c-session-list-item__desc__bottom__time {
      margin-bottom: 12px;
      line-height: normal;
      text-align: center;
    }
  }
}

@mixin smallStyle {
  .c-session-list-item__cover {
    height: 78px;
  }

  .c-session-list-item__desc {
    flex: 1;
  }

  .c-session-list-item__desc__content {
    justify-content: center;
    height: 100%;
    text-align: center;
  }

  .c-session-list-item__desc__top {
    text-align: center;

    .c-session-list-item__desc__title {
      margin-bottom: 6px;
    }
  }

  .c-session-list-item__desc__bottom {
    flex: 1;
    flex-direction: column;
    .c-session-list-item__desc__bottom__time {
      margin-bottom: 12px;
      line-height: normal;
      text-align: center;
    }
  }
}

@mixin detailListStyle {
  .c-session-list-item__float-left {
    top: 20px;
    left: 20px;
  }

  .c-session-list-item__cover {
    width: 92px;
    min-width: 92px;
    height: 120px;
    margin: 12px 0 12px 12px;
    border-radius: 4px;

    img {
      border-radius: 4px;
      object-fit: cover;
    }

    &.plv-channel-cover .plv-channel-cover__text-cover {
      border-radius: 4px;
    }

    .c-session-list-item__cover__default-cover {
      border-radius: 4px;
    }
  }

  .c-session-list-item__desc {
    box-sizing: border-box;
    display: flex;
    width: 100%;
    overflow: hidden;

    .c-session-list-item__desc__content {
      width: 100%;
      height: 100%;
    }

    .c-session-list-item__desc__top {
      flex: 1;
      margin-bottom: 0;

      .c-session-list-item__desc__title {
        margin-bottom: 6px;
      }
    }

    .c-session-list-item__desc__bottom {
      min-height: 24px;

      .c-session-list-item__desc__bottom__time {
        font-size: 12px;
      }
    }
  }
}

@mixin detailListHorizontalStyle {
  .c-session-list-item__float-left {
    top: 20px;
    left: 20px;
  }

  .c-session-list-item__cover {
    width: 138px;
    min-width: 138px;
    height: 78px;
    margin: 12px 0 12px 12px;
    border-radius: 8px;

    img {
      border-radius: 8px;
      object-fit: cover;
    }

    &.plv-channel-cover .plv-channel-cover__text-cover {
      border-radius: 8px;
    }

    .c-session-list-item__cover__default-cover {
      border-radius: 8px;
    }
  }

  .c-session-list-item__desc {
    box-sizing: border-box;
    display: flex;
    width: 100%;
    overflow: hidden;

    .c-session-list-item__desc__content {
      width: 100%;
      height: 100%;
    }

    .c-session-list-item__desc__top {
      flex: 1;
      margin-bottom: 0;

      .c-session-list-item__desc__title {
        margin-bottom: 6px;
      }
    }

    .c-session-list-item__desc__bottom {
      min-height: 24px;

      .c-session-list-item__desc__bottom__time {
        font-size: 12px;
      }
    }
  }
}

.c-session-list-item {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  background: #fff;
  border-radius: 8px;

  // 不同尺寸处理
  &__large {
    width: 320px;
    .c-session-list-item__cover {
      height: 184px;
    }
  }

  &__large_auto {
    width: 100%;
    .c-session-list-item__cover {
      height: 184px;
    }
  }

  &__medium {
    width: 230px;
    @include mediumStyle();
  }

  &__medium_auto {
    width: 100%;
    @include mediumStyle();
  }

  &__small {
    width: 140px;
    min-width: 140px;
    @include smallStyle();
  }

  &__detail_list {
    flex-direction: row;
    width: 100%;
    @include detailListStyle();
  }

  &__detail_list_horizontal {
    flex-direction: row;
    width: 100%;
    @include detailListHorizontalStyle();
  }
}
.c-session-list-item__cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 198px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;

  &--not-panel-desc {
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
  }
}

.c-session-list-item__cover--edit-mode {
  background: #f0f0f0;
}

.c-session-list-item__desc {
  padding: 12px;
  color: $--text-primary-color;
  background: #fff;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;

  .c-session-list-item__desc__content {
    display: flex;
    flex-direction: column;
  }

  .c-session-list-item__desc__top {
    .c-session-list-item__desc__title {
      margin-bottom: 10px;
    }
  }

  .c-session-list-item__desc__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.c-session-list-item__desc__title {
  display: inline-block;
  width: 100%;
  font-size: 14px;
  line-height: 14px;
}

.c-session-list-item__desc__title--one-row {
  height: 20px;
  overflow: hidden;
  line-height: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.c-session-list-item__desc__title--two-row {
  display: -webkit-box;
  min-height: 20px;
  max-height: 40px;
  overflow: hidden;
  line-height: normal;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: normal;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.c-session-list-item__float-left {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: flex;
}

.c-session-list-item__live-status {
  z-index: 2;
}

.c-session-list-item__cover__default-icon {
  font-size: 28px;
  color: #bbbbbb;
}

.c-session-list-item__desc__bottom__time {
  flex: 1; // 让时间区域占用所有可用空间，但当其没有内容时不占空间
  font-size: 12px;
  color: $--text-third-color;
  word-break: break-all;
  white-space: normal;
}

.c-session-list-item__desc__page-view {
  font-size: 12px;
  line-height: 14px;
  color: $--text-third-color;
}

.c-session-list-item__cover.c-session-list-item__cover--mobile {
  width: 128px;
  min-width: 128px;
}
</style>
