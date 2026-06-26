# 📘 Notion Setup Guide

> Hướng dẫn từng bước setup Notion workspace cho hệ thống Dr.Maya.
>
> **Thời gian dự kiến**: 45-60 phút (Vân Anh + Dr.Maya).
>
> **Mục tiêu**: tạo 4 database + 2 pinned page + 6 filtered views, lấy NOTION_TOKEN + 4 database ID.

---

## Bước 1: Tạo workspace / chọn workspace

**Option A** (recommended): tạo workspace mới riêng cho Dr.Maya
- Vào notion.so → Settings & Members → New workspace
- Tên: "Dr.Maya Content"
- Plan: Free

**Option B**: dùng workspace hiện có
- Tạo 1 page tổ chức tên "📁 Dr.Maya Content" làm root → các DB đặt bên trong

---

## Bước 2: Tạo 4 Database

### 2.1 Database `Content Calendar` (main DB)

Tạo new page → /database → Table

**Fields** (thêm theo thứ tự):

| Field name | Type | Options / Note |
|------------|------|----------------|
| `Title` | Title | (default) |
| `Status` | Select | 🆕 Ý tưởng / 🤖 Đang viết / 👁 Chờ duyệt / ✅ Đã duyệt / 🚀 Đã đăng |
| `Pillar` | Select | 🟢 Educational / 🟣 Storytelling / 🔵 Promotional / 🟡 Community |
| `Người viết` | Select | AI Bot / Linh / Hà / Sếp Vân Anh / Dr.Maya |
| `Phụ trách duyệt` | Person | (chọn user) |
| `Platform` | Multi-select | FB / TikTok / Instagram |
| `Caption` | Text (long) | Nội dung full |
| `Original AI draft` | Text (long) | Read-only bản gốc Gemini |
| `Inspired by` | Relation → Competitor DB | (link sau khi tạo Competitor DB) |
| `From idea` | Relation → Idea Inbox | (link sau khi tạo Idea Inbox) |
| `Ngày tạo` | Created time | (auto) |
| `Deadline` | Date | Sếp set |
| `Lên lịch đăng` | Date | Ngày dự kiến post |
| `Ngày đăng thật` | Date | Khi đổi sang "Đã đăng" |
| `Assets` | Files & media | Ảnh, video đính kèm |
| `Canva link` | URL | Link banner Canva |
| `Reach` | Number | Sau khi đăng |
| `Likes` | Number | |
| `Comments` | Number | |
| `Shares` | Number | |
| `Conversions` | Number | |
| `AI quality` | Select | 🌟 Excellent / 👍 Good / ✏️ Need edit / ❌ Reject |
| `Edit reason` | Text | Lý do edit (cho AI feedback loop) |
| `Cảnh báo` | Formula | `if(prop("Deadline") < now() and prop("Status") != "🚀 Đã đăng", "🔴 STUCK", "")` |

**View mặc định**: chuyển sang Board view, group by `Status`.

---

### 2.2 Database `Idea Inbox`

Tạo new page → /database → Table

| Field name | Type | Options |
|------------|------|---------|
| `Title` | Title | (default) |
| `Status` | Select | 🆕 Draft / ✅ Approved / 🤖 Đang viết / ✏️ Đã viết / 🚫 Reject |
| `Angle` | Text | Góc nhìn (1-2 câu) |
| `Pillar` | Select | (giống Content Calendar) |
| `Target platform` | Multi-select | FB / TikTok / Instagram |
| `Inspired by` | Relation → Competitor DB | |
| `Created at` | Created time | (auto) |
| `Processing at` | Date with time | Lock timestamp |
| `Approved by` | Person | Dr.Maya hoặc Sếp |
| `Approved at` | Date with time | |

**View mặc định**: Board, group by `Status`.

---

### 2.3 Database `Competitor DB`

