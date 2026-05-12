import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), "../Antra-main"))
from antra.core.config import load_config
from antra.core.spotify import SpotifyClient

import yt_dlp

def download_spotify_url(url, output_dir):
    config = load_config()
    spotify = SpotifyClient(config)
    
    print(f"Fetching metadata for {url} using Antra's public scraper...")
    if "playlist" in url:
        # Note: Antra's spotify client doesn't expose a public fetch for full playlist directly 
        # in the same way, but it uses _fetch_public_track_page_data... wait, let's see.
        pass

