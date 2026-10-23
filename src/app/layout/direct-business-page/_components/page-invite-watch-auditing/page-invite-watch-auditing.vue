<template>
  <div class="c-page-invite-watch-auditing">
    <div class="c-page-invite-watch-auditing__img"></div>
    <div class="c-page-invite-watch-auditing__title">
      {{ $lang('inviteWatch.auditing.title') }}
    </div>
    <div class="c-page-invite-watch-auditing__desc">
      {{ $lang('inviteWatch.auditing.desc') }}
    </div>
    <div
      v-if="inviteWatchAuthInfo && inviteWatchAuthInfo.saleInfo"
      class="c-page-invite-watch-auditing__sale-info"
    >
      <span> {{ $lang('inviteWatch.auditing.contacts') }} </span>
      <img
        :src="inviteWatchAuthInfo.saleInfo.avatar"
        class="c-page-invite-watch-auditing__sale-info__avatar"
      />
      <span class="c-page-invite-watch-auditing__sale-info__nickname">
        {{ inviteWatchAuthInfo.saleInfo.nickname }}
      </span>
      <span>{{ $lang('inviteWatch.auditing.urgent') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { InviteWatchAuthInfo } from '@polyv/live-watch-sdk';
import { onBeforeMount, ref } from 'vue';

const { getWatchCore } = useGlobalInject();
const { paramGetter } = useQueryParams();

const watchCore = getWatchCore();

const inviteWatchAuthInfo = ref<InviteWatchAuthInfo>();

onBeforeMount(async () => {
  const paramSaleId = paramGetter().inviteWatchSaleId();

  // 获取邀请观看上级邀请员的 inviteWatchSaleId
  const inviteWatchInviteSalesId = watchCore.user.getInviteWatchInviteSalesId();

  // 存在上级邀请员，则使用上级邀请员id，否则使用传入的saleId
  const saleId = inviteWatchInviteSalesId || paramSaleId;

  if (!saleId) return;

  inviteWatchAuthInfo.value = await watchCore.auth.getInviteWatchAuthInfo({ saleId });
});
</script>

<style lang="scss">
.c-page-invite-watch-auditing {
  position: absolute;
  top: 30%;
  left: 50%;
  width: 80%;
  line-height: 20px;
  text-align: center;
  transform: translate(-50%, -50%);
}

.c-page-invite-watch-auditing__img {
  width: 58px;
  height: 64px;
  margin: 0 auto 22px;
  background-image: url(./images/invite-watch-auditing-icon.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.c-page-invite-watch-auditing__title {
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.8);
}

.c-page-invite-watch-auditing__desc {
  margin-bottom: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}

.c-page-invite-watch-auditing__sale-info {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}
.c-page-invite-watch-auditing__sale-info__avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}
.c-page-invite-watch-auditing__sale-info__nickname {
  color: rgba(0, 0, 0, 0.8);
}
</style>
