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
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("music-api")

app = FastAPI(title="REIATSU Music API (spotDL Powered)")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure output directory exists
DOWNLOAD_DIR = os.getenv("OUTPUT_DIR", "downloads")
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

# Spotify Auth - Use default public scraper strategy for search if rate limited
client_id = os.getenv("SPOTIPY_CLIENT_ID")
client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
try:
    auth_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
    sp = spotipy.Spotify(auth_manager=auth_manager)
except Exception:
    sp = None

@app.get("/status")
async def status():
    return {
        "status": "online",
        "engine": "spotDL"
    }

@app.get("/search")
async def search(q: str = Query(...), limit: int = 20):
    try:
        if sp:
            results = sp.search(q=q, limit=limit, type="track")
            items = results["tracks"]["items"]
            tracks = []
            for item in items:
                tracks.append({
                    "id": item["id"],
                    "name": item["name"],
                    "artist": item["artists"][0]["name"],
                    "album": item["album"]["name"],
                    "poster": item["album"]["images"][0]["url"] if item["album"]["images"] else None,
                    "url": item["external_urls"]["spotify"],
                    "duration_ms": item.get("duration_ms")
                })
            return tracks
    except Exception as e:
        logger.error(f"Search error (falling back to ytmusic): {e}")

    # Fallback to ytmusic search
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

@app.get("/stream")
async def stream(q: str = Query(...)):
    """Get a direct streamable URL."""
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    
    if "open.spotify.com" in q:
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
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            else:
                raise HTTPException(status_code=404, detail="No stream found")
    except Exception as e:
        logger.error(f"Stream error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/audio-proxy")
async def audio_proxy(url: str, ua: str = "Mozilla/5.0"):
    """Proxy audio streams to avoid CORS/Forbidden errors."""
    async def stream_data():
        async with aiohttp.ClientSession(headers={"User-Agent": ua}) as session:
            async with session.get(url) as resp:
                async for chunk in resp.content.iter_chunked(65536):
                    yield chunk

    return StreamingResponse(stream_data(), media_type="audio/mpeg")

@app.get("/download")
async def download_track(url: str, name: Optional[str] = None, artist: Optional[str] = None, background_tasks: BackgroundTasks = None):
    """Download the track/playlist using spotdl engine."""
    background_tasks.add_task(run_spotdl_download, url)
    return {
        "message": "Download started using spotDL engine", 
        "url": url,
        "name": name,
        "artist": artist
    }

async def run_spotdl_download(url: str):
    """Run spotdl download in a subprocess."""
    logger.info(f"Starting spotDL download for: {url}")
    
    # Ensure ffmpeg and spotdl are in path for the current process
    homebrew_bin = "/opt/homebrew/bin"
    env = os.environ.copy()
    if homebrew_bin not in env.get("PATH", ""):
        env["PATH"] = f"{homebrew_bin}:{env.get('PATH', '')}"
        
    # Remove rate-limited spotify credentials from env so spotdl uses its internal defaults
    if "SPOTIPY_CLIENT_ID" in env:
        del env["SPOTIPY_CLIENT_ID"]
    if "SPOTIPY_CLIENT_SECRET" in env:
        del env["SPOTIPY_CLIENT_SECRET"]

    spotdl_path = os.path.join(os.path.dirname(sys.executable), "spotdl")
    cmd = [
        spotdl_path, 
        url,
        "--output", DOWNLOAD_DIR,
        "--format", "flac"
    ]
    
    logger.info(f"Running command: {' '.join(cmd)}")
    
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            logger.info(f"spotDL Download Finished: {url}")
        else:
            logger.error(f"spotDL Download Failed: {url}\nError: {stderr.decode()}")
    except Exception as e:
        logger.error(f"spotDL execution failed: {e}")

@app.get("/ocean")
async def get_ocean_feed():
    """Fetch and parse HentaiOcean RSS feed into clean structured JSON."""
    import xml.etree.ElementTree as ET
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://hentaiocean.com/rss.xml") as response:
                if response.status != 200:
                    raise HTTPException(status_code=response.status, detail="Failed to fetch RSS feed")
                xml_data = await response.text()
                
        # Parse XML
        root = ET.fromstring(xml_data)
        items = []
        namespaces = {
            'media': 'http://search.yahoo.com/mrss/'
        }
        
        for item in root.findall('.//item'):
            guid_el = item.find('guid')
            title_el = item.find('title')
            link_el = item.find('link')
            desc_el = item.find('description')
            pub_date_el = item.find('pubDate')
            embed_url_el = item.find('embedUrl')
            
            # media:thumbnail format is typically <media:thumbnail url="..." />
            thumbnail_el = item.find('media:thumbnail', namespaces)
            thumbnail = ""
            if thumbnail_el is not None:
                thumbnail = thumbnail_el.attrib.get('url', '')
            
            items.append({
                "id": guid_el.text if guid_el is not None else "",
                "title": title_el.text if title_el is not None else "",
                "link": link_el.text if link_el is not None else "",
                "description": desc_el.text if desc_el is not None else "",
                "pubDate": pub_date_el.text if pub_date_el is not None else "",
                "embedUrl": embed_url_el.text if embed_url_el is not None else "",
                "thumbnail": thumbnail
            })
            
        return items
    except Exception as e:
        logger.error(f"Ocean feed fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ocean/details")
async def get_ocean_details(slug: str = Query(...)):
    """Proxy details for a specific slug from HentaiOcean."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"https://hentaiocean.com/api?action=hentai&slug={slug}") as response:
                if response.status != 200:
                    raise HTTPException(status_code=response.status, detail="Failed to fetch details")
                return await response.json()
    except Exception as e:
        logger.error(f"Ocean details fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("[music-api] spotDL engine initialized. Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
