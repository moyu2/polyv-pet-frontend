<!-- @file 移动端更多面板 -->
<template>
  <div class="c-mobile-more-panel">
    <div class="c-mobile-more-panel__title">{{ $lang('more.base') }}</div>

    <div class="c-mobile-more-panel__list">
      <!-- 只看主持人 -->
      <more-item
        v-if="onlySpecialMsgWidgetVisible && chatMenuData.visible"
        :icon-comp="onlySpecialMsg ? MobileOriginIconMoreOnlySpecial : MobileOriginIconMoreLookAll"
        :text="$lang('chat.onlyHost')"
        @click="onClickOnlySpecialMsg"
      />

      <!-- 发送图片 -->
      <more-item
        v-if="chatSetting.viewerSendImgEnabled && chatMenuData.visible"
        :icon-comp="MobileIconMorePicture"
        :text="$lang('chat.sendImage')"
        @click="onClickSendImage"
      />

      <!-- 语言切换 -->
      <more-item
        v-if="langSwitchEnabled"
        :icon-comp="MobileIconMoreLanguage"
        :text="$lang('base.changeLang')"
        @click="onClickLanguageSwitch"
      />

      <!-- 修改昵称 -->
      <more-item
        v-if="canSetNick"
        :icon-comp="MobileIconMoreSetNick"
        :text="$lang('chat.setNick')"
        @click="onClickSetNick"
      />

      <!-- 文件管理 -->
      <more-item
        :icon-comp="MobileIconMoreFiles"
        :text="$lang('fileManagement.title')"
        @click="onClickFileManagement"
      />

      <!-- 投诉反馈 -->
      <more-item
        v-if="feedbackMenuVisible"
        :icon-comp="MobileIconMoreFeedback"
        :text="$lang('interact.feedback.title')"
        @click="onClickFeedback"
      />

      <!-- 绑定手机号 -->
      <more-item
        v-if="bindMobileVisible"
        :icon-comp="MobileIconMoreBindMobile"
        :text="$lang('identityInfo.bindMobile')"
        @click="onClickBindMobile"
      />

      <!-- 小窗播放 -->
      <more-item
        v-if="pictureInPictureEnabled"
        :icon-comp="MobileIconMorePip"
        :text="$lang('player.pictureInPicture.title')"
        @click="onClickPIP"
      />

      <!-- 播放设置 -->
      <more-item
        v-if="pictureInPictureEnabled"
        :icon-comp="MobileIconMorePlaybackSetting"
        :text="$lang('player.pictureInPicture.playbackSetting')"
        @click="onClickPlaybackSetting"
      />

      <!-- 系统全屏 -->
      <!-- 竖屏显示 || 横屏无延迟显示 -->
      <more-item
        v-if="
          (isPortraitWatchLayout || (!isPortraitWatchLayout && isLowLatency)) &&
          playerInited &&
          isPlayStarted
        "
        :icon-comp="MobileIconVideoFullscreen"
        :text="$lang('player.systemFullscreen')"
        @click="onClickSystemFullscreen"
      />

      <!-- 音视频切换 -->
      <more-item
        v-if="playerModeSwitcherVisible && isPortraitWatchLayout"
        :icon-comp="isAudioPlayerMode ? MobileIconMoreVideo : MobileIconMoreAudio"
        :text="isAudioPlayerMode ? $lang('player.mode.video') : $lang('player.mode.audio')"
        @click="onClickPlayMode"
      />

      <!-- 线路设置 -->
      <more-item
        v-if="lineSettingVisible && (isPortraitWatchLayout || isLowLatency)"
        :icon-comp="MobileIconMoreLineSetting"
        :text="$lang('player.lineSetting')"
        @click="onClickLineSetting"
      />
      <!-- 清晰度设置 -->
      <more-item
        v-if="qualitySettingVisible"
        :icon-comp="MobileIconMoreQualitySetting"
        :text="$lang('player.qualitySetting')"
        @click="onClickQualitySetting"
      />

      <!-- 倍速设置 -->
      <more-item
        v-if="rateSettingVisible && isPortraitWatchLayout"
        :icon-comp="MobileIconMoreRateSetting"
        :text="$lang('player.rate')"
        @click="onClickRateSetting"
      />

      <!-- 延迟模式 -->
      <more-item
        v-if="latencyModeSettingVisible && isPortraitWatchLayout"
        :icon-comp="MobileIconMoreLatencySetting"
        :text="$lang('player.latencyMode.name')"
        @click="onClickLatencySwitch"
      />

      <!-- 问答 -->
      <more-item
        v-if="qaMenuData.visible && isPortraitWatchLayout"
        :icon-comp="MobileIconMoreQuestionAnswer"
        :text="$lang('menu.tabName.qa')"
        @click="onClickQuestionAnswer"
      />

      <!-- 切换双流/切换流多轨 -->
      <more-item
        v-if="supportMultiStreamTrack && isPortraitWatchLayout"
        :icon-comp="
          isMultiLanguageTrack ? MobileIconMoreStreamTrack : MobileIconMoreStreamTrackNormal
        "
        :text="
          isMultiLanguageTrack ? $lang('player.streamTrack') : $lang('player.streamTrack.normal')
        "
        @click="onClickSwitchStream"
      />
    </div>

    <div class="c-mobile-more-panel__title">{{ $lang('more.interactive') }}</div>

    <div class="c-mobile-more-panel__list">
      <!-- 实时字幕 -->
      <more-item
        v-if="subtitleRealTimeEnabled && isPortraitWatchLayout && liveSubtitlesEnable"
        :icon-comp="MobileIconMoreSubtitle"
        :text="$lang('player.subtitle.text')"
        @click="onClickSubtitle"
      />

      <!-- 回放字幕 -->
      <more-item
        v-if="replaySubtitleVisible && isPortraitWatchLayout && !liveSubtitlesEnable"
        :icon-comp="MobileIconMoreSubtitle"
        :text="$lang('player.replaySubtitle.text')"
        @click="onClickReplaySubtitle"
      />

      <!-- 个人中心 -->
      <more-item
        v-if="identitySetting.profileEnabled"
        :icon-comp="MobileIconMoreProfile"
        :text="$lang('identitySetting.profile')"
        @click="onClickProfile"
      />

      <!-- 发红包 -->
      <more-item
        v-if="sendRedpackVisible && chatMenuData.visible && !isPortraitWatchLayout"
        :icon-comp="MobileIconMoreSendRedpack"
        :text="$lang('redpack.name')"
        @click="onClickSendRedpack"
      />

      <!-- 任务奖励 -->
      <more-item
        v-if="
          (iarSdkLoaded && !notNeedIar && personalRewardEntranceVisible) ||
          liveActivityRewardEntranceVisible
        "
        :icon-comp="MobileIconMoreMyReward"
        :text="$lang('taskActivity.myReward')"
        @click="onClickPersonalReward"
      />

      <!-- 提现 -->
      <more-item
        v-if="withdrawVisible && chatMenuData.visible"
        :icon-comp="MobileIconMoreWithdraw"
        :text="$lang('withdraw.name')"
        @click="onClickWithdraw"
      />

      <!-- 积分记录 -->
      <more-item
        v-if="iarSdkLoaded && !notNeedIar && scoreRedpackEnabled && chatMenuData.visible"
        :icon-comp="MobileIconMoreScore"
        :text="$lang('interact.scoreRecord.title')"
        @click="onClickScoreRecord"
      />

      <!-- 打赏特效开关 -->
      <more-item
        v-if="showDonateGifts && (chatMenuData.visible || isPortraitWatchLayout)"
        :icon-comp="
          donateAnimationVisible ? MobileOriginIconMoreShowDonate : MobileOriginIconMoreHideDonate
        "
        :text="$lang('donate.showAnimation')"
        auto-close
        @click="toggleDonateAnimationVisible"
      />

      <template v-if="iarSdkLoaded && !notNeedIar">
        <!-- 优惠券 -->
        <more-item
          v-if="couponPendantVisible"
          :icon-comp="MobileIconMoreCoupon"
          :text="$lang('interact.coupon.title')"
          @click="onClickCoupon"
        />

        <!-- 公告 -->
        <mobile-bulletin-entrance />
      </template>

      <!-- 我的学习 -->
      <more-item
        v-if="learningStatsEnabled"
        :icon-comp="MobileIconWatchDuration"
        :text="$lang('learningDetail.name')"
        @click="onClickLearningDetail"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MoreItem from './mobile-more-item.vue';
