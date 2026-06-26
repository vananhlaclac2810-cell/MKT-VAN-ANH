# 🔄 Workflows — Chi tiết 3 + 1 workflow

---

## 🌅 Workflow 1: Research đối thủ (Sunday 7AM)

### Trigger
- **Schedule**: cron-job.org cron `0 0 * * 0` (UTC) = 7AM Sunday Vietnam time
- **Endpoint**: `GET /cron/drmaya-research`
- **Secret header**: `X-Cron-Secret: <env>`

### Logic

1. **Load competitors list** từ Notion page `Internal Notes → Competitors` (hoặc file `competitors.json` trong repo)
   - Mỗi entry: `{ name, platform (FB/TikTok), url_or_handle }`
   - Tổng: 20 đối thủ

2. **Scrape** mỗi đối thủ qua Apify:
   - FB pages: actor `apify/facebook-pages-scraper`
   - TikTok: actor `clockworks/free-tiktok-scraper`
   - Param: lấy 10 posts mới nhất / page

3. **Analyze** mỗi post bằng Gemini Flash:
   ```
   Prompt: "Phân tích bài Facebook/TikTok này:
   {post_text}
   Likes: {likes}  Comments: {comments}  Shares: {shares}
   Followers: {followers}
   
   Output JSON:
   - hook_pattern (1-2 từ): VD 'question', 'shock_number', 'story', 'list', 'controversy'
   - topic_tag (1-3 từ): VD 'vitamin D', 'men vi sinh', 'tăng sữa'
   - engagement_score (0-10): tính từ engagement rate
   - content_pillar: Educational/Storytelling/Promotional/Community
   - insight (1 câu): tại sao bài này hot
   "
   ```

4. **Write to Competitor DB** mỗi post:
   - `name` (đối thủ)
   - `platform` (FB/TikTok)
   - `post_url`
   - `caption` (đầy đủ)
   - `likes`, `comments`, `shares`
   - `engagement_score` (Gemini output)
   - `hook_pattern`, `topic`, `pillar`, `insight`
   - `scraped_at` = now

5. **Alert** qua Telegram:
   ```
   ✅ Research Sunday done
   - 20 đối thủ scanned
   - 187 posts analyzed
   - Top engagement: Moaz BéBé (9.5/10)
   - Apify spent: $0.18
   ```

### Edge cases

| Case | Handle |
|------|--------|
| Đối thủ private page | Skip + log warning |
| Apify timeout | Retry 1 lần, nếu fail skip page đó |
| Post đã có trong DB (URL trùng) | Update engagement metrics, không tạo duplicate |
| Gemini từ chối analyze | Mark `insight = "manual review needed"` |

### Output Notion (Competitor DB)

```
┌────────────────────────────────────────────────────────────┐
│ Moaz BéBé │ TikTok │ Livestream...  │ 🔥 9.5/10 │ Dầu tắm │
│ Bio-Acimin│ FB     │ "Bé biếng ăn"  │ 🔥 8.7/10 │ Men VS  │
│ Wesser    │ FB     │ Black Friday   │ 📈 7.2/10 │ Sale    │
│ ...                                                         │
└────────────────────────────────────────────────────────────┘
```

---

## 💡 Workflow 2: Sinh ý tưởng (Sunday 8AM)

### Trigger
- **Schedule**: cron `0 1 * * 0` UTC = 8AM Sunday VN
- **Endpoint**: `GET /cron/drmaya-ideas`

### Logic

1. **Query Competitor DB**: filter `scraped_at > 7 days ago` AND `engagement_score >= 7.0`
   - Lấy top 20 posts hot tuần qua

2. **Read Brand Brief** từ Notion page `Brand Brief`

3. **Calculate pillar balance**: đọc Content Calendar 30 ngày qua, tính % mỗi pillar đã viết
   - Target: 40% Educational / 25% Story / 20% Promo / 15% Community
   - Sinh ideas thiên về pillar đang ít

