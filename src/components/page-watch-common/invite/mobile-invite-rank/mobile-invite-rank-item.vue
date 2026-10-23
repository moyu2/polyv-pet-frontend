<!-- @file 移动端-邀请榜列表项 -->
<template>
  <div
    v-if="item"
    class="c-mobile-invite-rank__list__item"
  >
    <!-- 排名序号 -->
    <div class="c-mobile-invite-rank__list__item__rank plv-font-din-pro-regular">
      <span>{{ item.inviteNum === 0 ? '-' : rank }}</span>
    </div>

    <!-- 头像 -->
    <img
      :src="item.avatar || plvDefaultResource.defaultViewerAvatar"
      :alt="item.nickname"
      class="c-mobile-invite-rank__list__item__avatar"
    />

    <!-- 内容 -->
    <slot>
      <p
        :class="{
          'c-mobile-invite-rank__list__item__nick': true,
          'c-mobile-invite-rank__list__item__nick--me': isCurrent,
        }"
      >
        <span class="g-singleline">{{ item.nickname }}</span>
        <span
          v-if="isCurrent"
          class="c-mobile-invite-rank__me-label"
        >
          <span>{{ $lang('invite.rank.me') }}</span>
        </span>
      </p>
      <div class="c-mobile-invite-rank__list__item__number plv-font-din-pro-regular">
        {{ item.inviteNum }}{{ $lang('invite.rank.people') }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { InviteRankItem } from '@polyv/live-watch-sdk';
import { PropUtils } from '@polyv/vue-components';
import { useCommonStore } from '@/store/use-common-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

defineProps({
  /** 邀请榜节点 */
  item: PropUtils.object<InviteRankItem>().isRequired,
  /** 该节点的排名数 */
  rank: PropUtils.number.isRequired,
  /** 是否为我自己 */
  isCurrent: PropUtils.bool.def(false),
});

const { plvDefaultResource } = storeDefinitionToRefs(useCommonStore);
</script>

<style lang="scss">
.c-mobile-invite-rank__list__item {
  display: flex;
  align-items: center;
  height: 52px;

  &.c-mobile-invite-rank__list__item--me {
    .c-mobile-invite-rank__list__item__nick--me {
      color: #78a7ed;
    }
  }
}

.c-mobile-invite-rank__list__item__rank {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 38px;
  font-size: 14px;
  line-height: 38px;
  color: rgba(#000, 0.4);
  text-align: center;
  background-size: 100%;
}

.c-mobile-invite-rank__list__item__avatar {
  width: 34px;
  height: 34px;
  margin-right: 12px;
  border-radius: 50%;
}

.c-mobile-invite-rank__list__item__nick {
  display: flex;
  flex: 1;
  align-items: center;
  margin-right: 32px;
  overflow: hidden;
  font-size: 14px;
  color: rgba(#000, 0.8);
}

.c-mobile-invite-rank__list__item__number {
  padding-right: 16px;
  font-size: 16px;
  color: rgba(#000, 0.4);
}
</style>
