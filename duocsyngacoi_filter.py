import json, sys, io, csv

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

items = []
with open('duocsyngacoi_raw.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        items.append(json.loads(line))

print(f"TOTAL videos: {len(items)}")

# Filter >= 100K views
THRESH = 100_000
viral = [it for it in items if (it.get('view_count') or 0) >= THRESH]
viral.sort(key=lambda x: x.get('view_count') or 0, reverse=True)
print(f"Videos with >={THRESH:,} views: {len(viral)}")

# Save filtered JSON
slim = []
for it in viral:
    slim.append({
        'id': it.get('id'),
        'title': (it.get('title') or '').strip(),
        'description': (it.get('description') or '').strip(),
        'url': it.get('webpage_url') or it.get('url'),
        'view_count': it.get('view_count'),
        'like_count': it.get('like_count'),
        'comment_count': it.get('comment_count'),
        'repost_count': it.get('repost_count'),
        'save_count': it.get('save_count'),
        'duration': it.get('duration'),
        'upload_date': it.get('upload_date'),
        'timestamp': it.get('timestamp'),
        'subtitles_available': sorted(list((it.get('subtitles') or {}).keys())),
    })

with open('duocsyngacoi_100k.json', 'w', encoding='utf-8') as f:
    json.dump(slim, f, ensure_ascii=False, indent=2)

# CSV
with open('duocsyngacoi_100k_summary.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['rank','id','view_count','like_count','comment_count','url','title','subtitles_available','duration_s','upload_date'])
    for i, it in enumerate(slim, 1):
        w.writerow([
            i,
            it['id'],
            it['view_count'],
            it['like_count'],
            it['comment_count'],
            it['url'],
            it['title'][:200],
            ','.join(it['subtitles_available']) if it['subtitles_available'] else '',
            it['duration'],
            it['upload_date'],
        ])

print("Saved: duocsyngacoi_100k.json, duocsyngacoi_100k_summary.csv")

# top 10 preview
print("\n=== TOP 10 by view ===")
for i, it in enumerate(slim[:10], 1):
    title = it['title'][:80]
    print(f"{i:>2}. {it['view_count']:>10,}  {it['id']}  {title}")

# subtitles coverage
with_sub = sum(1 for it in slim if it['subtitles_available'])
print(f"\nVideos with at least 1 subtitle track: {with_sub}/{len(slim)}")
# distribution of langs
from collections import Counter
lang_counter = Counter()
for it in slim:
    for s in it['subtitles_available']:
        lang_counter[s] += 1
print("Subtitle lang counts:", dict(lang_counter.most_common(10)))
