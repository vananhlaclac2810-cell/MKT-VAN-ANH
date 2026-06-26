"""Screenshot HTML -> PNG 1080x1920 via headless Chrome."""
import subprocess
import os
from pathlib import Path
import sys

ROOT = Path(r"D:\SKILL MARKETING AGENT\ren-sua-infographics")
HTML = ROOT / "01-cach-moi-binh.html"
OUT_PREVIEW = ROOT / "01-cach-moi-binh-preview.png"
OUT_FINAL = ROOT / "01-cach-moi-binh.png"

# Find Chrome on Windows
chrome_candidates = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expanduser(r"~\AppData\Local\Google\Chrome\Application\chrome.exe"),
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]
chrome = next((p for p in chrome_candidates if Path(p).exists()), None)
if not chrome:
    print("ERROR: Chrome/Edge not found", file=sys.stderr)
    sys.exit(1)
print(f"Using browser: {chrome}")

mode = sys.argv[1] if len(sys.argv) > 1 else "preview"
out = OUT_FINAL if mode == "final" else OUT_PREVIEW

cmd = [
    chrome,
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1080,1920",
    f"--screenshot={out}",
    "--default-background-color=00000000",
    HTML.as_uri(),
]
print(f"Running: {' '.join(cmd[:2])} ... --screenshot={out.name}")
result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
if result.returncode != 0:
    print(f"STDERR: {result.stderr[:500]}")
    sys.exit(result.returncode)
if out.exists():
    print(f"OK -> {out} ({out.stat().st_size:,} bytes)")
else:
    print("ERROR: screenshot file not created")
    sys.exit(1)
