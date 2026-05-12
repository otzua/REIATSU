import os
import sys
import json
import asyncio
import logging
from typing import List, Optional
from fastapi import FastAPI, Query, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import aiohttp
import yt_dlp
import requests
import re
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("music-api")

app = FastAPI(title="REIATSU Music API (Embed Scraper Bypass)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOAD_DIR = os.getenv("OUTPUT_DIR", "downloads")
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

def extract_spotify_id(url: str) -> tuple:
    match = re.search(r"spotify\.com/(track|album|playlist)/([a-zA-Z0-9]+)", url)
    if match:
        return match.group(1), match.group(2)
    return None, None

def fetch_spotify_tracks(url: str) -> list:
    type_, id_ = extract_spotify_id(url)
    tracks = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    
    if type_ == "track":
        embed_url = f"https://open.spotify.com/embed/track/{id_}"
    elif type_ == "playlist":
        embed_url = f"https://open.spotify.com/embed/playlist/{id_}"
    else:
        return []

    try:
        resp = requests.get(embed_url, headers=headers, timeout=15)
        resp.raise_for_status()
        
        match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', resp.text)
        if not match:
            logger.error("Could not find __NEXT_DATA__ in embed HTML")
            return []
            
        data = json.loads(match.group(1))
        entity = data.get("props", {}).get("pageProps", {}).get("state", {}).get("data", {}).get("entity", {})
        
        if type_ == "track":
            title = entity.get("title") or entity.get("name") or "Unknown Track"
            artists = entity.get("subtitle") or "Unknown Artist"
            tracks.append(f"{artists} - {title}")
        elif type_ == "playlist":
            track_items = []
            if isinstance(entity.get("trackList"), list):
                track_items.extend(entity["trackList"])

            # Fallback search for URIs starting with spotify:track:
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
                        
            seen_uris = {t.get("uri") for t in track_items if isinstance(t, dict) and t.get("uri")}
            for item in _iter_items(data):
                uri = item.get("uri")
                if uri and uri not in seen_uris:
                    seen_uris.add(uri)
                    track_items.append(item)

            for item in track_items:
                track_uri = item.get("uri", "")
                if not track_uri.startswith("spotify:track:"):
                    continue
                title = item.get("title") or item.get("name") or "Unknown Track"
                artists = item.get("subtitle") or "Unknown Artist"
                tracks.append(f"{artists} - {title}")
                
        logger.info(f"Embed Scraper resolved {len(tracks)} tracks")
        return tracks
    except Exception as e:
        logger.error(f"Embed Scraper failed: {e}")
        return []

@app.get("/status")
async def status():
    return {"status": "online", "engine": "yt-dlp (Embed Scraper Bypass)"}

@app.get("/search")
async def search(q: str = Query(...), limit: int = 20):
    try:
        from ytmusicapi import YTMusic
        ytmusic = YTMusic()
        search_results = ytmusic.search(q, filter="songs", limit=limit)
        tracks = []
        for item in search_results:
            tracks.append({
                "id": item.get("videoId"),
                "name": item.get("title"),
                "artist": item.get("artists", [{}])[0].get("name", "Unknown"),
                "album": item.get("album", {}).get("name", "Unknown"),
                "poster": item.get("thumbnails", [{}])[-1].get("url"),
                "url": f"https://music.youtube.com/watch?v={item.get('videoId')}",
                "duration_ms": None
            })
        return tracks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stream")
async def stream(q: str = Query(...)):
    ydl_opts = {'format': 'bestaudio/best', 'quiet': True, 'no_warnings': True, 'extract_flat': False}
    
    if "spotify.com" in q:
        try:
            tracks = fetch_spotify_tracks(q)
            search_query = f"ytsearch:{tracks[0]}" if tracks else f"ytsearch:{q}"
        except Exception:
            search_query = f"ytsearch:{q}"
    else:
        search_query = f"ytsearch:{q}"
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(None, lambda: ydl.extract_info(search_query, download=False))
            if 'entries' in info and len(info['entries']) > 0:
                best_entry = info['entries'][0]
                return {
                    "stream_url": best_entry['url'],
                    "title": best_entry.get('title'),
                    "thumbnail": best_entry.get('thumbnail'),
                    "user_agent": "Mozilla/5.0"
                }
            else:
                raise HTTPException(status_code=404, detail="No stream found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/audio-proxy")
async def audio_proxy(url: str, ua: str = "Mozilla/5.0"):
    async def stream_data():
        async with aiohttp.ClientSession(headers={"User-Agent": ua}) as session:
            async with session.get(url) as resp:
                async for chunk in resp.content.iter_chunked(65536):
                    yield chunk
    return StreamingResponse(stream_data(), media_type="audio/mpeg")

@app.get("/download")
async def download_track(url: str, name: Optional[str] = None, artist: Optional[str] = None, background_tasks: BackgroundTasks = None):
    background_tasks.add_task(run_download, url)
    return {"message": "Download started using Embed Scraper Bypass engine", "url": url, "name": name, "artist": artist}

async def run_download(url: str):
    logger.info(f"Starting download for: {url}")
    tracks_to_download = []
    if "spotify.com" in url:
        try:
            tracks_to_download = fetch_spotify_tracks(url)
            logger.info(f"Resolved {len(tracks_to_download)} tracks from Spotify URL")
        except Exception as e:
            logger.error(f"Failed to resolve Spotify URL: {e}")
            return
    else:
        tracks_to_download.append(url)
        
    if not tracks_to_download:
        return

    homebrew_bin = "/opt/homebrew/bin"
    if homebrew_bin not in os.environ.get("PATH", ""):
        os.environ["PATH"] = f"{homebrew_bin}:{os.environ.get('PATH', '')}"

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'flac',
            'preferredquality': '192',
        }],
        'quiet': False,
        'no_warnings': True,
    }
    
    def dl_sync():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            for i, track in enumerate(tracks_to_download):
                query = f"ytsearch1:{track}" if "youtube.com" not in track else track
                logger.info(f"Downloading {i+1}/{len(tracks_to_download)}: {track}")
                try:
                    ydl.download([query])
                except Exception as e:
                    logger.error(f"Failed to download {track}: {e}")

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, dl_sync)
    logger.info("Download operation completed.")

if __name__ == "__main__":
    import uvicorn
    print("[music-api] Embed Scraper Bypass engine initialized. Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
