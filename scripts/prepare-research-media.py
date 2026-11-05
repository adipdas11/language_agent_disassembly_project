"""Export selected dataset samples, annotations, and locally computed predictions.

Usage: python scripts/prepare-research-media.py /path/to/vision_training
Requires Pillow, numpy, PyYAML, rfdetr, ultralytics, and torch.
Only image data is exported from notebooks; source cells are never published.
"""
import argparse
import base64
import io
import json
from pathlib import Path
import numpy as np
import torch
import yaml
from PIL import Image, ImageDraw, ImageFont
from rfdetr import RFDETRLarge, RFDETRSmall
from ultralytics import YOLO

parser = argparse.ArgumentParser()
parser.add_argument('vision_root', type=Path)
args = parser.parse_args()
root = args.vision_root
torch.set_num_threads(6)
out = Path('public/assets/vision')
out.mkdir(parents=True, exist_ok=True)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
colors = ['#4cafff', '#ff9e46', '#67dbab', '#cb95ff', '#ff7f9e', '#f1d14c']
manifest = []

def save(im, name):
    im = im.convert('RGB')
    im.thumbnail((1088, 1088))
    im.save(out / name, 'WEBP', quality=88)
    return '/assets/vision/' + name

def annotate(im, items, masks=False):
    result = im.convert('RGBA')
    layer = Image.new('RGBA', result.size)
    d = ImageDraw.Draw(layer)
    occupied = []
    for idx, item in enumerate(items):
        color = colors[idx % len(colors)]
        if masks and 'polygon' in item:
            d.polygon(item['polygon'], fill=color + '50', outline=color)
        x1, y1, x2, y2 = item['box']
        d.rectangle((x1, y1, x2, y2), outline=color, width=3)
        label = item['label'] + (f" {item['confidence']:.2f}" if 'confidence' in item else '')
        width = d.textlength(label, font=font) + 10
        tx = min(x1, max(0, im.width - width))
        ty = max(0, y1 - 24)
        for shift in [0, -26, 26, -52, 52, -78, 78, -104, 104, -130, 130]:
            candidate_y = min(im.height - 24, max(0, ty + shift))
            rect = (tx, candidate_y, tx + width, candidate_y + 24)
            if not any(rect[0] < r[2] and rect[2] > r[0] and rect[1] < r[3] and rect[3] > r[1] for r in occupied):
                ty = candidate_y
                break
        occupied.append((tx, ty, tx + width, ty + 24))
        d.rectangle((tx, ty, tx + width, ty + 24), fill='#15283a')
        d.text((tx + 5, ty + 2), label, fill='white', font=font)
    return Image.alpha_composite(result, layer)

