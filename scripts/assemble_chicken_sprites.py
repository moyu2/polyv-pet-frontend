"""Register generated chicken pose strips into transparent web atlases.

Mirrors scripts/assemble_dog_sprites.py: one strip per pose per stage (single row of N frames),
matted RGBA in work/chicken-v2/sources/<pose>-<stage>.png. Assembly is deterministic:
connectivity-based subject recovery, per-stage height normalization, baseline 212,
walk-left mirrored from walk-right, boundary color cleaning, WebP lossless export.
"""
from __future__ import annotations

import argparse
from collections import deque
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "work/chicken-v2/sources"
FINAL = ROOT / "work/chicken-v2/final"
OUTPUT = ROOT / "public/assets/pets/chicken-v2"
QA = ROOT / "docs/evidence/chicken-v2"
CELL = (256, 224)
BASELINE = 212
STAGES = ("egg", "juvenile", "adult")
TARGET_HEIGHTS = (104, 140, 166)
ROWS = {
    "idle": (0, 6, [850, 150, 100, 100, 150, 900], True),
    "walk-right": (1, 8, [110] * 8, True),
    "greet": (3, 4, [140, 170, 240, 180], False),
    "eat": (4, 8, [200, 170, 180, 180, 180, 180, 190, 220], False),
    "happy": (5, 6, [120, 120, 140, 160, 140, 180], False),
    "hungry": (6, 6, [500, 200, 200, 200, 200, 900], True),
    "sleep": (7, 6, [500] * 6, True),
    "dragged": (8, 6, [150] * 6, True),
    "look-a": (9, 8, [1000] * 8, True),
    "look-b": (10, 8, [1000] * 8, True),
}


def _components(mask: np.ndarray, labels: np.ndarray) -> list[tuple[int, int, int, int, int]]:
    height, width = mask.shape
    components = []
    label = 0
    for y, x in zip(*np.where(mask)):
        if labels[y, x]:
            continue
        label += 1
        queue = deque([(int(x), int(y))])
        labels[y, x] = label
        left = right = int(x)
        top = bottom = int(y)
        area = 0
        while queue:
            px, py = queue.popleft()
            area += 1
            left, right = min(left, px), max(right, px)
            top, bottom = min(top, py), max(bottom, py)
            for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                if 0 <= nx < width and 0 <= ny < height and mask[ny, nx] and not labels[ny, nx]:
                    labels[ny, nx] = label
                    queue.append((nx, ny))
        if area >= 500:
            components.append((area, label, left, top, right + 1, bottom + 1))
    return components


def connected_subjects(path: Path, count: int) -> list[Image.Image]:
    """Recover the `count` subjects of a single-row strip by alpha connectivity."""
    rgba = np.array(Image.open(path).convert("RGBA"))
    alpha = rgba[:, :, 3]
    height, width = alpha.shape
    red, green, blue = rgba[:, :, 0], rgba[:, :, 1], rgba[:, :, 2]
    key_spill = ((red > 220) & (green > 220) & (blue < 50)) | ((red > 220) & (green < 70) & (blue > 150)) | ((red > 220) & (green < 45) & (blue < 70))
    mask = (alpha > 180) & ~key_spill
    labels = np.zeros((height, width), dtype=np.int32)
    components = _components(mask, labels)
    if len(components) < count:
        # Cutting a touching strip can silently amputate the chest or tail.
        # Require separated source poses instead of erasing any silhouette.
        raise ValueError(f"{path.name}: touching poses must be repaired or regenerated with clear spacing")
    if len(components) != count:
        raise ValueError(f"{path.name}: expected {count} connected subjects, got {len(components)}")
    components.sort(key=lambda item: item[2])
    crops = []
    for _, subject_id, left, top, right, bottom in components:
        if left <= 0 or right >= width or top <= 0 or bottom >= height:
            raise ValueError(f"{path.name}: clipped subject at canvas edge")
        body = Image.fromarray(np.uint8(labels[top:bottom, left:right] == subject_id) * 255)
        fringe = np.array(body.filter(ImageFilter.MaxFilter(3))) > 0
        pixels = rgba[top:bottom, left:right].copy()
        pixels[:, :, 3] = np.where(fringe, pixels[:, :, 3], 0)
        pixels[pixels[:, :, 3] == 0] = 0
        crops.append(Image.fromarray(pixels))
    return crops


