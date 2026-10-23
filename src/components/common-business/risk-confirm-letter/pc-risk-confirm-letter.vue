<template>
  <pc-dialog
    v-if="viewerRiskConfirmInfo"
    ref="dialogInstance"
    class="c-pc-risk-confirm-letter"
    body-locked
    :visible="dialogVisible"
    :title="dialogTitle"
    :closable="false"
  >
    <!-- 预览协议 -->
    <section v-show="riskConfirmLetterRenderMode === RiskConfirmLetterRenderMode.PreviewAgreement">
      <section
        class="c-pc-risk-confirm-letter__content__preview-agreement"
        :style="contentWrapperStyle"
      >
        <div class="c-pc-risk-confirm-letter__content__preview-agreement-title">
          {{ curPreviewAgreement.title }}
        </div>
        <iframe
          allow="*"
          scrolling="auto"
          class="c-pc-risk-confirm-letter__content__preview-agreement-pdf"
          :src="curPreviewAgreement.src"
        ></iframe>
      </section>
      <div class="c-pc-risk-confirm-letter__button-wrapper">
        <div
          class="c-pc-risk-confirm-letter__button c-pc-risk-confirm-letter__button--back"
          @click="resetRiskConfirmLetterRenderMode"
        >
          {{ $lang('base.back') }}
        </div>
      </div>
    </section>
    <!-- "不同意"的提示 -->
    <section v-show="riskConfirmLetterRenderMode === RiskConfirmLetterRenderMode.DisagreeTips">
      <section
        class="c-pc-risk-confirm-letter__content__disagree-tips"
        :style="contentWrapperStyle"
      >
        <img
          src="./img/no-agree.png"
          alt=""
        />
        <div class="c-pc-risk-confirm-letter__content__disagree-tips-text">
          {{ $lang('risk.confirm.letter.disagreeTips1') }}
        </div>
        <div class="c-pc-risk-confirm-letter__content__disagree-tips-text">
          {{ $lang('risk.confirm.letter.disagreeTips2') }}
        </div>
      </section>
      <div class="c-pc-risk-confirm-letter__button-wrapper">
        <div
          class="c-pc-risk-confirm-letter__button c-pc-risk-confirm-letter__button--viewAgreement"
          @click="resetRiskConfirmLetterRenderMode"
        >
          {{ $lang('risk.confirm.letter.viewAgreement') }}
        </div>
      </div>
    </section>
    <!-- 默认展示 -->
    <section v-show="riskConfirmLetterRenderMode === RiskConfirmLetterRenderMode.Default">
      <section class="c-pc-risk-confirm-letter__content-wrapper">
        <div
          v-if="viewerRiskConfirmInfo"
          v-html="viewerRiskConfirmInfo.content"
          ref="RiskConfirmLetterContentRef"
          class="c-pc-risk-confirm-letter__content"
          :style="contentWrapperStyle"
          @scroll="onRiskConfirmLetterContentRefScroll"
        ></div>
        <div class="c-pc-risk-confirm-letter__content-bottom">
          <div class="c-pc-risk-confirm-letter__content-bottom-line"></div>
          <div
            v-if="
              viewerRiskConfirmInfo.confirmConditionType === FinanceRiskConfirmConditionType.ALL
            "
            class="c-pc-risk-confirm-letter__content-bottom-tips"
          >
            {{ $lang('risk.confirm.letter.readAll.tips') }}
          </div>
        </div>
      </section>
      <section class="c-pc-risk-confirm-letter__button-wrapper">
        <div
          class="c-pc-risk-confirm-letter__button c-pc-risk-confirm-letter__button--disagree"
          @click="handleDisagreeRiskConfirm"
        >
          {{ $lang('risk.confirm.letter.disagree') }}
        </div>
        <div
          class="c-pc-risk-confirm-letter__button c-pc-risk-confirm-letter__button--agree"
          :class="{
            'c-pc-risk-confirm-letter__button--disabled': !agreeBtnEnabled,
          }"
          @click="handleAgreeRiskConfirm"
        >
          {{ agreeBtnText }}
        </div>
      </section>
    </section>
  </pc-dialog>
</template>

