#!/bin/bash
# TikTok Video Generator for Mẹ Biết Chưa
# Usage: bash scripts/make-tiktok.sh <script-file>
# Example: bash scripts/make-tiktok.sh content/tiktok/script-fetal-weight-calculator.md
#
# Requires: ffmpeg, say (macOS built-in)
# Output: static/videos/tiktok-<name>.mp4

SCRIPT_FILE="$1"
OUTPUT_DIR="static/videos"
mkdir -p "$OUTPUT_DIR"

NAME=$(basename "$SCRIPT_FILE" .md)
OUTPUT="$OUTPUT_DIR/tiktok-$NAME.mp4"

echo "🎬 Making TikTok: $NAME"

# === Step 1: Generate voiceover with macOS 'say' ===
AUDIO_FILE="/tmp/tiktok-voice-$NAME.aiff"
VOICE_TEXT="Mẹ ơi, đây là công cụ tính cân nặng thai nhi miễn phí cho mẹ bầu. 
Vào mebietchua.com, chọn Công Cụ, nhập tuần thai là biết ngay bé nặng bao nhiêu. 
Lưu video này lại để dùng nha mẹ."

echo "$VOICE_TEXT" | say -v "Linh" -r 180 -o "$AUDIO_FILE" 2>/dev/null

# Fallback: English voice if Vietnamese not available
if [ ! -f "$AUDIO_FILE" ] || [ $(stat -f%z "$AUDIO_FILE" 2>/dev/null || echo 0) -lt 1000 ]; then
  echo "⚠️  Vietnamese voice 'Linh' not found, trying English..."
  say -v Samantha -r 160 -o "$AUDIO_FILE" "Welcome to Mẹ Biết Chưa. Check out our free baby weight calculator at mebietchua.com"
fi

# === Step 2: Create slides with ffmpeg drawtext ===
SLIDE_DIR="/tmp/tiktok-slides-$NAME"
mkdir -p "$SLIDE_DIR"

# Slide 1: Hook (pink gradient background + text)
ffmpeg -y -f lavfi -i "color=c=0xFF6B8A:s=1080x1920:d=3,format=rgba" \
  -f lavfi -i "color=c=0xFF8E9E:s=1080x1920:d=3,format=rgba" \
  -filter_complex "[0][1]blend=all_mode=gradient:c0_opacity=1:c1_opacity=0.5" \
  -frames:v 90 "$SLIDE_DIR/slide1.mp4" 2>/dev/null

# Slide 2: Demo screen
ffmpeg -y -f lavfi -i "color=c=0x8B5CF6:s=1080x1920:d=5,format=rgba" \
  -f lavfi -i "color=c=0xEC4899:s=1080x1920:d=5,format=rgba" \
  -filter_complex "[0][1]blend=all_mode=gradient:c0_opacity=1:c1_opacity=0.5" \
  -frames:v 150 "$SLIDE_DIR/slide2.mp4" 2>/dev/null

# Slide 3: CTA (green gradient)
ffmpeg -y -f lavfi -i "color=c=0x10B981:s=1080x1920:d=3,format=rgba" \
  -f lavfi -i "color=c=0x059669:s=1080x1920:d=3,format=rgba" \
  -filter_complex "[0][1]blend=all_mode=gradient:c0_opacity=1:c1_opacity=0.5" \
  -frames:v 90 "$SLIDE_DIR/slide3.mp4" 2>/dev/null

# === Step 3: Add text overlays to slides ===
# Slide 1 text: Hook
ffmpeg -y -i "$SLIDE_DIR/slide1.mp4" \
  -vf "drawtext=text='Công cụ tính cân nặng thai nhi':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-80:fontfile=/System/Library/Fonts/Helvetica.ttc, \
       drawtext=text='MIỄN PHÍ cho mẹ bầu':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+20:fontfile=/System/Library/Fonts/Helvetica.ttc" \
  "$SLIDE_DIR/slide1-text.mp4" 2>/dev/null

# Slide 2 text: URL
ffmpeg -y -i "$SLIDE_DIR/slide2.mp4" \
  -vf "drawtext=text='mebietchua.com/cong-cu':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40:fontfile=/System/Library/Fonts/Helvetica.ttc, \
       drawtext=text='Nhập tuần thai → Biết cân nặng':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+30:fontfile=/System/Library/Fonts/Helvetica.ttc" \
  "$SLIDE_DIR/slide2-text.mp4" 2>/dev/null

# Slide 3 text: CTA
ffmpeg -y -i "$SLIDE_DIR/slide3.mp4" \
  -vf "drawtext=text='Follow Mẹ Biết Chưa':fontsize=56:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40:fontfile=/System/Library/Fonts/Helvetica.ttc, \
       drawtext=text='Thêm nhiều tools miễn phí!':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+30:fontfile=/System/Library/Fonts/Helvetica.ttc" \
  "$SLIDE_DIR/slide3-text.mp4" 2>/dev/null

# === Step 4: Concatenate slides ===
echo "file '$SLIDE_DIR/slide1-text.mp4'" > /tmp/concat-$NAME.txt
echo "file '$SLIDE_DIR/slide2-text.mp4'" >> /tmp/concat-$NAME.txt
echo "file '$SLIDE_DIR/slide3-text.mp4'" >> /tmp/concat-$NAME.txt

ffmpeg -y -f concat -safe 0 -i /tmp/concat-$NAME.txt \
  -i "$AUDIO_FILE" \
  -c:v libx264 -preset fast -crf 23 \
  -c:a aac -b:a 128k \
  -shortest -movflags +faststart \
  "$OUTPUT" 2>/dev/null

# === Step 5: Report ===
if [ -f "$OUTPUT" ]; then
  SIZE=$(du -h "$OUTPUT" | cut -f1)
  DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUTPUT" 2>/dev/null | cut -d. -f1)
  echo "✅ Done: $OUTPUT"
  echo "   Size: $SIZE | Duration: ${DURATION}s"
  echo "   Ready to upload to TikTok!"
else
  echo "❌ Failed. Check ffmpeg installation."
fi
