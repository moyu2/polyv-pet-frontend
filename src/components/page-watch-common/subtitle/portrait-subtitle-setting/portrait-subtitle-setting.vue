<!-- @file 竖屏字幕设置弹窗 -->
<template>
  <mobile-popup
    :visible.sync="isVisible"
    :title="
      isLiveMode ? $lang('portrait.subtitle.setting.title') : $lang('player.replaySubtitle.text')
    "
    position="bottom"
    @close="handleClose"
    content-background="#f6f7f9"
  >
    <!-- 直播模式 -->
    <div
      v-if="isLiveMode"
      class="c-portrait-subtitle-setting"
    >
      <!-- 实时字幕总开关 -->
      <div class="c-portrait-subtitle-setting__item">
        <div class="c-portrait-subtitle-setting__label">{{ $lang('player.subtitle.text') }}</div>
        <div class="c-portrait-subtitle-setting__control">
          <plv-switch
            v-model="localSubtitlesEnabled"
            @change="handleToggleSubtitle"
          />
        </div>
      </div>

      <!-- 字幕语言选择 -->
      <div
        v-if="localSubtitlesEnabled && subtitleTranslateEnabled"
        class="c-portrait-subtitle-setting__item c-portrait-subtitle-setting__language-selector"
        @click="handleOpenLanguageSelector"
      >
        <div class="c-portrait-subtitle-setting__label">
          {{ $lang('portrait.subtitle.setting.language') }}
        </div>
        <div class="c-portrait-subtitle-setting__language-value">
          {{ currentLiveLanguageLabel }}
          <mobile-icon-arrow-right />
        </div>
      </div>

      <!-- 双语显示开关 -->
      <div
        v-if="localSubtitlesEnabled && subtitleTranslateEnabled"
        class="c-portrait-subtitle-setting__item"
      >
        <div class="c-portrait-subtitle-setting__label">
          {{ $lang('portrait.subtitle.setting.bilingual') }}
        </div>
        <div class="c-portrait-subtitle-setting__control">
          <plv-switch
            :disabled="subtitleTranslateSelected[0] === 'source'"
            v-model="bilingualEnabled"
            @change="handleToggleBilingual"
          />
        </div>
      </div>
    </div>
    <!-- 回放模式 -->
    <div
      v-else
      class="c-portrait-subtitle-setting c-portrait-subtitle-setting--replay"
    >
      <div
        class="c-portrait-subtitle-setting__item"
        v-if="replayOriginalLanguageExist"
      >
        <mobile-form-checkbox
          :checked="mainReplaySubtitleShow"
          @change="handleChangeMainReplaySubtitle"
        >
          <span class="c-portrait-subtitle-setting__checkbox-label">
            {{ $lang('subtitle.source') }}
          </span>
        </mobile-form-checkbox>
        <div class="c-portrait-subtitle-setting__value">
          {{ replayOriginalLanguageLabel }}
        </div>
      </div>

      <div
        class="c-portrait-subtitle-setting__item c-portrait-subtitle-setting__item--space-between"
        v-if="replaySubtitleSourceTranslateLanguageOptions.length > 0"
      >
        <mobile-form-checkbox
          :checked="subReplaySubtitleShow"
          @change="handleChangeSubReplaySubtitle"
        >
          <span class="c-portrait-subtitle-setting__checkbox-label">
            {{ $lang('subtitle.translate') }}
          </span>
        </mobile-form-checkbox>

        <div
          class="c-portrait-subtitle-setting__language-value"
          :class="{ 'is-disabled': !replaySubtitleSourceTranslateLanguageOptions.length }"
          @click="handleOpenReplayLanguageSelector"
        >
          {{ currentReplayLanguageLabel }}
          <mobile-icon-arrow-right />
        </div>
      </div>
    </div>

    <!-- 实时字幕语言选择弹窗 -->
    <mobile-popup
      v-if="isLiveMode"
      :visible.sync="liveLanguageSelectorVisible"
      :title="$lang('portrait.subtitle.setting.language')"
      position="bottom"
      @close="handleCloseLanguageSelector"
    >
      <div class="c-portrait-subtitle-language-selector">
        <!-- 原文选项 -->
        <div class="c-portrait-subtitle-language-selector__list">
          <div
            class="c-portrait-subtitle-language-selector__item"
            :class="{
              'c-portrait-subtitle-language-selector__item--active':
                subtitleTranslateSelected[0] === 'source',
            }"
            @click="handleSelectOriginal"
          >
            <span>{{ $lang('portrait.subtitle.setting.original') }}</span>
            <mobile-icon-check
              v-if="subtitleTranslateSelected[0] === 'source'"
              class="c-portrait-subtitle-language-selector__check"
            />
          </div>
        </div>

        <!-- 语言选项列表 -->
        <div class="c-portrait-subtitle-language-selector__list">
          <div
            v-for="option in liveSubtitleSourceTranslateLanguageOptions"
            :key="option.value"
            class="c-portrait-subtitle-language-selector__item"
            :class="{
              'c-portrait-subtitle-language-selector__item--active':
                subtitleTranslateSelected[0] !== 'source' &&
                option.value === subtitleTranslateSelected[1],
            }"
            @click="handleLanguageChange(option.value)"
          >
            <span>{{ option.label }}</span>
            <mobile-icon-check
              v-if="
                subtitleTranslateSelected[0] !== 'source' &&
                option.value === subtitleTranslateSelected[1]
              "
              class="c-portrait-subtitle-language-selector__check"
            />
          </div>
        </div>
      </div>
    </mobile-popup>

    <!-- 回放字幕语言选择弹窗 -->
    <mobile-popup
      v-else
      :visible.sync="replayLanguageSelectorVisible"
      :title="$lang('portrait.subtitle.setting.language')"
      position="bottom"
      @close="handleCloseReplayLanguageSelector"
    >
      <div class="c-portrait-subtitle-language-selector">
        <div class="c-portrait-subtitle-language-selector__list">
          <div
            v-for="option in replaySubtitleSourceTranslateLanguageOptions"
            :key="option.value"
            class="c-portrait-subtitle-language-selector__item"
            :class="{
              'c-portrait-subtitle-language-selector__item--active':
                option.value === curSelectedReplaySubtitleItemId,
            }"
            @click="handleReplayLanguageChange(option.value)"
          >
            <span>{{ option.label }}</span>
            <mobile-icon-check
              v-if="option.value === curSelectedReplaySubtitleItemId"
              class="c-portrait-subtitle-language-selector__check"
            />
          </div>
        </div>
      </div>
    </mobile-popup>
  </mobile-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SubtitleSourceTranslateLanguage } from '@polyv/live-watch-sdk';
