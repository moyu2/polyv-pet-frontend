<template>
  <plv-popper
    v-if="hasPaintAuth && mainScreen === MainScreenContent.Doc"
    :content="$lang('doc.enterPaint')"
    placement="left"
    trigger="hover"
    popper-class-name="c-pc-doc-paint-switch__tips"
  >
    <div
      class="c-pc-doc-paint-switch"
      :class="{
        'c-pc-doc-paint-switch--exit': paintMode,
      }"
      slot="reference"
      @click="onClickSwitch"
    ></div>
  </plv-popper>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { PlvPopper } from '@/plugins/polyv-ui/admin-import';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { unref } from 'vue';
import { MainScreenContent } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';

const { getWatchCore } = useGlobalInject();

const { paintMode, hasPaintAuth } = storeDefinitionToRefs(useDocStore);

const { mainScreen } = storeDefinitionToRefs(useLayoutStore);

function onClickSwitch() {
  const watchCore = getWatchCore();

  if (unref(paintMode)) {
    watchCore.doc.exitPaintMode();
  } else {
    watchCore.doc.enterPaintMode();
  }
}
</script>

<style lang="scss">
.c-pc-doc-paint-switch {
  position: absolute;
  right: 20px;
  bottom: 70px;
  z-index: 6;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-image: url(../imgs/btn-paint.png);
  background-size: contain;

  &.c-pc-doc-paint-switch--exit {
    background-image: url(../imgs/btn-exit.png);
    &:hover {
      background-image: url(../imgs/btn-exit-hover.png);
    }
  }
}

.c-pc-doc-paint-switch__tips {
  color: #fff;
  background-color: #000000;
  border-color: #000000;
  border-radius: 4px;
  .popper__arrow {
    border-left-color: #000000 !important;

    &:after {
      border-left-color: #000000 !important;
    }
  }
}
</style>
