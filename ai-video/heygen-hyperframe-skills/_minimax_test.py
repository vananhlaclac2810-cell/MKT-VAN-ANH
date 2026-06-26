#!/usr/bin/env python3
# Quick MiniMax TTS key test — generates a ~10s Vietnamese MP3
import os, sys, json, re, pathlib, urllib.request, urllib.error
try:
    import truststore; truststore.inject_into_ssl()   # use Windows cert store
except Exception as _e:
    print(f"[test] truststore not active: {_e}")

HERE = pathlib.Path(__file__).parent
ENV = HERE / ".env"

# --- parse .env ---
cfg = {}
for line in ENV.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    cfg[k.strip()] = v.strip()

api_key  = cfg.get("MINIMAX_API_KEY", "")
group_id = cfg.get("MINIMAX_GROUP_ID", "") or os.environ.get("MINIMAX_GROUP_ID", "")
voice_id = cfg.get("MINIMAX_VOICE_ID", "") or "Wise_Woman"   # fallback system voice
model    = cfg.get("MINIMAX_MODEL", "") or "speech-02-hd"
base     = cfg.get("MINIMAX_API_BASE", "") or "https://api.minimax.io"

print(f"[test] key   : {api_key[:10]}...{api_key[-6:]} (len={len(api_key)})")
print(f"[test] group : {'<MISSING>' if not group_id else group_id}")
print(f"[test] voice : {voice_id}")
print(f"[test] model : {model}")
print(f"[test] base  : {base}")

if not api_key:
    sys.exit("[test] no MINIMAX_API_KEY")

text = ("Xin chào, đây là giọng đọc thử nghiệm từ MiniMax. "
        "Nếu bạn nghe được đoạn này, nghĩa là chìa khóa API của bạn đã hoạt động tốt. "
        "Chúc bạn một ngày làm việc thật hiệu quả và tràn đầy năng lượng nhé.")

# GroupId is a query param; if missing, still try (API will tell us if required)
url = f"{base.rstrip('/')}/v1/t2a_v2"
if group_id:
    url += f"?GroupId={group_id}"

payload = {
    "model": model,
    "text": text,
    "stream": False,
    "voice_setting": {"voice_id": voice_id, "speed": 1.0, "vol": 1.0, "pitch": 0},
    "audio_setting": {"sample_rate": 32000, "bitrate": 128000, "format": "mp3", "channel": 1},
    "language_boost": "Vietnamese",
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=120) as r:
        body = json.loads(r.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print(f"[test] HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:800]}")
    sys.exit(1)
except Exception as e:
    print(f"[test] ERROR: {e}")
    sys.exit(1)

base_resp = body.get("base_resp") or {}
print(f"[test] base_resp: {json.dumps(base_resp, ensure_ascii=False)}")

if base_resp.get("status_code") not in (0, None):
    print(f"[test] FAILED — {base_resp.get('status_msg')}")
    print(f"[test] full response: {json.dumps(body, ensure_ascii=False)[:600]}")
    sys.exit(1)

audio_hex = (body.get("data") or {}).get("audio")
if not audio_hex:
    print(f"[test] no audio in response: {json.dumps(body, ensure_ascii=False)[:600]}")
    sys.exit(1)

out = HERE / "minimax-test.mp3"
out.write_bytes(bytes.fromhex(audio_hex))
extra = body.get("extra_info") or {}
print(f"[test] OK — wrote {out} ({out.stat().st_size} bytes, "
      f"~{extra.get('audio_length','?')}ms, {extra.get('usage_characters','?')} chars)")