import { translate } from '@/assets/lang';

import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileFormCheckbox from '@/components/common-base/form/form-checkbox/mobile-form-checkbox.vue';
import { PlvSwitch } from '@/plugins/polyv-ui/mobile-import';
import { MobileIconArrowRight, MobileIconCheck } from '@/components/component-icons/mobile/map';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useSubtitleSelected } from '../use-subtitle';

const props = defineProps<{
  visible: boolean;
  mode: 'live' | 'replay';
}>();

const emit = defineEmits(['close', 'update:visible', 'enable-subtitle-float']);

const subtitleStore = useSubtitleStore();
const {
  subtitleTranslateEnabled,
  localUerSubtitlesEnable,
  liveSubtitleSourceLanguage,
  liveSubtitleSourceTranslateLanguageOptions,
  subtitleDisplayMode,
  mainReplaySubtitleShow,
  subReplaySubtitleShow,
  replaySubtitleSourceLanguageOptions,
  replaySubtitleSourceTranslateLanguageOptions,
  curSelectedReplaySubtitleItemId,
} = storeDefinitionToRefs(useSubtitleStore);

const { subtitleTranslateSelected } = useSubtitleSelected();

const isVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit('update:visible', value);
  },
});

const isLiveMode = computed(() => props.mode === 'live');

// 本地字幕开关状态
const localSubtitlesEnabled = ref(localUerSubtitlesEnable.value);
// 双语开关状态（基于显示模式）
const bilingualEnabled = ref(subtitleDisplayMode.value === 'all');

// 语言选择弹窗状态
const liveLanguageSelectorVisible = ref(false);
const replayLanguageSelectorVisible = ref(false);

// 当前选中语言的显示文本（直播）
const currentLiveLanguageLabel = computed(() => {
  const [type, language] = subtitleTranslateSelected.value;

  if (type === 'source') {
    return translate('portrait.subtitle.setting.original');
  }

  const currentOption = liveSubtitleSourceTranslateLanguageOptions.value.find(
    option => option.value === language,
  );
  return currentOption?.label;
});

const replayOriginalLanguageLabel = computed(() => {
  return replaySubtitleSourceLanguageOptions.value[0]?.label || '--';
});

/** 回放字幕是否有原始语言 */
const replayOriginalLanguageExist = computed(() => {
  return replaySubtitleSourceLanguageOptions.value.length > 0;
});

const currentReplayLanguageLabel = computed(() => {
  const currentOption = replaySubtitleSourceTranslateLanguageOptions.value.find(
    option => option.value === curSelectedReplaySubtitleItemId.value,
  );
  return currentOption?.label || '--';
});

