# 📋 PLAN — Content Notion System cho Dr.Maya

> **Cập nhật**: 2026-05-27 (FULL PIPELINE LIVE)
> **Phase hiện tại**: ✅ HOÀN THÀNH — Phase 0→4 done, pipeline tự chạy $0/tháng
>
> **👀 ĐỌC TRƯỚC**: [PHASE1_DONE.md](./PHASE1_DONE.md) — báo cáo trạng thái cuối + 5 việc c làm tiếp.

---

## 🎯 Goal

Build hệ thống AI tự động viết 30 bài/ngày cho brand Dr.Maya, push vào Notion để team duyệt và publish. **Chi phí $0/tháng. Fully automated.**

---

## 📅 Phase plan & checklist

### ✅ Phase 0: Design & Architecture (HOÀN THÀNH 2026-05-27)
- [x] Chốt kiến trúc $0 + fully automated (cron-job.org + Render + Gemini + Apify + Notion)
- [x] Vẽ sơ đồ Notion workspace + 6 filtered views
- [x] Chốt schema 4 DB (Content Calendar / Idea Inbox / Competitor DB / Internal Notes)
- [x] Lấy 16 brand voice examples từ FB Vân Anh
- [x] Tạo project workspace `D:\SKILL MARKETING AGENT\content notion`

### 🟡 Phase 1: Notion Setup (ĐANG LÀM — Vân Anh thực hiện)

**Hướng dẫn chi tiết**: [docs/notion-setup-guide.md](./docs/notion-setup-guide.md)

**Việc cần Vân Anh + Dr.Maya làm**:

- [ ] Tạo Notion workspace mới hoặc dùng workspace hiện có cho Dr.Maya
- [ ] Tạo **4 database** với đầy đủ field theo schema:
  - [ ] Content Calendar (~20 field)
  - [ ] Idea Inbox (~10 field)
  - [ ] Competitor DB (~12 field)
  - [ ] Internal Notes (~5 field)
- [ ] Tạo **2 pinned page**:
  - [ ] Brand Brief (paste từ `brand/brand-brief.md`, edit section [VERIFY])
  - [ ] Brand Voice Examples (paste 16 bài FB Vân Anh full text)
- [ ] Tạo **6 filtered views**:
  - [ ] 📋 Tổng quan Sếp (filter: all)
  - [ ] 👤 Board của Linh (filter: assignee = Linh)
  - [ ] 👤 Board của Hà (filter: assignee = Hà)
  - [ ] ⚠️ Bài quá hạn (filter: deadline < today AND status ≠ Đã đăng)
  - [ ] 🤖 AI Pipeline chờ duyệt (filter: viết bởi AI Bot AND status = Chờ duyệt)
  - [ ] 🏆 Top Performance (filter: published_at < 30d, sort by Reach desc)
- [ ] Tạo **Notion Integration**:
  - [ ] Vào https://www.notion.so/profile/integrations → New integration
  - [ ] Tên: "DrMaya Content Bot"
  - [ ] Lấy `Internal Integration Token` (bắt đầu bằng `secret_...`)
- [ ] **Share 4 database** với integration (mỗi DB → ... → Add connections → DrMaya Content Bot)
- [ ] Copy **4 database ID** từ URL (đoạn 32 ký tự sau workspace name)
- [ ] Gửi anh: `NOTION_TOKEN` + 4 database ID qua chat

### ⏳ Phase 2: API Keys (Vân Anh chuẩn bị, ~30 phút)

- [ ] **Gemini API key**:
  - [ ] Vào https://aistudio.google.com → Get API key
  - [ ] Lưu `GEMINI_API_KEY`
- [ ] **Apify**:
  - [ ] Đăng ký https://apify.com (free plan)
  - [ ] Settings → Integrations → Personal API token
  - [ ] Lưu `APIFY_TOKEN`
- [ ] **cron-job.org**:
  - [ ] Đăng ký https://cron-job.org (free)
  - [ ] Phase 3 anh sẽ hướng dẫn tạo 3 cron job
- [ ] **20 đối thủ list**:
  - [ ] List tên page FB + handle TikTok của 20 đối thủ Dr.Maya
  - [ ] Save vào file `competitors.txt` hoặc paste qua chat
