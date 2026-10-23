<template>
  <pwc-reward-receive-popup
    :receive-data="receiveData"
    :submit-action="submitTaskReceive"
  />
</template>

<script setup lang="ts">
import { PwcRewardReceivePopup } from '@polyv/vue-components';
import { useTaskRewardReceive } from './hooks/use-task-reward-receive';

const { receiveData, submitTaskReceive } = useTaskRewardReceive();
</script>

<style lang="scss">
.c-mobile-task-reward-receive__body {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 12px;
}
.c-mobile-task-reward-receive__content {
  flex: 1;
  overflow: auto;
}

.c-mobile-task-reward-receive__form-item {
  display: flex;
  align-items: flex-start;
}
.c-mobile-task-reward-receive__form-item__label {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 94px;
  min-height: 50px;
  padding: 0 12px;
}

.c-mobile-task-reward-receive__form-item--required {
  .c-mobile-task-reward-receive__form-item__label::before {
    color: red;
    content: '*';
  }
}

.c-mobile-task-reward-receive__form-item__content {
  flex: 1;
  border-bottom: 1px solid #ddd;

  .c-mobile-form-area-picker__body {
    background: none;
    border: none;
  }
  .c-mobile-form-area-picker__body__input {
    padding-left: 0 !important;
    font-size: 14px;
  }
}

.c-mobile-task-reward-receive__form-item__input {
  display: flex;
  width: 100%;
  height: 50px;
  border: none;
  outline: none;
}
.c-mobile-task-reward-receive__form-item__textarea {
  display: flex;
  width: 100%;
  padding-top: 15px;
  border: none;
  outline: none;
}

.c-mobile-task-reward-receive__submit {
  padding: 24px;
}

.c-mobile-task-reward-receive__qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    width: 200px;
    height: 200px;
  }
}
.c-mobile-task-reward-receive__qrcode__tips {
  padding: 0 12px;
  margin-top: 12px;
  font-size: 16px;
}

.c-mobile-task-reward-receive__body--readonly {
  .c-mobile-task-reward-receive__form-item__label {
    align-items: flex-start;
  }
  .c-mobile-task-reward-receive__form-item__label,
  .c-mobile-task-reward-receive__form-item__content {
    box-sizing: border-box;
    min-height: 50px;
    padding-top: 14px;
    padding-bottom: 14px;
    line-height: 22px;
  }
}
</style>
