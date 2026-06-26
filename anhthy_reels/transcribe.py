from faster_whisper import WhisperModel
import sys, json, os

mp4 = r"D:\SKILL MARKETING AGENT\anhthy_reels\reel_923252183754881.mp4"
out_txt = r"D:\SKILL MARKETING AGENT\anhthy_reels\reel_923252183754881.txt"
out_srt = r"D:\SKILL MARKETING AGENT\anhthy_reels\reel_923252183754881.srt"

model = WhisperModel("medium", device="cpu", compute_type="int8")
segments, info = model.transcribe(mp4, language="vi", beam_size=5, vad_filter=True)

segs = list(segments)

with open(out_txt, "w", encoding="utf-8") as f:
    for s in segs:
        f.write(s.text.strip() + "\n")

def srt_time(t):
    h = int(t // 3600); m = int((t % 3600) // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

with open(out_srt, "w", encoding="utf-8") as f:
    for i, s in enumerate(segs, 1):
        f.write(f"{i}\n{srt_time(s.start)} --> {srt_time(s.end)}\n{s.text.strip()}\n\n")

print(f"Duration: {info.duration:.1f}s, segments: {len(segs)}")
print("Saved:", out_txt)
print("Saved:", out_srt)
