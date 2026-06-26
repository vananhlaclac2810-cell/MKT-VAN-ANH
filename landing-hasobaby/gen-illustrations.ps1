# Generate a cohesive illustration set for the Hasobaby landing via Pollinations (free, no key).
# Usage: powershell -File gen-illustrations.ps1 [name1 name2 ...]   (no args = generate all, skip existing)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$outDir = "D:\SKILL MARKETING AGENT\landing-hasobaby\public\illustrations"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Remove-Item (Join-Path $outDir "_test.png") -ErrorAction SilentlyContinue

$style = "cute flat vector illustration, modern children's book style, soft rounded friendly shapes, simple clean flat design with soft shading and no harsh outlines, cheerful warm and gentle, color palette of sunny yellow fresh leaf green soft mint teal and gentle peach, plain solid white background, centered composition, no text, no words, no letters, no numbers"

$images = @(
  # --- Pain section ---
  @{ name="pain-1"; subj="a young Vietnamese mother at night gently holding her baby who has a fever with warm pink cheeks, a crescent moon and small stars behind, the mother looks softly worried and caring" }
  @{ name="pain-2"; subj="a worried young mother holding a small medicine bottle and a dosing spoon, hesitating, a tiny baby beside her, expressing concern about giving medicine too early" }
  @{ name="pain-3"; subj="a mother wiping her fussy crying baby with a warm wet towel next to a basin of water, the baby squirming, conveying a tiring awkward task" }
  @{ name="pain-4"; subj="a very tired mother with a sleepy face sitting beside a baby crib late at night, a moon in the window, conveying a sleepless exhausting night" }
  # --- 6 USP ---
  @{ name="usp-1"; subj="a single fresh water droplet with a bright sparkle beside a calm happy smiling baby face, conveying instant cooling freshness" }
  @{ name="usp-2"; subj="a friendly rounded thermometer at a comfortable safe level next to a small smiling sun, conveying gentle temperature relief" }
  @{ name="usp-3"; subj="a cute spray bottle releasing a light gentle mist with a green check mark, conveying quick easy one-step use, no mixing, no water needed" }
  @{ name="usp-4"; subj="a happy peaceful baby surrounded by soft green herbal leaves and plants, conveying natural herbal gentleness safe for newborns" }
  @{ name="usp-5"; subj="a friendly rounded protective shield decorated with a green leaf, conveying being free from harsh chemicals, clean and reassuring" }
  @{ name="usp-6"; subj="a water droplet joined with a soft heart resting on smooth baby skin, conveying cooling plus moisturizing skincare" }
  # --- 6 Ingredients (botanical) ---
  @{ name="ing-tram-gio"; subj="a botanical illustration of a cajuput tea tree sprig with slender narrow green leaves and tiny soft white bottlebrush flowers" }
  @{ name="ing-bac-ha"; subj="a botanical illustration of a fresh peppermint sprig with bright green oval leaves, cool and dewy" }
  @{ name="ing-hung-chanh"; subj="a botanical illustration of a Cuban oregano sprig with thick fleshy rounded fuzzy green leaves" }
  @{ name="ing-huong-nhu"; subj="a botanical illustration of a holy basil sprig with green leaves tinged slightly purple and small upright flower spikes" }
  @{ name="ing-dinh-huong"; subj="a botanical illustration of a few brown clove buds with a couple of green leaves, the clove spice" }
  @{ name="ing-lo-hoi"; subj="a botanical illustration of an aloe vera plant with thick green succulent pointed leaves, fresh and healthy" }
  # --- 4 How-to-use steps ---
  @{ name="step-1"; subj="two friendly hands shaking a small cute spray bottle with gentle motion lines around it" }
  @{ name="step-2"; subj="a hand holding a cute spray bottle a short measured distance from a baby's arm, a small soft gap shown between them" }
  @{ name="step-3"; subj="a cute spray bottle spraying a soft cool mist gently onto a baby's arm and back" }
  @{ name="step-4"; subj="a gentle hand softly patting a baby's skin with little soft sparkles, conveying the essence absorbing without wiping" }
  # --- 3 Audience ---
  @{ name="aud-1"; subj="a peaceful sleeping newborn baby softly swaddled in a blanket, tiny and calm" }
  @{ name="aud-2"; subj="a cheerful healthy toddler standing and smiling happily, full of energy and comfortable" }
  @{ name="aud-3"; subj="a smiling relaxed adult parent feeling cool and refreshed, comfortable and content" }
  # --- 3 Testimonial mom avatars ---
  @{ name="mom-1"; subj="an avatar portrait of a friendly smiling young Vietnamese mother with long straight black hair, head and shoulders, warm and approachable" }
  @{ name="mom-2"; subj="an avatar portrait of a friendly smiling Vietnamese mother with shoulder-length wavy hair, head and shoulders, cheerful and kind" }
  @{ name="mom-3"; subj="an avatar portrait of a friendly smiling Vietnamese mother with hair tied in a neat bun, head and shoulders, gentle and caring" }
)

$only = $args
$done = 0; $fail = 0
foreach ($img in $images) {
  if ($only.Count -gt 0 -and ($only -notcontains $img.name)) { continue }
  $path = Join-Path $outDir "$($img.name).jpg"
  if ((Test-Path $path) -and ((Get-Item $path).Length -gt 6kb)) { Write-Output "SKIP $($img.name)"; continue }

  $prompt = "$style, $($img.subj)"
  $enc = [uri]::EscapeDataString($prompt)
  $tok = $env:POLLINATIONS_TOKEN
  $tokParam = if ($tok) { "&token=$tok&referrer=hasobaby-landing" } else { "" }
  $url = "https://image.pollinations.ai/prompt/$enc`?width=1024&height=1024&nologo=true&model=flux&seed=7$tokParam"

  $ok = $false
  for ($try = 1; $try -le 4 -and -not $ok; $try++) {
    try {
      Invoke-WebRequest -Uri $url -OutFile $path -UseBasicParsing -TimeoutSec 180 | Out-Null
      if ((Test-Path $path) -and ((Get-Item $path).Length -gt 6kb)) {
        Write-Output "OK   $($img.name)  $([math]::Round((Get-Item $path).Length/1KB))KB"
        $ok = $true; $done++
      } else {
        Write-Output "SMALL $($img.name) try$try"
        Start-Sleep -Seconds 4
      }
    } catch {
      Write-Output "ERR  $($img.name) try$try : $($_.Exception.Message)"
      Start-Sleep -Seconds 6
    }
  }
  if (-not $ok) { $fail++; Remove-Item $path -ErrorAction SilentlyContinue }
  Start-Sleep -Milliseconds 700
}
Write-Output "==== DONE: $done generated, $fail failed ===="
