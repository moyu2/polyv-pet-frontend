"""Register repaired imagegen poses without reprocessing the unaffected animation frames.

The generated 4x4 source is committed in resources/. This uses the existing atlas
boundary cleanup and exports the same 256x224 cells and baseline as the player.
"""
from pathlib import Path
import json

import numpy as np
from PIL import Image, ImageFilter

from assemble_chicken_sprites import _components, clean_boundary_once

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/assets/pets/chicken-v2"
SOURCE = ROOT / "resources/pets/chicken-v2/adult-look-repaired.png"


def subject(cell):
    data = np.array(cell.convert("RGBA"))
    red, green, blue, alpha = (data[:, :, i] for i in range(4))
    # Generated cutouts may retain chroma-key debris. Preserve the genuine red
    # comb/wattle in the head, and exclude red/yellow key spill elsewhere.
    lower = np.indices(alpha.shape)[0] > cell.height * 0.38
    spill = ((red > 220) & (green > 220) & (blue < 70)) | (
        lower & (red > 220) & (green < 55) & (blue < 80)
    )
    mask = (alpha > 160) & ~spill
    labels = np.zeros(mask.shape, dtype=np.int32)
    components = _components(mask, labels)
    if not components:
        raise ValueError("Repaired pose is empty")
    _, label, *_ = max(components)
    body = Image.fromarray(np.uint8(labels == label) * 255)
    fringe = np.array(body.filter(ImageFilter.MaxFilter(3))) > 0
    data[:, :, 3] = np.where(fringe & ~spill, alpha, 0)
    data[data[:, :, 3] == 0] = 0
    pose = Image.fromarray(data)
    return pose.crop(pose.getbbox())


def main():
    manifest = json.loads((ASSETS / "manifest.json").read_text())
    atlas = Image.open(ASSETS / manifest["stages"]["adult"]["file"]).convert("RGBA")
    sheet = Image.open(SOURCE).convert("RGBA")
    poses = []
    for index in range(16):
        row, column = divmod(index, 4)
        bounds = (
            round(column * sheet.width / 4), round(row * sheet.height / 4),
            round((column + 1) * sheet.width / 4), round((row + 1) * sheet.height / 4),
        )
        poses.append(subject(sheet.crop(bounds)))
    scale = min(154 / max(p.height for p in poses), 220 / max(p.width for p in poses))
    for index, pose in enumerate(poses):
        sprite = pose.resize((round(pose.width * scale), round(pose.height * scale)), Image.Resampling.LANCZOS)
        frame = Image.new("RGBA", (256, 224))
        frame.alpha_composite(sprite, ((256 - sprite.width) // 2, 212 - sprite.height))
        frame, _ = clean_boundary_once(frame)
        x, y, _, _ = manifest["actions"]["look"]["frames"][index]["rect"]
        atlas.paste(frame, (x, y))
    # Reuse adjacent intact poses for the three damaged non-gaze frames. This
    # retains the original character/rendering through blink and feeding loops.
    for action, destination, source in (("idle", 2, 3), ("hungry", 1, 2), ("eat", 0, 7)):
        sx, sy, w, h = manifest["actions"][action]["frames"][source]["rect"]
        dx, dy, _, _ = manifest["actions"][action]["frames"][destination]["rect"]
        atlas.paste(atlas.crop((sx, sy, sx + w, sy + h)), (dx, dy))
    atlas.save(ASSETS / manifest["stages"]["adult"]["file"], lossless=True, exact=True, method=6)
    manifest["version"] = "2026-10-23-chicken-v2"
    (ASSETS / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print("Packaged 16 repaired gaze poses and 3 intact replacement poses; baseline=212")


if __name__ == "__main__":
    main()
