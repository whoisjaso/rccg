#!/usr/bin/env bash
# splice.sh <tag> <from_s> [to_s] : replace master frames [from, to) with the re-rendered range (lossless)
set -euo pipefail
cd "$(dirname "$0")/../out"
F=$(python3 -c "print(round($2*60))")
if [ $# -ge 3 ]; then
  T=$(python3 -c "print(round($3*60))")
  FC="[0:v]trim=end_frame=$F,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[0:v]trim=start_frame=$T,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1[v]"
else
  FC="[0:v]trim=end_frame=$F,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1[v]"
fi
ffmpeg -hide_banner -loglevel error -y -i $1.master.mkv -i $1.range.mkv -filter_complex "$FC" \
 -map "[v]" -c:v libx264 -preset veryfast -qp 0 -pix_fmt yuv444p -r 60 $1.spliced.mkv
mv $1.spliced.mkv $1.master.mkv && rm $1.range.mkv
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $1.master.mkv
