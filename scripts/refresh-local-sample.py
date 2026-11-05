"""Use a naturally exposed supplied sample and recompute its RF-DETR outputs.

Run in the inference environment with the vision_training directory as argument.
No colour, exposure, or geometric adjustment is applied to the camera image.
"""
import json
import sys
from pathlib import Path

import torch
import yaml
from PIL import Image, ImageDraw, ImageFont
from rfdetr import RFDETRSmall

root = Path(sys.argv[1])
base = root / 'Project 2 (Tool-Screw)/rfdetr'
source = base / 'dataset_yolo11_seg_640/valid/images/tool_camera_164645_182734_png.rf.1a8913548a40f204ac42c11f8f1ebcd4.jpg'
image = Image.open(source).convert('RGB')
torch.set_num_threads(6)
names = yaml.safe_load((base / 'dataset_yolo11_seg_640/data.yaml').read_text())['names']
model = RFDETRSmall(pretrain_weights=str(base / 'local_model/checkpoint_best_ema.pth'), device='cpu', resolution=640, num_classes=len(names), trust_checkpoint=True)
result = model.predict(image, threshold=.4)
detections = [{'box': box.tolist(), 'label': names[int(label)], 'confidence': float(confidence)} for box, label, confidence in zip(result.xyxy, result.class_id, result.confidence)]
annotations = []
for line in (source.parent.parent / 'labels' / (source.stem + '.txt')).read_text().splitlines():
    values = line.split()
    cls, coords = int(values[0]), list(map(float, values[1:]))
    if len(coords) == 4:
        cx, cy, width, height = coords
        box = [(cx-width/2)*image.width, (cy-height/2)*image.height, (cx+width/2)*image.width, (cy+height/2)*image.height]
        annotations.append({'label': names[cls], 'box': box})
    else:
        polygon = [(coords[i]*image.width, coords[i+1]*image.height) for i in range(0,len(coords),2)]
        annotations.append({'label': names[cls], 'polygon': polygon, 'box': [min(x for x,y in polygon), min(y for x,y in polygon), max(x for x,y in polygon), max(y for x,y in polygon)]})

font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
def annotated(items, masks=False):
    output = image.convert('RGBA')
    overlay = Image.new('RGBA', image.size)
    draw = ImageDraw.Draw(overlay)
    for index, item in enumerate(items):
        color = ['#51edff', '#dcff43', '#ffad5c'][index % 3]
        if masks and 'polygon' in item:
            draw.polygon(item['polygon'], fill=color + '40', outline=color)
        x1, y1, x2, y2 = item['box']
        draw.rectangle((x1, y1, x2, y2), outline=color, width=3)
        label = item['label'] + (f" {item['confidence']:.0%}" if 'confidence' in item else '')
        x, y = min(x1, max(0, image.width-draw.textlength(label,font=font)-10)), max(0,y1-24)
        draw.rectangle((x,y,x+draw.textlength(label,font=font)+10,y+24),fill='#15283a')
        draw.text((x+5,y+2),label,font=font,fill='white')
    return Image.alpha_composite(output,overlay).convert('RGB')

out = Path('public/assets/vision')
image.save(out / 'local-1-raw.webp', 'WEBP', quality=95)
annotated(detections).save(out / 'local-1-prediction.webp', 'WEBP', quality=95)
annotated(annotations, True).save(out / 'local-1-masks.webp', 'WEBP', quality=95)
manifest = json.loads((out / 'samples.json').read_text())
sample = next(item for item in manifest if item['id'] == 'local-1')
sample.update(detections=detections, source=str(source.relative_to(root)), annotationClasses=sorted({item['label'] for item in annotations}))
(out / 'samples.json').write_text(json.dumps(manifest, indent=2))
print('Updated local-1:', detections)
