<template>
  <div
    v-if="anchorDetail"
    class="c-anchor-info"
    @click.stop
  >
    <div
      v-if="anchorDetail.avatar"
      class="c-anchor-info__avatar"
      :class="{
        'c-anchor-info__avatar__living': liveStatus === LiveStatus.Live,
      }"
    >
      <img
        :src="anchorDetail.avatar"
        alt="avatar"
      />
    </div>

    <div class="c-anchor-info__content">
      <div class="c-anchor-info__nick">{{ anchorDetail.nickname }}</div>
      <div class="c-anchor-info__actor">
        <mobile-origin-icon-male
          v-if="anchorDetail.sex === 'M'"
          class="c-anchor-info__sex"
        />
        <mobile-origin-icon-female
          v-if="anchorDetail.sex === 'W'"
          class="c-anchor-info__sex"
        />
        {{ anchorDetail.actor || '' }}
      </div>

      <div
        v-if="anchorDetail.description"
        class="c-anchor-info__desc g-singleline"
      >
        {{ anchorDetail.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import {
  MobileOriginIconFemale,
  MobileOriginIconMale,
} from '@/components/component-icons/mobile-origin/map';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { onMounted } from 'vue';

const { getWatchCore } = useGlobalInject();

const channelStore = useChannelStore();
const { liveStatus, anchorDetail } = storeDefinitionToRefs(useChannelStore);

const watchCore = getWatchCore();

onMounted(async () => {
  const info = await watchCore.channel.getAnchorInfo();
  channelStore.$patch({
    anchorDetail: info,
  });
});
</script>

<style lang="scss">
.c-anchor-info {
  display: flex;
}

.c-anchor-info__avatar {
  position: relative;
  flex-shrink: 0;
  width: 70px;
  height: 70px;
  margin-right: 16px;

  img {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    vertical-align: middle;
    border-radius: 50%;
    object-fit: cover;
  }
}

.c-anchor-info__avatar__living {
  &::before,
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
    z-index: 1;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    content: '';
    border: 2px solid #ff0000;
    border-radius: 50%;
    opacity: 0;
    animation: avatar-diffuse 2s infinite ease-out;
  }

  &::before {
    animation-delay: 0s;
  }

  &::after {
    animation-delay: 0.5s;
  }
}

@keyframes avatar-diffuse {
  0% {
    opacity: 1;
    transform: scale(0.95);
  }
  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}

.c-anchor-info__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  overflow: hidden;
}

.c-anchor-info__nick {
  font-size: 18px;
  font-weight: bold;
  line-height: 25px;
  color: #fff;
}

.c-anchor-info__actor {
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
}

.c-anchor-info__sex {
  width: 12px;
  height: 12px;
  margin-right: 4px;
  font-size: 12px;
}

.c-anchor-info__desc {
  font-size: 12px;
  line-height: 18px;
  color: #fff;
}
</style>
