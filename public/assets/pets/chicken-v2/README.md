# 小鸡宠物逐帧素材 v2（chicken-v2）

本目录为小鸡桌宠的三阶段运行时形象资产，与小狗 `v2` 使用同一 `polyv-pet/2` 清单格式，可直接替换前端宠物资源使用。三阶段为 `egg`（蛋）、`juvenile`（雏鸡）、`adult`（母鸡）。

- 图集：2048×2464，8 列×11 行，单格 256×224，透明无损 WebP（lossless + exact）。
- 每阶段 74 个姿态：待机 6、右走 8、左走 8、问候 4、进食 8、开心 6、饥饿 6、休息 6、拖拽 6，以及 16 个注视方向（look）。
- `manifest.json` 定义逐帧矩形、时长和循环方式；`*-poster.webp` 是同阶段静态回退（待机首帧）。
- 左右镜像：左走按右走单帧水平镜像制作；小鸡毛色对称、无带方向含义的配件，帧顺序与小狗保持一致。
- 主图四阶段中「烤全鸡」仅作为主视觉彩蛋，不进入本运行时图集与 manifest。
- 身份规范：蛋=米白斑点蛋+金色五角星；雏鸡=金黄毛绒雏鸡、短圆翅膀、奶油胸口、橙色喙爪；母鸡=金黄母鸡、小红冠+肉垂、成型翅、扇形尾羽、橙色喙爪。统一暖黄身体、奶油胸口、橙色喙脚，精致软萌 2.5D 毛绒玩具质感。

## 切换方式

前端通过 `src/components/pet-panel/pet-assets.ts` 按物种选择资源：小狗使用 `/assets/pets/v2/`，小鸡使用 `/assets/pets/chicken-v2/`。观看页共用 Canvas 动画播放器、成长预加载和透明点击区域；换宠物页面使用各物种的三阶段封面。清单缓存与预加载图片按物种隔离，切换时不会串用同名图集。无需手动切换全局基址。

本地打开 `/pet-preview.html?species=chicken` 可预览三阶段和完整动作；图集失败时先显示对应阶段封面，封面失败再回退同物种 SVG。

## 制作与验收

- 工作文件：前端仓库 `work/chicken-v2/`（`prompts/` 姿态提示词、`sources/` 抠图源图、`final/` 阶段 PNG 母版）。
- 流水线脚本：`scripts/matte_chicken_strips.py`（rembg 抠图）、`scripts/assemble_chicken_sprites.py`（确定性拼装）、`scripts/verify_chicken_sprites.py`（自动验收）。
- 验收口径：74 帧/16 注视方向、透明区无 RGB 残留、帧间有姿态变化、图集尺寸与行位与小狗 manifest 完全一致、角色入格且脚部落基线。

## 成鸡坏帧修复（2026-10-23-chicken-v2）

成鸡 16 个转头姿态已修复胸口、翅膀和尾羽截断，以及脚间白底。眨眼、饥饿和进食各一帧复用相邻完好姿态，动作顺序和时长不变。其他帧保留原像素。

修复源与生成记录保存在 `resources/pets/chicken-v2/`。安装 Pillow、NumPy 后，运行 `python scripts/package_chicken_repairs.py` 可重复打包，再运行 `python scripts/verify_chicken_sprites.py` 验证所有阶段。清单版本已更新，以重新加载修复后的图集。

拼装脚本遇到粘连角色时会报错，要求修复源图；不再通过擦掉竖条来强行分离角色。验收新增格内直线截断和脚部白块检测，避免“角色没碰格子边缘”却仍然损坏轮廓的情况通过。
