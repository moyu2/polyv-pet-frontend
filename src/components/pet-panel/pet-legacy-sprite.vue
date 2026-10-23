<template>
  <div
    class="pet-legacy-sprite"
    :class="rootClass"
  >
    <!--
      形象资源（技术方案 §7.3）：/assets/pets/{species}/{stageDir}/{state}.svg，
      由 public/assets/pets/manifest.json 约定（512×512、透明背景）。
      状态：idle 待机 / eat 进食 / happy 开心（进化）/ hungry 饥饿（饱食度低）。
      资源缺失时回退到内置 SVG 占位形象。
    -->
    <img
      v-if="activeAssetSrc"
      :key="activeAssetSrc"
      class="pet-legacy-sprite__body pet-legacy-sprite__asset"
      :class="`is-${currentState}`"
      :src="activeAssetSrc"
      :alt="`${species}-${stage}-${currentState}`"
      draggable="false"
      @error="onAssetError"
    />

    <!-- 进食食物特效（{species}-food.svg） -->
    <img
      v-if="activeAssetSrc && animation === 'eat'"
      class="pet-legacy-sprite__fx pet-legacy-sprite__fx-food"
      :src="`${assetBase}assets/pets/effects/${species}-food.svg`"
      alt=""
      draggable="false"
    />

    <!-- 进化特效：从蛋/幼体孵化用 hatching，其余进化用 evolution -->
    <img
      v-if="activeAssetSrc && animation === 'evolve'"
      class="pet-legacy-sprite__fx pet-legacy-sprite__fx-evolve"
      :src="`${assetBase}assets/pets/effects/${stage === 'egg' ? 'hatching' : 'evolution'}.svg`"
      alt=""
      draggable="false"
    />

    <!-- ===== 以下为内置 SVG 占位形象（资源缺失时的回退） ===== -->

    <!-- 宠物蛋：蛋壳 + 轻微摇动（技术方案 §7.1） -->
    <svg
      v-if="!activeAssetSrc && stage === 'egg'"
      class="pet-legacy-sprite__body pet-legacy-sprite__egg"
      viewBox="0 0 120 140"
    >
      <defs>
        <radialGradient
          id="petEggGrad"
          cx="38%"
          cy="30%"
          r="75%"
        >
          <stop
            offset="0%"
            stop-color="#fffdf5"
          />
          <stop
            offset="70%"
            stop-color="#ffe9c9"
          />
          <stop
            offset="100%"
            stop-color="#f7c87a"
          />
        </radialGradient>
      </defs>
      <ellipse
        cx="60"
        cy="76"
        rx="42"
        ry="52"
        fill="url(#petEggGrad)"
        stroke="#e8a94e"
        stroke-width="3"
      />
      <ellipse
        cx="45"
        cy="52"
        rx="10"
        ry="14"
        fill="#fff8e8"
        opacity="0.9"
      />
      <ellipse
        cx="72"
        cy="96"
        rx="9"
        ry="7"
        fill="#f3b96b"
        opacity="0.7"
      />
      <ellipse
        cx="49"
        cy="102"
        rx="6"
        ry="5"
        fill="#f3b96b"
        opacity="0.5"
      />
      <ellipse
        cx="76"
        cy="58"
        rx="5"
        ry="7"
        fill="#f3b96b"
        opacity="0.5"
      />
    </svg>

    <!-- 幼宠：小史莱姆（占位） -->
    <svg
      v-if="!activeAssetSrc && stage === 'juvenile'"
      class="pet-legacy-sprite__body pet-legacy-sprite__juvenile"
      viewBox="0 0 140 130"
    >
      <defs>
        <radialGradient
          id="petJuvGrad"
          cx="38%"
          cy="28%"
          r="80%"
        >
          <stop
            offset="0%"
            stop-color="#d9ffe2"
          />
          <stop
            offset="65%"
            stop-color="#8fe8a8"
          />
          <stop
            offset="100%"
            stop-color="#58c47c"
          />
        </radialGradient>
      </defs>
      <path
        d="M20 105 C18 58 42 22 70 22 C98 22 122 58 120 105 C120 114 110 118 70 118 C30 118 20 114 20 105 Z"
        fill="url(#petJuvGrad)"
        stroke="#3f9e63"
        stroke-width="3"
      />
      <ellipse
        cx="52"
        cy="72"
        rx="9"
        ry="11"
        fill="#2c4a38"
      />
      <ellipse
        cx="88"
        cy="72"
        rx="9"
        ry="11"
        fill="#2c4a38"
      />
      <circle
        cx="55"
        cy="68"
        r="3"
        fill="#fff"
      />
      <circle
        cx="91"
        cy="68"
        r="3"
        fill="#fff"
      />
      <path
        d="M56 92 Q70 104 84 92"
        stroke="#2c4a38"
        stroke-width="4"
        fill="none"
        stroke-linecap="round"
      />
      <ellipse
        cx="36"
        cy="90"
        rx="7"
        ry="5"
        fill="#ff9db0"
        opacity="0.55"
      />
      <ellipse
        cx="104"
        cy="90"
        rx="7"
        ry="5"
        fill="#ff9db0"
        opacity="0.55"
      />
    </svg>

    <!-- 成宠：大史莱姆 + 王冠（占位） -->
    <svg
      v-if="!activeAssetSrc && stage === 'adult'"
      class="pet-legacy-sprite__body pet-legacy-sprite__adult"
      viewBox="0 0 150 150"
    >
      <defs>
        <radialGradient
          id="petAdultGrad"
          cx="38%"
          cy="26%"
          r="80%"
        >
          <stop
            offset="0%"
            stop-color="#e4f0ff"
          />
          <stop
            offset="60%"
            stop-color="#8ec2ff"
          />
          <stop
            offset="100%"
            stop-color="#5a92e8"
          />
        </radialGradient>
      </defs>
      <path
        d="M18 122 C14 62 44 20 75 20 C106 20 136 62 132 122 C132 132 120 137 75 137 C30 137 18 132 18 122 Z"
        fill="url(#petAdultGrad)"
        stroke="#3d6fc4"
        stroke-width="3"
      />
      <path
        d="M55 22 L62 6 L75 18 L88 6 L95 22 Z"
        fill="#ffd75e"
        stroke="#d9a627"
        stroke-width="2.5"
      />
      <circle
        cx="62"
        cy="6"
        r="2.5"
        fill="#ff8f5e"
      />
      <circle
        cx="88"
        cy="6"
        r="2.5"
        fill="#ff8f5e"
      />
      <ellipse
        cx="56"
        cy="76"
        rx="10"
        ry="12"
        fill="#1f3a5f"
      />
      <ellipse
        cx="94"
        cy="76"
        rx="10"
        ry="12"
        fill="#1f3a5f"
      />
      <circle
        cx="59"
        cy="71"
        r="3.5"
        fill="#fff"
      />
      <circle
        cx="97"
        cy="71"
        r="3.5"
        fill="#fff"
      />
      <path
        d="M60 98 Q75 112 90 98"
        stroke="#1f3a5f"
        stroke-width="4.5"
        fill="none"
        stroke-linecap="round"
      />
      <ellipse
        cx="36"
        cy="96"
        rx="8"
        ry="6"
        fill="#ff9db0"
        opacity="0.55"
      />
      <ellipse
        cx="114"
        cy="96"
        rx="8"
        ry="6"
        fill="#ff9db0"
        opacity="0.55"
      />
    </svg>

    <!-- 进食时的食物粒子（仅占位模式） -->
    <div
      v-if="!activeAssetSrc && animation === 'eat'"
      class="pet-legacy-sprite__crumbs"
    >
      <span
        v-for="i in 6"
        :key="i"
        :style="crumbStyle(i)"
      />
    </div>

    <!-- 进化光效（仅占位模式） -->
    <div
      v-if="!activeAssetSrc && animation === 'evolve'"
      class="pet-legacy-sprite__aura"
    >
      <span
        v-for="i in 8"
        :key="i"
        :style="starStyle(i)"
        >✦</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

