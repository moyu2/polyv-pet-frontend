<template>
  <div
    v-if="isShowPendant"
    class="c-mobile-task-activity-pendant"
    :class="{
      'c-mobile-task-activity-pendant--en': !isChineseLang,
    }"
    :style="pendantStyle"
    @click="onClickPendant"
  >
    <!-- 任务活动弹层 -->
    <mobile-task-activity-dialog />

    <!-- 任务活动答题弹层 -->
    <mobile-task-activity-questionnaire />

    <!-- 网络异常提示 -->
    <transition name="fade">
      <div
        v-if="isShowNetworkError"
        class="c-mobile-task-activity-pendant__network-error-tip"
      >
        <div class="c-mobile-task-activity-pendant__network-error-tip__container">
          <span class="c-mobile-task-activity-pendant__network-error-tip__text">
            {{ translate('taskActivity.networkError.title2') }}
          </span>
          <div
            class="c-mobile-task-activity-pendant__network-error-tip__close-icon"
            @click.stop="onCloseNetworkError"
          >
            <mobile-icon-close size="20" />
          </div>
        </div>
        <div class="c-mobile-task-activity-pendant__network-error-tip__arrow"></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useTaskActivityStore } from '@/store/use-task-activity-store';
import MobileTaskActivityDialog from './mobile-task-activity-dialog.vue';
import MobileTaskActivityQuestionnaire from './mobile-task-activity-questionnaire.vue';
import { useLangStore } from '@/store/use-lang-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { CSSProperties, computed, ref } from 'vue';
import { MobileIconClose } from '@/components/component-icons/mobile/map';
import { translate } from '@/assets/lang';
import { useThemeStore } from '@/store/use-theme-store';

const themeStore = useThemeStore();

const { getEmitter } = useGlobalInject();

const { isShowPendant, isShowTaskActivityErrorPopper } =
  storeDefinitionToRefs(useTaskActivityStore);

const { isChineseLang } = storeDefinitionToRefs(useLangStore);

const isCloseNetworkError = ref(false);

const isShowNetworkError = computed(() => {
  return isShowTaskActivityErrorPopper.value && !isCloseNetworkError.value;
});

function onClickPendant() {
  getEmitter().emit(appEvents.global.OpenTaskActivityDialog);
}

function onCloseNetworkError() {
  isCloseNetworkError.value = true;
}

const pendantStyle = computed<CSSProperties>(() => {
  if (!themeStore.watchThemeStyleConfig) return {};

  const pendantIconUrl = isChineseLang.value
    ? themeStore.watchThemeStyleConfig.common.pendant.taskPrizeZh
    : themeStore.watchThemeStyleConfig.common.pendant.taskPrizeEn;

  return {
    backgroundImage: `url(${pendantIconUrl})`,
  };
});
</script>

<style lang="scss">
.c-mobile-task-activity-pendant {
  position: relative;
  width: $pendant-size;
  height: $pendant-size;
  background-image: url(./images/pendant-icon.png);
  background-repeat: no-repeat;
  background-size: contain;
}
.c-mobile-task-activity-pendant--en {
  background-image: url(./images/pendant-icon-en.png);
}

/* 网络异常提示样式 */
.c-mobile-task-activity-pendant__network-error-tip {
  position: absolute;
  top: 50%;
  left: 0;
  display: flex;
  align-items: center;
  margin-right: 8px;
  pointer-events: none;
  transform: translate(-110%, -50%);
}

.c-mobile-task-activity-pendant__network-error-tip__container {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  min-width: 84px;
  height: 28px;
  padding: 4px 8px;
  background-color: rgba(255, 82, 82, 0.6); /* 功能色/危险色-禁用 */
  border-radius: 4px;
}

.c-mobile-task-activity-pendant__network-error-tip__text {
  flex: 1;
  font-family: PingFangSC-Regular, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #ffffff; /* 中性色-深色/中性色-白色100%(标题) */
  text-align: left;
  white-space: nowrap;
}

.c-mobile-task-activity-pendant__network-error-tip__close-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;

  .polyv-icon-close {
    height: 20px;
  }
}

.c-mobile-task-activity-pendant__network-error-tip__arrow {
  width: 0;
  height: 0;
  margin-left: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 6px solid rgba(255, 82, 82, 0.6);
}
</style>
