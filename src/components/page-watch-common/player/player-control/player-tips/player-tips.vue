<template>
  <div
    class="c-player-tips"
    :class="{
      'c-player-tips--mobile-web-page-fullscreen': isMobileWebPageFullscreen,
      'c-player-tips--mobile': isMobile,
    }"
    v-if="!mobileDocIsPageFullscreen"
  >
    <!-- 清晰度切换提示 -->
    <div
      class="c-player-tips__item c-player-tips__quality-switch-tips"
      v-if="switchQualityTipStatus !== SwitchTipsStatus.Hide"
    >
      <span v-if="switchQualityTipStatus === SwitchTipsStatus.Switching">
        {{ $lang('player.tips.switching')
        }}<span class="c-player-tips__switch-btn">"{{ switchLevelText }}"</span>，{{
          $lang('player.tips.switching2')
        }}
      </span>

      <span v-if="switchQualityTipStatus === SwitchTipsStatus.Finish">
        {{ $lang('player.tips.switchTo')
        }}<span class="c-player-tips__switch-btn">"{{ switchLevelText }}"</span
        >{{ $lang('player.quality') }}
      </span>
    </div>

    <!-- 弱网切换提示 -->
    <div
      class="c-player-tips__item c-player-tips__weak-network-switch"
      v-if="showWeakNetworkTip"
    >
      <weak-network-switch-tips></weak-network-switch-tips>
    </div>

    <!-- 线路切换提示 -->
    <div
      class="c-player-tips__item c-player-tips__quality-switch-tips"
      v-if="switchLineTipStatus !== SwitchTipsStatus.Hide && !isMobile"
    >
      <span v-if="switchLineTipStatus === SwitchTipsStatus.Switching">
        {{ $lang('player.tips.switching')
        }}<span class="c-player-tips__switch-btn">"{{ switchLineText }}"</span>，{{
          $lang('player.tips.switching2')
        }}
      </span>

      <span v-if="switchLineTipStatus === SwitchTipsStatus.Finish">
        {{ $lang('player.tips.switchTo')
        }}<span class="c-player-tips__switch-btn">"{{ switchLineText }}"</span>
      </span>
    </div>

    <!-- 历史播放进度提示 -->
    <div
      class="c-player-tips__item c-player-tips__history-tips"
      v-if="historyTipsVisible"
    >
      <span>{{ $lang('player.historyTips') }}</span>
      <span> {{ formatSeconds(historyTipsDuration, { segments: 3 }) }} </span>
      <span
        class="c-player-tips__history-tips-restart"
        @click="toRestart"
        >{{ $lang('player.restart') }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerStore, SwitchTipsStatus } from '@/store/use-player-store';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { useNetworkStatus } from '@/components/page-watch-common/player/hooks/use-network-status';
import { useWeakNetworkSwitch } from '@/components/page-watch-common/player/player-control/weak-network-switch-tips/use-weak-network-switch';
import WeakNetworkSwitchTips from '../weak-network-switch-tips/weak-network-switch-tips.vue';
import { PropUtils } from '@polyv/vue-components';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { isMobile } from '@/assets/utils/browser';
import { useWebPageFullscreen } from '@/components/page-watch-common/player/hooks/use-web-page-fullscreen';
import { useLayoutStore } from '@/store/use-layout-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { formatSeconds } from '@polyv/utils/date';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const props = defineProps({
  isNormalMobileLayout: PropUtils.bool.def(false),
});

const {
  switchQualityTipStatus,
  switchQualityLevel,
  showControl,
  playerInited,
  switchLineLevel,
  switchLineTipStatus,
  historyDuration,
} = storeDefinitionToRefs(usePlayerStore);

