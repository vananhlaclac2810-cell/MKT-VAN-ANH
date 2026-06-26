# BIZ.MKT.OS

Marketing operating system & content production workspace for Dr.Maya / MamaJoy.

## Cấu trúc thư mục

### Source projects
- `landing-dau-hung-chanh/` — Landing page Dầu Húng Chanh (live: thieuvananh.vn, hosted Vercel)
- `hyperframes-demo/` — Demo render video từ HTML (HyperFrames)
- `ebook-hanh-trinh-euro-tu-ngu/` — Ebook "Hành trình Euro từ ngữ"
- `text-overlay-vai-giot/` — Text overlay project "Vài giọt"

### Content production
- `video-raw/` — Video gốc chưa edit (LFS)
- `video-edited/` — Video đã edit (LFS)
- `audio/` — File audio nguồn (LFS)
- `anhthy_reels/` — Reels của Thiều Vân Anh
- `transcripts/` — Transcript các video

### Competitor research
- `bssuame_bmc_100k_*` — Data Bác Sĩ Sữa Mẹ BMC (TikTok @bssuame_bmc)
- `duocsyngacoi_*` — Data Dược Sỹ Ngà Coi (TikTok @duocsyngacoi)
- `tuvansuame_*` — Data Bác Sĩ Sữa Mẹ Anh Thy (Page TuVanSuaMe)
- `chamsocmebe_*` — Data Chăm Sóc Mẹ Bé

### Tools & scripts
- `.tools/` — Binary tools (yt-dlp)
- `transcribe.py`, `gen_karaoke_ass.py`, `duocsyngacoi_*.py` — Scripts xử lý

## Git LFS

Repo dùng [Git LFS](https://git-lfs.com/) cho file media lớn (mp4, mov, mp3, wav, exe).
Sau khi clone:

```bash
git lfs install
git lfs pull
```
