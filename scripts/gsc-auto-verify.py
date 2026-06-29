#!/usr/bin/env python3
"""GSC auto-verify using your Chrome profile (already logged in Google).
Usage: python3 scripts/gsc-auto-verify.py
"""
import subprocess, os, sys, time, re

CHROME_PROFILE = os.path.expanduser("~/Library/Application Support/Google/Chrome")
SITE = "https://mebietchua.com"
GSC = "https://search.google.com/search-console"

def main():
    from playwright.sync_api import sync_playwright
    
    print("🔑 Using Chrome profile: thangnq95@gmail.com (Default)")
    
    with sync_playwright() as p:
        try:
            context = p.chromium.launch_persistent_context(
                user_data_dir=CHROME_PROFILE,
                channel="chrome",
                headless=False,
                args=["--disable-blink-features=AutomationControlled", "--profile-directory=Default"],
                no_viewport=True
            )
        except Exception as e:
            print(f"❌ Cannot open Chrome: {e}")
            print("Close Chrome first (cmd+Q) then retry")
            return
        
        page = context.pages[0] if context.pages else context.new_page()
        
        # Go to GSC add property page
        add_url = f"{GSC}/welcome?resource_id={SITE}"
        print(f"📍 Opening: {add_url}")
        page.goto(add_url, timeout=15000)
        time.sleep(3)
        
        # Check if login needed
        if "Sign in" in page.content()[:5000] or "accounts.google" in page.url:
            print("⏳ Login required — sign in in the browser window...")
            try:
                page.wait_for_function("window.location.href.includes('search-console')", timeout=120000)
            except:
                pass
            time.sleep(2)
        
        print("📋 Looking for HTML verification file...")
        
        # Try to find and click HTML file upload method
        html_texts = page.locator("text=HTML").all()
        for el in html_texts:
            try:
                if "file" in el.text_content().lower() or "upload" in el.text_content().lower():
                    el.click()
                    time.sleep(1)
                    break
            except:
                pass
        
        # Extract filename
        content = page.content()
        match = re.search(r'google[a-f0-9]+\.html', content)
        
        if match:
            filename = match.group(0)
            print(f"📄 Found: {filename}")
            
            # Create + deploy file
            filepath = f"static/{filename}"
            with open(filepath, "w") as f:
                f.write(f"google-site-verification: {filename}")
            
            print(f"📝 Created {filepath}")
            
            subprocess.run(["git", "add", filepath])
            subprocess.run(["git", "commit", "-m", f"verify: GSC {filename}"])
            subprocess.run(["git", "push", "origin", "main"])
            
            print(f"✅ Deployed → {SITE}/{filename}")
            time.sleep(5)
            
            # Click VERIFY
            try:
                page.locator("button:has-text('Verify')").first.click(timeout=5000)
                print("✅ Clicked VERIFY")
                time.sleep(3)
            except:
                print("⚠️  Click VERIFY button manually")
        else:
            # Show filename candidates
            print("⚠️  Could not auto-detect filename.")
            print("   Copy the googleXXX.html filename from browser")
            filename = input("   Paste here: ").strip()
            
            if filename.startswith("google"):
                filepath = f"static/{filename}"
                with open(filepath, "w") as f:
                    f.write(f"google-site-verification: {filename}")
                subprocess.run(["git", "add", filepath])
                subprocess.run(["git", "commit", "-m", f"verify: GSC {filename}"])
                subprocess.run(["git", "push", "origin", "main"])
                print(f"✅ {SITE}/{filename}")
        
        print(f"\n📊 Next: goto {GSC}/sitemaps → submit {SITE}/sitemap.xml")
        print("⏳ Browser stays open. Close when done.")
        input("Press Enter to close browser...")
        context.close()

if __name__ == "__main__":
    main()
