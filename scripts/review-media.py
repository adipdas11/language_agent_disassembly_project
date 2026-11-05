"""Create local contact sheets for reviewing supplied research media."""
import base64
import io
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path('/home/adip/workspace/disassembly_ws/src/agentic_disassembly/vision_training')
OUT = Path('/tmp/disassembly-media-review')
OUT.mkdir(exist_ok=True)
for notebook in ROOT.rglob('*.ipynb'):
    group = 'global' if 'Project 1' in str(notebook) else 'local' if 'Project 2' in str(notebook) else 'state'
    model = 'rf' if notebook.name.startswith('rfdetr') else 'yolo'
    for i, cell in enumerate(json.loads(notebook.read_text())['cells']):
        for output in cell.get('outputs', []):
            raw = output.get('data', {}).get('image/png')
            if raw:
                im = Image.open(io.BytesIO(base64.b64decode(''.join(raw)))).convert('RGB')
                im.thumbnail((1600, 1000))
                im.save(OUT / f'{group}-{model}-{i}.jpg')

for group, folder in [('global', 'Project 1 (Segmentation)/rfdetr/dataset_yolo11_seg_1080/test/images'), ('local', 'Project 2 (Tool-Screw)/rfdetr/dataset_yolo11_seg_640/test/images')]:
    files = sorted((ROOT / folder).glob('*.jpg'))
    picks = files[::max(1, len(files) // 12)][:12]
    canvas = Image.new('RGB', (1200, 1000), 'white')
    draw = ImageDraw.Draw(canvas)
    for i, path in enumerate(picks):
        im = Image.open(path)
        im.thumbnail((295, 295))
        x, y = (i % 4) * 300, (i // 4) * 330
        canvas.paste(im, (x, y))
        draw.text((x, y + 295), f'{i}: {path.name[:32]}', fill='black')
    canvas.save(OUT / f'{group}-samples.jpg')
    (OUT / f'{group}-picks.json').write_text(json.dumps([str(p) for p in picks]))

base = ROOT / 'Project 1 (Segmentation)/rfdetr/dataset_yolo11_seg_1080/test'
for group, target, exclude in [('hdd', 10, [0, 7]), ('mini', 7, [0, 10])]:
    picks = []
    for path in sorted((base / 'labels').glob('*.txt')):
        ids = [int(line.split()[0]) for line in path.read_text().splitlines()]
        if target in ids and not any(c in ids for c in exclude):
            picks.append(base / 'images' / (path.stem+'.jpg'))
    picks = picks[:12]
    canvas = Image.new('RGB', (1200, 1000), 'white')
    draw = ImageDraw.Draw(canvas)
    for i,path in enumerate(picks):
        im = Image.open(path); im.thumbnail((295, 295))
        x,y = (i%4)*300,(i//4)*330
        canvas.paste(im, (x,y)); draw.text((x,y+295), str(i), fill='black')
    canvas.save(OUT / f'{group}-candidates.jpg')
    (OUT / f'{group}-picks.json').write_text(json.dumps([str(p) for p in picks]))
