<!-- @file 在线列表单个观众组件 -->
<template>
  <div
    class="c-member-list-item pws-member-list-item"
    :class="{
      'pws-member-list-item-special': isSpecialUser,
      'c-member-list-item--mobile': isMobile,
    }"
  >
    <span class="c-member-list-item__avatar__wrap">
      <span
        class="c-member-list-item__avatar"
        :style="{ backgroundImage: `url(${member.pic || plvDefaultResource.defaultViewerAvatar})` }"
      ></span>
    </span>
    <span class="c-member-list-item__nick"> {{ getDisplayMemberName(member) }} </span>
    <user-actor
      v-if="member.actor"
      class="c-member-list-item__actor"
      :actor="member.actor"
      :user-type="member.userType"
    />
  </div>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { PropUtils } from '@polyv/vue-components';
import UserActor from '@/components/page-watch-common/chat/chat-msg-list/msg-items/_msg-user-actor/msg-user-actor.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useCommonStore } from '@/store/use-common-store';
import { useLangStore } from '@/store/use-lang-store';
import { onMounted, ref } from 'vue';
import { useViewerStore } from '@/store/use-viewer-store';
import { MemberInfo } from './use-member-list';
import { isMobile } from '@/assets/utils/browser';

const { getWatchCore } = useGlobalInject();

const { translateNick } = useLangStore();
const { plvDefaultResource } = storeDefinitionToRefs(useCommonStore);
const viewerStore = useViewerStore();

const props = defineProps({
  member: PropUtils.object<MemberInfo>().def(),
});

/** 获取展示的成员名称 */
function getDisplayMemberName(member: MemberInfo) {
  if (member.userId === viewerStore.viewerId) {
    return translateNick(member.nick + `(${translate('member.self')})`);
  }
  return translateNick(member.nick);
}

const isSpecialUser = ref(false);

onMounted(() => {
  const watchCore = getWatchCore();
  isSpecialUser.value = watchCore.user.isSpecialUserType(props.member.userType, props.member.actor);
});
</script>

<style lang="scss">
$avatarWidth: 28px;

.c-member-list-item {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 52px;
  margin: 0 16px;
  line-height: $avatarWidth;
  color: #adadc0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.c-member-list-item__avatar__wrap {
  flex: none;
  width: $avatarWidth;
  height: $avatarWidth;
  margin-right: 12px;
}
.c-member-list-item__avatar {
  display: inline-block;
  width: $avatarWidth;
  height: $avatarWidth;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
}
.c-member-list-item__nick {
  overflow: hidden;
  font-size: 14px;
  color: #ffffff;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.c-member-list-item__actor {
  flex: none;
  margin-top: 1px;
  margin-left: 4px;
}

.c-member-list-item--mobile {
  .c-member-list-item__actor {
    margin-top: 4px;
  }
}
</style>