<script lang="ts" setup>
import { FinanceRiskConfirmConditionType } from '@polyv/live-watch-sdk';
import { computed, nextTick, ref, watch } from 'vue';
import { translate } from '@/assets/lang';

import PcDialog, { DialogInstance } from '@/components/common-base/dialog/pc-dialog';
import { useRiskConfirmLetterHook, RiskConfirmLetterRenderMode } from './use-risk-confirm-letter';

const {
  dialogVisible,
  viewerRiskConfirmInfo,
  curPreviewAgreement,

  riskConfirmLetterRenderMode,
  contentWrapperStyle,

  RiskConfirmLetterContentRef,
  onRiskConfirmLetterContentRefScroll,

  agreeBtnEnabled,
  agreeBtnText,

  resetRiskConfirmLetterRenderMode,
  handleAgreeRiskConfirm,
  handleDisagreeRiskConfirm,
} = useRiskConfirmLetterHook();

const dialogInstance = ref<DialogInstance>();

const dialogTitle = computed(() => {
  return viewerRiskConfirmInfo.value?.popupTitle || translate('risk.confirm.letter.title');
});

watch(
  () => riskConfirmLetterRenderMode.value,
  () => {
    nextTick(() => {
      dialogInstance.value?.resetPosition();
    });
  },
);
</script>

<style lang="scss">
$--finance-primary-text-color: rgb(208, 172, 82);
$--finance-primary-bg-color: rgb(217, 186, 108);

// 预览协议
.c-pc-risk-confirm-letter__content__preview-agreement {
  padding: 20px 0;
  margin: 4px;
}
.c-pc-risk-confirm-letter__content__preview-agreement-title {
  padding-bottom: 16px;
  overflow: hidden;
  font-size: 18px;
  font-weight: 600;
  color: $--font-color-primary;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.c-pc-risk-confirm-letter__content__preview-agreement-pdf {
  width: 100%;
  height: 400px;
  border: 0;
}

// "不同意"的提示
.c-pc-risk-confirm-letter__content__disagree-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  margin: 4px;
  img {
    width: 120px;
    height: 120px;
  }
}
.c-pc-risk-confirm-letter__content__disagree-tips-text {
  font-size: 14px;
  line-height: 1.5;
  color: #9e9e9e;
  text-align: center;
  word-break: break-all;
}

// 默认展示
.c-pc-risk-confirm-letter__content-wrapper {
  position: relative;
  margin-top: 24px;
  margin-bottom: 16px;
}
.c-pc-risk-confirm-letter__content {
  padding: 0 16px 4px 16px;
  margin: 0 4px 16px 4px;
  overflow: auto;
  font-size: 14px;
  line-height: 1.5;
  color: #757575;
  word-break: break-all;
  cursor: default;

  @include scrollbar(#cfd8dc, 5px, 10px);

  a {
    color: $--finance-primary-text-color;
    text-decoration: none;
    cursor: pointer;
  }
}

.c-pc-risk-confirm-letter__content-bottom {
  position: relative;
  width: 100%;
}
// 分割线
.c-pc-risk-confirm-letter__content-bottom-line {
  position: absolute;
  top: -30px;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 16px;
  background: linear-gradient(0deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
}
.c-pc-risk-confirm-letter__content-bottom-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #757575;
}

// 共用按钮
.c-pc-risk-confirm-letter__button-wrapper {
  display: flex;
  justify-content: center;
  padding: 0 24px 24px 24px;
  background: $--color-white;
}
.c-pc-risk-confirm-letter__button {
  box-sizing: border-box;
  width: 84px;
  height: 32px;
  font-size: 14px;
  line-height: 32px;
  color: $--color-white;

  text-align: center;
  cursor: pointer;
  background: $--finance-primary-bg-color;
  border-radius: 455.23px;

  &--disabled {
    color: #9e9e9e;
    cursor: not-allowed;
    background-color: #e9ecee;
  }
}
.c-pc-risk-confirm-letter__button--disagree {
  margin-right: 16px;
  color: $--font-color-primary;
  background: $--color-white;
  border: 1px solid rgba(51, 51, 51, 0.2);
}
.c-pc-risk-confirm-letter__button--back,
.c-pc-risk-confirm-letter__button--viewAgreement {
  width: 158px;
}
</style>
