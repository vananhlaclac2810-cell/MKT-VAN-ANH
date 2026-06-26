# Design System Reference — DR.MAYA (mẹ & bé) · 16:9

All slide-pane compositions share this aesthetic. Authored consistently, it
gives the whole video brand continuity. Slide pane is **1200×1080** (left);
the HeyGen avatar floats in a frame on the right.

## Mood

**Bright, soft, friendly mom-&-baby knowledge.** Inspired by the Dr.Maya
product slides — warm cream/white background with a gentle butter-yellow
glow, soft golden leaf motifs, clean white cards with rounded corners and
soft shadows. Headlines in deep brand-green, key words in warm gold. Cute
pastel illustrations (mom + baby) that match the spoken content.

Clean, warm, trustworthy — airy white space, soft shadows (NOT neon glows),
rounded shapes, friendly Be Vietnam Pro typography.

## What's locked vs free

**LOCKED:** light cream→butter-yellow bg (NEVER dark) · soft leaf motifs +
warm bokeh · Be Vietnam Pro · Dr.Maya tokens (green + gold + cream) ·
meta-badge top:92 left:56 (BELOW master brand-mark) · content-matching
illustration per beat. **FREE:** composition, animation, decorative SVG,
card counts, metaphors.

## Background (slide pane)

```css
background:
  radial-gradient(ellipse at 50% 12%, #FFFFFF 0%, transparent 55%),
  radial-gradient(ellipse at 82% 92%, rgba(245,196,51,0.20) 0%, transparent 50%),
  radial-gradient(ellipse at 50% 50%, #FFFDF4 0%, #FFF6DD 60%, #FCEDC4 100%);
```

NEVER dark. The avatar frame (right) inner bg also light cream `#FFF8E6`.

## Typography

**Be Vietnam Pro** everywhere (500–900). Loaded via Google Fonts inline.

| Role          | Size  | Weight | Color         |
|---------------|-------|--------|---------------|
| Hero (pane)   | 80-110| 900    | green #0A6F3E |
| Hero accent   | 80-110| 900    | gold #F2B705  |
| Section title | 56-64 | 900    | green #0A6F3E |
| Card heading  | 30-36 | 800    | charcoal #2C3A30 |
| Body          | 21-26 | 600    | muted #5A5240 |
| Eyebrow       | 22    | 800    | gold #C99A12  |
| Pill / number | 26-30 | 800    | white on gold/green |

## Color palette — DR.MAYA

**Foreground:** `#2C3A30` charcoal-green (body) · `#5A5240` muted · `#8A8266` dim.
**Backgrounds:** `#FFFDF4`/`#FFF6DD`/`#FCEDC4` cream→butter · `#FFFFFF` cards · `#FFF8E6` tint.
**Brand:** `#0A6F3E` deep green (headlines/pills) · `#3E8B64`/`#5BA77C` medium · `#84B599`/`#BDDBA9`/`#C4DFB1` sage/mint/leaves · `#F2B705` gold (highlights/numbers/key words) · `#F5C433`/`#F6DB52` warm yellow (bokeh) · `#C99A12` deep gold (eyebrow).
Semantic warm: green `#3E8B64` = OK; soft clay `#E0734F` = cảnh báo (NOT harsh red).

## Avatar frame (right)

Border SPLIT = brand green `#0A6F3E` (3px); PIP active = gold `#F2B705`.
Inner bg light cream. Soft shadow, not glow.

## Content-matching images

Mỗi beat nhắc thứ cụ thể ("bé đi tiêm", "đo nhiệt độ", "cho bú") → ảnh minh
hoạ khớp. AI-gen (Pollinations) + tải LOCAL về `assets/img/`. Xem
`references/content-images.md` + `scripts/gen_content_images.py`. Style suffix:
*"soft flat vector illustration, warm yellow and cream pastel tones, minimal
cute, white background"*. `object-fit: contain`, ~420px in hero.

## Effects

Soft shadows (NOT glow): cards `0 14px 36px rgba(190,150,40,0.12)`; hero illo
`drop-shadow(0 18px 40px rgba(200,150,30,0.18))`. Underline green→gold gradient.
Pills/numbers solid gold/green fill + white text.

## Anti-patterns

Dark/navy/black bg (NEVER) · neon glow/text-shadow halo · gradient/rainbow text ·
harsh red/blue/purple/pink · decorative emoji in headings · clashing stock photos
(prefer soft pastel illustrations) · multiple typefaces · borders >1px (except
underline) · clutter (keep airy). Scene canvas is **1200×1080** (slide pane), hero
≤110px, no element past x≈1100px, content flex-CENTERED (PIP re-centers clean).