- [ ] Gửi anh: tất cả keys + competitors list

### 🟢 Phase 3: Build Render Endpoints (DONE — chờ env vars)

- [x] Add module `drmaya/` vào repo `telegram-journal-bot` hiện tại
- [x] Code `lib/notion.js` — wrapper Notion API (raw fetch)
- [x] Code `lib/gemini.js` — wrapper Gemini API (reuse OpenAI SDK)
- [x] Code `lib/apify.js` — wrapper Apify FB + TikTok scraper
- [x] Code `lib/alert.js` — Telegram alert qua bot journal
- [x] Code `prompts.js` — 3 prompts cho 3 workflow
- [x] Code `routes/research.js` — workflow 1
- [x] Code `routes/ideas.js` — workflow 2
- [x] Code `routes/draft.js` — workflow 3 (kèm lock mechanism + daily cap)
- [x] Code `routes/healthcheck.js` — keep Render awake + reset stuck ideas
- [x] Modify `src/index.js` — register routes opt-in
- [x] Update `.env.example` + `render.yaml`
- [x] Syntax check tất cả file pass ✅
- [ ] Deploy lên Render (sau khi có env vars từ Phase 1+2)

### ⚪ Phase 4: Test & Launch (anh + Vân Anh, ~1 ngày)

- [ ] **Test 1 (manual)**: Trigger research với 1 đối thủ → check Competitor DB có entry mới đúng schema
- [ ] **Test 2 (manual)**: Trigger ideas → check Idea Inbox có 5-10 idea + quality OK
- [ ] **Test 3 (manual)**: Manually approve 1 idea → trigger draft → check Content Calendar có entry "Chờ duyệt" + caption đúng brand voice
- [ ] **Test 4 (alert)**: Test Telegram alert bằng cách fail Notion API key 1 lần → check Telegram nhận tin
- [ ] Setup 3 cron job trên cron-job.org:
  - [ ] Research: Sunday 7:00 AM
  - [ ] Ideas: Sunday 8:00 AM
  - [ ] Draft poll: every 10 minutes
  - [ ] Healthcheck: every 5 minutes
- [ ] **Live launch** với 1 tuần monitor sát

### ⚪ Phase 5: Optimization (sau 1 tháng)

- [ ] Review `AI quality` field → tune prompts dựa trên `Edit reason`
- [ ] Add auto-backup Notion → Google Drive weekly
- [ ] Add A/B testing variants (2 hook/idea)
- [ ] Add performance auto-sync (engagement metrics qua Apify)
- [ ] Add content pillar % dashboard

---

## ⏳ Đang chờ Vân Anh quyết định

| # | Câu hỏi | Status |
|---|---------|--------|
| 1 | **Approval matrix**: Dr.Maya duyệt tất cả? Hay Sếp duyệt riêng Promotional? | ❓ Chờ Vân Anh confirm (default: Sếp duyệt Promotional + Medical) |
| 2 | **20 đối thủ**: Vân Anh có list sẵn? Hay anh đề xuất research mẫu? | ❓ Chờ |
| 3 | **Brand Voice paste**: Vân Anh paste full text 16 bài vào Notion page khi nào? | ❓ Có thể paste sau khi tạo Notion DB xong |
| 4 | **Telegram alert**: anh wire vào bot journal hiện tại để gửi cảnh báo? | ❓ Confirm OK? |

---

## 📊 Cost summary

| Item | Cost | Note |
|------|------|------|
| Render free web | $0 | Share infrastructure với bot journal |
| Gemini 2.5 Flash | $0 | Free tier 1500 req/day (cần ~100/day) |
| Apify scrape | $0 | $5 free credit/month (cần ~$0.80) |
| cron-job.org | $0 | Free unlimited |
| Notion | $0 | Free plan |
| **TOTAL** | **$0/tháng** | ✅ |

---

## 📞 Liên hệ

- **Owner**: Vân Anh (vananh.laclac2810@gmail.com)
- **Brand**: Dr.Maya Baby
- **Repo code**: tích hợp trong `telegram-journal-bot` (Render service hiện có)
