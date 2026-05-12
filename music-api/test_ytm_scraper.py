import subprocess
import re
from ytmusicapi import YTMusic

def fallback_spotify_to_ytm(spotify_url: str):
    print(f"Scraping title from {spotify_url}...")
    try:
        result = subprocess.run(["curl", "-s", spotify_url], capture_output=True, text=True, timeout=10)
        html = result.stdout
    except Exception as e:
        print(f"Curl failed: {e}")
        return []
    
    match = re.search(r'<meta property="og:title" content="([^"]*)"', html)
    if not match:
        print("Could not find og:title")
        return []
        
    title = match.group(1).replace(" | Spotify Playlist", "").strip()
    print(f"Found Spotify Title: {title}")
    
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
    result = []
    for t in tracks:
        artists = ", ".join([a['name'] for a in t.get('artists', [])])
        track_name = t.get('title', 'Unknown')
        print(f"- {artists} - {track_name}")
        result.append(f"{artists} - {track_name}")
        
    return result

if __name__ == "__main__":
    fallback_spotify_to_ytm("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")
