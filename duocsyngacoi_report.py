import json, sys, io, csv, datetime
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('duocsyngacoi_100k_FINAL.json','r',encoding='utf-8') as f:
    items = json.load(f)

items.sort(key=lambda x: x.get('view_count') or 0, reverse=True)

def fmt_num(n):
    n = n or 0
    return f"{n:,}"

# Markdown report
lines = []
lines.append(f"# TikTok @duocsyngacoi — Video ≥100K view")
lines.append("")
lines.append(f"Snapshot: 2026-05-12  |  Channel: https://www.tiktok.com/@duocsyngacoi")
lines.append(f"Tổng số video ≥100K view: **{len(items)}**")
lines.append("")
lines.append("---")
lines.append("")
for i, it in enumerate(items, 1):
    title = (it.get('title') or '').strip().replace('\n',' ')
    desc = (it.get('description') or '').strip()
    upload_date = it.get('upload_date') or ''
    if upload_date and len(upload_date) == 8:
        upload_date = f"{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:]}"
    lines.append(f"## {i}. {fmt_num(it['view_count'])} view  —  ID {it['id']}")
    lines.append("")
    lines.append(f"- **Link:** {it['url']}")
    lines.append(f"- **View:** {fmt_num(it['view_count'])}  |  Like: {fmt_num(it['like_count'])}  |  Comment: {fmt_num(it['comment_count'])}  |  Share: {fmt_num(it['repost_count'])}  |  Save: {fmt_num(it.get('save_count'))}")
    lines.append(f"- **Duration:** {it['duration']}s  |  **Upload:** {upload_date}")
    if title:
        lines.append(f"- **Caption:** {title[:300]}")
    lines.append("")
    lines.append("**Transcript:**")
    lines.append("")
    lines.append("> " + (it.get('transcript','') or '').replace('\n',' '))
    lines.append("")
    lines.append("---")
    lines.append("")

with open('duocsyngacoi_100k_REPORT.md','w',encoding='utf-8') as f:
    f.write('\n'.join(lines))

# CSV summary (no transcript, easier to scan)
with open('duocsyngacoi_100k_summary.csv','w',encoding='utf-8-sig',newline='') as f:
    w = csv.writer(f)
    w.writerow(['rank','id','view_count','like_count','comment_count','repost_count','duration_s','upload_date','url','title','transcript_chars'])
    for i, it in enumerate(items, 1):
        ud = it.get('upload_date') or ''
        if ud and len(ud) == 8:
            ud = f"{ud[:4]}-{ud[4:6]}-{ud[6:]}"
        w.writerow([
            i,
            it['id'],
            it['view_count'],
            it['like_count'],
            it['comment_count'],
            it['repost_count'],
            it['duration'],
            ud,
            it['url'],
            (it.get('title') or '').replace('\n',' ')[:200],
            len(it.get('transcript') or ''),
        ])

# CSV with transcript column (for further analysis)
with open('duocsyngacoi_100k_full.csv','w',encoding='utf-8-sig',newline='') as f:
    w = csv.writer(f)
    w.writerow(['rank','id','view_count','url','title','transcript'])
    for i, it in enumerate(items, 1):
        w.writerow([
            i,
            it['id'],
            it['view_count'],
            it['url'],
            (it.get('title') or '').replace('\n',' '),
            (it.get('transcript') or '').replace('\n',' '),
        ])

print(f"Compiled:")
print(f"  duocsyngacoi_100k_REPORT.md     — full markdown report ({len(items)} videos)")
print(f"  duocsyngacoi_100k_summary.csv   — table (no transcript)")
print(f"  duocsyngacoi_100k_full.csv      — table with full transcripts")
print(f"  duocsyngacoi_100k_FINAL.json    — JSON master file")
print()
print(f"=== TOP 10 ===")
for i, it in enumerate(items[:10], 1):
    t = (it.get('title') or '')[:70]
    print(f"{i:>2}. {fmt_num(it['view_count']):>11}  {it['id']}  {t}")