import { emitFunc } from '@polyv/vue-components';
import { useChatStore } from '@/store/use-chat-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { storeToRefs } from 'pinia';
import { appEvents } from '@/app/app-events';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useLangStore } from '@/store/use-lang-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { useDonateAnimationVisible } from '@/components/page-watch-common/donate/donate-animation/use-donate-animation';
import { useWebviewStore } from '@/store/use-webview-store';
import { watch } from 'vue';
import {
  MobileIconMoreAudio,
  MobileIconMoreBindMobile,
  MobileIconMoreCoupon,
  MobileIconMoreFeedback,
  MobileIconMoreLanguage,
  MobileIconMoreLatencySetting,
  MobileIconMoreLineSetting,
  MobileIconMoreMyReward,
  MobileIconMorePicture,
  MobileIconMorePip,
  MobileIconMorePlaybackSetting,
  MobileIconMoreProfile,
  MobileIconMoreQualitySetting,
  MobileIconMoreQuestionAnswer,
  MobileIconMoreRateSetting,
  MobileIconMoreScore,
  MobileIconMoreSendRedpack,
  MobileIconMoreSetNick,
  MobileIconMoreStreamTrack,
  MobileIconMoreStreamTrackNormal,
  MobileIconMoreSubtitle,
  MobileIconMoreVideo,
  MobileIconMoreWithdraw,
  MobileIconMoreFiles,
  MobileIconWatchDuration,
  MobileIconVideoFullscreen,
} from '@/components/component-icons/mobile/map';
import {
  MobileOriginIconMoreHideDonate,
  MobileOriginIconMoreLookAll,
  MobileOriginIconMoreOnlySpecial,
  MobileOriginIconMoreShowDonate,
} from '@/components/component-icons/mobile-origin/map';
import MobileBulletinEntrance from '@/components/page-watch-common/interactive-receive-v2/bulletin-v2/bulletin-entrance/mobile-bulletin-entrance.vue';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerControl } from '../../player/hooks/use-player-control';
import { usePlayerStore } from '@/store/use-player-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useStreamTrack } from '../../player/player-stream-track/use-stream-track';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useLiveActivityStore } from '@/store/use-live-activity-store';

