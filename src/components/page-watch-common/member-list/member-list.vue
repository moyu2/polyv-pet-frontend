<!-- @file PC 端、移动端在线用户列表 -->
<template>
  <div
    class="c-member-list"
    :class="{
      'c-member-list--pc': !isMobile,
    }"
  >
    <member-list-item
      v-for="member in onlineUserList"
      :key="member.userId"
      :member="member"
    />

    <div
      v-if="onlineUserList.length >= 20"
      class="c-member-list__tips"
    >
      {{ $lang('member.list.noMore.tips') }}
    </div>

    <div class="c-member-list__loading__wrap">
      <i
        v-if="loadingVisible"
        class="c-member-list__loading"
      ></i>
      <p
        v-else-if="failTipsVisible"
        class="c-member-list__load-tips c-member-list__load-failed pws-member-list-fail"
      >
        {{ $lang('member.failTips') }}
        <span class="pws-member-list-fail-highlight">
          {{ $lang('member.failTips.retry') }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, unref, watch } from 'vue';
import { ChatEvents, ChannelMenuType } from '@polyv/live-watch-sdk';

import MemberListItem from './member-list-item.vue';
import { useMemberListHook } from './use-member-list';
import { isMobile } from '@/assets/utils/browser';
import { useGlobalInject } from '@/app/use-global-inject';

const { getWatchCore } = useGlobalInject();

const {
  mobileMenuCurrentName,
  pcAsideTabCurrentName,
  onlineUserList,

  onOnlineUserListChange,
  startPollingOnlineUserList,
  stopPollingOnlineUserList,
} = useMemberListHook();

const loadingVisible = ref(false);
const failTipsVisible = ref(false);

onMounted(() => {
  const watchCore = getWatchCore();
  watchCore.chat.eventEmitter.on(ChatEvents.OnlineUserListChange, onOnlineUserListChange);
});

onBeforeMount(() => {
  const watchCore = getWatchCore();
  watchCore.chat.eventEmitter.off(ChatEvents.OnlineUserListChange, onOnlineUserListChange);
});

function handlePollingOnlineUserList(currentName: typeof mobileMenuCurrentName) {
  if (unref(currentName) === ChannelMenuType.Members) {
    startPollingOnlineUserList();
  } else {
    stopPollingOnlineUserList();
  }
}

watch(mobileMenuCurrentName, () => handlePollingOnlineUserList(mobileMenuCurrentName), {
  immediate: true,
});
watch(pcAsideTabCurrentName, () => handlePollingOnlineUserList(pcAsideTabCurrentName), {
  immediate: true,
});
</script>

<style lang="scss">
.c-member-list {
  box-sizing: border-box;
  height: 100%;
  padding-bottom: 34px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  @include scrollbar;
}

.c-member-list__tips {
  margin-top: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

.c-member-list__load-tips {
  margin-top: 17px;
  font-size: 12px;
  color: #adadc0;
  text-align: center;
}

.c-member-list__loading__wrap {
  text-align: center;
  .c-member-list__loading {
    display: inline-block;
    width: 32px;
    height: 32px;
    background-image: url(./imgs/loading.png);
    background-position: center;
    background-size: cover;
    animation: spin 1s ease infinite;
  }
}

.c-member-list--pc {
  padding-top: 50px;
}

.c-member-list__load-failed {
  span {
    color: #3082fe;
    cursor: pointer;
  }
}
</style>
