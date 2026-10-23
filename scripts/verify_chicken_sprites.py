"""Validate packaged chicken web sprites (mirrors scripts/verify_dog_sprites.py)."""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/assets/pets/chicken-v2"
QA = ROOT / "docs/evidence/chicken-v2"
STAGES = ("egg", "juvenile", "adult")
manifest = json.loads((ASSETS / "manifest.json").read_text(encoding="utf-8"))
width, height = manifest["cell"]
errors = []
report = {"ok": False, "errors": errors, "stages": {}}
atlases = {}


def cell(image, frame):
    x, y, w, h = frame["rect"]
    return image.crop((x, y, x + w, y + h))


def silhouette_quality(pose):
    """Catch cutoffs inside a cell and opaque background trapped between feet."""
    data = np.array(pose.convert("RGBA"))
    mask = data[:, :, 3] > 180
    ys = np.flatnonzero(mask.any(axis=1))
    longest = 0
    if len(ys):
        for side in (0, -1):
            previous, run = -1, 0
            for row in mask[ys[0]:ys[-1] + 1]:
                xs = np.flatnonzero(row)
                boundary = int(xs[side]) if len(xs) else -1
                run = run + 1 if boundary == previous else 1
                previous = boundary
                longest = max(longest, run)
    feet = data[180:]
    white = int(((feet[:, :, :3].min(axis=2) > 244) & (feet[:, :, 3] > 220)).sum())
    return longest, white


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
    max_edge_run = 0
    max_white_feet = 0
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
            edge_run, white_feet = silhouette_quality(pose)
            max_edge_run = max(max_edge_run, edge_run)
            max_white_feet = max(max_white_feet, white_feet)
            if edge_run > 45:
                errors.append(f"{stage}/{action}: straight silhouette cutoff {frame['rect']}")
            if stage != "egg" and white_feet > 16:
                errors.append(f"{stage}/{action}: opaque white background near feet {frame['rect']}")
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
    report["stages"][stage] = {"usedFrames": len(used), "idleBounds": idle.getbbox(), "actions": action_report,
                                "maxStraightEdgeRun": max_edge_run, "maxWhitePixelsNearFeet": max_white_feet}
    if len(used) != 74 or len(manifest["actions"].get("look", {}).get("frames", [])) != 16:
        errors.append(f"{stage}: incomplete animation family")

report["ok"] = not errors
QA.mkdir(parents=True, exist_ok=True)
(QA / "asset-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"ok": report["ok"], "errors": errors, "usedFramesPerStage": [report["stages"][stage]["usedFrames"] for stage in STAGES]}, ensure_ascii=False))
if errors:
    raise SystemExit(1)
