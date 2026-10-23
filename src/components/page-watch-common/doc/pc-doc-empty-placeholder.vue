<!-- @file 控制台占位图 -->
<template>
  <div class="c-pc-doc__empty-placeholder">
    <img src="./imgs/player-ppt.png" />
  </div>
</template>

<style lang="scss">
.c-pc-doc__empty-placeholder {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  background: #2b3045;
  img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
