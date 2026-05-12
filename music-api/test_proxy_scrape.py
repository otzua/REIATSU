import requests
import json
import re

def scrape_spotify_via_proxy(url):
    proxy_url = f"https://api.allorigins.win/get?url={url}"
    print(f"Fetching from {proxy_url}...")
    try:
        resp = requests.get(proxy_url, timeout=10)
        data = resp.json()
        html = data.get('contents', '')
        
        # Scrape title
        match = re.search(r'<meta property="og:title" content="([^"]*)"', html)
        if match:
            title = match.group(1).replace(" | Spotify Playlist", "").replace(" | Spotify", "").strip()
            print(f"Scraped Title via Proxy: {title}")
            return title
        else:
            print("Title not found in HTML.")
            # dump first 500 chars to see what we got
            print(html[:500])
    except Exception as e:
        print(f"Proxy request failed: {e}")
    return None

if __name__ == "__main__":
    scrape_spotify_via_proxy("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")
