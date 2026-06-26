# Patient retry for the missing illustrations. Probes Pollinations cheaply;
# only runs a full generation sweep when the service responds.
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$dir = "D:\SKILL MARKETING AGENT\landing-hasobaby\public\illustrations"
$gen = "D:\SKILL MARKETING AGENT\landing-hasobaby\gen-illustrations.ps1"
$names = @("ing-lo-hoi","step-1","step-2","step-3","step-4","aud-1","aud-2","aud-3","mom-1","mom-2","mom-3")

function Get-Missing {
  $names | Where-Object {
    -not ((Test-Path "$dir\$_.jpg") -and ((Get-Item "$dir\$_.jpg").Length -gt 6kb))
  }
}

for ($s = 1; $s -le 20; $s++) {
  $missing = @(Get-Missing)
  if ($missing.Count -eq 0) { Write-Output "ALL DONE at sweep $s"; break }

  $up = $false
  try {
    $tok = $env:POLLINATIONS_TOKEN
    $tp = if ($tok) { "&token=$tok" } else { "" }
    Invoke-WebRequest -Uri "https://image.pollinations.ai/prompt/tiny%20circle?width=128&height=128&nologo=true&model=flux&seed=7$tp" -OutFile "$env:TEMP\poll_probe.jpg" -UseBasicParsing -TimeoutSec 60 | Out-Null
    if ((Get-Item "$env:TEMP\poll_probe.jpg").Length -gt 2kb) { $up = $true }
  } catch {}

  if ($up) {
    Write-Output "Sweep $s : Pollinations UP -> generating $($missing.Count) missing"
    & $gen @missing
  } else {
    Write-Output "Sweep $s : Pollinations still blocked (402) -> waiting"
  }

  if (@(Get-Missing).Count -eq 0) { Write-Output "ALL DONE"; break }
  Start-Sleep -Seconds 150
}
Write-Output "==== retry-missing finished, remaining: $((@(Get-Missing)) -join ',') ===="
