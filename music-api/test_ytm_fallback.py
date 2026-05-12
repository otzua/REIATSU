import requests
from bs4 import BeautifulSoup
from ytmusicapi import YTMusic

def get_spotify_title(url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'html.parser')
    return soup.title.string.split(' | ')[0].strip()

def test_fallback(url):
    title = get_spotify_title(url)
    print(f"Scraped title: {title}")
    
    yt = YTMusic()
    playlists = yt.search(title, filter="playlists")
    if not playlists:
        print("No playlists found on YTM.")
        return
        
    best_match = playlists[0]
    print(f"Found YTM playlist: {best_match['title']} (ID: {best_match['browseId']})")
    
    tracks = yt.get_playlist(best_match['browseId'])['tracks']
    print(f"Found {len(tracks)} tracks. First 5:")
    for t in tracks[:5]:
        artists = ", ".join([a['name'] for a in t['artists']])
        print(f"- {t['title']} by {artists}")

if __name__ == "__main__":
    test_fallback("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")
