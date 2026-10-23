import Vue from 'vue';
import { createPinia, PiniaVuePlugin } from 'pinia';
import PetPreview from './components/pet-panel/pet-preview.vue';
import { usePetStore } from './components/pet-panel/use-pet-store';
import type { FeedResult, FoodInfo, PetInfo } from './components/pet-panel/pet-api';

Vue.use(PiniaVuePlugin);
const pinia = createPinia();
const store = usePetStore(pinia);
store.inited = true;
store.authenticated = true;
store.balance = '120.00';
const previewSpecies =
  new URLSearchParams(location.search).get('species') === 'chicken' ? 'chicken' : 'dog';
store.pet = {
  id: 1,
  name: previewSpecies === 'chicken' ? '小啾' : '小萌',
  species: previewSpecies,
  exp: 20,
  satiety: 65,
  adoptedAt: '',
  stage: 'egg',
  stageName: previewSpecies === 'chicken' ? '宠物蛋' : '幼犬',
  nextStage: 'juvenile',
  nextStageExp: 30,
  stageProgress: 2 / 3,
};
const previewPets = new Map<string, PetInfo>();
store.foods = [
  {
    id: 'normal_feed',
    code: 'normal_feed',
    name: '普通口粮',
    pointCost: '10.00',
    expGain: 10,
    satietyGain: 20,
  },
  {
    id: 'nutrition_meal',
    code: 'nutrition_meal',
    name: '营养餐',
    pointCost: '30.00',
    expGain: 35,
    satietyGain: 40,
  },
];

/** 开发入口内的本地接口替身；正式观看页不会导入或打包这个入口。 */
const realFetch = window.fetch.bind(window);
const response = (data: unknown, code = 0, message = 'ok') =>
  new Response(JSON.stringify({ code, message, data }), {
    headers: { 'Content-Type': 'application/json' },
  });
function grownPet(old: PetInfo, food: FoodInfo): PetInfo {
  const exp = old.exp + food.expGain;
  const stage = exp >= 100 ? 'adult' : exp >= 30 ? 'juvenile' : 'egg';
  const nextStage = { egg: 'juvenile', juvenile: 'adult', adult: null }[stage];
  const nextStageExp = { egg: 30, juvenile: 100, adult: null }[stage];
  const stageProgress = stage === 'adult' ? null : stage === 'egg' ? exp / 30 : (exp - 30) / 70;
  return {
    ...old,
    exp,
    stage,
    stageName:
      old.species === 'chicken'
        ? { egg: '宠物蛋', juvenile: '雏鸡', adult: '母鸡' }[stage]
        : { egg: '幼犬', juvenile: '少年犬', adult: '成犬' }[stage],
    satiety: Math.min(100, old.satiety + food.satietyGain),
    nextStage,
    nextStageExp,
    stageProgress,
  };
}
async function previewFeed(body: { foodId: string; actionId: string }): Promise<Response> {
  const food = store.foods.find(item => item.id === body.foodId) as FoodInfo;
  await new Promise(resolve => window.setTimeout(resolve, 300));
  if (sessionStorage.getItem('pet-preview:fail') === '1') {
    sessionStorage.removeItem('pet-preview:fail');
    return response({}, 20002, '暂时没喂成功，再试一次吧');
  }
  if (Number(store.balance) < Number(food.pointCost))
    return response({ balance: store.balance }, 20001, '积分不足');
  const old = store.pet as PetInfo;
  if (sessionStorage.getItem('pet-preview:idempotent') === '1') {
    sessionStorage.removeItem('pet-preview:idempotent');
    return response({
      actionId: body.actionId,
      balance: store.balance,
      pet: old,
      expGain: 0,
      satietyGain: 0,
      evolved: false,
      idempotent: true,
    });
  }
  const pet = grownPet(old, food);
  const result: FeedResult = {
    actionId: body.actionId,
    balance: (Number(store.balance) - Number(food.pointCost)).toFixed(2),
    pet,
    expGain: food.expGain,
    satietyGain: food.satietyGain,
    evolved: pet.stage !== old.stage,
  };
  return response(result);
}
window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!new URL(url, location.href).pathname.startsWith('/api/')) return realFetch(input, init);
  if (url.endsWith('/pets/species')) {
    return response({
      species: [
        { code: 'dog', name: '狗狗' },
        { code: 'chicken', name: '小鸡' },
      ],
    });
  }
  if (url.endsWith('/me/pet/switch')) {
    const { species } = JSON.parse(String(init?.body)) as { species: string };
    if (store.pet) previewPets.set(store.pet.species, { ...store.pet });
    const pet = previewPets.get(species) || {
      id: species === 'dog' ? 1 : 2,
      name: '宠物蛋',
      species,
      exp: 0,
      satiety: 40,
      adoptedAt: new Date().toISOString(),
      stage: 'egg',
      stageName: '初始伙伴',
      nextStage: 'juvenile',
      nextStageExp: 30,
      stageProgress: 0,
    };
    return response({ pet });
  }
  if (url.endsWith('/me/state')) {
    return response({
      user: { id: 1, username: 'preview', firstName: '本地演示', isStaff: false },
      points: { balance: store.balance },
      pet: store.pet,
    });
  }
  if (url.endsWith('/me/pet/feed'))
    return previewFeed(JSON.parse(String(init?.body)) as { foodId: string; actionId: string });
  return response({});
};

new Vue({ pinia, render: createElement => createElement(PetPreview) }).$mount('#pet-preview-app');
