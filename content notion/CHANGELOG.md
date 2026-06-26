# 📝 CHANGELOG — Báo cáo cho chị Vân Anh

> Anh tự làm khi c đi ăn cơm. Đây là toàn bộ tiến độ.

---

## 🟢 2026-05-27 — Phase 1 + Phase 2 + Phase 3 (scaffold) HOÀN THÀNH

### ✅ 1. Research 20 đối thủ Dr.Maya Baby

Đã research và lưu vào 2 nơi:
- `D:\SKILL MARKETING AGENT\content notion\config\competitors.json`
- `D:\SKILL MARKETING AGENT\telegram-journal-bot\src\drmaya\config\competitors.json` (code đọc từ đây)

**Danh sách 20 đối thủ chia 4 nhóm:**

| # | Tên | Tier | Priority |
|---|-----|------|----------|
| 1 | Bio-Acimin | Direct (men vi sinh) | 🔥 high |
| 2 | Imiale | Direct (men vi sinh) | 🔥 high |
| 3 | BioGaia Protectis Baby | Direct | 🔥 high |
| 4 | BioAmicus Complete | Direct | 🔥 high |
| 5 | LiveSpo | Direct | 🔥 high |
| 6 | Enterogermina | Direct | medium |
| 7 | Pediakid | Direct (vitamin) | 🔥 high |
| 8 | Nature's Way Kids | Direct (vitamin) | 🔥 high |
| 9 | Doppelherz Kinder | Direct (vitamin) | medium |
| 10 | Zeambi | Direct | medium |
| 11 | Moaz BéBé | Skincare (dầu tắm) | 🔥 high |
| 12 | Wesser | Skincare | medium |
| 13 | Pigeon Vietnam | Skincare | medium |
| 14 | Mustela | Skincare | low |
| 15 | Bibo Mart | Retail chain | medium |
| 16 | Con Cưng | Retail chain | 🔥 high |
| 17 | Kids Plaza | Retail chain | medium |
| 18 | Chiaki.vn | Online retail | medium |
| 19 | **Dược Sĩ Nhi Đồng** | KOL pharmacist (834K TT) | 🚨 **critical** |
| 20 | Bác sĩ Lê Hữu Thắng | KOL doctor | 🔥 high |

**⚠️ Quan trọng**: 1 số FB URL + TikTok handle là **best-effort guess** từ web search. C cần verify trước khi launch (mở từng link, nếu sai → edit `competitors.json`). Đặc biệt:
- **Dược Sĩ Nhi Đồng** (TikTok 834K) — KOL trực tiếp cạnh tranh positioning Dr.Maya, **phải theo dõi sát**.

### ✅ 2. Scaffold toàn bộ code Phase 3 (Render endpoints)

Đã code đầy đủ module `drmaya/` vào repo `telegram-journal-bot` (share infrastructure với bot journal hiện tại):

```
D:\SKILL MARKETING AGENT\telegram-journal-bot\src\drmaya\
├── index.js                    # Route registrar (opt-in qua env)
├── prompts.js                  # 3 prompts cho 3 workflow
├── config/
│   └── competitors.json        # 20 đối thủ
├── lib/
│   ├── notion.js               # Notion API wrapper (raw fetch)
│   ├── gemini.js               # Gemini API wrapper (reuse OpenAI SDK)
│   ├── apify.js                # Apify FB + TikTok scraper wrapper
│   └── alert.js                # Telegram alert qua bot journal hiện tại
└── routes/
    ├── research.js             # GET /cron/drmaya-research
    ├── ideas.js                # GET /cron/drmaya-ideas
    ├── draft.js                # GET /cron/drmaya-draft
    └── healthcheck.js          # GET /cron/drmaya-healthcheck
```

**Đã sửa journal-bot**:
- `src/index.js`: thêm `registerDrMayaRoutes(app)` — opt-in, journal bot vẫn chạy bình thường nếu chưa set NOTION_TOKEN
- `.env.example`: thêm section Dr.Maya env vars
- `render.yaml`: thêm 11 env keys cho Dr.Maya

**Tất cả 10 file đã pass `node --check` ✅** — syntax sạch, sẵn deploy.

### ✅ 3. Document đầy đủ tại `content notion/`

| File | Mô tả |
|------|-------|
| `README.md` | Tổng quan hệ thống |
| `PLAN.md` | Master checklist 5 phase |
| `CHANGELOG.md` | (file này) |
| `docs/architecture.md` | Sơ đồ + tech stack + cron schedule |
| `docs/workflows.md` | Chi tiết 3 workflow + edge cases |
| `docs/notion-setup-guide.md` | Hướng dẫn step-by-step setup Notion |
| `brand/brand-brief.md` | Brand voice guideline (draft, c verify) |
| `brand/brand-voice-examples.md` | 16 link FB Vân Anh + style analysis |
| `prompts/prompts.md` | 3 prompts (đồng bộ với code drmaya/prompts.js) |
| `config/competitors.json` | 20 đối thủ (source) |
| `.env.example` | Template env vars (cho dev local) |
| `.gitignore` | (chuẩn) |

