import json, sys
sys.stdout.reconfigure(encoding="utf-8")

with open("D:/SKILL MARKETING AGENT/video-raw/words.json", encoding="utf-8") as f:
    words = json.load(f)

# Clean tokens
for w in words:
    w["word"] = w["word"].strip(" .,!?").strip()
words = [w for w in words if w["word"]]

# Group every 3 syllables into a caption chunk
chunks = []
i = 0
N = 3
while i < len(words):
    group = words[i:i+N]
    text = " ".join(w["word"] for w in group).upper()
    start = group[0]["start"]
    end = group[-1]["end"]
    chunks.append({"start": start, "end": end, "text": text})
    i += N

# Extend each chunk's end to next chunk's start (no gaps)
for j in range(len(chunks)-1):
    chunks[j]["end"] = chunks[j+1]["start"]

def ass_time(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t - h*3600 - m*60
    return f"{h}:{m:02d}:{s:05.2f}"

ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,Arial Black,108,&H0035EBFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,11,5,2,40,40,500,1
Style: Hook,Arial Black,96,&H00FFFFFF,&H00FFFFFF,&H000033E6,&HCC000000,-1,0,0,0,100,100,0,0,1,12,5,5,40,40,0,1
Style: HookSub,Arial Black,72,&H0035EBFF,&H0035EBFF,&H00000000,&HCC000000,-1,0,0,0,100,100,0,0,1,9,4,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

# Intro hook (the first 4.4s before speech starts) — big 3-line punch
ass += f"Dialogue: 1,0:00:00.10,0:00:02.20,Hook,,0,0,0,,{{\\fad(80,80)\\pos(540,700)}}BỎ NGAY\\NTHÓI QUEN!\n"
ass += f"Dialogue: 1,0:00:02.25,0:00:04.60,Hook,,0,0,0,,{{\\fad(80,80)\\pos(540,650)}}XÌ TÈ\\NCHO BÉ\n"
ass += f"Dialogue: 1,0:00:02.40,0:00:04.60,HookSub,,0,0,0,,{{\\fad(120,80)\\pos(540,1100)}}4 LÝ DO NGUY HIỂM\n"

# Word-by-word captions
for c in chunks:
    if c["start"] < 4.6:
        continue  # skip caption overlap with hook
    ass += f"Dialogue: 0,{ass_time(c['start'])},{ass_time(c['end'])},Word,,0,0,0,,{c['text']}\n"

with open("D:/SKILL MARKETING AGENT/video-raw/captions.ass", "w", encoding="utf-8") as f:
    f.write(ass)

print(f"Generated ASS with {len(chunks)} word chunks + intro hook")