// 监听本地开关状态变化
watch(localUerSubtitlesEnable, newVal => {
  localSubtitlesEnabled.value = newVal;
});

watch(
  () => props.mode,
  () => {
    liveLanguageSelectorVisible.value = false;
    replayLanguageSelectorVisible.value = false;
  },
);

function updateSubtitleDisplayMode(mode: 'source' | 'translate' | 'all') {
  subtitleStore.changeSubtitleDisplayMode(mode);
}

const handleClose = () => {
  emit('close');
};

const handleToggleSubtitle = (enabled: boolean) => {
  subtitleStore.changeLocalUerSubtitlesEnable(enabled);
  if (enabled) {
    // 当用户开启字幕时，通知管理器启用浮窗显示
    emit('enable-subtitle-float');
  }
};

const handleToggleBilingual = (enabled: boolean) => {
  const newMode = enabled ? 'all' : 'translate';
  updateSubtitleDisplayMode(newMode);
};

const handleOpenLanguageSelector = () => {
  liveLanguageSelectorVisible.value = true;
};

const handleCloseLanguageSelector = () => {
  liveLanguageSelectorVisible.value = false;
};

const handleSelectOriginal = () => {
  subtitleTranslateSelected.value = ['source', liveSubtitleSourceLanguage.value];
  updateSubtitleDisplayMode('source');
  bilingualEnabled.value = false;
  liveLanguageSelectorVisible.value = false;
};

const handleLanguageChange = (language: string) => {
  let changeMode = subtitleDisplayMode.value;

  if (changeMode === 'source' || changeMode === 'translate') {
    changeMode = 'translate';
  }

  subtitleTranslateSelected.value = [changeMode, language as SubtitleSourceTranslateLanguage];
  liveLanguageSelectorVisible.value = false;
};

const handleChangeMainReplaySubtitle = (checked: boolean) => {
  subtitleStore.changeMainReplaySubtitleShow(checked);
};

const handleChangeSubReplaySubtitle = (checked: boolean) => {
  if (!replaySubtitleSourceTranslateLanguageOptions.value.length) return;

  subtitleStore.changeSubReplaySubtitleShow(checked);
  if (checked) {
    replayLanguageSelectorVisible.value = true;
  }
};

const handleOpenReplayLanguageSelector = () => {
  if (!replaySubtitleSourceTranslateLanguageOptions.value.length) return;
  replayLanguageSelectorVisible.value = true;
};

const handleCloseReplayLanguageSelector = () => {
  replayLanguageSelectorVisible.value = false;
};

const handleReplayLanguageChange = (languageId: string) => {
  subtitleStore.$patch({
    curSelectedReplaySubtitleItemId: String(languageId),
  });
  replayLanguageSelectorVisible.value = false;
};
</script>

<style lang="scss">
.c-portrait-subtitle-setting {
  padding: 12px 16px;
  margin: 12px 16px;
  background: #ffffff;
  border-radius: 12px;
}

.c-portrait-subtitle-setting--replay {
  .c-portrait-subtitle-setting__item {
    padding: 12px 0;
    border-bottom: none;
  }
}

.c-portrait-subtitle-setting__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.c-portrait-subtitle-setting__item--space-between {
  gap: 12px;
}

.c-portrait-subtitle-setting__label {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.c-portrait-subtitle-setting__checkbox-label {
  font-size: 16px;
  color: #333333;
}

.c-portrait-subtitle-setting__checkbox--disabled {
  opacity: 0.5;
}

.c-portrait-subtitle-setting__control {
  flex-shrink: 0;
}

.c-portrait-subtitle-setting__value {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 56px;
  margin-left: auto;
  font-size: 16px;
  color: #666666;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.c-portrait-subtitle-setting__language-selector {
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
}

.c-portrait-subtitle-setting__language-value {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-left: auto;
  font-size: 16px;
  color: #666666;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    color: #999999;
  }

  &.is-disabled {
    color: #b6b6c4;
    cursor: not-allowed;

    svg {
      color: #ccccd9;
    }
  }
}

// 语言选择弹窗样式
.c-portrait-subtitle-language-selector {
  padding: 0;
  background: #ffffff;
}

.c-portrait-subtitle-language-selector__list {
  padding: 0;
}

.c-portrait-subtitle-language-selector__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-size: 16px;
  color: #333333;
  cursor: pointer;
  border-bottom: 1px solid #f8f8f8;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }

  &.c-portrait-subtitle-language-selector__item--active {
    color: #007aff;
  }
}

.c-portrait-subtitle-language-selector__check {
  width: 20px;
  height: 20px;
  color: #007aff;
}
</style>
