"""Export each recorded device sequence and a 2x combined execution video.

Usage: python3 scripts/prepare-architecture-clips.py /path/to/experiment.mp4
Times refer to the supplied experiment recording, which already contains edits
and accelerated passages. Opening slides and obsolete result overlays are omitted.
"""
import json
import subprocess
import sys
from pathlib import Path

out = Path('public/assets/architecture')
out.mkdir(parents=True, exist_ok=True)
review = Path('/tmp/remake-sequence-review')
review.mkdir(exist_ok=True)
source_url = 'https://www.youtube.com/watch?v=lEE3qmOJsXo'
crop = '950:612:0:50'
segments = [
    {'id': 'hdd', 'label': 'HDD recorded disassembly sequence', 'start': 21.2, 'end': 62.7},
    {'id': 'mini-pc', 'label': 'Mini PC recorded disassembly sequence', 'start': 66.8, 'end': 108.3},
    {'id': 'laptop', 'label': 'Laptop recorded disassembly sequence', 'start': 112.4, 'end': 143.2},
]

def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', *args], check=True)

encoding = ['-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
clips = []
for segment in segments:
    stem = f'{segment["id"]}-full'
    duration = round(segment['end'] - segment['start'], 2)
    ffmpeg('-ss', str(segment['start']), '-i', sys.argv[1], '-t', str(duration), '-vf', f'crop={crop},setsar=1,fps=25', *encoding, str(out / f'{stem}.mp4'))
    clips.append({**segment, 'duration': duration, 'src': f'/assets/architecture/{stem}.mp4', 'poster': f'/assets/architecture/{stem}-poster.webp', 'crop': crop, 'source': source_url, 'speed': '1x recording playback; source includes accelerated passages', 'note': 'Complete recorded device segment, not an uncut recording of every target step. Original tool-camera inset retained.'})

filters = []
for i, segment in enumerate(segments):
    filters.append(f'[0:v]trim=start={segment["start"]}:end={segment["end"]},setpts=(PTS-STARTPTS)/2,crop={crop},setsar=1,fps=25[v{i}]')
filters.append('[v0][v1][v2]concat=n=3:v=1:a=0[out]')
ffmpeg('-i', sys.argv[1], '-filter_complex', ';'.join(filters), '-map', '[out]', *encoding, str(out / 'execution-all-devices.mp4'))
clips.insert(0, {'id': 'execution', 'label': 'All three recorded disassembly sequences', 'duration': round(sum(c['duration'] for c in clips) / 2, 2), 'src': '/assets/architecture/execution-all-devices.mp4', 'poster': '/assets/architecture/execution-all-devices-poster.webp', 'crop': crop, 'source': source_url, 'speed_factor': 2, 'speed': '2x recording playback; source includes accelerated passages', 'segments': [{**s, 'output_start': round(sum(p['end'] - p['start'] for p in segments[:i]) / 2, 2)} for i,s in enumerate(segments)], 'note': 'HDD, Mini PC, then Laptop; full recorded action segments, with title and summary slides omitted.'})
for clip in clips:
    path = Path('public' + clip['src'])
    ffmpeg('-ss', '1', '-i', str(path), '-frames:v', '1', 'public' + clip['poster'])
    count = 12 if clip['id'] == 'execution' else 6
    ffmpeg('-i', str(path), '-vf', f'fps={count}/{clip["duration"]},scale=320:206,drawtext=text=\'%{{pts\\:hms}}\':fontsize=18:fontcolor=white:box=1:boxcolor=black@0.8:x=5:y=5,tile={4 if count == 12 else 3}x{3 if count == 12 else 2}', '-frames:v', '1', str(review / f'{clip["id"]}-full-review.jpg'))
(out / 'clips.json').write_text(json.dumps(clips, indent=2) + '\n')
print('Exported:', [(c['id'], c['duration']) for c in clips])
