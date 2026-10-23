<!-- @file 移动端频道错误信息组件 -->

<template>
  <div
    class="c-page-error-mobile-default"
    :class="{
      'c-page-error-mobile-default--full': isDisallowMobileWatch,
    }"
  >
    <div
      v-if="isDisallowMobileWatch"
      class="c-page-error-mobile-default__disallow"
    >
      <h1 class="c-page-error-mobile-default__disallow__title">{{ $lang('base.warmTips') }}</h1>
      <div class="c-page-error-mobile-default__disallow__content-wrap">
        <div class="c-page-error-mobile-default__disallow__content">
          <div class="c-page-error-mobile-default__disallow__content-icon"></div>
          <p>{{ $lang('pageError.disallow.mobile.watch') }}</p>
          <p class="c-page-error-mobile-default__disallow__content-link">{{ watchLink }}</p>
        </div>
      </div>
    </div>

    <div v-else>
      <div
        class="c-page-error-mobile-default__img"
        :class="{
          'c-page-error-mobile-default__img-auth': isAuthError,
          'c-page-error-mobile-default__img-not-exist': isNotExistError,
          'c-page-error-mobile-default__img-not-found': isNotFoundError || isWorkWechatError,
        }"
      ></div>
      <h1
        v-if="pageError.title"
        class="c-page-error-mobile-default__title"
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
        class="c-page-error-mobile-default__reloadBtn"
        @click="reloadPage"
      >
        {{ $lang('base.reload') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { usePageErrorHook } from './use-page-error';

const {
  pageError,

  isDisallowMobileWatch,
  isAuthError,
  isNotExistError,
  isWorkWechatError,
  isNotFoundError,

  reloadPage,
} = usePageErrorHook();

const watchLink = computed(() => {
  return window.location.href;
});
</script>

<style lang="scss">
.c-page-error-mobile-default {
  position: absolute;
  top: 50%;
  left: 50%;
  text-align: center;
  transform: translate(-50%, -50%);
}
.c-page-error-mobile-default--full {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: none;
}

.c-page-error-mobile-default__img {
  width: 310px;
  height: 242px;
  margin: 0 auto 60px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
.c-page-error-mobile-default__img-auth {
  background-image: url(./images/error-auth.png);
}
.c-page-error-mobile-default__img-not-exist {
  background-image: url(./images/error-noExist.png);
}
.c-page-error-mobile-default__img-not-found {
  background-image: url(./images/error-404.png);
}

.c-page-error-mobile-default__title {
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

.c-page-error-mobile-default__disallow {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #e9ebf5;
}
.c-page-error-mobile-default__disallow__title {
  font-size: 16px;
  line-height: 50px;
  color: #263238;
  background: #fff;
  border-bottom: 1px solid #cfd8dc;
}
.c-page-error-mobile-default__disallow__content-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 50px;
}
.c-page-error-mobile-default__disallow__content {
  max-width: 90%;
  font-size: 14px;
  line-height: 1.4;
  color: #455a64;

  p {
    margin: 10px 0;
  }
}
.c-page-error-mobile-default__disallow__content-icon {
  width: 85px;
  height: 95px;
  margin: 0 auto;
  background-image: url(./images/tip-icon.png);
  background-repeat: no-repeat;
  background-size: 285px 100px;
}
.c-page-error-mobile-default__disallow__content-link {
  color: #2196f3;
}

.c-page-error-mobile-default__reloadBtn {
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