---

## 🟡 Việc tiếp theo c cần làm (theo thứ tự)

### Bước 1: Setup Notion (45-60 phút)

Mở `docs/notion-setup-guide.md` và làm theo:
1. Tạo workspace "Dr.Maya Content"
2. Tạo 4 database với đầy đủ field schema
3. Tạo 2 pinned page (Brand Brief + Voice Examples) — paste từ `brand/*.md`
4. Paste 16 bài Vân Anh full text vào Voice Examples
5. Tạo 6 filtered views
6. Tạo Notion Integration → lấy `NOTION_TOKEN`
7. Share 4 DB với integration
8. Copy 4 database ID + 2 page ID

**Gửi anh 7 giá trị này khi xong**:
```
NOTION_TOKEN=secret_xxx
NOTION_DB_CONTENT_CALENDAR=xxx
NOTION_DB_IDEA_INBOX=xxx
NOTION_DB_COMPETITOR=xxx
NOTION_DB_INTERNAL_NOTES=xxx
NOTION_PAGE_BRAND_BRIEF=xxx
NOTION_PAGE_VOICE_EXAMPLES=xxx
```

### Bước 2: API keys (30 phút)

- [ ] Gemini: https://aistudio.google.com → Get API key (đã có cho journal bot, có thể share)
- [ ] Apify: https://apify.com → Sign up → Settings → Integrations → Personal API token
- [ ] cron-job.org: https://cron-job.org → Sign up

### Bước 3: Verify 20 đối thủ (15-30 phút)

Mở `content notion/config/competitors.json` → kiểm tra mỗi link FB + TikTok có đúng không. Bài về sau:
- Click vào FB URL → có ra đúng page đối thủ không?
- Click TikTok handle → đúng người?
- Nếu sai → edit lại trong file

Có vài link anh chỉ guess (vd: PediakidVN, Doppelherz.Vietnam) — c xác minh giúp.

### Bước 4: Anh hoàn thiện Phase 4 (test + launch)

Khi c có đủ keys trên + Notion setup xong, gửi anh → anh sẽ:
1. Add env vars vào Render dashboard
2. Setup 4 cron job trên cron-job.org
3. Test workflow 1 (research) với 1 đối thủ trước
4. Test workflow 2 (ideas) với 5 idea
5. Test workflow 3 (draft) với 1 caption
6. Live launch + monitor 1 tuần

---

## 📊 Tiến độ tổng thể

```
Phase 0: Design & Architecture       ████████████████████ 100% ✅
Phase 1: Notion Setup                ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   0% ⏳ (chờ c làm)
Phase 2: API keys                    ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   0% ⏳ (chờ c đăng ký)
Phase 3: Code Render endpoints       ██████████████████░░  90% 🟡 (scaffold xong, đợi env vars)
Phase 4: Test & Launch               ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   0% ⏳
Phase 5: Optimization (1 tháng sau)  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   0%
```

---

## 🔒 Sanity checks (anh đã verify)

- [x] 10 file source code pass `node --check`
- [x] Code module hoàn toàn opt-in — không ảnh hưởng journal bot hiện tại nếu thiếu env
- [x] Reuse infrastructure có sẵn: Telegraf bot (alerts), express server (port 3000), OpenAI SDK (Gemini call)
- [x] Lock mechanism trong draft.js chống double-process khi cron trùng nhịp
- [x] Daily cap 30 bài/ngày + idempotent dedup theo URL trong research
- [x] Healthcheck cron tự reset stuck ideas > 30 phút
- [x] Telegram alert tận dụng credentials journal bot — không phát sinh setup mới

---

## 💰 Cost projection (sau khi launch)

| Item | Cost/tháng | Note |
|------|-----------|------|
| Render free web | $0 | Share với bot journal |
| Gemini 2.5 Flash | $0 | Free 1500 req/day, dùng ~100/day |
| Apify scraping | $0 | $5 free credit, dùng ~$0.80 (20 pages × weekly) |
| cron-job.org | $0 | Free unlimited |
| Notion | $0 | Free plan |
| **TỔNG** | **$0** | ✅ |

---

## 📞 Khi quay lại

C đọc file này trước, rồi:
1. Mở `PLAN.md` xem checklist tổng thể
2. Bắt đầu Bước 1 (setup Notion) theo `docs/notion-setup-guide.md`
3. Khi xong, gửi anh 7 giá trị env vars → anh launch
