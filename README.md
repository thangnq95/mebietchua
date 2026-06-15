# mebietchua.com

Hugo site cho mebietchua.com — website nội dung cho mẹ và bé.

## Setup (One Time)

```bash
# 1. Clone this repo
git clone https://github.com/YOUR_USERNAME/mebietchua.git
cd mebietchua

# 2. Add PaperMod theme
git submodule add https://github.com/adityatelange/hugo-PaperMod themes/PaperMod

# 3. Run locally to preview
hugo server -D
# Open http://localhost:1313
```

## Deploy

Push to `main` branch → GitHub Actions auto-deploys to GitHub Pages.

```bash
git add .
git commit -m "update content"
git push origin main
```

## Add New Article

```bash
hugo new content posts/your-article-title.md
```

Then edit the file in `content/posts/`.

## Kết nối domain riêng (mebietchua.com)

1. In GitHub repo → Settings → Pages → Custom domain → enter `mebietchua.com`
2. In Cloudflare DNS → add these records:
   - A record: `@` → `185.199.108.153`
   - A record: `@` → `185.199.109.153`
   - A record: `@` → `185.199.110.153`
   - A record: `@` → `185.199.111.153`
   - CNAME: `www` → `YOUR_USERNAME.github.io`

## Structure

```
content/
  posts/
    best-breast-pumps.md
    best-bottle-warmers.md
    newborn-essentials-checklist.md
    momcozy-m5-review.md
    breastfeeding-essentials.md
  gioi-thieu.md
  cach-chung-toi-review.md
  lien-he.md
```
