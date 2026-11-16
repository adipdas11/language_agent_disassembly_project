"""Render three publication collages from real images and supplied annotations.

Run from the repository root: python3 scripts/create-paper-collages.py
Source paths and the manually reviewed classifier selection are recorded in
scripts/paper-collage-sources.json. Classifier originals must be available at
the recorded cache paths. No generated imagery or predicted masks are used.
"""
import hashlib
import json
import random
from pathlib import Path

from PIL import Image, ImageDraw, PngImagePlugin

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "scripts/paper-collage-sources.json"
SOURCES = json.loads(MANIFEST.read_text())
COLOURS = [
    "#267fbc", "#f49b37", "#388e5b", "#d45057", "#9266b4", "#a47b61",
    "#dd74a2", "#6f83a6", "#b5a62d", "#319caf", "#6aa6e0", "#e9bd62",
    "#7cbe7a", "#ed8c83", "#bd9ad7", "#be9a7a", "#c17c98", "#77a8a4",
]
LOCAL_COLOURS = ["#36a679", "#e69f00", "#cf5a8c", "#239ac2"]


def mixed_records(group):
    """Shuffle samples while representing every device/session/class in each row."""
    rng = random.Random(f"paper-collage-2026-{group}")
    key = "label" if group == "classification" else "device"
    buckets = {}
    for record in SOURCES[group]:
        buckets.setdefault(record[key], []).append(record)
    assert len(buckets) <= 5 and all(len(items) >= 4 for items in buckets.values())
    rows = [[] for _ in range(4)]
    remaining = []
    for items in buckets.values():
        items = items.copy()
        rng.shuffle(items)
        for row in rows:
            row.append(items.pop())
        remaining.extend(items)
    rng.shuffle(remaining)
    for record in remaining:
        # Balance extra samples, then randomise the position within each row.
        candidates = [row for row in rows if len(row) == min(map(len, rows))]
        rng.choice(candidates).append(record)
    rng.shuffle(rows)
    for row in rows:
        rng.shuffle(row)
        assert len(row) == 5 and {item[key] for item in row} == set(buckets)
    return [record for row in rows for record in row]


def polygons(record):
    result = []
    for row in Path(record["annotation"]).read_text().splitlines():
        if not row.strip():
            continue
        values = row.split()
        coords = list(map(float, values[1:]))
        if len(coords) < 6 or len(coords) % 2:
            raise ValueError("Expected a supplied segmentation polygon")
        if not all(-0.001 <= value <= 1.001 for value in coords):
            raise ValueError("Polygon coordinates lie outside the normalised image")
        result.append((int(values[0]), list(zip(coords[::2], coords[1::2]))))
    return result


def polygon_area(points):
    return abs(sum(x * yy - xx * y for (x, y), (xx, yy) in zip(points, points[1:] + points[:1]))) / 2


def colour_rgb(colour):
    return tuple(bytes.fromhex(colour.lstrip("#")))


def masked_image(record, colours):
    image = Image.open(record["file"]).convert("RGB")
    overlay = Image.new("RGBA", image.size)
    draw = ImageDraw.Draw(overlay)
    # Draw small fasteners after large components so their edges remain visible.
    for cls, points in sorted(polygons(record), key=lambda item: polygon_area(item[1]), reverse=True):
        xy = [(round(x * image.width), round(y * image.height)) for x, y in points]
        rgb = colour_rgb(colours[cls])
        draw.polygon(xy, fill=(*rgb, 66))
        edge = tuple(round(channel * 0.83) for channel in rgb)
        draw.line(xy + xy[:1], fill=(*edge, 255), width=max(3, round(image.width * 0.005)), joint="curve")
    return Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")


def render(group, title, subtitle, tile_width, tile_height, colours, filename):
    records = mixed_records(group)
    assert len(records) == 20
    assert len({record.get("frame", record.get("id")) for record in records}) == 20
    # Image-only grid; retain each full source frame at its native resolution.
    gap = round(tile_width * 0.02)
    width = tile_width * 5 + gap * 4
    height = tile_height * 4 + gap * 3
    canvas = Image.new("RGB", (width, height), "white")
    coverage = []
    for index, record in enumerate(records):
        x = (index % 5) * (tile_width + gap)
        y = (index // 5) * (tile_height + gap)
        source = Image.open(record["file"])
        image = source.convert("RGB") if group == "classification" else masked_image(record, colours)
        # Resize only when placing a source in its native-aspect frame.
        if image.size != (tile_width, tile_height):
            assert abs(image.width / image.height - tile_width / tile_height) < 0.001
            image = image.resize((tile_width, tile_height), Image.Resampling.LANCZOS)
        canvas.paste(image, (x, y))
        if group != "classification":
            counts = {}
            for cls, _ in polygons(record):
                counts[str(cls)] = counts.get(str(cls), 0) + 1
        else:
            counts = {record["label"]: 1}
        coverage.append({"panel": chr(97 + index), "file": record["file"], "source_pixels": source.size,
                         "sha256": hashlib.sha256(Path(record["file"]).read_bytes()).hexdigest(), "annotations": counts})
    metadata = PngImagePlugin.PngInfo()
    metadata.add_text("Title", title)
    metadata.add_text("Description", subtitle + ". " + SOURCES["annotation_note"])
    metadata.add_text("PanelCount", "20")
    metadata.add_text("AnnotationType", "none (classification source images)" if group == "classification" else "ground-truth dataset polygons")
    dest = ROOT / filename
    canvas.save(dest, "PNG", dpi=(600, 600), pnginfo=metadata, compress_level=6)
    preview = canvas.copy()
    preview.thumbnail((1800, 1800))
    preview.save(Path("/tmp/disassembly-collage-source") / (group + "-collage-review.png"))
    print(f"Saved {dest.name}: {width} × {height} pixels, 20 panels, {dest.stat().st_size / 1024**2:.1f} MiB", flush=True)
    return {"file": filename, "pixels": [width, height], "dpi": 600, "visible_text": False, "panels": coverage}


def main():
    outputs = []
    for group, model, caption, tile, palette, filename in [
        ("global", "RF-DETR-Large", "Global scene perception · 20 distinct annotated frames", 1088, COLOURS, "RF_DETR_Large_segmentation_collage.png"),
        ("local", "RF-DETR-Small", "Local fastener perception · 20 distinct annotated frames", 640, LOCAL_COLOURS, "RF_DETR_Small_segmentation_collage.png"),
    ]:
        outputs.append(render(group, model, caption, tile, tile, palette, filename))
    # Preserve the 4:3 aspect and the full 1440 × 1080 original camera images.
    outputs.append(render("classification", "YOLOv11-Nano", "Contact-state classification · 10 aligned and 10 misaligned examples", 1440, 1080,
                          [], "YOLOv11_Nano_classification_collage.png"))
    audit = {"annotation_note": SOURCES["annotation_note"], "outputs": outputs}
    (ROOT / "scripts/paper-collage-export.json").write_text(json.dumps(audit, indent=2) + "\n")


if __name__ == "__main__":
    main()