const emit = defineEmits({
  close: emitFunc<void>(),
});

const { getEmitter, getWatchCore } = useGlobalInject();

const { feedbackMenuVisible, couponPendantVisible, personalRewardEntranceVisible } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { langSwitchEnabled } = storeDefinitionToRefs(useLangStore);

const donateStore = useDonateStore();
const { donateAnimationVisible, showDonateGifts } = storeToRefs(donateStore);
const { toggleDonateAnimationVisible } = useDonateAnimationVisible();

const chatStore = useChatStore();
const { onlySpecialMsg, chatSetting, onlySpecialMsgWidgetVisible } = storeToRefs(chatStore);
const { toggleOnlySpecialMsg } = chatStore;

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { sendRedpackVisible, scoreRedpackEnabled } = storeDefinitionToRefs(useRedpackStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { supportMultiStreamTrack } = storeDefinitionToRefs(useChannelStore);

const { learningStatsEnabled } = storeDefinitionToRefs(useChannelInfoStore);

const { subtitleRealTimeEnabled, liveSubtitlesEnable, replaySubtitleVisible } =
  storeDefinitionToRefs(useSubtitleStore);

const { chatMenuData, qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { identitySetting, bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);

const { toSmallWindow } = useWebviewStore();

const { isMultiLanguageTrack } = useStreamTrack();

const { isSmallWindow, pictureInPictureEnabled } = storeDefinitionToRefs(useWebviewStore);

const playerStore = usePlayerStore();
const { isAudioPlayerMode, isLowLatency, playerInited, isPlayStarted } =
  storeDefinitionToRefs(usePlayerStore);

const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { notNeedIar } = storeDefinitionToRefs(useWatchAppStore);

const { liveActivityRewardEntranceVisible } = storeDefinitionToRefs(useLiveActivityStore);

const {
  lineSettingVisible,
  qualitySettingVisible,
  rateSettingVisible,
  latencyModeSettingVisible,
  playerModeSwitcherVisible,
} = usePlayerControl();

const { toInterruptUserClick } = useInterruptUserClick();

const watchCore = getWatchCore();

/** 关闭更多 */
function closeMore() {
  emit('close');
}

/** 点击"个人中心" */
function onClickProfile() {
  const url = watchCore.utils.generateProfilePageUrl();
  if (url) {
    window.open(url, '_blank');
  }

  closeMore();
}

/** 点击只看主持人 */
function onClickOnlySpecialMsg() {
  toggleOnlySpecialMsg();
  closeMore();
}

/** 点击我的学习 */
function onClickLearningDetail() {
  getEmitter().emit(appEvents.global.OpenLearningDetail, true);
  closeMore();
}

/** 点击投诉反馈 */
function onClickFeedback() {
  getEmitter().emit(appEvents.interaction.OpenFeedback, true);
  closeMore();
}

/** 点击积分记录 */
function onClickScoreRecord() {
  getEmitter().emit(appEvents.interaction.OpenScoreRecord, true);
  closeMore();
}

/** 点击修改昵称 */
function onClickSetNick() {
  const result = toInterruptUserClick({ triggerSource: 'set-nick', ignoreSetNick: false });
  if (result) {
    return;
  }

  getEmitter().emit(appEvents.chat.OpenSetNick, true);
  closeMore();
}

/** 点击文件管理 */
function onClickFileManagement() {
  getEmitter().emit(appEvents.global.OpenFileManagement, true);
  closeMore();
}

/** 点击语言切换 */
function onClickLanguageSwitch() {
  getEmitter().emit(appEvents.global.OpenLanguageSwitch);
  closeMore();
}

/** 点击发红包 */
function onClickSendRedpack() {
  getEmitter().emit(appEvents.interaction.OpenSendRedpack, true);
  closeMore();
}

/** 点击发送图片 */
function onClickSendImage() {
  getEmitter().emit(appEvents.chat.ToSendImage);
  closeMore();
}

/** 点击提现 */
function onClickWithdraw() {
  getEmitter().emit(appEvents.withdraw.OpenWithdrawDetail, true);
  closeMore();
}

/** 点击绑定手机号 */
function onClickBindMobile() {
  getEmitter().emit(appEvents.global.OpenBindIdentityInfoDialog, true);
  closeMore();
}

/** 点击任务奖励 */
function onClickPersonalReward() {
  const result = toInterruptUserClick({ triggerSource: 'personal-reward', ignoreSetNick: true });
  if (result) {
    return;
  }

  getEmitter().emit(appEvents.global.OpenPersonalRewardDialog);
  closeMore();
}

/** 点击小窗播放 */
function onClickPIP() {
  toSmallWindow();
}

/** 点击播放设置 */
function onClickPlaybackSetting() {
  getEmitter().emit(appEvents.global.PlaybackSettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击系统全屏 */
function onClickSystemFullscreen() {
  // 竖屏暂时全由观看页处理
  if (isPortraitWatchLayout.value) {
    getEmitter().emit(appEvents.portrait.PlayerSystemFullscreen);
    closeMore();
    return;
  }

  // 处理横屏场景
  const isSupported = watchCore.player.supportFullscreen();
  if (isSupported) {
    watchCore.player.requestFullscreen();
  } else {
    getEmitter().emit(appEvents.portrait.PlayerSystemFullscreen);
  }
  closeMore();
}

/** 点击优惠券 */
function onClickCoupon() {
  const result = toInterruptUserClick({ triggerSource: 'coupon-pendant', ignoreSetNick: true });
  if (result) {
    return;
  }

  getEmitter().emit(appEvents.interaction.OpenCouponUserList, true);
  closeMore();
}

/** 点击播放模式 */
function onClickPlayMode() {
  playerStore.$patch({
    isAudioPlayerMode: !playerStore.isAudioPlayerMode,
  });
  closeMore();
}

/** 点击线路切换 */
function onClickLineSetting() {
  closeMore();
  getEmitter().emit(appEvents.portrait.OpenLineSettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击清晰度切换 */
function onClickQualitySetting() {
  closeMore();
  getEmitter().emit(appEvents.portrait.OpenQualitySettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击倍速设置 */
function onClickRateSetting() {
  closeMore();
  getEmitter().emit(appEvents.portrait.OpenRateSettingPopup, {
    _visible: true,
    _useTransition: false,
  });
}

/** 点击延迟模式 */
function onClickLatencySwitch() {
  getEmitter().emit(appEvents.portrait.OpenLatencySwitchPopup, true);
  closeMore();
}

/** 点击问答 */
function onClickQuestionAnswer() {
  const result = toInterruptUserClick({ triggerSource: 'iar-qa', ignoreSetNick: true });
  if (result) {
    return;
  }

  getEmitter().emit(appEvents.interaction.OpenQuestionAnswer, true);
  closeMore();
}

/** 点击切换语言流 */
function onClickSwitchStream() {
  getEmitter().emit(appEvents.portrait.OpenLangStreamPopup, true);
  closeMore();
}

/** 点击实时字幕 */
function onClickSubtitle() {
  getEmitter().emit(appEvents.portrait.OpenSubtitleSettingPopup, { mode: 'live' });
  closeMore();
}

/** 点击回放字幕 */
function onClickReplaySubtitle() {
  getEmitter().emit(appEvents.portrait.OpenSubtitleSettingPopup, { mode: 'replay' });
  closeMore();
}

watch(isSmallWindow, pip => {
  if (pip) closeMore();
});
</script>

<style lang="scss">
.c-mobile-more-panel {
  box-sizing: border-box;
  max-height: 492px;
  padding-top: 4px;
  padding-bottom: 24px;
  overflow-y: auto;
  background: #f7f8fa;
  border-radius: 12px 12px 0 0;
}

.c-mobile-more-panel__title {
  padding: 16px 16px 0;
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 17px;
  color: rgba(#000000, 0.4);
}

.c-mobile-more-panel__list {
  display: flex;
  flex-wrap: wrap;
}
</style>
