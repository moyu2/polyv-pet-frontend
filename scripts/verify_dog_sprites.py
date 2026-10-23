"""Validate packaged web sprites and create labeled plus blind direction review sheets."""
from __future__ import annotations
import json
from pathlib import Path
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/assets/pets/v2"
QA = ROOT / "docs/evidence/pet-v2"
STAGES = ("egg", "juvenile", "adult")
NAMES = ("幼犬", "少年犬", "成犬")
manifest = json.loads((ASSETS / "manifest.json").read_text(encoding="utf-8"))
width, height = manifest["cell"]
font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 13)
errors = []
report = {"ok": False, "errors": errors, "stages": {}}
atlases = {}


def cell(image, frame):
    x, y, w, h = frame["rect"]
    return image.crop((x, y, x + w, y + h))


for index, stage in enumerate(STAGES):
    image = Image.open(ASSETS / manifest["stages"][stage]["file"]).convert("RGBA")
    atlases[stage] = image
    data = np.array(image)
    if image.size != (manifest["width"], manifest["height"]):
        errors.append(f"{stage}: dimensions")
    if np.any(data[data[:, :, 3] == 0, :3]):
        errors.append(f"{stage}: hidden RGB residue")
    used = set()
    action_report = {}
    for action, clip in manifest["actions"].items():
        signatures = set()
        for frame in clip["frames"]:
            if frame["duration"] <= 0:
                errors.append(f"{stage}/{action}: nonpositive timing")
            x, y, w, h = frame["rect"]
            used.add((x // width, y // height))
            pose = cell(image, frame)
            box = pose.getbbox()
            if not box or min(box[0], box[1], width - box[2], height - box[3]) < 3:
                errors.append(f"{stage}/{action}: empty or clipped frame {frame['rect']}")
            signatures.add(pose.tobytes())
        action_report[action] = {"frames": len(clip["frames"]), "distinctPoses": len(signatures)}
        if len(signatures) < 2:
            errors.append(f"{stage}/{action}: no pose variation")
    for row in range(11):
        for column in range(8):
            if (column, row) not in used:
                pose = image.crop((column * width, row * height, (column + 1) * width, (row + 1) * height))
                if pose.getbbox():
                    errors.append(f"{stage}: nonempty unused slot {column},{row}")
    idle = cell(image, manifest["actions"]["idle"]["frames"][0])
    report["stages"][stage] = {"usedFrames": len(used), "idleBounds": idle.getbbox(), "actions": action_report}
    if len(used) != 74 or len(manifest["actions"].get("look", {}).get("frames", [])) != 16:
        errors.append(f"{stage}: incomplete animation family")

# Normal-size review: shared body registration, neutral plus all sixteen gazes.
sheet = Image.new("RGB", (9 * 144, 3 * 2 * 158), "#35332f")
draw = ImageDraw.Draw(sheet)
for row, stage in enumerate(STAGES):
    poses = [manifest["actions"]["idle"]["frames"][0]] + manifest["actions"]["look"]["frames"]
    for index, frame in enumerate(poses):
        x = index % 9 * 144
        y = (row * 2 + index // 9) * 158
        label = f"{NAMES[row]} neutral" if index == 0 else f"{(index - 1) * 22.5:g}°"
        draw.text((x + 8, y + 5), label, font=font, fill="#e5dac8")
        pose = cell(atlases[stage], frame).resize((144, 126), Image.Resampling.LANCZOS)
        sheet.paste(pose, (x, y + 28), pose)
sheet.save(QA / "look-directions.png")

rng = random.Random(20261023)
pairs = []
for stage_index, stage in enumerate(STAGES):
    for axis, first, second, expected, cardinal in (
        *[("H", i, 16 - i, ("screen-right", "screen-left"), i == 4) for i in range(1, 8)],
        *[("V", i, (8 - i) % 16, ("up", "down"), i == 0) for i in (0, 1, 2, 3, 13, 14, 15)],
    ):
        # Top-left look indices 13..15 need their lower-left opposites 11..9.
        if axis == "V" and first >= 13:
            second = 24 - first
        reverse = rng.choice((False, True))
        a, b = (second, first) if reverse else (first, second)
        expected_a, expected_b = expected[::-1] if reverse else expected
        pairs.append({"id": f"P{len(pairs) + 1:02}", "stage": stage, "stageIndex": stage_index, "axis": axis, "a": a, "b": b, "A": expected_a, "B": expected_b, "cardinal": cardinal})
blind = Image.new("RGB", (4 * 280, 11 * 160), "#eae5dc")
draw = ImageDraw.Draw(blind)
for index, pair in enumerate(pairs):
    x, y = index % 4 * 280, index // 4 * 160
    draw.text((x + 6, y + 4), f"{pair['id']} {pair['axis']}  {NAMES[pair['stageIndex']]}", font=font, fill="#493d31")
    for side, frame_index in enumerate((pair["a"], pair["b"])):
        pose = cell(atlases[pair["stage"]], manifest["actions"]["look"]["frames"][frame_index]).resize((128, 112), Image.Resampling.LANCZOS)
        blind.paste(pose, (x + side * 136, y + 26), pose)
        draw.text((x + side * 136 + 58, y + 140), "AB"[side], font=font, fill="#493d31")
blind.save(QA / "direction-blind-pairs.png")
(QA / "direction-blind-answer-key.json").write_text(json.dumps(pairs, indent=2), encoding="utf-8")
report["ok"] = not errors
(QA / "asset-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"ok": report["ok"], "errors": errors, "usedFramesPerStage": [report["stages"][stage]["usedFrames"] for stage in STAGES]}, ensure_ascii=False))
if errors:
    raise SystemExit(1)
