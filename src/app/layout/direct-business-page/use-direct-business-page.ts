import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { computed } from 'vue';
import { DirectBusinessPageType } from './type';

export const useDirectBusinessPage = () => {
  const { directBusinessPageType } = storeDefinitionToRefs(useWatchAppStore);

  /** 用户系统登录认证 */
  const isWatchIdentifyPage = computed(() => {
    return directBusinessPageType.value === DirectBusinessPageType.WatchIdentity;
  });

  /** 一客一码验证页 */
  const isVerifySaleInvitePage = computed(() => {
    return directBusinessPageType.value === DirectBusinessPageType.VerifySaleInvite;
  });

  /** 观看限制-邀请观看-审核中页面 */
  const isInviteWatchAuditingPage = computed(() => {
    return directBusinessPageType.value === DirectBusinessPageType.InviteWatchAuditing;
  });

  /** 添加企微好友页面 */
  const isWorkWechatFriendPage = computed(() => {
    return directBusinessPageType.value === DirectBusinessPageType.WorkWechatFriend;
  });

  /** 场次选择页面 */
  const isSessionSelectPage = computed(() => {
    return directBusinessPageType.value === DirectBusinessPageType.SessionSelectPage;
  });

  return {
    isSessionSelectPage,
    isWorkWechatFriendPage,
    isVerifySaleInvitePage,
    isWatchIdentifyPage,
    isInviteWatchAuditingPage,
  };
};