def load_sources(partial: bool) -> dict[str, dict[str, list[Image.Image]]]:
    sources: dict[str, dict[str, list[Image.Image]]] = {action: {} for action in ROWS}
    missing = []
    for action, (_, count, _, _) in ROWS.items():
        for stage in STAGES:
            path = SOURCE / f"{action}-{stage}.png"
            if not path.exists():
                missing.append(f"{action}-{stage}")
                continue
            try:
                sources[action][stage] = connected_subjects(path, count)
            except ValueError as error:
                if not partial:
                    raise
                print(str(error), flush=True)
                missing.append(f"{action}-{stage}")
    if missing and not partial:
        raise ValueError(f"Missing generated sources: {missing}")
    if not sources["idle"]:
        raise ValueError("Idle source is required")
    return sources


def register_rows(sources: dict[str, dict[str, list[Image.Image]]]) -> dict[str, dict[str, list[Image.Image]]]:
    frames = {stage: {} for stage in STAGES}
    for stage_index, stage in enumerate(STAGES):
        standing = [sources[key][stage] for key in ("idle", "walk-right", "eat", "hungry") if key in sources and stage in sources[key]]
        aspect = max(pose.width / pose.height for row in standing for pose in row)
        normal_height = min(TARGET_HEIGHTS[stage_index], (CELL[0] - 22) / aspect)
        look_poses = sources.get("look-a", {}).get(stage, []) + sources.get("look-b", {}).get(stage, [])
        look_scale = min(normal_height / max(pose.height for pose in look_poses), (CELL[0] - 18) / max(pose.width for pose in look_poses)) if look_poses else 1
        for action, strips in sources.items():
            if stage not in strips:
                continue
            poses = strips[stage]
            # The egg is an object: it never shrinks for sleep/dragged poses.
            height_ratio = 1.0 if stage == "egg" else 0.48 if action == "sleep" else 0.9 if action == "dragged" else 1.0
            scale = min(normal_height * height_ratio / max(pose.height for pose in poses), (CELL[0] - 18) / max(pose.width for pose in poses))
            if action in ("look-a", "look-b"):
                scale = look_scale
            row_frames = []
            for index, pose in enumerate(poses):
                sprite = pose.resize((max(1, round(pose.width * scale)), max(1, round(pose.height * scale))), Image.Resampling.LANCZOS)
                canvas = Image.new("RGBA", CELL)
                jump = [0, 0, 10, 20, 10, 0][index] if action == "happy" else 12 if action == "dragged" else 0
                left = (CELL[0] - sprite.width) // 2
                if action in ("look-a", "look-b"):
                    foot_alpha = np.array(sprite.getchannel("A"))
                    ys, xs = np.where(foot_alpha[int(sprite.height * 0.7):] > 160)
                    if len(xs):
                        left = round(CELL[0] / 2 - float(np.median(xs)))
                if left < 4 or left + sprite.width > CELL[0] - 4:
                    raise ValueError(f"{stage}/{action}/{index}: registration clips silhouette")
                canvas.alpha_composite(sprite, (left, BASELINE - sprite.height - jump))
                row_frames.append(canvas)
            frames[stage][action] = row_frames
        if "walk-right" in frames[stage]:
            frames[stage]["walk-left"] = [ImageOps.mirror(frame) for frame in frames[stage]["walk-right"]]
    return frames