// 宠物资源与观看页部署在同一路径，避免误取同域其他项目的 /assets。
const assetBase = process.env.VUE_APP_PUBLIC_PATH || '/';

const props = defineProps<{
  stage: 'egg' | 'juvenile' | 'adult';
  /** 由服务端保存并下发的宠物物种 */
  species?: string;
  animation?: '' | 'eat' | 'evolve';
  /** 饱食度：低于阈值时常态显示饥饿形象 */
  satiety?: number;
}>();

/** manifest.json 的 backendStage → 资源目录名映射 */
const STAGE_DIRS: Record<string, Record<string, string>> = {
  dog: { egg: 'puppy', juvenile: 'juvenile', adult: 'adult' },
  chicken: { egg: 'egg', juvenile: 'chick', adult: 'adult' },
};

/** 饥饿阈值：饱食度低于该值时常态使用 hungry 形象 */
const HUNGRY_SATIETY = 30;

const species = computed(() => props.species || 'dog');

/** 当前展示状态：动画 > 饥饿 > 待机。 */
const currentState = computed<'idle' | 'eat' | 'happy' | 'hungry'>(() => {
  if (props.animation === 'eat') {
    return 'eat';
  }
  if (props.animation === 'evolve') {
    return 'happy';
  }
  if ((props.satiety ?? 100) < HUNGRY_SATIETY) {
    return 'hungry';
  }
  return 'idle';
});

const assetSrc = computed(() => {
  const stageDir = STAGE_DIRS[species.value]?.[props.stage];
  if (!stageDir) {
    return '';
  }
  return `${assetBase}assets/pets/${species.value}/${stageDir}/${currentState.value}.svg`;
});

/** 探测失败（404/损坏）时回退占位 SVG；物种/阶段变化后重新探测。 */
const failedSrcs = ref<string[]>([]);

const activeAssetSrc = computed(() =>
  assetSrc.value && !failedSrcs.value.includes(assetSrc.value) ? assetSrc.value : '',
);

function onAssetError() {
  if (assetSrc.value) {
    failedSrcs.value = [...failedSrcs.value, assetSrc.value];
  }
}

