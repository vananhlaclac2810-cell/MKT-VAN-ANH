import os, ssl, certifi
os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
os.environ["CURL_CA_BUNDLE"] = certifi.where()
ssl._create_default_https_context = ssl._create_unverified_context
import httpx
_orig_init = httpx.Client.__init__
def _patched_init(self, *args, **kwargs):
    kwargs.setdefault("verify", False)
    _orig_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_init

from faster_whisper import WhisperModel
import sys, json
sys.stdout.reconfigure(encoding="utf-8")

model = WhisperModel("small", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    "D:/SKILL MARKETING AGENT/video-raw/hut_sua_3_audio.wav",
    language="vi",
    beam_size=5,
    word_timestamps=True,
)
out = []
for seg in segments:
    out.append({"start": round(seg.start, 2), "end": round(seg.end, 2), "text": seg.text.strip()})
    print(f"[{seg.start:6.2f}s -> {seg.end:6.2f}s] {seg.text.strip()}")

with open("D:/SKILL MARKETING AGENT/video-raw/transcript.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