for group, project, dataset, model_class, indices in [
    ('global', 'Project 1 (Segmentation)', 'dataset_yolo11_seg_1080', RFDETRLarge, [0, 2, 11]),
    ('local', 'Project 2 (Tool-Screw)', 'dataset_yolo11_seg_640', RFDETRSmall, [0, 5, 11]),
]:
    base = root / project / 'rfdetr'
    paths = sorted((base / dataset / 'test/images').glob('*.jpg'))
    picks = paths[::max(1, len(paths) // 12)][:12]
    if group == 'local':
        # Prefer the naturally exposed variant to the washed-out test export.
        picks[0] = base / dataset / 'valid/images/tool_camera_164645_182734_png.rf.1a8913548a40f204ac42c11f8f1ebcd4.jpg'
    if group == 'global':
        picks = [next(p for p in paths if p.name.startswith(prefix)) for prefix in [
            'orbbec_162944_352092_png.rf.cafe996',
            'orbbec_160532_137469_png.rf.6c16da',
            'orbbec_154833_726084',
        ]]
        indices = [0, 1, 2]
    names = yaml.safe_load((base / dataset / 'data.yaml').read_text())['names']
    checkpoint = base / f'{group}_model/checkpoint_best_ema.pth'
    model = model_class(pretrain_weights=str(checkpoint), device='cpu', resolution=1088 if group == 'global' else 640, num_classes=len(names), trust_checkpoint=True)
    for n, idx in enumerate(indices):
        path = picks[idx]
        im = Image.open(path).convert('RGB')
        annotations = []
        for line in (base / dataset / 'test/labels' / (path.stem + '.txt')).read_text().splitlines():
            values = line.split()
            cls, coords = int(values[0]), list(map(float, values[1:]))
            if len(coords) == 4:
                cx, cy, w, h = coords
                box = [(cx-w/2)*im.width, (cy-h/2)*im.height, (cx+w/2)*im.width, (cy+h/2)*im.height]
                annotations.append({'label': names[cls], 'box': box})
            else:
                points = [(coords[i]*im.width, coords[i+1]*im.height) for i in range(0, len(coords), 2)]
                annotations.append({'label': names[cls], 'polygon': points, 'box': [min(x for x,y in points), min(y for x,y in points), max(x for x,y in points), max(y for x,y in points)]})
        detections = model.predict(im, threshold=0.4)
        predictions = []
        for box, cls, conf in zip(detections.xyxy, detections.class_id, detections.confidence):
            # These checkpoints use the zero-based classes in their data.yaml.
            index = int(cls)
            label = names[index] if 0 <= index < len(names) else f'class {int(cls)}'
            predictions.append({'box': box.tolist(), 'label': label, 'confidence': float(conf)})
        prefix = f'{group}-{n+1}'
        label = ['HDD lid', 'Mini PC internals', 'Laptop internals'][n] if group == 'global' else ['Lid screw', 'PCB fastener', 'Component fastener'][n]
        manifest.append({'id': prefix, 'group': group, 'label': label, 'model': 'RF-DETR-Large' if group == 'global' else 'RF-DETR-Small', 'raw': save(im, prefix+'-raw.webp'), 'annotations': save(annotate(im, annotations, True), prefix+'-masks.webp'), 'prediction': save(annotate(im, predictions), prefix+'-prediction.webp'), 'detections': predictions, 'source': str(path.relative_to(root)), 'annotationClasses': sorted(set(a['label'] for a in annotations))})
        print(prefix, 'predictions:', [(p['label'], round(p['confidence'], 2)) for p in predictions], flush=True)
    del model
    torch.cuda.empty_cache()

# The state notebook retains real sample images and a prediction; the original
# classification dataset folders are absent. Export only these saved images.
notebook = root / 'Project 3 (Classification)/yolo11/yolo11-train.ipynb'
cells = json.loads(notebook.read_text())['cells']
def embedded(cell):
    raw = next(o['data']['image/png'] for o in cells[cell]['outputs'] if 'image/png' in o.get('data', {}))
    return Image.open(io.BytesIO(base64.b64decode(''.join(raw)))).convert('RGB')

samples = embedded(2)
# Matplotlib's two axes: crop away titles and keep the complete image panels.
panels = [(10, 31, 395, 417), (649, 31, 1037, 417)]
scale_x, scale_y = samples.width/1039, samples.height/427
state_model = YOLO(str(root / 'Project 3 (Classification)/yolo11/state_model/best.pt'))
for n, (label, bounds) in enumerate(zip(['Contact misaligned', 'Contact aligned'], panels)):
    im = samples.crop(tuple(round(v*(scale_x if i%2 == 0 else scale_y)) for i,v in enumerate(bounds)))
    result = state_model.predict(im, device='cpu', verbose=False)[0]
    probs = [{'label': result.names[i].replace('_', ' '), 'confidence': float(result.probs.data[i])} for i in range(len(result.names))]
    prediction = im.copy()
    d = ImageDraw.Draw(prediction)
    best = max(probs, key=lambda p:p['confidence'])
    d.rectangle((0, 0, prediction.width, 54), fill='#15283a')
    d.text((10, 8), best['label'], fill='white', font=font)
    d.text((10, 30), f"Confidence {best['confidence']:.1%}", fill='white', font=font)
    prefix = f'state-{n+1}'
    manifest.append({'id': prefix, 'group': 'state', 'label': label, 'model': 'YOLOv11-Nano classifier', 'raw': save(im, prefix+'-raw.webp'), 'annotations': None, 'prediction': save(prediction, prefix+'-prediction.webp'), 'detections': probs, 'source': 'Project 3 (Classification)/yolo11/yolo11-train.ipynb · cell 2 image output', 'annotationClasses': [label]})
    print(prefix, probs, flush=True)
(out / 'samples.json').write_text(json.dumps(manifest, indent=2))
