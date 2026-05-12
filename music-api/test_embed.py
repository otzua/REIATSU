import requests
import json
import re

url = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

resp = requests.get(url, headers=headers)
print(f"Status: {resp.status_code}")

match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', resp.text)
if not match:
    print("Could not find __NEXT_DATA__")
else:
    data = json.loads(match.group(1))
    entity = data.get("props", {}).get("pageProps", {}).get("state", {}).get("data", {}).get("entity", {})
    print("Entity keys:", entity.keys() if entity else "None")
    
    if "trackList" in entity:
        print(f"trackList has {len(entity['trackList'])} items")
    else:
        print("trackList not found in entity.")
        
    print("\nExtracting URIs recursively...")
    def _iter_items(value):
        if isinstance(value, dict):
            uri = value.get("uri", "")
            if isinstance(uri, str) and uri.startswith("spotify:track:"):
                yield value
            for v in value.values():
                yield from _iter_items(v)
        elif isinstance(value, list):
            for v in value:
                yield from _iter_items(v)
                
    items = list(_iter_items(data))
    print(f"Found {len(items)} tracks recursively.")
    for i in items[:3]:
        print(i.get("title") or i.get("name"), "-", i.get("subtitle"))
