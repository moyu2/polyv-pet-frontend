<template>
  <main class="dog-preview">
    <header data-pet-avoid>
      <span class="dog-preview__eyebrow">积萌研究所 · 本地演示</span>
      <h1>陪伴，也在慢慢长大。</h1>
      <p>每一段成长，都有自己的样子。左键打招呼，右键或长按喂养，也可拖动和换宠物。</p>
    </header>
    <section
      class="dog-preview__growth"
      data-pet-avoid
      aria-label="三阶段成长对比"
    >
      <article
        v-for="(stage, index) in stages"
        :key="stage"
      >
        <pet-canvas
          :stage="stage"
          :species="species"
          :action="action"
          :token="token"
          :look-index="lookIndex"
        />
        <div>
          <span>{{ stageNames[index] }}</span
          ><small>{{ stageDescriptions[index] }}</small>
        </div>
      </article>
    </section>
    <section
      class="dog-preview__controls"
      data-pet-avoid
      aria-label="动作预览"
    >
      <button
        v-for="item in actions"
        :key="item.code"
        type="button"
        :class="{ selected: action === item.code }"
        @click="showAction(item.code)"
      >
        {{ item.name }}
      </button>
      <label v-if="action === 'look'"
        >视线方向
        <input
          v-model.number="lookIndex"
          aria-label="视线方向"
          type="range"
          min="0"
          max="15"
      /></label>
    </section>
    <div
      class="dog-preview__pet-zone"
      aria-label="宠物活动区"
    >
      <span>小伙伴的陪伴位置 · 左键打招呼，右键或长按喂养</span>
    </div>
    <section
      class="dog-preview__watch"
      aria-label="观看页交互预览"
    >
      <div
        class="dog-preview__video"
        data-pet-avoid
      >
        <span>POLYV LIVE</span>
        <h2>好好看直播，让小萌陪着你。</h2>
        <p>左键点击小伙伴打招呼，右键或长按打开喂食栏。</p>
        <div>▶ &nbsp; 直播画面预留区</div>
      </div>
      <aside data-pet-avoid>
        <strong>这次想看哪段成长？</strong
        ><button
          v-for="(stage, index) in stages"
          :key="stage"
          type="button"
          :disabled="store.feeding"
          @click="setStage(stage)"
        >
          {{
            index < 2
              ? `${stageNames[index]} → ${stageNames[index + 1]}`
              : `${stageNames[index]}的日常`
          }}</button
        ><button
          type="button"
          @click="setHungry"
        >
          看看饿肚子的样子
        </button>
        <div class="dog-preview__checks">
          <button
            type="button"
            @click="failNext"
          >
            下次喂养失败</button
          ><button
            type="button"
            @click="repeatNext"
          >
            下次重复响应
          </button>
        </div>
        <small aria-live="polite">{{ note }}</small>
      </aside>
    </section>
    <footer>
      可以把宠物拖到页面任意位置；自己闲逛时会避开直播画面与操作区。手机上默认安静停靠。
    </footer>
    <pet-companion />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PetCanvas from './pet-canvas.vue';
import PetCompanion from './pet-companion.vue';
import type { PetAction, PetStage } from './pet-animation';
import { usePetStore } from './use-pet-store';

const store = usePetStore();
const species = computed(() => store.pet?.species || 'dog');
const stageNames = computed(() =>
  species.value === 'chicken' ? ['宠物蛋', '雏鸡', '母鸡'] : ['幼犬', '少年犬', '成犬'],
);
const stageDescriptions = computed(() =>
  species.value === 'chicken'
    ? ['米白斑点 · 金色星星', '金黄绒毛 · 奶油胸口', '小红冠 · 扇形尾羽']
    : ['瘦小 · 细短腿 · 稚嫩', '匀称 · 结实 · 活泼', '厚实 · 丰满尾巴 · 成熟'],
);
const stages: PetStage[] = ['egg', 'juvenile', 'adult'];
const action = ref<PetAction>('idle');
const token = ref(0);
const lookIndex = ref(0);
const note = ref('演示积分 120，普通口粮 10 分。');
const actions: { code: PetAction; name: string }[] = [
  { code: 'idle', name: '待机' },
  { code: 'walk-right', name: '向右走' },
  { code: 'walk-left', name: '向左走' },
  { code: 'greet', name: '打招呼' },
  { code: 'eat', name: '吃饭' },
  { code: 'happy', name: '开心' },
  { code: 'hungry', name: '饿肚子' },
  { code: 'sleep', name: '睡觉' },
  { code: 'dragged', name: '提起来' },
  { code: 'look', name: '看向你' },
];
function showAction(value: PetAction) {
  action.value = value;
  token.value += 1;
}
function setStage(stage: PetStage) {
  if (!store.pet || store.feeding) return;
  const exp = { egg: 20, juvenile: 90, adult: 120 }[stage];
  store.revision += 1;
  store.pet = {
    ...store.pet,
    stage,
    stageName: stageNames.value[stages.indexOf(stage)],
    exp,
    satiety: 65,
    nextStage: stage === 'egg' ? 'juvenile' : stage === 'juvenile' ? 'adult' : null,
    nextStageExp: stage === 'egg' ? 30 : stage === 'juvenile' ? 100 : null,
    stageProgress: stage === 'egg' ? 2 / 3 : stage === 'juvenile' ? 6 / 7 : null,
  };
  store.balance = '120.00';
  store.toast = '';
  note.value = '右键或长按小伙伴，再喂一份普通口粮，看看成长过程。';
}
function setHungry() {
  if (store.pet) store.pet.satiety = 18;
}
function failNext() {
  sessionStorage.setItem('pet-preview:fail', '1');
  note.value = '下次喂养会返回失败，积分和成长不变。';
}
function repeatNext() {
  sessionStorage.setItem('pet-preview:idempotent', '1');
  note.value = '下次返回重复响应，积分和成长不变，不重播奖励。';
}
</script>