4. **Gemini prompt**:
   ```
   Bạn là Dr.Maya — dược sĩ chuyên về sức khỏe mẹ bé.
   
   Brand brief:
   {brand_brief_text}
   
   Top 20 bài đối thủ hot tuần qua:
   {competitor_posts_summary}
   
   Pillar đang cần bổ sung: {underweight_pillars}
   
   Sinh 30-50 IDEAS cho tuần tới. Mỗi idea:
   - title: tiêu đề bài (hook punchy)
   - angle: góc nhìn / lý do bài này hấp dẫn (1-2 câu)
   - pillar: Educational/Storytelling/Promotional/Community
   - inspired_by_url: link competitor post (nếu có) hoặc null
   - target_platform: FB hoặc TikTok hoặc both
   
   YÊU CẦU:
   - Tránh trùng nội dung với 4 tuần Content Calendar gần đây
   - Theo tone Vân Anh: số liệu cụ thể, hook tranh cãi, personal story
   - KHÔNG copy y nguyên title từ đối thủ
   
   Output: JSON array
   ```

5. **Dedup**: với mỗi idea sinh ra, embed bằng Gemini embedding API, so sánh cosine similarity với 4 tuần Content Calendar:
   - Similarity > 0.85 → bỏ idea (trùng)
   - Similarity < 0.85 → giữ

6. **Write to Idea Inbox**:
   - Mỗi idea = 1 page trong Idea Inbox
   - Status = `Draft`
   - Fields: title, angle, pillar, inspired_by (relation), target_platform, created_at

7. **Alert Telegram**:
   ```
   💡 30 ideas ready for Dr.Maya review
   - Educational: 12 (cần thêm)
   - Storytelling: 8
   - Promotional: 6
   - Community: 4
   ```

### Edge cases

| Case | Handle |
|------|--------|
| Tuần này không có competitor post nào engagement > 7 | Lower threshold xuống 5, sinh ideas từ Brand Brief alone |
| Gemini sinh < 30 ideas | Retry với prompt khác (nới constraint) |
| Tất cả ideas đều trùng dedup | Telegram alert + Vân Anh manual seed ideas |

---

## ✍️ Workflow 3: Viết caption (every 10 min)

### Trigger
- **Schedule**: cron `*/10 * * * *` = every 10 minutes
- **Endpoint**: `GET /cron/drmaya-draft`

### Logic

1. **Query Idea Inbox**: filter:
   - `status = "Approved"` (Dr.Maya đã duyệt)
   - AND (`processing_at IS NULL` OR `processing_at < now() - 10 minutes`)
   - Sort: `last_edited_time` asc (FIFO)
   - Limit: 5 ideas/run (chống burst Gemini)

2. **Check daily cap**:
   - Count Content Calendar có `Người viết = AI Bot` AND `created_at = today`
   - Nếu >= 30 → skip + telegram alert

3. **For each idea** (loop max 5):

   a. **Lock idea**:
      - Update idea status = `"Đang viết"`
      - Update `processing_at` = now()

   b. **Build context**:
      - Read Brand Brief
      - Read Brand Voice Examples (10-16 bài full text)
      - Read idea title + angle + pillar
      - Read inspired_by (nếu có) → competitor post details

   c. **Gemini prompt**:
      ```
      Bạn là Dr.Maya viết caption Facebook/TikTok.
      
      ## BRAND BRIEF
      {brand_brief}
      
      ## BRAND VOICE EXAMPLES (học tone, không copy)
      {brand_voice_examples_full_text}
      
      ## IDEA CẦN VIẾT
      Title: {idea_title}
      Angle: {idea_angle}
      Pillar: {idea_pillar}
      Platform: {target_platform}
      
      ## COMPETITOR INSPIRED BY (nếu có)
      {competitor_post_text}
      
      ## YÊU CẦU
      - Viết caption đúng format pillar:
        + Educational → Hook tranh cãi → Open story → Body 3-5 bullet + data → CTA mềm
        + Storytelling → Hook nỗi đau/win → Story personal → Lesson → CTA mềm
        + Promotional → Hook tò mò → Personal experience → Product soft mention → CTA mềm
        + Community → Hook câu hỏi → Open empathy → Answer + data → CTA mời comment
      - Độ dài: 500-1000 từ (FB) hoặc 50-100 từ (TikTok)
      - Xưng "Vân Anh" hoặc "Dr.Maya" ngôi thứ 3
      - Số liệu cụ thể, không nói chung chung
      - Casual VN, có "các bác", "tee", "toang"... nếu phù hợp
      - TRÁNH: emoji spam, "ĐẶT NGAY", cam kết 100%, so sánh brand đối thủ
      
      Output: caption full text only, không markdown, không note
      ```

   d. **Create Content Calendar entry**:
      - status = `"Chờ duyệt"`
      - title = idea.title
      - caption = (Gemini output)
      - original_ai_draft = (same as caption, lưu bản gốc)
      - pillar = idea.pillar
      - platform = idea.target_platform
      - Người viết = `"AI Bot"`
      - Phụ trách duyệt = (Sếp Vân Anh if Promotional/Medical else Dr.Maya)
      - inspired_by = idea.inspired_by
      - from_idea = idea (relation)
      - created_at = now()

   e. **Update idea**:
      - status = `"Đã viết"`
      - processing_at = null

