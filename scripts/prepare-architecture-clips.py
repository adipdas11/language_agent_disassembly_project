"""Export visually reviewed experiment excerpts for the animated system map."""
import json
import subprocess
import sys
from pathlib import Path

out = Path('public/assets/architecture')
out.mkdir(parents=True, exist_ok=True)
review = Path('/tmp/disassembly-media-review')
review.mkdir(exist_ok=True)
clips = [
    {'id': 'execution', 'label': 'Dual-arm execution', 'start': 80.0, 'duration': 12.0},
    {'id': 'hdd', 'label': 'HDD PCB extraction', 'start': 54.4, 'duration': 6.2},
    {'id': 'mini-pc', 'label': 'Mini PC heat-sink extraction', 'start': 66.6, 'duration': 6.6},
    {'id': 'laptop', 'label': 'Laptop heat-sink extraction', 'start': 134.4, 'duration': 7.8},
]
for clip in clips:
    dest = out / f'{clip["id"]}.mp4'
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', str(clip['start']), '-i', sys.argv[1], '-t', str(clip['duration']), '-vf', 'crop=688:516:0:148,scale=768:576,setsar=1', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', '25', '-movflags', '+faststart', str(dest)], check=True)
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', '2', '-i', str(dest), '-frames:v', '1', str(out / f'{clip["id"]}-poster.webp')], check=True)
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', str(dest), '-vf', 'fps=1,scale=240:180,tile=5x3', '-frames:v', '1', str(review / f'architecture-{clip["id"]}.jpg')], check=True)
    clip.update({'src': f'/assets/architecture/{clip["id"]}.mp4', 'poster': f'/assets/architecture/{clip["id"]}-poster.webp', 'crop': '688:516:0:148', 'source': 'https://www.youtube.com/watch?v=lEE3qmOJsXo', 'speed': 'As shown in the experiment recording'})
(out / 'clips.json').write_text(json.dumps(clips, indent=2))
