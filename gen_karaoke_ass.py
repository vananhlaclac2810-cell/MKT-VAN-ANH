"""Generate ASS karaoke subtitle from whisper word-level timestamps.

TikTok-style:
- Bold white text with black outline
- Current word highlighted YELLOW
- Group max 5 words per line
- Subtle pop fade-in
- Positioned around y=1400 (center-low of 1080x1920)
"""
import json
from pathlib import Path

TRANSCRIPT = r"D:\SKILL MARKETING AGENT\duc_lo_num_transcript.json"
OUT_ASS = r"D:\SKILL MARKETING AGENT\duc_lo_num_subs.ass"

MAX_WORDS_PER_LINE = 5
MAX_LINE_DURATION = 3.0  # seconds


def fmt_ass_time(t: float) -> str:
    """Convert seconds to ASS time format H:MM:SS.cc"""
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def split_into_lines(words):
    """Group words into lines of max N words or max T duration."""
    lines = []
    current = []
    for w in words:
        if not current:
            current.append(w)
            continue
        # break if too many words, or duration too long, or sentence-end punctuation
        line_start = current[0]["start"]
        if (
            len(current) >= MAX_WORDS_PER_LINE
            or (w["end"] - line_start) > MAX_LINE_DURATION
            or current[-1]["text"].rstrip().endswith((".", "?", "!", ",", ";", ":"))
        ):
            lines.append(current)
            current = [w]
        else:
            current.append(w)
    if current:
        lines.append(current)
    return lines


def build_ass(transcript):
    # Flatten all words across all segments
    all_words = []
    for seg in transcript["segments"]:
        for w in seg.get("words", []):
            txt = w["text"].strip()
            if txt:
                all_words.append({"start": w["start"], "end": w["end"], "text": txt})

    lines = split_into_lines(all_words)

    # ASS header — TikTok karaoke style
    # PrimaryColour (yellow) = color after k time elapsed (i.e. spoken word)
    # SecondaryColour (white) = color before k time elapsed (i.e. not yet spoken)
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial Black,76,&H0000F0FF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,2,0,1,5,2,2,80,80,360,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    events = []
    for line in lines:
        if not line:
            continue
        start = line[0]["start"]
        end = line[-1]["end"] + 0.15  # small linger

        # Build karaoke string: {\k<cs>}word {\k<cs>}word
        parts = []
        for i, w in enumerate(line):
            # Duration in centiseconds (1/100 s) until next word OR end of word
            if i + 1 < len(line):
                k_dur = (line[i + 1]["start"] - w["start"]) * 100
            else:
                k_dur = (w["end"] - w["start"]) * 100
            k_cs = max(1, int(round(k_dur)))
            parts.append(f"{{\\k{k_cs}}}{w['text']}")

        # Add pop fade-in (50ms in, 100ms out)
        text = "{\\fad(80,80)}" + " ".join(parts)

        event = f"Dialogue: 0,{fmt_ass_time(start)},{fmt_ass_time(end)},Default,,0,0,0,,{text}"
        events.append(event)

    return header + "\n".join(events) + "\n"


if __name__ == "__main__":
    data = json.loads(Path(TRANSCRIPT).read_text(encoding="utf-8"))
    ass = build_ass(data)
    Path(OUT_ASS).write_text(ass, encoding="utf-8")
    print(f"Saved: {OUT_ASS}")
    print(f"Lines: {ass.count('Dialogue:')}")
