# 宠物形象资源

当前狗狗默认使用 [v2 逐帧图集](./v2/README.md)。下面记录的 SVG 资源保留用于回退及历史素材参考。

资源由 `deliverables/pet-svg-assets` 提供，规格见 `manifest.json`
（512×512 viewBox、透明背景、baseline 444）。当前默认宠物：**狗狗（dog）**。

## 目录结构

```
assets/pets/
├── manifest.json          # 资源清单与 backendStage 映射
├── dog/                   # 狗狗（默认）：puppy 幼犬 / juvenile 少年犬 / adult 成犬
│   └── {stage}/idle.svg | eat.svg | happy.svg | hungry.svg
├── chicken/               # 小鸡：egg 鸡蛋 / chick 雏鸡 / adult 成鸡（可在宠物小屋更换）
│   └── {stage}/idle.svg | eat.svg | happy.svg | hungry.svg
└── effects/               # 特效素材
    ├── evolution.svg      # 进化特效（普通进化）
    ├── hatching.svg       # 孵化特效（蛋 → 幼体）
    ├── dog-food.svg       # 狗狗进食食物
    ├── chicken-food.svg   # 小鸡进食食物
    ├── hearts.svg         # 爱心（备用）
    └── sparkles.svg       # 星光（备用）
```

## 后端阶段 → 资源目录映射（与 manifest.json 一致）

| 后端 stage（经验区间） | dog | chicken |
| --- | --- | --- |
| `egg`（0–29） | puppy 幼犬 | egg 鸡蛋 |
| `juvenile`（30–99） | juvenile 少年犬 | chick 雏鸡 |
| `adult`（≥100） | adult 成犬 | adult 成鸡 |

## 状态切换规则（`src/components/pet-panel/pet-sprite.vue`）

| 状态 | 触发 |
| --- | --- |
| `idle` 待机 | 默认；轻微上下浮动 |
| `eat` 进食 | 喂养后 1.6s；挤压弹跳 + 右下角食物特效 |
| `happy` 开心 | 进化时 2.4s；欢快跳动 + evolution/hatching 特效 |
| `hungry` 饥饿 | 饱食度 < 30 时常态显示；无力摇摆 |

## 替换与扩展

- 换图：直接覆盖同名 SVG，刷新生效（无需改代码）
- 可选物种由后端 `/api/pets/species` 返回，选择后通过 `/api/me/pet/switch` 保存；前端不预置可选列表。
- 换默认物种：后端 `adopt_pet` 的 species 默认值 + 存量数据；
  前端 `pet-sprite.vue` 的 `STAGE_DIRS` 已包含 dog/chicken 映射
- 资源缺失时自动回退组件内置的占位 SVG 形象
- 构建（`npm run build`）时 CopyPlugin 会把本目录拷入 dist；
  开发模式由 devServer static 提供（见 `webpack.config.js`）