| Field name | Type | Options |
|------------|------|---------|
| `Đối thủ` | Title | Tên page/handle |
| `Platform` | Select | FB / TikTok |
| `Post URL` | URL | |
| `Caption` | Text (long) | Nội dung post |
| `Likes` | Number | |
| `Comments` | Number | |
| `Shares` | Number | |
| `Followers` | Number | Followers count |
| `Engagement score` | Number | 0-10 (Gemini tính) |
| `Hook pattern` | Select | question / shock_number / story / list / controversy |
| `Topic` | Text | 1-3 từ |
| `Content pillar` | Select | Educational / Storytelling / Promotional / Community |
| `Insight` | Text | Tại sao bài này hot (1 câu) |
| `Scraped at` | Date with time | |

**View mặc định**: Table, sort by `Engagement score` desc.

---

### 2.4 Database `Internal Notes`

| Field name | Type | Options |
|------------|------|---------|
| `Title` | Title | |
| `Category` | Select | Strategy / Meeting / Idea / Research / Other |
| `Tags` | Multi-select | |
| `Content` | Text (long) | |
| `Owner` | Person | |
| `Created` | Created time | (auto) |

**View mặc định**: Gallery hoặc Table.

---

## Bước 3: Tạo 2 Pinned Page (sidebar)

### 3.1 Brand Brief

- Tạo new page tên `⭐ Brand Brief`
- Pin lên đầu sidebar (Pin to sidebar)
- Mở file `D:\SKILL MARKETING AGENT\content notion\brand\brand-brief.md`
- Copy toàn bộ nội dung markdown → paste vào Notion page
- Edit các section đánh dấu `[VERIFY]`

### 3.2 Brand Voice Examples

- Tạo new page tên `⭐ Brand Voice Examples`
- Pin lên sidebar
- Mở file `D:\SKILL MARKETING AGENT\content notion\brand\brand-voice-examples.md`
- Copy → paste vào Notion
- **Quan trọng**: với mỗi bài trong 16 bài, mở link FB → copy full text caption → paste vào Notion dưới heading bài đó.
  - Nếu chưa có thời gian paste hết 16 → paste ít nhất 5-10 bài chất lượng cao trước. AI sẽ vẫn học được.

---

## Bước 4: Tạo 6 Filtered Views

### Cách tạo view trong Notion

Mở Content Calendar → click `+ New view` ở thanh tab → đặt tên + chọn layout.

### View 1: 📋 Tổng quan Sếp 👑

- **DB**: Content Calendar
- **Layout**: Board (group by Status)
- **Filter**: (no filter)
- **Sort**: Status ascending, Deadline ascending
- **Sharing**: chỉ Sếp Vân Anh + Dr.Maya

### View 2: 👤 Board của Linh

- **DB**: Content Calendar
- **Layout**: Board (group by Status)
- **Filter**: `Người viết` = Linh OR `Phụ trách duyệt` = Linh
- **Sharing**: Linh + Sếp

### View 3: 👤 Board của Hà

- **DB**: Content Calendar
- **Layout**: Board
- **Filter**: `Người viết` = Hà OR `Phụ trách duyệt` = Hà
- **Sharing**: Hà + Sếp

### View 4: ⚠️ Bài quá hạn 🔴

- **DB**: Content Calendar
- **Layout**: Table
- **Filter**: `Deadline` is before today AND `Status` is not `🚀 Đã đăng`
- **Sort**: Deadline ascending (cũ nhất lên đầu)

### View 5: 🤖 AI Pipeline chờ duyệt

- **DB**: Content Calendar
- **Layout**: Board (group by Pillar) — Dr.Maya scroll theo pillar
- **Filter**: `Người viết` = AI Bot AND `Status` = `👁 Chờ duyệt`
- **Sort**: Created descending (mới nhất lên đầu)

### View 6: 🏆 Top Performance

- **DB**: Content Calendar
- **Layout**: Table
- **Filter**: `Status` = `🚀 Đã đăng` AND `Ngày đăng thật` is within past 30 days
- **Sort**: Reach descending
- **Properties shown**: Title, Platform, Pillar, Reach, Likes, Comments, Shares

---

## Bước 5: Setup Notion Integration

### 5.1 Tạo integration