const { toRestart } = usePlayerAction();
const { mobileDocIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const { qualitySettingList, lineSettingList } = usePlayerControl();
const { isMobileWebPageFullscreen } = useWebPageFullscreen();

/**
 * 历史播放进度提示是否显示
 */
const historyTipsVisible = ref(false);

/**
 * 历史播放进度提示时长
 */
const historyTipsDuration = ref(0);

const switchLevelText = computed(() => {
  const getLevelText = (level?: number) => {
    if (level === undefined) return;
    return qualitySettingList.value.find(item => {
      return item.value === level;
    })?.text;
  };

  return getLevelText(switchQualityLevel.value);
});

const switchLineText = computed(() => {
  const getLineTex = (line?: number) => {
    if (line === undefined) return;
    return lineSettingList.value.find(item => {
      return item.value === line;
    })?.text;
  };

  return getLineTex(switchLineLevel.value);
});

const { isWeakNetwork } = useNetworkStatus();
const { updateWeakNetworkTips, showWeakNetworkTip, showWeakNetworkOnce } = useWeakNetworkSwitch();

let finishTimer: ReturnType<typeof setTimeout>;

const handleQualityLevelChange = () => {
  clearTimeout(finishTimer);
  // 移动端播放器延迟出现提示，可能效果好点？移动端播放器只要切换清晰度，视频未加载完就触发事件
  setTimeout(() => {
    switchQualityTipStatus.value = SwitchTipsStatus.Finish;
    switchQualityLevel.value = watchCore.player.getCurrentQualityLevel();
  }, 600);

  finishTimer = setTimeout(() => {
    switchQualityTipStatus.value = SwitchTipsStatus.Hide;
  }, 3000);
};

/**
 * 显示历史播放进度提示
 */
const showHistoryTipsInSeconds = (seconds: number) => {
  historyTipsVisible.value = true;
  setTimeout(() => {
    historyTipsVisible.value = false;
    historyTipsDuration.value = 0;
  }, seconds);
};

onMounted(() => {
  if (props.isNormalMobileLayout) {
    watchCore.player.eventEmitter.on(PlayerEvents.QualityLevelChange, handleQualityLevelChange);
  }
});

onUnmounted(() => {
  if (props.isNormalMobileLayout) {
    watchCore.player.eventEmitter.off(PlayerEvents.QualityLevelChange, handleQualityLevelChange);
  }
});

watch(isWeakNetwork, newVal => {
  if (newVal && playerInited.value && !mobileDocIsPageFullscreen.value) {
    updateWeakNetworkTips();
    showWeakNetworkOnce();
  }
});

watch(showWeakNetworkTip, val => {
  if (val) {
    showControl.value = true;
  }
});

watch(historyDuration, val => {
  if (val) {
    historyTipsDuration.value = val;
    // 对齐pc端，pc端是5秒
    showHistoryTipsInSeconds(5000);
  }
});
</script>

<style lang="scss">
.c-player-tips {
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: initial;
  pointer-events: none;
}

.c-player-tips--mobile {
  align-items: center;

  .c-player-tips__item {
    max-width: 81%;
    overflow: hidden;
  }
}

.c-player-tips__item {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: max-content;
  padding: 10px 16px;
  margin: 5px 0;
  font-size: 14px;
  color: #fff;
  pointer-events: initial;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 20px;
}

.c-player-tips__close {
  display: flex;
  margin-left: 8px;
  font-size: 16px !important;
  font-weight: bold;
  color: #a8a8a8;
  cursor: pointer;
}

.c-player-tips__switch-btn {
  padding: 0 3px;
  color: #85a6f7;
}

.c-player-tips__history-tips {
  display: inline;
  font-size: 12px;
  line-height: 18px;
}

.c-player-tips__history-tips-restart {
  @extend .c-player-tips__switch-btn;
}

.c-player-tips--mobile-web-page-fullscreen {
  position: fixed;
  top: calc((var(--plv-fullscreen-vh, 100vh) - 100vw) / 2);
  left: calc((100vw - var(--plv-fullscreen-vh, 100vh)) / 2) !important;
  z-index: 2024;
  align-items: center;
  width: 100vh;
  height: 100vw;
  overflow: inherit !important;
  transform: rotate(90deg) translateY(30px);
}
</style>
