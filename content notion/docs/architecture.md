# 🏗 Architecture — Content Notion System

## Sơ đồ tổng thể

```
         ┌─────────────────────┐
         │   cron-job.org      │  FREE unlimited
         │   4 lịch tự chạy:   │  ─────────────
         │   • CN 7AM research │
         │   • CN 8AM ideas    │
         │   • Mỗi 10' draft   │
         │   • Mỗi 5' health   │
         └──────────┬──────────┘
                    │ HTTP GET
                    ▼
   ┌──────────────────────────────────────────┐
   │   RENDER FREE WEB SERVICE                 │
   │   (share với bot journal đang chạy)      │
   │                                            │
   │   GET /cron/drmaya-research               │
   │   GET /cron/drmaya-ideas                  │
   │   GET /cron/drmaya-draft                  │
   │   GET /cron/drmaya-healthcheck            │
   └──┬───────────┬──────────────┬─────────────┘
      │           │              │
      ▼           ▼              ▼
   ┌─────┐   ┌────────┐    ┌─────────┐
   │Apify│   │ Gemini │    │ Notion  │
   │ $5  │   │  2.5   │    │   API   │
   │free │   │ Flash  │    │  free   │
   │/m   │   │  free  │    │unlimited│
   └─────┘   └────────┘    └────┬────┘
                                 │ read/write
                                 ▼
   ┌──────────────────────────────────────────┐
   │           NOTION WORKSPACE                │
   │  ┌──────────────┐  ┌──────────────┐      │
   │  │ Competitor   │  │ Idea Inbox   │      │
   │  │     DB       │  │     DB       │      │
   │  └──────────────┘  └──────────────┘      │
   │  ┌──────────────────────────────────┐    │
   │  │  Content Calendar (Chờ duyệt tab)│    │
   │  └──────────────────────────────────┘    │
   │  ┌──────────────────────────────────┐    │
   │  │  Brand Brief + Voice Examples    │    │
   │  └──────────────────────────────────┘    │
   │                                            │
   │  👤 Dr.Maya: chỉ Approve ideas + caption  │
   │  👑 Sếp Vân Anh: xem dashboard tổng quan  │
   │  📤 Linh/Hà: post + fill metrics          │
   └──────────────────────────────────────────┘
```

---

## Tech stack

| Component | Service | Tier | Cost |
|-----------|---------|------|------|
| **Cron trigger** | cron-job.org | Free | $0 unlimited cron |
| **Worker host** | Render web service | Free | $0 (share với telegram-journal-bot) |
| **AI model** | Gemini 2.5 Flash via API | Free tier | $0 (1500 req/day, 1M token/min) |
| **Web scrape** | Apify (Facebook + TikTok actors) | Free credit | $0 ($5/month free, dùng ~$0.80) |
| **Database** | Notion API | Free workspace | $0 (rate 3 req/sec, unlimited daily) |
| **Alert** | Telegram bot (existing) | Free | $0 (reuse journal bot) |

**Tổng: $0/tháng** ✅

---

## Cron schedules

| Endpoint | Schedule | Mục đích |
|----------|----------|----------|
| `/cron/drmaya-research` | Chủ nhật 7:00 AM | Scrape 20 đối thủ → phân tích → Competitor DB |
| `/cron/drmaya-ideas` | Chủ nhật 8:00 AM | Đọc Competitor tuần qua → sinh 30-50 ideas → Idea Inbox |
| `/cron/drmaya-draft` | Mỗi 10 phút | Poll Notion `status=Approved` → viết caption → Content Calendar |
| `/cron/drmaya-healthcheck` | Mỗi 5 phút | Ping endpoint dummy → keep Render awake, không sleep |

---

## Data flow

### Workflow 1: Research

```
cron-job.org (Sunday 7AM)
    │
    ▼
GET /cron/drmaya-research
    │
    ▼
Read competitors.json (20 đối thủ)
    │
    ▼
For each competitor:
    └─ Apify run actor (facebook-pages-scraper / tiktok-scraper)
    └─ Get last 10 posts
        └─ For each post:
            └─ Gemini analyze (hook, topic, engagement score)
            └─ Notion API: create page in Competitor DB
    │
    ▼
Telegram alert: "✅ Research done: 800 posts analyzed"
```

### Workflow 2: Ideas

```
cron-job.org (Sunday 8AM)
    │
    ▼
GET /cron/drmaya-ideas
    │
    ▼
Notion API: query Competitor DB
    └─ Filter: scraped_at > 7 days ago
    └─ Sort by engagement_score desc
    └─ Take top 20 posts
    │
    ▼
Read Brand Brief + Pillar % (target: 40/25/20/15)
    │
    ▼
Gemini generate 30-50 ideas:
    └─ Mỗi idea: title, angle, pillar, inspired_by (relation)
    │
    ▼
For each idea:
    └─ Hash semantic, check dedup với 4 tuần qua
    └─ Notion API: create page in Idea Inbox (status = Draft)
    │
    ▼
Telegram alert: "💡 30 ideas ready for Dr.Maya review"
```

