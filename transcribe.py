"""Transcribe Vietnamese audio with word-level timestamps for karaoke subtitles."""
import io
import json
import os
import sys
from pathlib import Path

# Force UTF-8 stdout on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

import certifi
os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
os.environ["CURL_CA_BUNDLE"] = certifi.where()

# Disable SSL verification globally as fallback (corp/system cert chain issue)
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
import httpx
_orig_client_init = httpx.Client.__init__
def _patched_init(self, *args, **kwargs):
    kwargs["verify"] = False
    return _orig_client_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_init

from faster_whisper import WhisperModel

AUDIO = r"D:\SKILL MARKETING AGENT\video-raw\duc_lo_num_audio.wav"
OUT_JSON = r"D:\SKILL MARKETING AGENT\duc_lo_num_transcript.json"

print("Loading model (medium, int8)...")
model = WhisperModel("medium", device="cpu", compute_type="int8")

print("Transcribing...")
segments, info = model.transcribe(
    AUDIO,
    language="vi",
    word_timestamps=True,
    vad_filter=True,
    vad_parameters={"min_silence_duration_ms": 300},
)

result = {
    "language": info.language,
    "duration": info.duration,
    "segments": [],
}

for seg in segments:
    words = []
    if seg.words:
        for w in seg.words:
            words.append({
                "start": w.start,
                "end": w.end,
                "text": w.word,
            })
    result["segments"].append({
        "start": seg.start,
        "end": seg.end,
        "text": seg.text,
        "words": words,
    })
    print(f"[{seg.start:6.2f} -> {seg.end:6.2f}] {seg.text.strip()}")

Path(OUT_JSON).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nSaved: {OUT_JSON}")
print(f"Total segments: {len(result['segments'])}")
