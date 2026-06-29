#!/bin/bash
# Google Search Console Verification Helper
# Usage: bash scripts/gsc-verify.sh <google-filename>.html
# Example: bash scripts/gsc-verify.sh google123abc.html

set -e
FILE="$1"

if [ -z "$FILE" ]; then
  echo "❌ Usage: bash scripts/gsc-verify.sh <google-filename>.html"
  echo ""
  echo "📋 Steps:"
  echo "   1. Go to https://search.google.com/search-console"
  echo "   2. Add property: mebietchua.com (URL prefix)"
  echo "   3. Choose 'HTML file upload' verification"
  echo "   4. Google gives you a filename like: google123abc.html"
  echo "   5. Run: bash scripts/gsc-verify.sh google123abc.html"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "🔑 Creating verification file: static/$FILE"
touch "static/$FILE"

echo "⚙️  Building Hugo..."
hugo --gc --minify --quiet

echo "📤 Deploying..."
git add "static/$FILE"
git commit -m "feat: Google Search Console verification"
git push origin main

echo ""
echo "✅ File deployed to: https://mebietchua.com/$FILE"
echo "🔗 Go back to Search Console and click 'VERIFY'"
echo "📊 After verified, submit sitemap: https://mebietchua.com/sitemap.xml"
