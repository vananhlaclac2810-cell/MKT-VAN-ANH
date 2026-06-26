# 📜 NHẬT KÝ YÊU CẦU — Phiên làm việc "Chăm sóc bé" (17/06/2026)

Bản ghi toàn bộ yêu cầu của chị Vân Anh + kết quả em đã làm, theo đúng thứ tự.

---

## 🔍 GIAI ĐOẠN 1 — Nghiên cứu chăm sóc bé

**Yêu cầu:** *"Nghiên cứu chủ đề chăm sóc bé trên web và YouTube, các video trên 100.000 view, ~30 video, tiếng Anh hoặc Việt."*

**Đã làm:** Dùng `yt-dlp` quét 13 truy vấn → 171 video unique → lọc **73 video ≥100K view** (31 Việt + 42 Anh).
**File:** `nghien-cuu-cham-soc-be-youtube-2026-06-17.md`
**Insight chính:** Tiếng Việt ăn ngách "bé ốm" (9/10 video ho/sốt/nghẹt mũi là VN); tiếng Anh ăn "cẩm nang tổng quát".

---

## 🧠 GIAI ĐOẠN 2 — NotebookLM

**Yêu cầu:** *"Đưa vào NotebookLM phân tích → ra tuyến content → làm content video short 60-90s."* + *"hướng dẫn lấy API"* + *"chạy tự động sang notebook"* + *"cài đi"*.

**Đã làm:**
- Bóc transcript 12 video Việt top → source pack.
- Tự phân tích ra **5 tuyến content + 5 kịch bản video 60-90s** (`tuyen-content-cham-soc-be-video-short-2026-06-17.md`).
- Cài **2 công cụ NotebookLM tự động**: `notebooklm-py` (CLI) + `notebooklm-mcp-cli` (`nlm`, gắn MCP vào Claude Code), đăng nhập `vananh.laclac2810@gmail.com`, fix SSL truststore.
- Đẩy tự động vào NotebookLM → notebook "Chăm sóc bé" tự phân tích ra **5 tuyến + 10 ý tưởng** (`KETQUA-NOTEBOOKLM-cham-soc-be-2026-06-17.md`).

---

## 🛒 GIAI ĐOẠN 3 — Bộ skill landing page

**Yêu cầu:** *"Mở bộ mkt landing"* → *"cài repo Freedombuiders/MKT.LANDINGPAGE.SKILLS vào máy"* → *"a (giữ lại)"* → *"lưu vào ổ + mở file"* → *"đã thêm affiliate/đa ngôn ngữ/google chưa"*.

**Đã làm:**
- ⚠️ **PHÁT HIỆN MÃ ĐỘC** trong repo (`biz-email-setup/templates/api-route-vercel-function.js` — JS obfuscated). File nhiễm KHÔNG lên máy.
- Cài 3 skill MỚI **đã quét sạch**: `biz-admin-google-auth`, `biz-affiliate-system`, `biz-i18n-landing-page`.
- Lưu docs an toàn: `freedom-mkt-landing-docs/`.

---

## 🎨 GIAI ĐOẠN 4 — Rebrand skill video 9:16 sang Dr.Maya

**Yêu cầu (theo thứ tự):**
1. *"Đổi màu thương hiệu Dr.Maya + kiểu mẹ bé"*
2. *"Lấy màu của slide sản phẩm Dr.Maya"* (→ xanh lá `#0A6F3E` + gold `#F2B705`)
3. *"Dùng màu đó cho cảnh trám"* → *"thử làm 1 video xem"*
4. *"Cho màu vàng trắng đi… + chèn hình ảnh theo nội dung"* (vd bé đi tiêm → ảnh bé đi tiêm)
5. *"Ổn hơn rồi, thay đổi và lưu lại skill"*
6. *"Bổ sung thumbnail giật tít + tiêu đề từ kịch bản"*
7. *"Ok quá, lưu lại hết vào skill"*
8. *"Thử 1 video có mặt c, kịch bản ở ảnh (Tắm lá)"*

**Đã làm — skill `mkt-hyperframe-knowledge-video-heygen-9-16` giờ có:**
- ✅ Palette **vàng-trắng Dr.Maya** + font Be Vietnam Pro (`design-system.md`, `scene-reference.html`)
- ✅ **Thumbnail giật tít 0-2.4s** lấy tiêu đề từ kịch bản (`master-index`)
- ✅ **Ảnh chèn theo nội dung** tự tạo (`scripts/gen_content_images.py` + `references/content-images.md`)
- ✅ brand-mark `@drmaya · Mẹo cho mẹ` + section "BÀI HỌC CHẠY THẬT"
- ✅ **VIDEO THẬT:** `videos-done/tam-la-da-be.mp4` (avatar HeyGen Vân Anh + giọng clone MiniMax + Dr.Maya + thumbnail + 4 ảnh + captions, 36s)

---

## 🔁 GIAI ĐOẠN 5 — Nhân rộng + thử nghiệm

**Yêu cầu:** *"/mkt-hyperframe-knowledge-video-heygen-16-9"* + hỏi về talking-head & faceless + *"thử video có mặt tôi → faceless → head video → edit kĩ như clip 9:16"*.

**Đã làm:**
- ✅ Rebrand skill **16:9** sang Dr.Maya (`design-system.md`, `scene-reference.html` 1200×1080, `master-index` avatar frame xanh→gold, `gen_content_images.py`, SKILL.md).
- 🔄 **ĐANG BUILD DỞ:** video 16:9 avatar Dr.Maya (tái dùng asset tắm-lá) — đã set up asset + viết brief, còn dựng 4 cảnh + render.

---

## 📦 TỔNG KẾT FILE/SKILL ĐÃ TẠO TRONG PHIÊN

**File ở `D:\SKILL MARKETING AGENT\`:**
- `nghien-cuu-cham-soc-be-youtube-2026-06-17.md` — 73 video research
- `tuyen-content-cham-soc-be-video-short-2026-06-17.md` — 5 tuyến + 5 kịch bản
- `KETQUA-NOTEBOOKLM-cham-soc-be-2026-06-17.md` — 5 tuyến + 10 ý tưởng (NotebookLM)
- `notebooklm-source-pack-cham-soc-be.md` + `transcript-cham-soc-be/` — tư liệu gốc
- `videos-done/tam-la-da-be.mp4` — video mẫu hoàn chỉnh
- `freedom-mkt-landing-docs/` — docs landing skills (đã lọc mã độc)

**Skill đã cài/sửa:**
- Cài: `biz-admin-google-auth`, `biz-affiliate-system`, `biz-i18n-landing-page`, `notebooklm-py`, `notebooklm-mcp-cli`
- Rebrand Dr.Maya: `mkt-hyperframe-knowledge-video-heygen-9-16` (xong + test) + `...-16-9` (xong, chưa test)

**Còn lại (tuỳ chọn):** rebrand base `mkt-hyperframe-knowledge-video` + `mkt-hyperframe-talking-head-video` (vẫn tông dark).
