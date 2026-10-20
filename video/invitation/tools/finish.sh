#!/usr/bin/env bash
# finish.sh <tag> : master.mkv + cues -> score -> loudness master -> final MP4 (exactly 60/1, metadata stripped)
set -euo pipefail
cd "$(dirname "$0")/.."
TAG=$1
M=out/$TAG.master.mkv
python3 tools/score.py out/$TAG.cues.json work/$TAG-score.wav 56
# two-pass loudnorm to -14 LUFS, true peak -4.5 dBTP
J=$(ffmpeg -hide_banner -i work/$TAG-score.wav -af loudnorm=I=-14:TP=-4.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -loglevel error -y -i work/$TAG-score.wav -af "loudnorm=I=-14:TP=-4.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s16le work/$TAG-audio.wav
ffmpeg -hide_banner -loglevel error -y -i $M -i work/$TAG-audio.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -profile:v high -r 60 -g 120 -bf 2 \
  -vf "format=yuv420p" -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 384k -ar 48000 -shortest -map_metadata -1 -fflags +bitexact -flags:v +bitexact -flags:a +bitexact \
  -movflags +faststart out/$TAG.mp4
ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=width,height,r_frame_rate,nb_read_frames -of csv=p=0 out/$TAG.mp4
ffmpeg -hide_banner -i out/$TAG.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
