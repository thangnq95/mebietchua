#!/usr/bin/env python3
"""Generate cover thumbnails for mebietchua.com blog posts.
Creates 1200x630 social share images with post title.
Requires: Pillow
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUTDIR = "static/images/posts"
os.makedirs(OUTDIR, exist_ok=True)

# Post slug -> title mapping
POSTS = {
    "pregnancy-month-3-body-changes": ("Mẹ Bầu Tháng 3", "Cơ thể thay đổi & ốm nghén", "#ff6b8a"),
    "pregnancy-month-4-first-kicks": ("Mẹ Bầu Tháng 4", "Thai máy lần đầu", "#ec4899"),
    "pregnancy-month-5-baby-shopping": ("Mẹ Bầu Tháng 5", "Checklist đồ sơ sinh", "#8b5cf6"),
    "pregnancy-month-6-nutrition-exercise": ("Mẹ Bầu Tháng 6", "Dinh dưỡng & vận động", "#10b981"),
    "pregnancy-month-7-back-pain-swelling": ("Mẹ Bầu Tháng 7", "Đau lưng & phù chân", "#f59e0b"),
    "pregnancy-month-8-hospital-bag": ("Mẹ Bầu Tháng 8", "Chuẩn bị túi đi sinh", "#ef4444"),
    "pregnancy-month-9-labor-signs": ("Mẹ Bầu Tháng 9", "Dấu hiệu sắp sinh", "#6366f1"),
    "newborn-month-1-first-weeks": ("Bé Sơ Sinh Tháng 1", "Chăm sóc tuần đầu", "#14b8a6"),
    "baby-month-2-3-milestones": ("Bé 2-3 Tháng", "Cười lần đầu, tập lật", "#f472b6"),
    "baby-month-4-5-starting-solids": ("Bé 4-5 Tháng", "Bắt đầu ăn dặm", "#a855f7"),
    "baby-month-6-8-sitting-teething": ("Bé 6-8 Tháng", "Tập ngồi, mọc răng", "#06b6d4"),
    "baby-month-9-10-standing-talking": ("Bé 9-10 Tháng", "Tập đứng, nói từ đầu", "#84cc16"),
    "baby-month-11-12-first-birthday": ("Bé 11-12 Tháng", "Tròn 1 tuổi", "#f97316"),
    "hanh-trinh-me-bau-roadmap": ("Hành Trình Mẹ Bầu", "Roadmap 3-9 tháng", "#db2777"),
    "hanh-trinh-nuoi-con-roadmap": ("Hành Trình Nuôi Con", "Roadmap 0-12 tháng", "#0891b2"),
}

W, H = 1200, 630

for slug, (title, subtitle, color) in POSTS.items():
    path = f"{OUTDIR}/{slug}.webp"
    
    # Create gradient background
    img = Image.new('RGBA', (W, H), color)
    draw = ImageDraw.Draw(img)
    
    # Add semi-transparent overlay
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 60))
    img = Image.alpha_composite(img.convert('RGBA'), overlay)
    draw = ImageDraw.Draw(img)
    
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 42)
        font_url = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    except:
        font_title = font_sub = font_url = ImageFont.load_default()
    
    # Title
    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, H/2 - 80), title, fill='white', font=font_title)
    
    # Subtitle
    bbox = draw.textbbox((0, 0), subtitle, font=font_sub)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, H/2 + 10), subtitle, fill='rgba(255,255,255,200)', font=font_sub)
    
    # URL
    draw.text((40, H - 50), "mebietchua.com", fill='rgba(255,255,255,150)', font=font_url)
    
    img.convert('RGB').save(path, 'WEBP', quality=85)
    size_kb = os.path.getsize(path) // 1024
    print(f"✅ {slug}.webp ({size_kb}KB)")

print(f"\nDone! {len(POSTS)} thumbnails in {OUTDIR}/")
