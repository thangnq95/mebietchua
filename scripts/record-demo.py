#!/usr/bin/env python3
"""Record TikTok demo video of mebietchua.com tools using Playwright.
Captures actual browser interaction + Vietnamese voiceover.
Output: 1080x1920 portrait MP4 for TikTok.
Usage: python3 scripts/record-demo.py <tool-name> <voice-script>
Example: python3 scripts/record-demo.py tinh-can-nang-thai-nhi "Mẹ ơi đây là công cụ..."
"""

import sys, os, subprocess, time, tempfile, shutil

def main():
    from playwright.sync_api import sync_playwright
    
    tool = sys.argv[1] if len(sys.argv) > 1 else "tinh-can-nang-thai-nhi"
    voice_text = sys.argv[2] if len(sys.argv) > 2 else (
        "Mẹ ơi, vào mebietchua.com, chọn Công Cụ, rồi chọn Tính cân nặng thai nhi. "
        "Mẹ chỉ cần nhập tuần thai, ví dụ 28 tuần, bấm nút tính. "
        "Là biết ngay bé nặng khoảng 1 ký. Thanh màu xanh là bình thường, vàng là cần theo dõi. "
        "Công cụ hoàn toàn miễn phí. Vào mebietchua.com dùng ngay nha mẹ!"
    )
    
    BASE = "https://mebietchua.com"
    URL = f"{BASE}/cong-cu/{tool}/"
    W, H = 390, 844  # iPhone viewport for portrait recording
    
    tmpdir = tempfile.mkdtemp(prefix="demo-")
    outdir = "static/videos"
    os.makedirs(outdir, exist_ok=True)
    output = f"{outdir}/demo-{tool}.mp4"
    
    # Step 1: Generate voiceover
    audio_file = f"{tmpdir}/voice.aiff"
    subprocess.run(
        ["say", "-v", "Linh", "-r", "175", "-o", audio_file, voice_text],
        capture_output=True
    )
    
    # Get audio duration
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", audio_file],
        capture_output=True, text=True
    )
    duration = float(probe.stdout.strip() or 15)
    print(f"🎙️  Voice: {duration:.0f}s")
    
    # Step 2: Record browser interaction
    video_file = f"{tmpdir}/screen.webm"
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={"width": W, "height": H},
            device_scale_factor=2,
            record_video_dir=tmpdir,
            record_video_size={"width": W * 2, "height": H * 2}
        )
        page = context.new_page()
        
        # Navigate to tool
        print(f"🌐 Opening {URL}...")
        page.goto(URL, wait_until="networkidle", timeout=15000)
        time.sleep(2)
        
        # Find input and type
        try:
            input_el = page.locator("input[type='number']").first
            if input_el:
                input_el.click()
                time.sleep(0.3)
                # Type slowly for realism
                for char in "28":
                    input_el.press(char)
                    time.sleep(0.15)
                time.sleep(0.5)
        except:
            pass
        
        # Click calculate button
        try:
            btn = page.locator("button").filter(has_text="Tính").first
            if btn:
                btn.click()
                time.sleep(1.5)
        except:
            pass
        
        # Scroll to results
        page.evaluate("window.scrollBy(0, 300)")
        time.sleep(2)
        
        # Show the homepage briefly
        page.goto(BASE, wait_until="networkidle", timeout=10000)
        time.sleep(2)
        
        # Stop recording
        context.close()
        browser.close()
    
    # Find the recorded video
    import glob
    videos = glob.glob(f"{tmpdir}/*.webm")
    if not videos:
        print("❌ No video recorded")
        return
    
    recorded = videos[0]
    print(f"📹 Recorded: {os.path.getsize(recorded)/1024:.0f}KB")
    
    # Step 3: Convert to portrait MP4 with voiceover
    # Crop top bar (URL bar) and bottom, scale to 1080x1920
    subprocess.run([
        "ffmpeg", "-y",
        "-i", recorded,
        "-i", audio_file,
        "-vf", (
            "scale=780:1688,"        # 2x viewport
            "crop=780:1688:0:0,"     # remove URL bar area
            "scale=1080:1920,"       # TikTok portrait
            "format=yuv420p"
        ),
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
        print("❌ Failed to create video")
    
    shutil.rmtree(tmpdir, ignore_errors=True)

if __name__ == "__main__":
    main()