<style lang="scss">
body {
  margin: 0;
  background: #f8f5ef;
}
.dog-preview {
  box-sizing: border-box;
  max-width: 1120px;
  min-height: 100vh;
  padding: 38px 32px 160px;
  margin: auto;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #5b4330;
}
.dog-preview__eyebrow {
  font-size: 12px;
  color: #a1886a;
  letter-spacing: 2px;
}
.dog-preview h1 {
  margin: 14px 0 10px;
  font-size: 34px;
  font-weight: 500;
  letter-spacing: 1px;
}
.dog-preview header p {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: #9b856f;
}
.dog-preview__growth {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 14px 0 22px;
}
.dog-preview__growth article {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.dog-preview__growth .pet-sprite {
  width: 100%;
  max-width: 256px;
  height: auto;
  aspect-ratio: 8 / 7;
}
.dog-preview__growth article > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 7px;
  align-items: center;
}
.dog-preview__growth article span {
  font-size: 15px;
}
.dog-preview__growth small {
  font-size: 11px;
  color: #a18d77;
}
.dog-preview__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0 28px;
}
.dog-preview button {
  font-family: inherit;
}
.dog-preview__controls > button,
.dog-preview aside button {
  min-height: 38px;
  padding: 8px 14px;
  font-size: 12px;
  color: #816345;
  cursor: pointer;
  background: #fffaf3;
  border: 1px solid #e5d7c4;
  border-radius: 12px;
}
.dog-preview__controls > button.selected {
  color: #fffaf3;
  background: #94724c;
  border-color: #94724c;
}
.dog-preview__controls label {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
}
.dog-preview__pet-zone {
  min-height: 132px;
  padding-top: 12px;
  font-size: 11px;
  color: #ad967d;
  border-top: 1px solid #eee5d9;
}
.dog-preview__watch {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 248px;
  gap: 22px;
}
.dog-preview__video {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 246px;
  padding: 30px;
  color: #f5eadb;
  background: #51483f;
  border-radius: 22px;
}
.dog-preview__video > span {
  font-size: 11px;
  color: #c7b292;
  letter-spacing: 3px;
}
.dog-preview h2 {
  margin: 19px 0 9px;
  font-size: 21px;
  font-weight: 500;
}
.dog-preview__video p {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
  color: #c6b9a9;
}
.dog-preview__video > div {
  margin-top: 26px;
  font-size: 12px;
  color: #a89d90;
}
.dog-preview aside {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.dog-preview aside > strong {
  margin: 2px 0 5px;
  font-size: 14px;
  font-weight: 500;
}
.dog-preview aside > small {
  min-height: 32px;
  font-size: 11px;
  line-height: 1.6;
  color: #a18d77;
}
.dog-preview__checks {
  display: flex;
  gap: 6px;
}
.dog-preview__checks button {
  flex: 1;
  padding: 6px 8px;
  font-size: 11px;
}
.dog-preview footer {
  margin-top: 18px;
  font-size: 11px;
  line-height: 1.8;
  color: #a18d77;
}
@media (max-width: 600px) {
  .dog-preview {
    padding: 26px 18px 150px;
  }
  .dog-preview h1 {
    font-size: 24px;
  }
  .dog-preview__growth {
    gap: 4px;
    padding-top: 24px;
  }
  .dog-preview__growth .pet-sprite {
    width: 100%;
    max-width: 100px;
    height: auto;
  }
  .dog-preview__growth small {
    max-width: 100px;
    font-size: 10px;
    line-height: 1.5;
    text-align: center;
  }
  .dog-preview__controls {
    gap: 6px;
    padding: 14px 0 22px;
  }
  .dog-preview__controls > button {
    padding: 8px 10px;
  }
  .dog-preview__watch {
    grid-template-columns: 1fr;
  }
  .dog-preview__video {
    min-height: 200px;
    padding: 24px;
  }
  .dog-preview h2 {
    font-size: 17px;
  }
}
</style>
