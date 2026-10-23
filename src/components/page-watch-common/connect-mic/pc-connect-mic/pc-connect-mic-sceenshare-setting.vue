<!-- @file PC 端连麦屏幕共享设置 -->
<template>
  <pc-dialog
    class="c-pc-connect-mic-screenshare-setting"
    :visible.sync="visible"
    :title="$lang('connectMic.screenshare.settingTitle')"
  >
    <div class="c-pc-connect-mic-screenshare-setting__content">
      <form-wrap
        :form-data="formData"
        :label-width="100"
      >
        <!-- 屏幕共享模式 -->
        <form-item
          form-field="screenShareMode"
          :label="$lang('connectMic.screenshare.mode')"
        >
          <pc-form-select
            v-model="formData.screenShareMode"
            :options="modeOptions"
          />
        </form-item>

        <!-- 混音开关 -->
        <form-item
          form-field="audioMixEnabled"
          :label="$lang('connectMic.screenshare.audioMixEnabled')"
        >
          <pc-form-select
            v-model="formData.audioMixEnabled"
            :options="audioMixOptions"
          />
        </form-item>
      </form-wrap>

      <plv-tips>
        <p>1. {{ $lang('connectMic.screenshare.tips1') }}</p>
        <p>2. {{ $lang('connectMic.screenshare.tips2') }}</p>
        <p>3. {{ $lang('connectMic.screenshare.tips3') }}</p>
        <p>4. {{ $lang('connectMic.screenshare.tips4') }}</p>
      </plv-tips>

      <div class="c-pc-connect-mic-screenshare-setting__button">
        <normal-button
          class="c-pc-connect-mic-screenshare-setting__button__item"
          :text="$lang('base.confirm')"
          :size="ButtonSize.Small"
          @click="setScreenShareConfig"
        />
        <normal-button
          class="c-pc-connect-mic-screenshare-setting__button__item"
          :text="$lang('base.cancel')"
          :size="ButtonSize.Small"
          :type="ButtonType.Cancel"
          @click="closeSetting"
        />
      </div>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import PcFormSelect from '@/components/common-base/form/form-select/pc-form-select.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import { PlvTips } from '@/plugins/polyv-ui/admin-import';
import { useConnectMicScreenShareSetting } from '../hooks/use-connect-mic-screen-share';

const { visible, closeSetting, formData, modeOptions, audioMixOptions, setScreenShareConfig } =
  useConnectMicScreenShareSetting();
</script>

<style lang="scss">
.c-pc-connect-mic-screenshare-setting__content {
  padding: 24px 40px;
}
.c-pc-connect-mic-screenshare-setting__button {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.c-pc-connect-mic-screenshare-setting__button__item {
  margin: 0 8px;
}
</style>
