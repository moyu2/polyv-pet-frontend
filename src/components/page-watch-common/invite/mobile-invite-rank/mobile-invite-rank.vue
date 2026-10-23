<!-- @file 移动端-横屏-邀请榜列表 -->
<template>
  <div class="c-mobile-invite-rank">
    <section
      class="c-mobile-invite-rank__list"
      @scroll="handleScroll"
    >
      <div class="c-mobile-invite-rank__list__inner">
        <mobile-invite-activity-banner v-if="inviteActivityEnabled" />
        <mobile-invite-popup-title
          v-else
          :title="$lang('invite.rank.title')"
        />

        <div class="c-mobile-invite-rank__list__content">
          <!-- 前三名 -->
          <div class="c-mobile-invite-rank__top-three">
            <mobile-invite-rank-top-three
              :data="topThreeRankItems[1]"
              :is-current="isCurrentViewer(topThreeRankItems[1])"
              order="second"
            />
            <mobile-invite-rank-top-three
              :data="topThreeRankItems[0]"
              :is-current="isCurrentViewer(topThreeRankItems[0])"
              order="first"
            />
            <mobile-invite-rank-top-three
              :data="topThreeRankItems[2]"
              :is-current="isCurrentViewer(topThreeRankItems[2])"
              order="third"
            />
          </div>

          <div class="c-mobile-invite-rank__list__title">
            <span>{{ $lang('invite.rank') }}</span>
            <span>{{ $lang('invite.rank.people.number') }}</span>
          </div>

          <!-- 除开前三名的列表 -->
          <invite-rank-item
            v-for="(item, index) in rankList"
            :rank="index + 4"
            :is-current="isCurrentViewer(item)"
            :item="item"
            :key="item.openId"
          />
          <div
            v-if="isLoading"
            class="c-mobile-invite-rank__list--loading"
          >
            <list-loading />
          </div>
          <div
            v-else-if="isNoMore"
            class="c-mobile-invite-rank__list__nomore"
          >
            {{
              inviteListSettingInfo.inviteListDisplayType === 'partial'
                ? onlyTopLimitTips
                : $lang('invite.rank.no.more')
            }}
          </div>
          <div
            v-else-if="isLoadFailed"
            class="c-mobile-invite-rank__list__failed"
          >
            {{ $lang('invite.rank.loaded.failed') }}
          </div>
        </div>
      </div>
    </section>

    <!-- 我的排名信息 -->
    <section
      class="c-mobile-invite-rank__me"
      v-if="inviteActivityWillEndTipVisible || currentRankInfo || invitePosterEnabled"
    >
      <mobile-invite-activity-will-end-tip
        v-if="inviteActivityWillEndTipVisible"
        class="c-mobile-invite-rank__invite-activity-will-end-tip"
      />
      <invite-rank-item
        v-if="currentRankInfo"
        :rank="currentRankInfo.rank"
        :item="currentRankInfo"
        :is-current="true"
      >
        <div class="c-mobile-invite-rank__me__info">
          <p class="c-mobile-invite-rank__me__info__nick">
            <span class="g-singleline">{{ currentRankInfo.nickname }}</span>
            <span class="c-mobile-invite-rank__me-label">
              <span>{{ $lang('invite.rank.me') }}</span>
            </span>
          </p>
          <p
            class="c-mobile-invite-rank__me__info__margin"
            @click="openInviteDetail"
          >
            <span>{{ currentDes }}</span>
            <span
              v-if="inviteDetailEnabled"
              class="c-mobile-invite-rank__me__info__detail-btn"
            >
              {{ $lang('invite.rank.detail.btn') }}
              <mobile-icon-arrow-right class="c-mobile-invite-rank__me__info__icon-right" />
            </span>
          </p>
        </div>
        <invite-entry-capsule v-if="invitePosterEnabled" />
      </invite-rank-item>
      <div
        v-else-if="invitePosterEnabled"
        class="c-mobile-invite-rank__not__info"
      >
        <span class="c-mobile-invite-rank__not__info__text">
          {{ $lang('invite.rank.click.btn.desc') }}
        </span>
        <invite-entry-capsule />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import ListLoading from '@/components/common-base/list-loading/list-loading.vue';
import { MobileIconArrowRight } from '@/components/component-icons/mobile/map';
import InviteEntryCapsule from '../mobile-invite-poster-entry/mobile-invite-poster-entry-capsule.vue';
import InviteRankItem from './mobile-invite-rank-item.vue';
import MobileInviteActivityBanner from '../mobile-invite-activity/mobile-invite-activity-banner/mobile-invite-activity-banner.vue';
import MobileInviteActivityWillEndTip from '../mobile-invite-activity/mobile-invite-activity-will-end-tip/mobile-invite-activity-will-end-tip.vue';
import MobileInvitePopupTitle from './mobile-invite-popup-title.vue';
import MobileInviteRankTopThree from './mobile-invite-rank-top-three.vue';

