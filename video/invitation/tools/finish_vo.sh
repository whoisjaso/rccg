#!/usr/bin/env bash
# finish_vo.sh <tag> : master.mkv + cue sheet -> VO/music/SFX mix -> -14 LUFS (TP -1.5, music master) -> final MP4
set -euo pipefail
cd "$(dirname "$0")/.."
T=out/vo/$1
python3 tools/mix.py $T.cues.json work/$1-mix.wav
J=$(ffmpeg -hide_banner -i work/$1-mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -loglevel error -y -i work/$1-mix.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s16le work/$1-audio.wav
NF=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $T.master.mkv)
DT=$(python3 -c "print($NF/60)")
ffmpeg -hide_banner -loglevel error -y -i $T.master.mkv -i work/$1-audio.wav -map 0:v -map 1:a -af apad -t $DT \
  -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -profile:v high -r 60 -g 120 -bf 2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 384k -ar 48000  -map_metadata -1 -fflags +bitexact -flags:v +bitexact -flags:a +bitexact \
  -movflags +faststart $T.mp4
ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=width,height,r_frame_rate,nb_read_frames -of csv=p=0 $T.mp4
ffmpeg -hide_banner -i $T.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
