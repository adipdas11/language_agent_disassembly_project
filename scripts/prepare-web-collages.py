"""Export existing research-figure tiles for the website without altering root PNGs."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
export = json.loads((ROOT / 'scripts/paper-collage-export.json').read_text())
sources = json.loads((ROOT / 'scripts/paper-collage-sources.json').read_text())
dest = ROOT / 'public/assets/vision/collages'
dest.mkdir(parents=True, exist_ok=True)
output = {}
for group, item, tw, th in zip(['global', 'local', 'classification'], export['outputs'], [1088, 640, 1440], [1088, 640, 1080]):
    lookup = {r['file']: r for r in sources[group]}
    gap = round(tw * .02)
    tiles = []
    with Image.open(ROOT / item['file']) as collage:
        for i, panel in enumerate(item['panels']):
            x, y = (i % 5) * (tw + gap), (i // 5) * (th + gap)
            tile = collage.crop((x, y, x + tw, y + th))
            tile.thumbnail((800, 800), Image.Resampling.LANCZOS)
            name = f'{group}-{i+1:02d}.webp'
            tile.save(dest / name, quality=95, method=6)
            record = lookup[panel['file']]
            tiles.append({'src': f'/assets/vision/collages/{name}', 'category': record.get('label', record.get('device')), 'width': tile.width, 'height': tile.height})
    output[group] = tiles
(ROOT / 'src/content/collage-samples.json').write_text(json.dumps(output, indent=2) + '\n')
print('Prepared 60 website images; root research collages untouched.')