watch(
  () => [props.stage, props.species],
  () => {
    failedSrcs.value = [];
  },
);

const rootClass = computed(() => [
  `pet-legacy-sprite--${props.stage}`,
  props.animation ? `pet-legacy-sprite--${props.animation}` : '',
  activeAssetSrc.value ? 'has-asset' : '',
]);

function crumbStyle(i: number) {
  const left = 30 + (i % 3) * 20;
  const delay = (i % 3) * 0.12;
  const duration = 0.9 + (i % 2) * 0.25;
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
}

function starStyle(i: number) {
  const angle = (i / 8) * 360;
  return {
    transform: `rotate(${angle}deg) translateY(-46px)`,
    animationDelay: `${i * 0.07}s`,
  };
}
</script>

<style lang="scss">
.pet-legacy-sprite {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 132px;
  height: 132px;
  filter: drop-shadow(0 8px 10px rgba(80, 50, 10, 0.18));

  &__body {
    width: 100%;
    height: 100%;
  }

  &__asset {
    user-select: none;
    transform-origin: 50% 90%;
    object-fit: contain;

    /* 资源模式状态动画 */
    &.is-idle {
      animation: pet-asset-idle 3s ease-in-out infinite;
    }

    &.is-eat {
      animation: pet-asset-eat 0.5s ease-in-out 3;
    }

    &.is-happy {
      animation: pet-asset-happy 0.6s ease-in-out 4;
    }

    &.is-hungry {
      animation: pet-asset-hungry 2.8s ease-in-out infinite;
    }
  }

  /* 特效层：食物 / 进化 */
  &__fx {
    position: absolute;
    pointer-events: none;
    user-select: none;
  }

  &__fx-food {
    right: -6%;
    bottom: 6%;
    width: 42%;
    height: 42%;
    animation: pet-fx-pop 0.8s ease-in-out 2;
  }

  &__fx-evolve {
    top: 50%;
    left: 50%;
    width: 150%;
    height: 150%;
    transform: translate(-50%, -50%);
    animation: pet-fx-evolve 1.2s ease-in-out 2;
  }

  /* ===== 占位模式动画（资源缺失回退时） ===== */
  &__egg {
    transform-origin: 50% 92%;
    animation: pet-egg-sway 3.2s ease-in-out infinite;
  }

  &__juvenile {
    transform-origin: 50% 100%;
    animation: pet-breathe 2.4s ease-in-out infinite;
  }

  &__adult {
    transform-origin: 50% 100%;
    animation: pet-breathe 3s ease-in-out infinite;
  }

  &--eat &__body {
    animation: pet-eat 0.45s ease-in-out 3;
  }

  &__crumbs {
    position: absolute;
    top: 18%;
    left: 0;
    width: 100%;
    height: 60%;
    pointer-events: none;

    span {
      position: absolute;
      width: 9px;
      height: 9px;
      background: #ffb559;
      border-radius: 3px;
      animation: pet-crumb-fall 1s ease-in forwards;
    }
  }

  &--evolve &__body {
    animation: pet-evolve 0.8s ease-in-out 3;
  }

  &__aura {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    span {
      position: absolute;
      font-size: 18px;
      color: #ffd75e;
      text-shadow: 0 0 8px #ffe9a3;
      animation: pet-star 0.8s ease-out forwards;
    }
  }
}

@keyframes pet-asset-idle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4%);
  }
}

@keyframes pet-asset-eat {
  0%,
  100% {
    transform: scaleY(1);
  }
  35% {
    transform: scaleY(0.86) scaleX(1.08);
  }
  70% {
    transform: scaleY(1.06) scaleX(0.96);
  }
}

@keyframes pet-asset-happy {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  30% {
    transform: translateY(-9%) scale(1.04);
  }
  60% {
    transform: translateY(0) scale(0.98);
  }
}

@keyframes pet-asset-hungry {
  0%,
  100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}

@keyframes pet-fx-pop {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes pet-fx-evolve {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5) rotate(-8deg);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.15) rotate(8deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.3) rotate(-4deg);
  }
}

@keyframes pet-egg-sway {
  0%,
  100% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(4deg);
  }
}

@keyframes pet-breathe {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.94) scaleX(1.04);
  }
}

@keyframes pet-eat {
  0%,
  100% {
    transform: scaleY(1);
  }
  35% {
    transform: scaleY(0.82) scaleX(1.1);
  }
  70% {
    transform: scaleY(1.08) scaleX(0.95);
  }
}

@keyframes pet-crumb-fall {
  0% {
    opacity: 1;
    transform: translateY(-6px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(64px) scale(0.4);
  }
}

@keyframes pet-evolve {
  0%,
  100% {
    filter: brightness(1);
    transform: scale(1);
  }
  40% {
    filter: brightness(1.9) saturate(1.4);
    transform: scale(1.12);
  }
}

@keyframes pet-star {
  0% {
    opacity: 0;
    transform-origin: center;
    scale: 0.3;
  }
  35% {
    opacity: 1;
    scale: 1.2;
  }
  100% {
    opacity: 0;
    scale: 0.6;
  }
}
</style>