1. Vào https://www.notion.so/profile/integrations
2. Click `+ New integration`
3. Thông tin:
   - **Name**: `DrMaya Content Bot`
   - **Associated workspace**: chọn workspace Dr.Maya Content
   - **Type**: Internal
4. Click `Save`
5. Vào tab `Configuration` → copy `Internal Integration Token` (bắt đầu bằng `secret_`)
6. **Lưu vào file `D:\SKILL MARKETING AGENT\content notion\.env.local`** (file này KHÔNG commit Git):
   ```
   NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 5.2 Share 4 database với integration

Với MỖI database (Content Calendar, Idea Inbox, Competitor DB, Internal Notes):

1. Mở database → click `...` (góc trên phải)
2. Chọn `Add connections` (hoặc `Connect to`)
3. Tìm `DrMaya Content Bot` → click Confirm

⚠️ **Nếu không share, integration sẽ KHÔNG đọc/ghi được DB đó.**

### 5.3 Copy 4 database ID

Với mỗi database, mở DB ở chế độ full page:
- URL có dạng: `https://www.notion.so/{workspace}/{title}-{database_id}?v=...`
- `database_id` là chuỗi 32 ký tự ngay sau title (vd: `a1b2c3d4e5f67890abcdef1234567890`)
- Copy 4 ID vào `.env.local`:
  ```
  NOTION_DB_CONTENT_CALENDAR=a1b2c3d4...
  NOTION_DB_IDEA_INBOX=b2c3d4e5...
  NOTION_DB_COMPETITOR=c3d4e5f6...
  NOTION_DB_INTERNAL_NOTES=d4e5f6g7...
  ```

---

## Bước 6: Verify setup

Test integration bằng curl từ máy Vân Anh:

```bash
curl -X POST https://api.notion.com/v1/databases/$NOTION_DB_CONTENT_CALENDAR/query \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"page_size": 5}'
```

✅ Nếu trả về JSON `{ "results": [...] }` → setup thành công.

❌ Nếu trả về `unauthorized` → check lại đã share DB với integration chưa.

---

## Bước 7: Mời team vào workspace

### Quyền theo role

| Role | Người | Quyền | View được mở |
|------|-------|-------|--------------|
| 👑 Admin | Sếp Vân Anh | Full edit | Tất cả |
| ✏️ Editor | Dr.Maya | Edit nội dung, không xoá DB | Tất cả |
| ✏️ Editor | Linh | Edit caption, fill metrics | Board của Linh + Top Performance |
| ✏️ Editor | Hà | Edit caption, fill metrics | Board của Hà + Top Performance |
| 👁 Viewer | (junior, nếu có) | Chỉ xem | Top Performance only |

**Cách invite**:
- Notion Free → Settings & Members → Invite members
- Free plan: 10 members miễn phí, 1000 blocks → đủ cho team Dr.Maya

---

## ✅ Checklist hoàn thành Phase 1

Tick từng dòng khi đã làm:

- [ ] Tạo Notion workspace "Dr.Maya Content"
- [ ] Tạo Database `Content Calendar` (~24 fields)
- [ ] Tạo Database `Idea Inbox` (~10 fields)
- [ ] Tạo Database `Competitor DB` (~14 fields)
- [ ] Tạo Database `Internal Notes` (~6 fields)
- [ ] Tạo Pinned Page `⭐ Brand Brief` (paste từ md + verify)
- [ ] Tạo Pinned Page `⭐ Brand Voice Examples` (paste từ md + paste 16 bài full text)
- [ ] Tạo 6 filtered views (Tổng quan Sếp / Board Linh / Board Hà / Bài quá hạn / AI Pipeline / Top Performance)
- [ ] Tạo Notion Integration `DrMaya Content Bot` → lấy NOTION_TOKEN
- [ ] Share 4 DB với integration
- [ ] Copy 4 database ID vào `.env.local`
- [ ] Test API call → trả 200 OK
- [ ] Invite team (Sếp / Dr.Maya / Linh / Hà)

**Sau khi tick hết → báo anh để bắt đầu Phase 2 (API keys) và Phase 3 (code Render endpoints).**