def clean_boundary_once(frame: Image.Image) -> tuple[Image.Image, int]:
    """Propagate clean interior color through the alpha boundary in linear light (alpha preserved)."""
    data = np.array(frame)
    alpha = data[:, :, 3].copy()
    rgb = data[:, :, :3].astype(np.float32) / 255
    linear = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    visible = alpha > 0
    interior = np.array(Image.fromarray(np.uint8(visible) * 255).filter(ImageFilter.MinFilter(7))) > 0
    red, green, blue = data[:, :, 0], data[:, :, 1], data[:, :, 2]
    spill = ((red > 220) & (green > 220) & (blue < 70)) | ((red > 220) & (green < 80) & (blue > 150)) | ((red > 220) & (green < 50) & (blue < 70))
    pending = visible & ~interior & ((alpha < 250) | spill)
    known = visible & ~pending
    original = linear.copy()
    for _ in range(9):
        sums = np.zeros_like(linear)
        counts = np.zeros(alpha.shape, dtype=np.float32)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)):
            neighbor = np.roll(np.roll(known, dy, axis=0), dx, axis=1)
            colors = np.roll(np.roll(linear, dy, axis=0), dx, axis=1)
            sums += colors * neighbor[:, :, None]
            counts += neighbor
        fill = pending & (counts > 0)
        if not fill.any():
            break
        linear[fill] = sums[fill] / counts[fill, None]
        known[fill] = True
        pending[fill] = False
    if pending.any():
        linear[pending] = np.mean(linear[pending], axis=1, keepdims=True)
    srgb = np.where(linear <= 0.0031308, linear * 12.92, 1.055 * np.maximum(linear, 0) ** (1 / 2.4) - 0.055)
    data[:, :, :3] = np.clip(np.round(srgb * 255), 0, 255).astype(np.uint8)
    data[alpha == 0] = 0
    assert np.array_equal(data[:, :, 3], alpha)
    return Image.fromarray(data), int(np.any(np.abs(original - linear) > 0.0001, axis=2).sum())


def assemble(partial: bool) -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    QA.mkdir(parents=True, exist_ok=True)
    FINAL.mkdir(parents=True, exist_ok=True)
    sources = load_sources(partial)
    frames = register_rows(sources)
    cleanup = {stage: 0 for stage in STAGES}
    if not partial:
        for stage in STAGES:
            for action, row_frames in frames[stage].items():
                for index, frame in enumerate(row_frames):
                    row_frames[index], changed = clean_boundary_once(frame)
                    cleanup[stage] += changed
    manifest = {
        "schema": "polyv-pet/2", "version": "2026-10-23-chicken-v1", "width": CELL[0] * 8,
        "height": CELL[1] * 11, "cell": list(CELL), "baseline": BASELINE,
        "stages": {stage: {"file": f"{stage}.webp", "poster": f"{stage}-poster.webp"} for stage in STAGES},
        "actions": {},
    }
    all_rows = dict(ROWS)
    all_rows["walk-left"] = (2, 8, [110] * 8, True)
    for action, (row, count, durations, loop) in all_rows.items():
        if action not in frames["egg"] or action in ("look-a", "look-b"):
            continue
        manifest["actions"][action] = {"loop": loop, "frames": [{"rect": [index * CELL[0], row * CELL[1], *CELL], "duration": durations[index]} for index in range(count)]}
    if "look-a" in sources and "look-b" in sources and frames["egg"].get("look-a"):
        manifest["actions"]["look"] = {"loop": True, "frames": [{"rect": [index % 8 * CELL[0], (9 + index // 8) * CELL[1], *CELL], "duration": 1000} for index in range(16)]}
    report = {"ok": True, "cell": CELL, "alphaPreserved": True, "cleanupPasses": 0 if partial else 1, "changedBoundaryPixels": cleanup, "stages": {}}
    for stage in STAGES:
        atlas = Image.new("RGBA", (manifest["width"], manifest["height"]))
        count = 0
        for action, (row, _, durations, _) in all_rows.items():
            if action not in frames[stage]:
                continue
            for index, frame in enumerate(frames[stage][action]):
                atlas.alpha_composite(frame, (index * CELL[0], row * CELL[1]))
                count += 1
        atlas.save(FINAL / f"{stage}.png")
        atlas.save(OUTPUT / f"{stage}.webp", lossless=True, exact=True, method=6)
        frames[stage]["idle"][0].save(OUTPUT / f"{stage}-poster.webp", lossless=True, exact=True, method=6)
        report["stages"][stage] = {"usedFrames": count, "webpBytes": (OUTPUT / f"{stage}.webp").stat().st_size}
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (QA / "assembly.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--partial", action="store_true", help="Intermediate review only; missing rows stay transparent")
    assemble(parser.parse_args().partial)
