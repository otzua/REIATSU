import requests

def test_spotifydown():
    url = "https://api.spotifydown.com/metadata/playlist/37i9dQZF1DXcBWIGoYBM5M"
    headers = {
        "Origin": "https://spotifydown.com",
        "Referer": "https://spotifydown.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
    
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {resp.status_code}")
        print(resp.text[:500])
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_spotifydown()