import { useInviteRankHook } from '../hooks/use-invite-rank';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInviteStore } from '@/store/use-invite-store';
import { appEvents, useEventBusEmitter } from '@/app/app-events';
import { PropUtils } from '@polyv/vue-components';

const props = defineProps({
  isActive: PropUtils.bool.def(false),
});

const {
  currentRankInfo,
  rankList,
  isLoading,
  isNoMore,
  isLoadFailed,
  inviteListSettingInfo,
  onlyTopLimitTips,
  topThreeRankItems,

  currentDes,
  invitePosterEnabled,

  isCurrentViewer,
  initInviteRank,
  handleScroll,
} = useInviteRankHook();

const { inviteDetailEnabled, inviteActivityEnabled, inviteActivityWillEndTipVisible } =
  storeDefinitionToRefs(useInviteStore);

const { emitEvent: emitOpenInviteDetail } = useEventBusEmitter(appEvents.invite.OpenInviteDetail);

function openInviteDetail() {
  if (inviteDetailEnabled.value) {
    emitOpenInviteDetail();
  }
}

watch(
  () => props.isActive,
  isActive => {
    if (isActive) {
      initInviteRank();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.c-mobile-invite-rank {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffeae4;
}

.c-mobile-invite-rank__list {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}

.c-mobile-invite-rank__list__inner {
  box-sizing: border-box;
  min-height: 100%;
  padding-top: 16px;
  background-image: url(./imgs/rank-bg.png);
  background-repeat: no-repeat;
  background-size: 100%;
}

.c-mobile-invite-rank__list__content {
  position: relative;
  padding-top: 20px;
  margin: 16px;
  background: linear-gradient(180deg, rgba(255, 238, 236, 0.98) 0%, rgba(255, 254, 255, 0.8) 10%);
  border: 1px solid #fefdfd;
  border-radius: 16px;

  &::before {
    position: absolute;
    top: 20px;
    left: 50%;
    width: 289px;
    height: 102px;
    pointer-events: none;
    content: '';
    user-select: none;
    background-image: url(./imgs/bg-star.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    transform: translateX(-50%);
  }
}

.c-mobile-invite-rank__top-three {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 30px;
  margin-bottom: 8px;
}

.c-mobile-invite-rank__list__title {
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 40px;
  color: rgba(#000, 0.4);
}

.c-mobile-invite-rank__list__nomore,
.c-mobile-invite-rank__list__failed {
  height: 44px;
  font-size: 14px;
  line-height: 44px;
  color: #595a66;
  text-align: center;
}

.c-mobile-invite-rank__list--loading {
  text-align: center;
}

.c-mobile-invite-rank__invite-activity-will-end-tip {
  position: absolute;
  right: 8px;
  bottom: 56px;
  @include iphone-x-b(80px);
}

.c-mobile-invite-rank__me-label {
  display: inline-block;
  height: 16px;
  padding: 0 3px;
  margin-left: 4px;
  font-size: 12px;
  line-height: 16px;
  color: #ff5252;
  vertical-align: middle;
  background: rgba(#ff5252, 0.1);
  border-radius: 2px;

  span {
    zoom: 0.83;
  }
}

.c-mobile-invite-rank__me {
  z-index: 10;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 100%;
  padding-top: 6px;
  padding-right: 16px;
  padding-left: 12px;
  word-wrap: break-word;
  background: #fff;
  border-radius: 16px 16px 0 0;
  @include iphone-x-pb(16px);
}
.c-mobile-invite-rank__me__info {
  flex: 1;
  margin-right: 8px;
  overflow: hidden;
}
.c-mobile-invite-rank__me__info__nick {
  display: flex;
  align-items: center;
  overflow: hidden;
  font-size: 14px;
  color: rgba(#000, 0.8);
  word-break: break-word;
}

.c-mobile-invite-rank__me__info__margin {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(#000, 0.6);
  word-break: break-word;
}

.c-mobile-invite-rank__me__info__detail-btn {
  position: relative;
  color: #ff5252;
}

.c-mobile-invite-rank__me__info__icon-right {
  position: absolute;
  font-size: 12px;
}

.c-mobile-invite-rank__not__info {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 8px 0 16px;
  color: #adadc0;
}
.c-mobile-invite-rank__not__info__text {
  flex: 1;
  margin-right: 8px;
  font-size: 14px;
  line-height: 20px;
  word-break: break-word;
}
</style>
