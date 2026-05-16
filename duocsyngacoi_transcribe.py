import json, os, sys, io, glob, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from faster_whisper import WhisperModel

# Load videos metadata
with open('duocsyngacoi_100k.json', 'r', encoding='utf-8') as f:
    videos = json.load(f)

audio_files = {}
for p in glob.glob('audio/*.mp3'):
    vid = os.path.splitext(os.path.basename(p))[0]
    audio_files[vid] = p

print(f"Found {len(audio_files)} audio files for {len(videos)} videos")
missing = [v['id'] for v in videos if v['id'] not in audio_files]
if missing:
    print(f"Missing audio for {len(missing)} videos: {missing[:5]}...")

# Load whisper model — use 'small' for balance of speed/quality on Vietnamese
print("Loading faster-whisper model 'small'...")
model = WhisperModel("small", device="cpu", compute_type="int8")
print("Model loaded.")

os.makedirs('transcripts', exist_ok=True)

results = []
for i, v in enumerate(videos, 1):
    vid = v['id']
    out_path = f"transcripts/{vid}.txt"
    if os.path.exists(out_path):
        with open(out_path,'r',encoding='utf-8') as f:
            text = f.read().strip()
        print(f"[{i}/{len(videos)}] {vid} CACHED ({len(text)} chars)")
        results.append({**v, 'transcript': text, 'transcript_status': 'cached'})
        continue
    audio = audio_files.get(vid)
    if not audio:
        print(f"[{i}/{len(videos)}] {vid} NO_AUDIO")
        results.append({**v, 'transcript': '', 'transcript_status': 'no_audio'})
        continue
    t0 = time.time()
    try:
        segments, info = model.transcribe(audio, language='vi', beam_size=1, vad_filter=True)
        text = ' '.join(s.text.strip() for s in segments).strip()
        with open(out_path,'w',encoding='utf-8') as f:
            f.write(text)
        dt = time.time()-t0
        print(f"[{i}/{len(videos)}] {vid} OK {dt:.1f}s {len(text)} chars  {text[:60]}...")
        results.append({**v, 'transcript': text, 'transcript_status': 'ok'})
    except Exception as e:
        print(f"[{i}/{len(videos)}] {vid} ERR {e}")
        results.append({**v, 'transcript': '', 'transcript_status': f'error: {e}'})

with open('duocsyngacoi_100k_FINAL.json','w',encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"\nSaved duocsyngacoi_100k_FINAL.json — {len(results)} items")
print(f"  ok: {sum(1 for r in results if r['transcript_status']=='ok')}")
print(f"  cached: {sum(1 for r in results if r['transcript_status']=='cached')}")
print(f"  no_audio: {sum(1 for r in results if r['transcript_status']=='no_audio')}")
print(f"  error: {sum(1 for r in results if 'error' in r['transcript_status'])}")
