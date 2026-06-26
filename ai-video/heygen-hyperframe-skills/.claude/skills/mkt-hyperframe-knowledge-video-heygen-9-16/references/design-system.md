# Design System Reference — DR.MAYA (mẹ & bé)

All compositions share this aesthetic. Authored consistently, it gives
the whole video brand continuity — looks like one cohesive piece rather
than ten unrelated slides.

## Mood

**Bright, soft, friendly mom-&-baby knowledge.** Inspired by the Dr.Maya
product slides — warm cream/white background with a gentle butter-yellow
glow, soft golden leaf motifs, lots of clean white cards with rounded
corners and soft shadows. Headlines in deep brand-green, key words in
warm gold. Cute pastel illustrations (mom + baby) that match the spoken
content.

The aesthetic is **clean, warm and trustworthy** — airy white space,
soft shadows (NOT neon glows), rounded shapes, friendly Be Vietnam Pro
typography. Content-matching illustrations are welcome — that's the
emotional hook for mẹ-bỉm viewers. Everything earns its place.

## What's locked vs what's free

**LOCKED** (this is the brand DNA — never deviate):
- Background: light cream→butter-yellow radial per `--bg` token (NEVER dark)
- Soft golden/sage leaf motifs + low-opacity warm bokeh
- Typography: Be Vietnam Pro (friendly Vietnamese sans) — 500–900
- Color palette: only the Dr.Maya tokens below (green + gold + cream)
- Meta badge top-left (white pill) on every scene
- Content-matching illustration per beat where it helps comprehension

**FREE** (sub-agent invents within above):
- Composition, layout, element placement
- Animation choreography (timing, easing, sequence)
- Decorative SVG (leaves, icons, diagrams, charts, metaphor shapes)
- Card sizes, shapes, arrangements, counts
- Visual metaphors (timelines, steps, checklists, before/after, etc.)
- Number of elements per scene
- Whether to use cards at all — some scenes don't need cards

## Background

```css
background:
  radial-gradient(ellipse at 50% 20%, #FFFFFF 0%, transparent 55%),
  radial-gradient(ellipse at 80% 88%, rgba(245,196,51,0.20) 0%, transparent 50%),
  radial-gradient(ellipse at 50% 50%, #FFFDF4 0%, #FFF6DD 60%, #FCEDC4 100%);
```

A clean white-to-soft-butter-yellow wash with a warm gold glow bottom-
right. The leaf motifs + soft bokeh drift on top. NEVER use a dark
background — Dr.Maya mom-baby content is always light and airy.

## Leaf motifs + Particles

2–3 soft leaf SVG shapes (gold `#F6DB52` / sage `#BDDBA9`, opacity
~0.5) anchored to corners — echoes the Dr.Maya herbal brand. Plus
40–60 low-opacity warm bokeh dots (yellow/cream/sage, opacity ≤0.55,
NO glow box-shadow — keep it soft). Density:

| Density | Particle count | Used for                                 |
|---------|----------------|------------------------------------------|
| Sparse  | 40             | Content-dense (many cards, lists)        |
| Normal  | 55             | Default                                  |
| Dense   | 70             | Hero, CTA (visual breathing room)        |

## Content-matching images

Each beat that names a concrete thing ("bé đi tiêm", "đo nhiệt độ",
"cho bú", "tắm bé"...) SHOULD show a matching soft illustration. Images
are AI-generated (Pollinations, free) from the script keywords and
**downloaded locally** to `assets/img/` so the render never depends on
network. See `references/content-images.md` + `scripts/gen_content_images.py`.
Style prompt suffix (keep consistent): *"soft flat vector illustration,
warm yellow and cream pastel tones, minimal cute, white background"*.

## Typography

**Be Vietnam Pro** (friendly Vietnamese sans, 500/600/700/800/900) —
everything. Loaded from Google Fonts CDN inline. Excellent Vietnamese
diacritics, warm rounded feel.

| Role           | Font            | Size  | Weight | Tracking | Color              |
|----------------|-----------------|-------|--------|----------|--------------------|
| Hero           | Be Vietnam Pro  | 108px | 900    | -0.02em  | green #0A6F3E      |
| Hero accent    | Be Vietnam Pro  | 108px | 900    | -0.02em  | gold #F2B705       |
| Section title  | Be Vietnam Pro  | 64px  | 900    | -0.01em  | green #0A6F3E      |
| Card heading   | Be Vietnam Pro  | 36px  | 800    | normal   | charcoal #2C3A30   |
| Body / card    | Be Vietnam Pro  | 26px  | 600    | normal   | muted #5A5240      |
| Caption / sub  | Be Vietnam Pro  | 24px  | 600    | normal   | dim #8A8266        |
| Eyebrow label  | Be Vietnam Pro  | 26px  | 800    | 0.16em   | gold #C99A12       |
| Pill / number  | Be Vietnam Pro  | 28-32 | 800/900| normal   | white on gold/green|

## Color palette — DR.MAYA

**Foreground**:
- `#2C3A30` charcoal-green — primary body text
- `#5A5240` warm muted — secondary text
- `#8A8266` dim — tertiary / captions

**Backgrounds**:
- `#FFFDF4` near-white — top of radial
- `#FFF6DD` soft cream — mid
- `#FCEDC4` butter yellow — outer
- `#FFFFFF` — card surface (white) with soft shadow
- `#FFF8E6` — tinted card / thumbnail backing

**Brand colors** (rotate across scenes for variety):
- `#0A6F3E` deep green — primary brand, headlines, pills
- `#3E8B64` / `#5BA77C` medium green — secondary accents, success
- `#84B599` sage / `#BDDBA9` `#C4DFB1` mint — soft fills, leaves, calm
- `#F2B705` gold — primary highlight, numbers, key words (readable on white)
- `#F5C433` / `#F6DB52` warm yellow — accent variety, bokeh, leaves
- `#C99A12` deep gold — eyebrow labels on light bg

Semantic (use sparingly, stay warm): green `#3E8B64` = OK/đúng,
soft clay `#E0734F` = sai/cảnh báo (NOT harsh red).

## Spacing

Everything follows an 8px grid scale: 8, 12, 14, 16, 18, 20, 24, 28, 32,
36, 44, 56, 80, 120. Card padding typically 26-38px. Inter-card gaps
26-36px. Hero margin-bottom 14-30px before underline + 56px before next
element.

## Radii

- `14px` — number chips, small buttons
- `20px` — thumbnails, small cards
- `28px` — standard cards
- `999px` — pills, badges

## Effects

**Soft shadows** (NOT neon glow): cards use
`box-shadow: 0 14px 36px rgba(190,150,40,0.12)`. Hero illustration uses
`filter: drop-shadow(0 18px 40px rgba(200,150,30,0.18))`.

**Underline accent**: green→gold gradient bar
`linear-gradient(90deg,#0A6F3E,#5BA77C 45%,#F2B705 100%)`, 7-8px tall,
rounded.

**Pills / numbers**: solid gold `#F2B705` or green `#0A6F3E` fill with
white text + soft shadow (no glow).

## Anti-patterns

These ruin the aesthetic — never include:

- Dark / navy / black backgrounds (this brand is ALWAYS light)
- Neon glows or text-shadow halos (use soft warm shadows instead)
- Gradient text or rainbow type
- Harsh saturated red/blue/purple/pink (stay in green + gold + cream)
- Decorative emoji in headings
- Stock photos that clash — prefer soft flat pastel illustrations
- Multiple typefaces (only Be Vietnam Pro)
- Borders thicker than 1px (except underline gradient bar)
- Cluttered scenes — keep airy white space, mom-baby calm
