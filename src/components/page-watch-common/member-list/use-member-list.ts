import { ref } from 'vue';
import { ChatMessageUser, ChatEvents, ChatEventsRelations } from '@polyv/live-watch-sdk';
import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { useGlobalInject } from '@/app/use-global-inject';

/** 成员信息 */
export interface MemberInfo extends ChatMessageUser {}

export const useMemberListHook = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const viewerStore = useViewerStore();
  const { isPortraitWatchLayout, mobileMenuCurrentName, pcAsideTabCurrentName } =
    storeDefinitionToRefs(useLayoutStore);

  /** 在线用户列表数据 */
  const onlineUserList = ref<ChatMessageUser[]>([]);

  function startPollingOnlineUserList() {
    watchCore.chat.startOnlineUserListPolling();
  }

  function stopPollingOnlineUserList() {
    watchCore.chat.stopOnlineUserListPolling();
  }

  function onOnlineUserListChange(data: ChatEventsRelations[ChatEvents.OnlineUserListChange]) {
    const isSelf = data.userlist.find(item => item.userId === viewerStore.viewerId);
    // 把自己放到最前面
    if (isSelf) {
      const selfIndex = data.userlist.findIndex(item => item.userId === viewerStore.viewerId);
      data.userlist.unshift(data.userlist.splice(selfIndex, 1)[0]);
    } else {
      const mySelf = {
        actor: viewerStore.actor,
        nick: viewerStore.nickname,
        pic: viewerStore.avatar,
        userId: viewerStore.viewerId,
      } as ChatMessageUser;
      data.userlist.unshift(mySelf);
    }
    onlineUserList.value = data.userlist || [];
  }

  return {
    onlineUserList,
    mobileMenuCurrentName,
    pcAsideTabCurrentName,
    isPortraitWatchLayout,

    startPollingOnlineUserList,
    stopPollingOnlineUserList,
    onOnlineUserListChange,
  };
};
