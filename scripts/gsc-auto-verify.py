#!/usr/bin/env python3
"""Auto-verify mebietchua.com on Google Search Console using Playwright.
Reuses your existing Chrome profile (already logged into Google).
Usage: python3 scripts/gsc-auto-verify.py
"""
import sys, os, subprocess, time, re, glob

CHROME_PROFILE = os.path.expanduser("~/Library/Application Support/Google/Chrome/Default")
SITE = "https://mebietchua.com"
GSC = "https://search.google.com/search-console"

def main():
    from playwright.sync_api import sync_playwright
    
    print("🔑 Opening Chrome with your profile...")
    
    with sync_playwright() as p:
        # Use persistent context to reuse Chrome profile (keeps Google login)
        context = p.chromium.launch_persistent_context(
            CHROME_PROFILE,
            headless=False,
            channel="chrome",
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        page = context.pages[0] if context.pages else context.new_page()
        
        # Step 1: Go to Search Console
        print("📍 Navigating to Search Console...")
        page.goto(f"{GSC}/welcome", wait_until="networkidle", timeout=30000)
        time.sleep(3)
        
        # Check if already logged in
        if "accounts.google.com" in page.url:
            print("⏳ Please sign in to Google in the browser window...")
            page.wait_for_url("**/search-console/**", timeout=120000)
            print("✅ Signed in!")
        
        # Step 2: Check if property already exists
        page.goto(GSC, wait_until="networkidle", timeout=30000)
        time.sleep(2)
        
        # Try to select property
        try:
            # Click property selector
            selector = page.locator("[aria-label*='property']").first
            if selector:
                selector.click()
                time.sleep(1)
                page.keyboard.type(SITE)
                time.sleep(0.5)
                page.keyboard.press("Enter")
        except:
            pass
        
        # Step 3: Try to add property via URL prefix
        print(f"🔗 Adding property: {SITE}")
        page.goto(f"{GSC}/add?resource_id={SITE}", wait_until="networkidle", timeout=30000)
        time.sleep(3)
        
        # Check verification method
        current_url = page.url
        print(f"   Current URL: {current_url}")
        
        # Step 4: Look for HTML file verification
        try:
            # Find the HTML file method
            html_method = page.locator("text=HTML file").first
            if html_method:
                html_method.click()
                time.sleep(2)
        except:
            pass
        
        # Step 5: Extract filename from page
        page_content = page.content()
        
        # Look for googleXXXX.html pattern
        match = re.search(r'google([a-f0-9]+)\.html', page_content)
        if not match:
            # Try to find in any text
            filename_text = page.locator("text=google").first
            if filename_text:
                text = filename_text.text_content()
                match = re.search(r'google([a-f0-9]+)\.html', text)
        
        if match:
            filename = f"google{match.group(1)}.html"
            print(f"📄 Found verification file: {filename}")
            
            # Step 6: Create file and deploy
            filepath = f"static/{filename}"
            with open(filepath, "w") as f:
                f.write(f"google-site-verification: {filename}")
            
            print(f"📝 Created {filepath}")
            
            # Build & deploy
            subprocess.run(["hugo", "--gc", "--minify", "--quiet"], cwd=os.path.dirname(os.path.abspath(__file__)) + "/..")
            subprocess.run(["git", "add", filepath])
            subprocess.run(["git", "commit", "-m", f"verify: Google Search Console {filename}"])
            subprocess.run(["git", "push", "origin", "main"])
            
            print(f"✅ Deployed! File at: {SITE}/{filename}")
            time.sleep(5)
            
            # Step 7: Click VERIFY button
            print("🔍 Looking for VERIFY button...")
            verify_btn = page.locator("button:has-text('Verify')").first
            if verify_btn:
                verify_btn.click()
                print("✅ Clicked VERIFY")
                time.sleep(5)
                
                # Check result
                if "verified" in page.content().lower() or "success" in page.content().lower():
                    print("🎉 DOMAIN VERIFIED!")
                    
                    # Step 8: Submit sitemap
                    page.goto(f"{GSC}/sitemaps?resource_id={SITE}", wait_until="networkidle", timeout=30000)
                    time.sleep(2)
                    
                    sitemap_input = page.locator("input[type='url']").first
                    if sitemap_input:
                        sitemap_input.fill(f"{SITE}/sitemap.xml")
                        page.locator("button:has-text('Submit')").first.click()
                        print("📊 Sitemap submitted!")
            else:
                print("⚠️  Please click VERIFY manually in the browser")
        else:
            print("⚠️  Could not find HTML filename. Checking page content...")
            # Save screenshot for debugging
            page.screenshot(path="/tmp/gsc-debug.png")
            print("   Screenshot saved to /tmp/gsc-debug.png")
            print("   Please complete verification manually:")
            print(f"   1. Get the HTML filename from page")
            print(f"   2. Run: bash scripts/gsc-verify.sh <filename>")
        
        print("\n⏳ Browser will stay open for 30s. Close it when done.")
        time.sleep(30)
        context.close()

if __name__ == "__main__":
    main()
