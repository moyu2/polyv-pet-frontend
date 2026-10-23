<!-- @file 公共-风险测评-更改测评时机提示弹窗 -->
<template>
  <mobile-dialog
    class="c-risk-evaluation-redirect-dialog"
    :visible="dialogVisible"
    :content-style="dialogContentStyle"
    :close-on-click-mask="false"
    :closable="false"
    :show-header="false"
    :show-footer="false"
  >
    <div class="c-risk-evaluation-redirect-dialog__content-wrapper">
      <div class="c-risk-evaluation-redirect-dialog-wrapper__content">
        <p>
          管理员已更改风险测评时机，<span>{{ countDownTime }}s </span>
          后将进入测评
        </p>
      </div>
      <button
        class="c-risk-evaluation-redirect-dialog__redirect-button"
        @click="handleRedirect"
      >
        去测评
      </button>
    </div>
  </mobile-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MobileDialog from '@/components/common-base/dialog/mobile-dialog/mobile-dialog.vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

/** 默认倒计时时长 */
const DEFAULT_COUNT_DOWN_TIME = 5;

const dialogContentStyle = {
  width: '280px',
  height: '168px',
  overflow: 'hidden',
};

const dialogVisible = ref(false);
/** 当前倒计时时长 */
const countDownTime = ref(DEFAULT_COUNT_DOWN_TIME);

/** 重定向钩子 */
function handleRedirect() {
  dialogVisible.value = false;
  setTimeout(() => {
    countDownTime.value = DEFAULT_COUNT_DOWN_TIME;
    location.reload();
  }, 300);
}

/** 倒计时钩子 */
function handleCountDown() {
  const timerFunc = () => {
    setTimeout(() => {
      countDownTime.value -= 1;
      if (countDownTime.value === 0) {
        handleRedirect();
      } else {
        timerFunc();
      }
    }, 1000);
  };
  timerFunc();
}

const { getEmitter } = useGlobalInject();

// 展示跳转弹窗
useEventBusListener(appEvents.finance.RiskEvaluationRedirectDialogShow, () => {
  getEmitter().emit(appEvents.finance.RiskEvaluationMainDialogHidden);

  dialogVisible.value = true;
  handleCountDown();
});
</script>

<style lang="scss">
.c-risk-evaluation-redirect-dialog__content-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 24px 12px;
}

.c-risk-evaluation-redirect-dialog-wrapper__content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  p {
    font-size: 16px;
    line-height: 24px;
    color: #333333;
    text-align: center;
  }
}
.c-risk-evaluation-redirect-dialog__redirect-button {
  width: 100px;
  height: 32px;

  font-size: 14px;
  line-height: 32px;
  color: #ffffff;
  cursor: pointer;
  background: #d9ba6c;

  border-radius: 16px;
}
</style>
