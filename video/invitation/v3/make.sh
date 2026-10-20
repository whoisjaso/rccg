#!/usr/bin/env bash
# One command from script to finished film, following the video standard's voice SOP (voice-selection-sop.md):
#   ElevenLabs takes (3 voices x 2 seeds, pinned model) -> score_takes.py -> picks -> assemble_vo.py -> word-synced
#   timeline -> 1080p60 renders (9:16 + 16:9) -> mix (VO + Pastor Joel's songs + library SFX) -> -14 LUFS -> gates.
# Needs ELEVENLABS_API_KEY in the environment (set by the owner as an environment secret; never printed or committed).
#
#   VOICES=id1,id2,id3 ./make.sh          # cast these three voices (default: tools/cast.py picks from the account)
#   ONLY_ORIENT=v ./make.sh               # 9:16 only
set -euo pipefail
cd "$(dirname "$0")"
STD=${VIDEO_STANDARD:-/home/user/video-editing-standard}
MODEL=${ELEVEN_MODEL:-eleven_v4}
: "${ELEVENLABS_API_KEY:?ELEVENLABS_API_KEY is not set: add it as an environment secret, then start a new session}"
mkdir -p work/takes work/vo out

# 1. cast + takes (Creative stability 0.0 = the most expressive read; the [tags] in beats.json carry the emotion)
VOICES=${VOICES:-$(python3 tools/cast.py)}
echo "voices: $VOICES  model: $MODEL"
python3 "$STD/tools/voice/elevenlabs_takes.py" takes beats.json work/takes "$VOICES" --n 2 --model "$MODEL" --stability 0.0
# 2. score (whisper accuracy + pitch range = expressiveness) and pick the best take per beat of the winning voice
python3 "$STD/tools/voice/score_takes.py" beats.json work/takes --out work/picks.json
# 3. assemble with the meaning-led gaps + the Liquid voice chain, then lock every word to its frame
python3 "$STD/tools/voice/assemble_vo.py" beats.json work/picks.json work/vo
python3 tools/timeline.py vo work/vo

for O in ${ONLY_ORIENT:-v h}; do
  T=$([ "$O" = v ] && echo dayspring-v3-9x16 || echo dayspring-v3-16x9)
  # 4. render the picture natively at 1080p, exactly 60/1
  node tools/render.mjs video "$O" "out/$T.mp4" 4
  # 5. mix and master (-14 LUFS, true peak -1.5 dBTP with music), every frame kept
  python3 tools/mix.py "out/$T.cues.json" "work/$T-mix.wav" --vo work/vo/vo.wav
  J=$(ffmpeg -hide_banner -i "work/$T-mix.wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
  ffmpeg -hide_banner -loglevel error -y -i "work/$T-mix.wav" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s16le "work/$T-audio.wav"
  NF=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "out/$T.master.mkv")
  ffmpeg -hide_banner -loglevel error -y -i "out/$T.master.mkv" -i "work/$T-audio.wav" -map 0:v -map 1:a -af apad -t "$(python3 -c "print($NF/60)")" \
    -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -profile:v high -r 60 -g 120 -bf 2 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -c:a aac -b:a 384k -ar 48000 -map_metadata -1 -fflags +bitexact -flags:v +bitexact -flags:a +bitexact -movflags +faststart "out/$T.mp4"
  # 6. gates (docs/qa-checklist.md)
  ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=width,height,r_frame_rate,nb_read_frames -of csv=p=0 "out/$T.mp4"
  ffmpeg -hide_banner -i "out/$T.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
  python3 "$STD/tools/word_sync.py" check "out/$T.wordsheet.json" work/words_sync.json --json "work/$T-wordsync.json"
  python3 "$STD/tools/smoothness_check.py" "out/$T.mp4"
done
python3 "$STD/tools/whisper_check.py" --ref work/dayspring-v3-9x16-mix.vo_only.wav --mix out/dayspring-v3-9x16.mp4 --json work/whisper.json | tail -3 || true
echo "done: out/*.mp4"
