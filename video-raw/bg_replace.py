import os, sys, ssl, certifi, time, subprocess
os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
os.environ["CURL_CA_BUNDLE"] = certifi.where()
ssl._create_default_https_context = ssl._create_unverified_context
sys.stdout.reconfigure(encoding="utf-8")
import requests
_orig_send = requests.adapters.HTTPAdapter.send
def _patched_send(self, request, **kwargs):
    kwargs["verify"] = False
    return _orig_send(self, request, **kwargs)
requests.adapters.HTTPAdapter.send = _patched_send
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from rembg import remove, new_session

session = new_session("u2netp")

EMOJI_FONT = "C:/Windows/Fonts/seguiemj.ttf"
ICONS = "D:/SKILL MARKETING AGENT/video-raw/icons"
RAW = "D:/SKILL MARKETING AGENT/video-raw"

def make_bg_image(bg_color_rgb, icon_path, emoji_pattern=None):
    W, H = 1080, 1920
    img = Image.new("RGB", (W, H), bg_color_rgb)
    draw = ImageDraw.Draw(img)

    if emoji_pattern:
        pat = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        pdraw = ImageDraw.Draw(pat)
        small_font = ImageFont.truetype(EMOJI_FONT, 90)
        np.random.seed(42)
        positions = []
        for _ in range(28):
            x = np.random.randint(0, W - 90)
            y = np.random.randint(0, H - 90)
            positions.append((x, y))
        for (x, y) in positions:
            pdraw.text((x, y), emoji_pattern, font=small_font, embedded_color=True)
        a = pat.split()[-1]
        a = a.point(lambda p: int(p * 0.15))
        pat.putalpha(a)
        img.paste(pat, (0, 0), pat)

    if icon_path and os.path.exists(icon_path):
        icon = Image.open(icon_path).convert("RGBA")
        side = 850
        icon = icon.resize((side, side))
        alpha = icon.split()[-1]
        alpha = alpha.point(lambda p: int(p * 0.85))
        icon.putalpha(alpha)
        x = (W - side) // 2
        y = (H - side) // 2 - 80
        img.paste(icon, (x, y), icon)

    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

print("Generating background images...")
BG_WARN = make_bg_image((250, 210, 210), f"{ICONS}/warn.png", "🚨")
BG_N1   = make_bg_image((255, 225, 235), f"{ICONS}/n1.png",   "👶")
BG_N2   = make_bg_image((215, 235, 255), f"{ICONS}/n2.png",   "💧")
BG_N3   = make_bg_image((255, 230, 215), f"{ICONS}/n3.png",   "🦴")
BG_N4   = make_bg_image((235, 220, 255), f"{ICONS}/n4.png",   "🧠")
print("Backgrounds ready.")

def get_bg(t):
    if 8.85 <= t < 13.0: return BG_WARN
    if 14.55 <= t < 19.6: return BG_N1
    if 19.7 <= t < 22.85: return BG_N2
    if 22.9 <= t < 25.45: return BG_N3
    if 25.55 <= t < 28.7: return BG_N4
    return None

def get_zoom(t):
    if 8.85 <= t < 13.0: return 1.13
    if 14.55 <= t < 19.6: return 1.0
    if 19.7 <= t < 22.85: return 1.07
    if 22.9 <= t < 25.45: return 1.0
    if 25.55 <= t < 28.7: return 1.09
    if t < 4.5: return 1.0
    return 1.04

def apply_zoom(frame, scale):
    if scale <= 1.001:
        return frame
    h, w = frame.shape[:2]
    new_w = int(w / scale)
    new_h = int(h / scale)
    x = (w - new_w) // 2
    y = (h - new_h) // 2
    cropped = frame[y:y+new_h, x:x+new_w]
    return cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LANCZOS4)

def process(input_path, output_path):
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Input: {W}x{H} {fps}fps {total} frames")

    proc = subprocess.Popen([
        "ffmpeg", "-y", "-f", "rawvideo", "-vcodec", "rawvideo",
        "-s", f"{W}x{H}", "-pix_fmt", "bgr24", "-r", str(fps),
        "-i", "-",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-pix_fmt", "yuv420p",
        output_path
    ], stdin=subprocess.PIPE)

    frame_idx = 0
    t0 = time.time()
    last_mask = None
    last_mask_t = -1

    while True:
        ret, frame = cap.read()
        if not ret: break
        t = frame_idx / fps
        bg = get_bg(t)

        if bg is not None:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            small = cv2.resize(frame_rgb, (W // 2, H // 2), interpolation=cv2.INTER_LINEAR)
            input_pil = Image.fromarray(small)
            rgba = np.array(remove(input_pil, session=session))
            alpha = rgba[:, :, 3]
            alpha_full = cv2.resize(alpha, (W, H), interpolation=cv2.INTER_LINEAR)
            alpha_full = cv2.GaussianBlur(alpha_full, (5, 5), 0).astype(np.float32) / 255.0
            alpha_full = alpha_full[:, :, np.newaxis]
            out_frame = (frame.astype(np.float32) * alpha_full +
                         bg.astype(np.float32) * (1 - alpha_full)).astype(np.uint8)
        else:
            out_frame = frame

        zoom = get_zoom(t)
        out_frame = apply_zoom(out_frame, zoom)

        proc.stdin.write(out_frame.tobytes())
        frame_idx += 1

        if frame_idx % 30 == 0:
            elapsed = time.time() - t0
            pct = 100 * frame_idx / total
            eta = (elapsed / frame_idx) * (total - frame_idx)
            print(f"Frame {frame_idx}/{total} ({pct:.1f}%) elapsed={elapsed:.0f}s eta={eta:.0f}s")

    cap.release()
    proc.stdin.close()
    proc.wait()
    print(f"Done in {time.time()-t0:.0f}s")

process(f"{RAW}/base.mp4", f"{RAW}/bg_replaced.mp4")
