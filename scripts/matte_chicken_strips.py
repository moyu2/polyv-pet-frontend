"""Matte raw chicken pose strips (white-background JPEG from image tools) into RGBA PNG sources.

Each strip is ONE row of N frames for ONE stage. Uses rembg u2net with alpha matting;
the produced PNG keeps genuine transparency (alpha channel) for downstream assembly.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "work/chicken-v2/sources"


def matte_one(path: Path, out: Path, session) -> None:
    im = Image.open(path).convert("RGB")
    from rembg import remove

    result = remove(
        im,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )
    result.save(out)
    print(f"{out.name}: {result.size} alpha={result.getchannel('A').getextrema()}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", help="matte only this raw jpg (name in sources/, e.g. idle-egg-raw.jpg)")
    args = parser.parse_args()
    from rembg import new_session

    session = new_session("u2net")
    if args.file:
        raw = SOURCE / args.file
        matte_one(raw, SOURCE / args.file.replace("-raw.jpg", ".png"), session)
        return
    for raw in sorted(SOURCE.glob("*-raw.jpg")):
        out = SOURCE / raw.name.replace("-raw.jpg", ".png")
        if not out.exists():
            matte_one(raw, out, session)


if __name__ == "__main__":
    main()
