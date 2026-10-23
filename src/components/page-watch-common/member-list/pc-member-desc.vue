<!-- @file PC端 - 在线用户列表信息栏 -->
<template>
  <div>
    <div class="c-pc-member-desc">
      <div>{{ $lang('member.list.viewer.info') }}</div>
      <div @click="showRulePopup">{{ $lang('member.list.rule') }}</div>
    </div>
    <!-- 规则弹窗 -->
    <pc-dialog
      :visible.sync="visible"
      :title="$lang('member.popup.title')"
      class="c-pc-member-desc__dialog"
    >
      <div class="c-pc-member-desc__dialog__item">
        <h2>{{ $lang('member.list.rule.one') }}</h2>
        <div>
          {{ $lang('member.list.rule.text1') }}
        </div>
      </div>
      <div class="c-pc-member-desc__dialog__item">
        <h2>{{ $lang('member.list.rule.two') }}</h2>
        <div>
          {{ $lang('member.list.rule.text2') }}
        </div>
      </div>
    </pc-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';

const visible = ref(false);

function showRulePopup() {
  visible.value = true;
}
</script>

<style lang="scss">
.c-pc-member-desc {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px;
  padding: 0 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  background: #202127;
  & > div:last-child {
    cursor: pointer;
  }
}
.c-pc-member-desc__dialog {
  .c-pc-dialog__content {
    width: 400px !important;
    border-radius: 4px;
  }
  .c-pc-dialog__body {
    padding: 17px 16px 54px;
  }
  .c-pc-member-desc__dialog__item {
    margin-bottom: 32px;
    &:last-child {
      margin-bottom: 0;
    }
    & > h2 {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.8);
    }
    & > div {
      margin-top: 12px;
      font-size: 12px;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}
</style>
