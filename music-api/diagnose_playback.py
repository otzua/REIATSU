import requests
import yt_dlp
import sys

def diagnose_playback(query):
    print(f"--- DIAGNOSING PLAYBACK FOR: {query} ---")
    
    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'extractor_args': {
            'youtube': {
                'player_client': ['web_embedded', 'mweb', 'tv'],
                'skip': ['webpage', 'hls']
            }
        }
    }
    
    stream_url = None
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("1. Extracting info via yt-dlp (using Chrome cookies)...")
            info = ydl.extract_info(f"ytsearch:{query}", download=False)
            if 'entries' in info and len(info['entries']) > 0:
                best_entry = info['entries'][0]
                stream_url = best_entry['url']
                print(f"   - Success! Found URL (starts with {stream_url[:30]}...)")
            else:
                print("   - FAILED: No entries found.")
                return
    except Exception as e:
        print(f"   - ERROR during extraction: {e}")
        return

    if stream_url:
        print("2. Testing Proxy-like request to the stream URL...")
        try:
            resp = requests.get(stream_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10, stream=True)
            print(f"   - Response Status: {resp.status_code}")
            print(f"   - Content Type: {resp.headers.get('Content-Type')}")
            if resp.status_code == 200:
                chunk = next(resp.iter_content(chunk_size=1024))
                print(f"   - Data Read Test: Read {len(chunk)} bytes successfully.")
            else:
                print(f"   - Error Body: {resp.text[:200]}...")
        except Exception as e:
            print(f"   - ERROR during stream fetch: {e}")

if __name__ == "__main__":
    diagnose_playback("Daft Punk - One More Time")
