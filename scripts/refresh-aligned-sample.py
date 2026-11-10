"""Export a visually reviewed aligned-contact sample from the supplied dataset.

Usage: python scripts/refresh-aligned-sample.py dataset-folder.zip vision_training
Requires Pillow, torch, and ultralytics. No credentials or download URLs are saved.
The complete camera image is preserved without colour or geometric adjustments.
"""
import io
import json
import sys
import zipfile
from pathlib import Path

import torch
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO

member = 'train/Contact_Aligned/22-1_mp4-0020_jpg.rf.10d87268aff16a4cf366fba1d40ca068.jpg'
root = Path(sys.argv[2])
with zipfile.ZipFile(sys.argv[1]) as archive:
    image = Image.open(io.BytesIO(archive.read(member))).convert('RGB')
torch.set_num_threads(4)
model = YOLO(str(root / 'Project 3 (Classification)/yolo11/state_model/best.pt'))
result = model.predict(image, device='cpu', verbose=False)[0]
probs = [{'label': result.names[i].replace('_', ' '), 'confidence': float(result.probs.data[i])} for i in range(len(result.names))]
assert max(probs, key=lambda p: p['confidence'])['label'] == 'Contact Aligned'
out = Path('public/assets/vision')
image.save(out / 'state-2-raw.webp', 'WEBP', quality=95)
prediction = image.copy()
draw = ImageDraw.Draw(prediction)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
draw.rectangle((0, 0, image.width, 24), fill='#15283a')
draw.text((7, 4), 'Contact Aligned', fill='white', font=font)
prediction.save(out / 'state-2-prediction.webp', 'WEBP', quality=95)
manifest = json.loads((out / 'samples.json').read_text())
sample = next(item for item in manifest if item['id'] == 'state-2')
sample.update(source=f'Roboflow hard-drive/hdd_process_states v5 / {member}', sourceUrl='https://universe.roboflow.com/hard-drive/hdd_process_states/5', annotationClasses=['Contact aligned'], detections=probs, selectionNote='Original Contact_Aligned class image; tool bit visibly seated in the screw. Classifier result recomputed from supplied state_model/best.pt.')
(out / 'samples.json').write_text(json.dumps(manifest, indent=2) + '\n')
print('Updated aligned-contact sample:', member)
