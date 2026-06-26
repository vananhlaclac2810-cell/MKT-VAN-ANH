# Transcode the 5 raw clips into web-optimized MP4 + poster JPG.
$ff = "C:\Users\ADMIN\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
$src = "D:\SKILL MARKETING AGENT\landing-hasobaby\assets-raw"
$out = "D:\SKILL MARKETING AGENT\landing-hasobaby\public\videos"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function Encode($inName, $outName, $crf) {
  $inp = Join-Path $src $inName
  $vid = Join-Path $out "$outName.mp4"
  $pos = Join-Path $out "$outName.jpg"
  if (-not (Test-Path $inp)) { Write-Output "MISSING $inName"; return }
  & $ff -loglevel error -y -i $inp -vf "scale='min(720,iw)':-2,format=yuv420p" -c:v libx264 -preset medium -crf $crf -c:a aac -b:a 128k -movflags +faststart $vid
  & $ff -loglevel error -y -ss 1.2 -i $vid -frames:v 1 -q:v 3 $pos
  if (Test-Path $vid) { Write-Output ("OK {0} -> {1} MB" -f $outName, [math]::Round((Get-Item $vid).Length/1MB,1)) }
  else { Write-Output "FAIL $outName" }
}

Encode "FSave_Reels_Co-con-roi-moi-hieu-Moi-lan-con-sot-nhe-_Media_1623457943060492_001_720p.mp4" "review-1" 28
Encode "FSave_Reels_Sot-moc-rang-sot-sau-tiem-phong-nguoi-ha_Media_1938477540369246_001_540p.mp4" "review-2" 28
Encode "FSave_Reels_Di-tiem-ve-can-ngay-bao-boi-Xit-HASOBABY_Media_1982990555597228_001_360p.mp4" "review-3" 28
Encode "FSave_Reels_Sot-tiem-phong-la-phan-ung-cua-co-the-vo_Media_1617877892967491_001_360p.mp4" "review-4" 28
Encode "raw-pharmacy.mp4" "pharmacy" 29
Write-Output "==== TRANSCODE DONE ===="
