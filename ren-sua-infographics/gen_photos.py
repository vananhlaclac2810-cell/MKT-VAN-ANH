"""Sinh 4 ảnh AI mẹ-bé ti bình bằng Gemini 2.5 Flash Image (Nano Banana)."""
import os
import sys
import re
import ssl
from pathlib import Path

# Fix SSL on Windows — use certifi bundle BEFORE importing genai
import certifi
os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
# Also patch ssl default context to use truststore (Windows system store) as fallback
try:
    import truststore
    truststore.inject_into_ssl()
except Exception as e:
    print(f"[warn] truststore inject failed: {e}", file=sys.stderr)

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

# Load GEMINI_API_KEY from zalo-listener .env
ENV_PATH = Path(r"D:\SKILL MARKETING AGENT\zalo-listener\.env")
if ENV_PATH.exists():
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^([A-Z_]+)\s*=\s*(.+)$", line.strip())
        if m and m.group(1) == "GEMINI_API_KEY":
            os.environ["GEMINI_API_KEY"] = m.group(2).strip().strip('"').strip("'")
            break

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY not set", file=sys.stderr)
    sys.exit(1)

OUT_DIR = Path(r"D:\SKILL MARKETING AGENT\ren-sua-infographics\photos")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 4 prompts — Vietnamese mom + 4-6 month baby, cream warm lighting, soft pastel
BASE_STYLE = (
    "Soft warm cream lighting, pastel peach background, shallow depth of field, "
    "natural skin tones, cozy nursery aesthetic, photorealistic, square crop, "
    "Vietnamese mother (mid-20s, gentle smile, soft beige top) and her 4-month-old "
    "baby (chubby cheeks, soft pastel onesie). The baby lies on a light gray "
    "geometric-pattern pillow with a soft peach-pink bib. Camera angle: top-down view of the baby's face."
)

PROMPTS = {
    "01-buoc1-chuan-bi.png": (
        f"{BASE_STYLE} Step 1 'Preparation': Close-up of mother's hand holding a "
        "white baby bottle filled with warm milk, gently testing the temperature of "
        "milk by tilting the bottle near her wrist, baby lying calmly on the pillow "
        "looking up curiously. The bottle is the focus. Quiet, intimate atmosphere."
    ),
    "02-buoc2-cham-num.png": (
        f"{BASE_STYLE} Step 2 'Touch the nipple to baby's lip corner': Mother's hand "
        "tilts a white baby bottle and gently touches the bottle nipple to the corner "
        "of baby's mouth. Baby is alert, eyes open, beginning to turn head toward the bottle. "
        "Visible from above, baby on pillow."
    ),
    "03-buoc3-be-ngam.png": (
        f"{BASE_STYLE} Step 3 'Baby latches and drinks': Baby is happily drinking from "
        "the bottle, lips wrapped around the nipple in a proper deep latch, mother's index "
        "finger gently lifting the baby's upper lip outward (un-tucking). Baby's eyes half "
        "closed in contentment. Close-up of baby's face and the bottle."
    ),
    "04-khop-ngam-dung.png": (
        "Soft warm cream lighting, pastel peach background, photorealistic close-up. "
        "Extreme close-up macro shot of a 4-month-old baby's mouth properly latched on a "
        "white baby bottle nipple. Lower lip is flanged outward (not tucked under), upper "
        "lip relaxed and visible, bottle deep in mouth. Side profile angle showing the "
        "correct latch position. Soft skin tones, no full face — just the mouth area."
    ),
}

print(f"GEMINI_API_KEY loaded: ...{api_key[-6:]}")
client = genai.Client(api_key=api_key)

MODEL = "gemini-2.5-flash-image"

for fname, prompt in PROMPTS.items():
    out_path = OUT_DIR / fname
    if out_path.exists() and out_path.stat().st_size > 10_000:
        print(f"[skip] {fname} already exists ({out_path.stat().st_size:,} bytes)")
        continue
    print(f"\n[generate] {fname}")
    print(f"  prompt (first 100): {prompt[:100]}...")
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=[prompt],
        )
        # Extract image bytes from response
        image_saved = False
        for cand in resp.candidates:
            for part in cand.content.parts:
                if hasattr(part, "inline_data") and part.inline_data is not None:
                    data = part.inline_data.data
                    img = Image.open(BytesIO(data))
                    # Resize to 1024x1024 to keep file size sane
                    if img.width > 1200:
                        img.thumbnail((1024, 1024), Image.LANCZOS)
                    img.save(out_path, "PNG", optimize=True)
                    print(f"  saved -> {out_path} ({out_path.stat().st_size:,} bytes, {img.size})")
                    image_saved = True
                    break
            if image_saved:
                break
        if not image_saved:
            print(f"  WARN: no image in response. Text candidates:")
            for cand in resp.candidates:
                for part in cand.content.parts:
                    if hasattr(part, "text") and part.text:
                        print(f"    {part.text[:200]}")
    except Exception as e:
        print(f"  ERROR: {e}")

print("\nDone.")
