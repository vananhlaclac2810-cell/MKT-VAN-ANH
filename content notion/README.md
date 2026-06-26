# 📁 Content Notion — Hệ thống tự động hoá content cho Dr.Maya

> Hệ thống AI tự động: research đối thủ → sinh ý tưởng → viết caption → đẩy vào Notion để team duyệt và publish.
>
> **Chi phí: $0/tháng.** Fully automated. Zero touch.

---

## 🎯 Tổng quan

3 workflow AI chạy tự động:

| # | Workflow | Khi nào chạy | Output |
|---|----------|--------------|--------|
| 1 | Research 20 đối thủ FB+TikTok | Chủ nhật 7:00 AM | Competitor DB (~800 posts/tuần) |
| 2 | Sinh ý tưởng từ insight tuần qua | Chủ nhật 8:00 AM | Idea Inbox (30-50 ideas/tuần) |
| 3 | Viết caption full từ idea Approved | Mỗi 10 phút | Content Calendar tab "Chờ duyệt" |

Team chỉ thao tác **3 việc** trong Notion:
1. **Dr.Maya**: bấm Approve ideas → Approve caption (~30 phút/ngày)
2. **Sếp Vân Anh**: duyệt bài Promotional + xem dashboard tổng quan
3. **Linh/Hà**: post bài đã duyệt lên FB/TikTok + fill metrics

---

## 📂 Cấu trúc thư mục

| File | Nội dung |
|------|----------|
| **[PLAN.md](./PLAN.md)** | 🚦 Master checklist — phase hiện tại + việc tiếp theo |
| [docs/architecture.md](./docs/architecture.md) | Sơ đồ kiến trúc + tech stack + data flow |
| [docs/notion-setup-guide.md](./docs/notion-setup-guide.md) | Hướng dẫn setup Notion (4 DB + 6 views + integration) |
| [docs/workflows.md](./docs/workflows.md) | Chi tiết 3 workflow (sequence + edge case) |
| [brand/brand-brief.md](./brand/brand-brief.md) | Brand voice guideline (ngách, audience, tone, format) |
| [brand/brand-voice-examples.md](./brand/brand-voice-examples.md) | 16 bài mẫu Vân Anh viết — AI đọc để bắt chước giọng |
| [prompts/prompts.md](./prompts/prompts.md) | 3 prompts Gemini cho 3 workflow |

---

## 🛠 Tech stack

| Layer | Tool | Cost |
|-------|------|------|
| Cron trigger | cron-job.org | Free unlimited |
| Worker host | Render free web (share với bot journal) | $0 |
| AI model | Gemini 2.5 Flash API | Free 1500 req/day |
| Scraper | Apify FB+TikTok actors | Free $5 credit/month |
| Database | Notion API | Free |
| Alert | Telegram bot (existing journal bot) | $0 |

**Tổng: $0/tháng** ✅

---

## 🚀 Bắt đầu

1. Đọc [PLAN.md](./PLAN.md) — biết phase hiện tại và việc tiếp theo
2. Phase 1 hiện tại: setup Notion theo [docs/notion-setup-guide.md](./docs/notion-setup-guide.md)
3. Khi Notion xong → gửi anh `NOTION_TOKEN` + 4 database ID → anh code Render endpoints

---

_Updated: 2026-05-27_