### Workflow 3: Draft

```
cron-job.org (every 10 min)
    │
    ▼
GET /cron/drmaya-draft
    │
    ▼
Notion API: query Idea Inbox
    └─ Filter: status = "Approved" AND processing_at < (now - 10min OR null)
    └─ Take up to 5 ideas per run (rate limit Gemini)
    │
    ▼
For each idea:
    ├─ Lock: update idea status = "Đang viết" + processing_at = now
    ├─ Read context:
    │   └─ Brand Brief
    │   └─ Brand Voice Examples (10-16 bài)
    │   └─ Idea details
    │   └─ Inspired_by competitor post
    ├─ Gemini draft caption (Hook + Open + Body + CTA)
    ├─ Notion API:
    │   └─ Create new page in Content Calendar
    │       └─ status = "Chờ duyệt"
    │       └─ caption = full text
    │       └─ inspired_by relation
    │       └─ from_idea relation
    │       └─ pillar tag
    │       └─ Người viết = "AI Bot"
    │   └─ Update idea status = "Đã viết"
    │
    ▼
If error → revert idea status, log to Notion field "ai_error"
If success → continue next idea
    │
    ▼
Daily cap: nếu > 30 bài viết hôm nay → pause, telegram alert
```

### Workflow 4: Healthcheck

```
cron-job.org (every 5 min)
    │
    ▼
GET /cron/drmaya-healthcheck
    │
    ▼
Return 200 OK (lightweight, no logic)
    │
    ▼
Render free service: not sleeping (15min idle timeout reset)
```

---

## Why this stack

| Decision | Reasoning |
|----------|-----------|
| Render free (share with bot journal) | Vân Anh đã có service đang chạy → không phát sinh hosting mới. Healthcheck giữ awake → cron không lỡ. |
| Gemini Flash thay Claude API | Claude Max plan không cho headless API access. Gemini free tier (1500 req/day) đủ cho 100 req/day Dr.Maya cần. |
| Apify thay tự code scraper | FB block Playwright/Puppeteer trên IP datacenter rất nhanh. Apify chạy trên IP pool residential, ổn định. $5 free credit/month đủ cho 20 pages weekly. |
| cron-job.org thay GitHub Actions | GitHub Actions min interval = 5 min (OK) nhưng setup phức tạp hơn. cron-job.org chỉ cần URL + schedule, đơn giản hơn nhiều. |
| Notion thay Airtable/Sheets | Vân Anh đang dùng Notion. Notion API free unlimited. Schema flexibility tốt. Kanban view đẹp built-in. |
| Polling 10 phút thay realtime webhook | Notion webhook automation cần plan Business ($15/user/m). Polling free + delay 10p chấp nhận được cho 30 bài/ngày. |

---

## Failure modes & recovery

| Failure | Detection | Recovery |
|---------|-----------|----------|
| Render sleep | Healthcheck cron fail | Cron-job.org email alert + healthcheck wake lại |
| Apify hết free credit | Worker exception | Telegram alert + skip research tuần đó |
| Gemini rate limit | API 429 response | Retry sau 60s × 3, nếu vẫn fail → push idea sang "Cần viết tay" |
| Notion API down | Worker exception | Retry × 3, nếu fail → Telegram alert + skip cycle |
| FB/TikTok block Apify | Apify returns empty | Telegram alert + fallback Dr.Maya curate manual link |
| AI quality kém | Dr.Maya rate "Need edit" nhiều | Cuối tháng review Edit reason → tune prompt |

---

## Security

- `NOTION_TOKEN`, `GEMINI_API_KEY`, `APIFY_TOKEN` lưu trong Render env vars (encrypted at rest)
- Endpoints có rate limit 1 req/min (chống spam)
- Endpoints có secret header check (`X-Cron-Secret` header phải match env var)
- Notion integration scope: chỉ 4 DB được share (không thấy DB khác trong workspace)

---

## Scale ceiling

| Resource | Free tier limit | Hiện tại dùng | Headroom |
|----------|-----------------|---------------|----------|
| Gemini 2.5 Flash req | 1500/day | ~100/day | 15× |
| Apify credit | $5/month | $0.80/month | 6× |
| Notion API | 3 req/sec | ~1 req/min | 180× |
| Render free hours | 750/month | ~720/month (24/7) | 1× ⚠️ |
| cron-job.org | unlimited | ~9000 runs/month | ∞ |

⚠️ **Render free 750h/month gần sát limit (24/7 = 720h)**. Nếu cần buffer → consider Render starter $7/month sau này.
