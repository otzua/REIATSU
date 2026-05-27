import yt_dlp
import time

def test_stream(q):
    print(f"--- TESTING YT-DLP FOR '{q}' ---")
    start = time.time()
    
    # We search for the video ID to bypass direct block!
    url_to_extract = f"ytsearch1:{q}"
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url_to_extract, download=False)
            if 'entries' in info and len(info['entries']) > 0:
                entry = info['entries'][0]
                elapsed = time.time() - start
                print(f"   - SUCCESS! Time taken: {elapsed:.2f}s")
                print(f"   - Title: {entry.get('title')} (ID: {entry.get('id')})")
                print(f"   - Stream URL starts with: {entry.get('url')[:100]}...")
                return True
            else:
                print("   - No entries found.")
                return False
    except Exception as e:
        print(f"   - ERROR: {e}")
        return False

if __name__ == "__main__":
    test_stream("FGBhQbmPwH8")
