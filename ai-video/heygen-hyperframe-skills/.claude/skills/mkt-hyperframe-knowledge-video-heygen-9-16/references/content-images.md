# Content-matching images (cảnh trám theo nội dung)

Dr.Maya knowledge videos show a **soft illustration that matches what is
being said**. Khi lời thoại nói "bé đi tiêm" → hiện ảnh bé đi tiêm; nói
"đo nhiệt độ" → ảnh đo nhiệt độ; "cho bú" → ảnh cho bú. This is the
emotional + comprehension hook for mẹ-bỉm viewers.

## How it works

1. **Read the script / outline.** For each scene (and each list item that
   names a concrete action/object), pick a short visual cue.
2. **Build `cues.json`** — one entry per image, `slug` = where it mounts,
   `prompt` = the thing to draw (Vietnamese concept in English is fine):

   ```json
   [
     {"slug": "scene-01", "prompt": "mother checking baby temperature with thermometer"},
     {"slug": "card-tiem", "prompt": "baby getting a vaccine shot, gentle nurse, clinic"},
     {"slug": "card-bu",   "prompt": "mother breastfeeding baby, milk bottle nearby"}
   ]
   ```

3. **Generate + download locally:**

   ```bash
   python scripts/gen_content_images.py cues.json assets/img
   ```

   Images land in `assets/img/<slug>.jpg` (720×720). They are **local
   files** — the render never fetches them over network (reliable).

4. **Reference in the scene HTML** with an onerror fallback so a missing
   image never breaks the layout:

   ```html
   <img class="hero-img" src="assets/img/scene-01.jpg" alt=""
        onerror="this.style.display='none'" />
   ```

## Style — keep consistent

The script appends a fixed style suffix so every image feels like one set:
*"soft flat vector illustration, warm yellow and cream pastel tones,
minimal cute, mom and baby care, white background"*.

The white background means the illustrations blend into the light
cream/yellow Dr.Maya scenes with no hard edges. Use `object-fit: contain`
for hero illustrations, `cover` inside small card thumbnails.

## Notes

- Pollinations is free, no API key. First request per prompt takes a few
  seconds (it generates on demand), then it's cached on their side.
- SSL on this machine: the script injects `truststore` automatically.
- Want real photos instead of illustrations? Change the style suffix in
  `gen_content_images.py` (e.g. "soft natural photograph, warm light").
