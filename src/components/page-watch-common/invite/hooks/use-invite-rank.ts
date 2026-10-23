/** @file 邀请榜 hook 钩子 */

import debounce from 'lodash-es/debounce';
import { computed, ref, unref } from 'vue';

import { useInviteStore } from '@/store/use-invite-store';

import { translate } from '@/assets/lang';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import {
  InviteRankCurrentViewer,
  InviteRankItem,
  InviteRankRequestFailReason,
  InviteListSetting,
} from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';

interface TopInviteRankItem extends InviteRankItem {
  /** 是否是造出来的数据 */
  isFake?: true;
}

export const useInviteRankHook = () => {
  const { getWatchCore } = useGlobalInject();

  const page = ref(0);
  const isLoading = ref(false);
  const isNoMore = ref(false);
  const inviteListSettingInfo = ref<InviteListSetting>({
    inviteListDisplayType: 'full',
    inviteListPartialDisplayNumber: 0,
  });
  /** 接口获取的邀请榜列表 */
  const resRankList = ref<InviteRankItem[]>([]);
  /** 当前可见的邀请榜列表，除去前三名 */
  const rankList = ref<InviteRankItem[]>([]);
  /** 邀请榜前三名(包含假数据) */
  const topThreeRankItems = ref<TopInviteRankItem[]>(
    new Array(3).fill(undefined).map<TopInviteRankItem>(() => ({
      avatar: '',
      nickname: '--',
      inviteNum: 0,
      openId: Math.random().toString(),
      me: false,
      isFake: true,
    })),
  );
  /** 邀请榜前三名(真实数据) */
  const realTopThreeRankItems = computed<InviteRankItem[]>(() => {
    return topThreeRankItems.value.filter(item => !item.isFake);
  });

  /** 是否存在邀请榜数据 */
  const isExistInviteRankData = computed(() => {
    return realTopThreeRankItems.value.length > 0;
  });

  /** 榜单仅显示x人提示 */
  const onlyTopLimitTips = computed(() => {
    return translate('invite.rank.onlyShowBottom', {
      number: inviteListSettingInfo.value.inviteListPartialDisplayNumber.toString(),
    });
  });

  /** 接口获取的当前用户邀请数据 */
  const currentRankInfo = ref<InviteRankCurrentViewer | null>(null);
  /** 是否加载接口失败 */
  const isLoadFailed = ref(false);

  const { invitePosterEnabled } = storeDefinitionToRefs(useInviteStore);

  /** 当前用户的排名文案 */
  const currentDes = computed<string>(() => {
    const rankInfo = unref(currentRankInfo);
    if (!rankInfo) {
      return '';
    }

    // 我是第一名
    if (rankInfo.rank === 1) {
      return translate('invite.rank.first.desc', {
        number: String(rankInfo.inviteNum),
      });
    }

    return translate('invite.rank.invited', {
      number: String(rankInfo.inviteNum),
    });
  });

  /** 判断是否为当前用户 */
  function isCurrentViewer(item: InviteRankItem) {
    return item.me;
  }

  /** 初始化邀请榜数据 */
  async function initInviteRank() {
    page.value = 0;
    isLoading.value = false;
    isNoMore.value = false;

    await getRankList(true);

    const watchCore = getWatchCore();
    inviteListSettingInfo.value = watchCore.invite.getInviteRankSettingInfo();

    await getCurrentRankInfo();
  }

  const debounceTime = 300;
  /** 邀请榜滚动钩子 */
  const handleScroll = debounce(function (e) {
    if (isNoMore.value) {
      return;
    }
    // 获取下一页数据
    const target = e.target;
    const scrollHeight = parseInt(target.scrollHeight);
    const scrollTop = parseInt(target.scrollTop);
    const clientHeight = parseInt(target.clientHeight);
    if (scrollTop >= scrollHeight - clientHeight - 150) {
      if (resRankList.value.length > 0) {
        rankList.value.push(...resRankList.value.splice(0, 20));
      } else {
        getRankList();
      }
    }
  }, debounceTime);

  /** 获取邀请榜列表数据 */
  async function getRankList(isFirst = false) {
    if (isLoading.value || isNoMore.value) return;

    try {
      isLoadFailed.value = false;
      isLoading.value = true;

      const watchCore = getWatchCore();
      const data = await watchCore.invite.getRankList({
        pageNumber: page.value + 1,
      });

      isLoading.value = false;

      if (!data.success) {
        if (data.failReason === InviteRankRequestFailReason.FeatureClose) {
          isNoMore.value = true;
          return;
        }
        throw new Error('getRankList request failed');
      }

      page.value = data.pageNumber;
      resRankList.value = data.contents.map(item => {
        if (isCurrentViewer(item)) return item;

        return {
          ...item,
          nickname: watchCore.utils.processForceHiddenNickname(item.nickname),
        };
      });
      if (data.totalPages <= page.value) {
        isNoMore.value = true;
      }

      if (isFirst) {
        rankList.value = [];
      }
      if (resRankList.value.length > 0) {
        const pushedList = isNoMore.value ? resRankList.value : resRankList.value.splice(0, 20);
        rankList.value.push(...pushedList);
        // 单独获取前三名数据
        if (isFirst) {
          const topItems = rankList.value.splice(0, 3);
          topThreeRankItems.value = topThreeRankItems.value.map(
            (item, idx) => topItems[idx] || item,
          );
        }
      }
    } catch (err) {
      isLoadFailed.value = true;
      isLoading.value = false;
      console.error('getRankList', err);
    }
  }
  /** 获取当前用户的排行信息 */
  async function getCurrentRankInfo() {
    try {
      const watchCore = getWatchCore();
      const data = await watchCore.invite.getCurrentRankInfo();
      if (!data) {
        console.warn('获取当前用户的排行榜信息为空');
      } else {
        currentRankInfo.value = { ...data };
      }
    } catch (error) {
      console.error('getCurrentRankInfo', error);
    }
  }

  return {
    currentRankInfo,
    inviteListSettingInfo,
    rankList,
    topThreeRankItems,
    realTopThreeRankItems,
    isExistInviteRankData,
    isLoading,
    isNoMore,
    isLoadFailed,
    onlyTopLimitTips,

    currentDes,
    invitePosterEnabled,

    isCurrentViewer,
    initInviteRank,
    handleScroll,
  };
};
