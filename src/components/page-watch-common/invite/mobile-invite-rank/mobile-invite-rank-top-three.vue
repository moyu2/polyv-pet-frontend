<!-- @file 竖屏-邀请榜前三名 -->
<template>
  <div
    v-if="data"
    :class="['c-mobile-invite-rank-top-three', `c-mobile-invite-rank-top-three--${order}`]"
  >
    <div class="c-mobile-invite-rank-top-three__avatar plv-font-din-pro-regular">
      <img
        :src="data.avatar || plvDefaultResource.defaultViewerAvatar"
        class="c-mobile-invite-rank-top-three__avatar__pic"
      />
    </div>
    <div class="c-mobile-invite-rank-top-three__detail">
      <p class="c-mobile-invite-rank-top-three__detail__nick">
        <span class="g-singleline">{{ data.nickname || '-' }}</span>
        <span
          v-if="isCurrent"
          class="c-mobile-invite-rank__me-label"
        >
          <span>{{ $lang('invite.rank.me') }}</span>
        </span>
      </p>
      <p
        v-if="data.inviteNum"
        class="c-mobile-invite-rank-top-three__detail__num"
      >
        <span>{{ data.inviteNum }}</span
        >{{ $lang('invite.rank.people') }}
      </p>
      <p
        v-else
        class="c-mobile-invite-rank-top-three__detail__num"
      >
        {{ $lang('invite.poster.not.on.the.list') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InviteRankItem } from '@polyv/live-watch-sdk';
import { PropUtils } from '@polyv/vue-components';
import { tupleString } from '@/assets/utils/array';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useCommonStore } from '@/store/use-common-store';

defineProps({
  data: PropUtils.object<InviteRankItem>().isRequired,
  order: PropUtils.oneOf(tupleString('first', 'second', 'third')).def('first'),
  isCurrent: PropUtils.bool,
});

const { plvDefaultResource } = storeDefinitionToRefs(useCommonStore);
</script>

<style lang="scss">
.c-mobile-invite-rank-top-three {
  text-align: center;
}

.c-mobile-invite-rank-top-three__avatar {
  position: relative;
  width: 60px;
  height: 60px;
  padding: 2px;
  margin: 0 auto;
  margin-bottom: 10px;
  border-radius: 50%;

  .c-mobile-invite-rank-top-three__avatar__pic {
    display: inline-block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  &::after {
    position: absolute;
    bottom: -8px;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 12px;
    color: rgba(#000, 0.6);
    border-radius: 50%;
    transform: translateX(-50%);
  }
}
.c-mobile-invite-rank-top-three__detail {
  margin-top: 4px;
}
.c-mobile-invite-rank-top-three__detail__nick {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  padding: 0 4px;
  margin-bottom: 3px;
  overflow: hidden;
  font-size: 14px;
  line-height: 20px;
  color: rgba(#000000, 0.8);
  text-align: center;
}
.c-mobile-invite-rank-top-three__detail__num {
  font-size: 14px;
  line-height: 17px;
  color: rgba(#000, 0.4);
}
.c-mobile-invite-rank-top-three--second {
  .c-mobile-invite-rank-top-three__avatar {
    background: #85a8e5;
    &::after {
      content: '2';
      background: #85a8e5;
    }
  }
}
.c-mobile-invite-rank-top-three--third {
  .c-mobile-invite-rank-top-three__avatar {
    background: #ebae75;
    &::after {
      content: '3';
      background: #ebae75;
    }
  }
}
.c-mobile-invite-rank-top-three--first {
  .c-mobile-invite-rank-top-three__avatar {
    width: 102px;
    height: 102px;
    margin-bottom: -8px;
    background-image: url(./imgs/rank-first.png);
    background-size: 100% 100%;

    .c-mobile-invite-rank-top-three__avatar__pic {
      position: absolute;
      top: 18px;
      left: 50%;
      width: 72px;
      height: 72px;
      transform: translateX(-50%);
    }

    &::after {
      bottom: 7px;
      content: '1';
      background: #f38162;
    }
  }
  .c-mobile-invite-rank-top-three__detail__nick {
    width: 102px;
  }
}
</style>
