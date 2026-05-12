import sys
import os

# Add Antra-main to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../Antra-main"))

from antra.core.config import load_config
from antra.core.service import AntraService

import yt_dlp

def download_url(url, output_dir):
    config = load_config()
    service = AntraService(config)
    
    print(f"Fetching metadata for {url} using Antra...")
    tracks = service.fetch_playlist_tracks(url)
    
    if not tracks:
        print("No tracks found.")
        return
        
    print(f"Found {len(tracks)} tracks. Starting yt-dlp FLAC downloads...")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'flac',
            'preferredquality': '192',
        }],
        'quiet': False,
        'no_warnings': True,
        'extract_flat': False,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for i, track in enumerate(tracks):
            query = f"{track.primary_artist} - {track.title}"
            print(f"Downloading {i+1}/{len(tracks)}: {query}")
            try:
                ydl.download([f"ytsearch1:{query}"])
            except Exception as e:
                print(f"Failed to download {query}: {e}")

if __name__ == "__main__":
    url = sys.argv[1]
    out_dir = sys.argv[2]
    download_url(url, out_dir)
