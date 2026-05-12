import sys
from duckduckgo_search import DDGS
from ytmusicapi import YTMusic

def fallback_spotify_to_ytm(spotify_url: str):
    print(f"Searching DDG for {spotify_url}...")
    try:
        results = DDGS().text(f"site:open.spotify.com \"{spotify_url}\"", max_results=1)
        if not results:
            # try without quotes
            results = DDGS().text(spotify_url, max_results=1)
            
        if not results:
            print("Could not find title via DDG")
            return []
            
        result = results[0]
        title = result['title'].replace(" - Spotify", "").replace(" | Spotify Playlist", "").replace(" | Spotify", "").strip()
        print(f"Scraped Title via DDG: {title}")
        
    except Exception as e:
        print(f"DDG request failed: {e}")
        return []
        
    print("Searching YouTube Music for playlist...")
    yt = YTMusic()
    playlists = yt.search(title, filter="playlists")
    
    if not playlists:
        print("No playlists found on YTM.")
        return []
        
    best_playlist = playlists[0]
    print(f"Selected YTM Playlist: {best_playlist['title']} (ID: {best_playlist['browseId']})")
    
    print("Fetching tracks from YTM...")
    playlist_data = yt.get_playlist(best_playlist['browseId'])
    tracks = playlist_data.get('tracks', [])
    
    print(f"Found {len(tracks)} tracks:")
    for t in tracks[:5]:
        artists = ", ".join([a['name'] for a in t.get('artists', [])])
        track_name = t.get('title', 'Unknown')
        print(f"- {artists} - {track_name}")

if __name__ == "__main__":
    fallback_spotify_to_ytm("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")
