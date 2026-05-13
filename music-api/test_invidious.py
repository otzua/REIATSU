import requests
import json

def test_invidious_stream(query):
    print(f"--- TESTING INVIDIOUS FOR: {query} ---")
    
    # List of public invidious instances
    instances = [
        "https://invidious.snopyta.org",
        "https://yewtu.be",
        "https://invidious.kavin.rocks",
        "https://iv.melmac.space",
        "https://invidious.sethforprivacy.com",
        "https://inv.riverside.rocks"
    ]
    
    for instance in instances:
        try:
            print(f"Testing instance: {instance}...")
            # 1. Search
            search_url = f"{instance}/api/v1/search?q={query}&type=video"
            resp = requests.get(search_url, timeout=5)
            if resp.status_code == 200:
                results = resp.json()
                if results:
                    video_id = results[0]['videoId']
                    print(f"   - Found Video ID: {video_id}")
                    
                    # 2. Get stream
                    video_url = f"{instance}/api/v1/videos/{video_id}"
                    video_resp = requests.get(video_url, timeout=5)
                    if video_resp.status_code == 200:
                        video_data = video_resp.json()
                        adaptive_formats = video_data.get('adaptiveFormats', [])
                        audio_formats = [f for f in adaptive_formats if 'audio' in f.get('type', '')]
                        if audio_formats:
                            stream_url = audio_formats[0]['url']
                            print(f"   - SUCCESS! Found Stream URL: {stream_url[:50]}...")
                            return True
            print("   - Instance failed or returned no results.")
        except Exception as e:
            print(f"   - ERROR with instance {instance}: {e}")
            
    return False

if __name__ == "__main__":
    test_invidious_stream("Daft Punk - One More Time")
