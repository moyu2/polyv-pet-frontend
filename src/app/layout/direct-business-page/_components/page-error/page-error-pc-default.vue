<!-- @file PC 端频道错误信息组件 -->

<template>
  <div class="c-page-error-pc-default">
    <div
      class="c-page-error-pc-default__img"
      :class="{
        'c-page-error-pc-default__img-auth': isAuthError,
        'c-page-error-pc-default__img-not-exist': isNotExistError,
        'c-page-error-pc-default__img-not-found': isNotFoundError || isWorkWechatError,
      }"
    ></div>
    <h1
      v-if="pageError.title"
      class="c-page-error-pc-default__title"
    >
      {{ pageError.title }}
    </h1>
    <p
      v-if="pageError.desc"
      class="c-channel-err__desc"
    >
      {{ pageError.desc }}
    </p>
    <button
      v-if="pageError.reloadBtnVisible"
      class="c-page-error-pc-default__reloadBtn"
      @click="reloadPage"
    >
      {{ $lang('base.reload') }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { usePageErrorHook } from './use-page-error';

const {
  pageError,

  isAuthError,
  isNotExistError,
  isNotFoundError,
  isWorkWechatError,

  reloadPage,
} = usePageErrorHook();
</script>

<style lang="scss">
.c-page-error-pc-default {
  position: fixed;
  top: 50%;
  left: 50%;
  text-align: center;
  transform: translate(-50%, -50%);
}

.c-page-error-pc-default__img {
  width: 310px;
  height: 242px;
  margin: 0 auto 60px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
.c-page-error-pc-default__img-auth {
  background-image: url(./images/error-auth.png);
}
.c-page-error-pc-default__img-not-exist {
  background-image: url(./images/error-noExist.png);
}
.c-page-error-pc-default__img-not-found {
  background-image: url(./images/error-404.png);
}

.c-page-error-pc-default__title {
  margin-bottom: 18px;
  font-size: 22px;
  line-height: 1.3;
  color: #000000;
}
.c-channel-err__desc {
  font-size: 18px;
  line-height: 1.4;
  color: #8b8b8b;
}

.c-page-error-pc-default__reloadBtn {
  width: 184px;
  height: 46px;
  margin-top: 18px;
  font-size: 18px;
  color: #fff;
  cursor: pointer;
  background-color: #02d2fd;
  border: 0;
  border-radius: 28px;
  outline: none;
}
</style>