4. **Error handling per idea**:
   - Gemini timeout → revert idea status = `"Approved"`, processing_at = null (sẽ retry next run)
   - Notion API fail → retry × 3
   - Daily cap hit → skip remaining ideas, telegram alert

5. **End-of-run alert** (chỉ khi viết bài):
   ```
   ✍️ Drafted 5 bài (lần thứ 3 hôm nay, total 18/30)
   ```

### Edge cases

| Case | Handle |
|------|--------|
| Idea bị stuck "Đang viết" > 30 phút (server crash giữa chừng) | Healthcheck cron reset processing_at = null mỗi giờ |
| Caption Gemini sinh < 200 từ (incomplete) | Retry với prompt rõ hơn, mark `ai_quality = "auto_short"` |
| Caption vi phạm topic cấm (Gemini detect) | Mark `ai_quality = "needs_review"`, telegram alert |

---

## 💓 Workflow 4: Healthcheck (every 5 min)

### Trigger
- **Schedule**: cron `*/5 * * * *`
- **Endpoint**: `GET /cron/drmaya-healthcheck`

### Logic

```javascript
app.get('/cron/drmaya-healthcheck', (req, res) => {
  // Optional: reset stuck "Đang viết" ideas > 30 phút
  // resetStuckIdeas();
  
  res.json({ status: 'ok', service: 'drmaya', timestamp: new Date().toISOString() });
});
```

### Mục đích

- Keep Render free service awake (15 min idle timeout)
- Reset stuck processing locks (mỗi giờ chạy `resetStuckIdeas()`)

---

## 🚨 Alert helper (Telegram)

Reuse Telegram bot journal hiện tại:

```javascript
async function alertSep(message) {
  await telegramBot.sendMessage(env.OWNER_TELEGRAM_CHAT_ID, `[DrMaya] ${message}`);
}
```

Alert events:
- ✅ Research done (Sunday 7AM)
- 💡 Ideas ready (Sunday 8AM)  
- ⚠️ Apify failed
- ⚠️ Gemini quota hit
- ⚠️ Daily cap reached (30 bài AI viết hôm nay)
- 🔴 Pipeline error 3 lần liên tiếp
- 🔄 Healthcheck cron đã không chạy 1 giờ (suggest cron-job.org issue)

---

## 📊 Metrics tracked

Mỗi workflow log vào file `D:\SKILL MARKETING AGENT\content notion\logs\` (hoặc Render logs):

```
[2026-05-31 07:00:23] WORKFLOW=research PHASE=start
[2026-05-31 07:00:24] WORKFLOW=research COMPETITORS=20 LOADED
[2026-05-31 07:01:45] WORKFLOW=research APIFY_DONE POSTS=187
[2026-05-31 07:03:12] WORKFLOW=research GEMINI_ANALYZED POSTS=187 FAILED=2
[2026-05-31 07:03:55] WORKFLOW=research NOTION_WRITTEN POSTS=185
[2026-05-31 07:03:56] WORKFLOW=research PHASE=done DURATION=213s COST_APIFY=$0.18
```

Phase 5 (optimization) sẽ export logs sang Google Sheets → dashboard.
