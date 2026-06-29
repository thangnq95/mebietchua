#!/usr/bin/env python3
"""TikTok Video Generator for Mẹ Biết Chưa
Creates 1080x1920 vertical video with slides + voiceover
Requires: Pillow, ffmpeg, macOS 'say' command
Usage: python3 scripts/make-tiktok.py <name> <title> <subtitle> <cta>
"""

import sys, os, subprocess, tempfile, shutil

def create_slide(text_main, text_sub, bg_color, filename):
    from PIL import Image, ImageDraw, ImageFont
    W, H = 1080, 1920
    
    img = Image.new('RGB', (W, H), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to load a font
    try:
        font_main = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 42)
    except:
        font_main = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    
    # Main text
    bbox = draw.textbbox((0, 0), text_main, font=font_main)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((W - tw) / 2, H/2 - th - 30), text_main, fill='white', font=font_main)
    
    # Sub text
    bbox = draw.textbbox((0, 0), text_sub, font=font_sub)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((W - tw) / 2, H/2 + 10), text_sub, fill='white', font=font_sub)
    
    # URL footer
    try:
        font_url = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
    except:
        font_url = ImageFont.load_default()
    draw.text((40, H - 80), "mebietchua.com", fill='rgba(255,255,255,180)', font=font_url)
    
    img.save(filename)

def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "tiktok"
    title = sys.argv[2] if len(sys.argv) > 2 else "Công cụ cho mẹ bầu"
    subtitle = sys.argv[3] if len(sys.argv) > 3 else "Tính cân nặng thai nhi miễn phí"
    cta = sys.argv[4] if len(sys.argv) > 4 else "Lưu video & Follow để xem thêm!"
    
    tmpdir = tempfile.mkdtemp(prefix="tiktok-")
    outdir = "static/videos"
    os.makedirs(outdir, exist_ok=True)
    output = f"{outdir}/tiktok-{name}.mp4"
    
    # Colors
    PINK = (255, 107, 138)
    PURPLE = (139, 92, 246)
    GREEN = (16, 185, 129)
    
    # Create 3 slides
    create_slide(title, subtitle, PINK, f"{tmpdir}/slide1.png")
    create_slide("Vào ngay công cụ:", "mebietchua.com/cong-cu", PURPLE, f"{tmpdir}/slide2.png")
    create_slide("Miễn phí · Dễ dùng", cta, GREEN, f"{tmpdir}/slide3.png")
    
    # Generate voiceover
    voice_text = f"{title}. {subtitle}. Vào mebietchua.com để dùng ngay. Lưu video và follow Mẹ Biết Chưa để xem thêm công cụ miễn phí mỗi tuần nha mẹ."
    audio_file = f"{tmpdir}/voice.aiff"
    
    result = subprocess.run(
        ["say", "-v", "Linh", "-r", "180", "-o", audio_file, voice_text],
        capture_output=True, text=True
    )
    if result.returncode != 0 or not os.path.exists(audio_file) or os.path.getsize(audio_file) < 1000:
        print("⚠️  Linh voice failed, trying fallback...")
        subprocess.run(["say", "-v", "Samantha", "-r", "160", "-o", audio_file, "Welcome to Me Biet Chua. Try our free tools."], capture_output=True)
    
    # Get audio duration
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio_file],
        capture_output=True, text=True
    )
    duration = float(probe.stdout.strip() or 10)
    slide_dur = duration / 3
    
    # Make silent slides at correct duration
    for i, slide_file in enumerate(["slide1.png", "slide2.png", "slide3.png"]):
        subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", f"{tmpdir}/{slide_file}",
            "-c:v", "libx264", "-t", str(slide_dur),
            "-pix_fmt", "yuv420p", "-vf", "scale=1080:1920",
            f"{tmpdir}/vid{i+1}.mp4"
        ], capture_output=True)
    
    # Concat slides
    concat_file = f"{tmpdir}/concat.txt"
    with open(concat_file, "w") as f:
        for i in range(3):
            f.write(f"file '{tmpdir}/vid{i+1}.mp4'\n")
    
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
        "-i", audio_file,
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-shortest", "-movflags", "+faststart",
        output
    ], capture_output=True)
    
    if os.path.exists(output):
        size_mb = os.path.getsize(output) / 1024 / 1024
        print(f"✅ {output}")
        print(f"   Size: {size_mb:.1f}MB | Duration: {duration:.0f}s")
        print(f"   Ready for TikTok!")
    else:
        print("❌ Failed")
    
    shutil.rmtree(tmpdir, ignore_errors=True)

if __name__ == "__main__":
    main()
