"""Trim reviewed action segments from the supplied YouTube experiment recording.

Usage: python3 scripts/prepare-action-clips.py /path/to/experiment.mp4
Requires ffmpeg. The source video is already accelerated; preserve its timing.
"""
import json
import subprocess
import sys
from pathlib import Path

out = Path('public/assets/actions')
out.mkdir(parents=True, exist_ok=True)
clips = [
    {'id': 'unscrew', 'start': 22.5, 'duration': 7.3, 'label': 'Unscrew', 'description': 'The tooling arm aligns the screwdriver, engages a lid fastener, and retracts after screw removal.'},
    {'id': 'pick', 'start': 30.2, 'duration': 6.4, 'label': 'Pick-and-Extract', 'description': 'The manipulation arm grasps the released HDD lid, lifts it clear of the drive, and transfers it away.'},
    {'id': 'flip', 'start': 38.2, 'duration': 7.8, 'label': 'Flip', 'description': 'The manipulation arm grasps the HDD, rotates it through 180 degrees, and places it back with the PCB exposed.'},
]
for clip in clips:
    # Keep the manipulation workspace; remove the planner pane and captions.
    # For unscrewing, retain a separate tool-camera inset showing engagement.
    filters = '[0:v]crop=688:516:0:148,scale=960:720[main]'
    if clip['id'] == 'unscrew':
        filters += ';[0:v]crop=252:188:706:520,scale=252:188[inset];[main][inset]overlay=698:10,setsar=1[v]'
    else:
        filters += ';[main]setsar=1[v]'
    dest = out / (clip['id'] + '.mp4')
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', str(clip['start']), '-i', sys.argv[1], '-t', str(clip['duration']), '-filter_complex', filters, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', '25', '-movflags', '+faststart', str(dest)], check=True)
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', '2', '-i', str(dest), '-frames:v', '1', str(out / (clip['id'] + '-poster.webp'))], check=True)
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', str(dest), '-vf', 'fps=1,scale=240:180,tile=4x2', '-frames:v', '1', f'/tmp/disassembly-media-review/{clip["id"]}-review.jpg'], check=True)
    clip.update({'src': f'/assets/actions/{clip["id"]}.mp4', 'poster': f'/assets/actions/{clip["id"]}-poster.webp', 'crop': '688:516:0:148', 'source': 'https://www.youtube.com/watch?v=lEE3qmOJsXo', 'playback': 'Original demonstration speed (source contains 3× segments)'})
(out / 'clips.json').write_text(json.dumps(clips, indent=2))
