import os
import sys
import json
import asyncio
import logging
from typing import List, Optional
from fastapi import FastAPI, Query, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
import urllib.parse
import aiohttp
import yt_dlp
try:
    from yt_dlp.networking.impersonate import ImpersonateTarget
    IMPERSONATE_SUPPORTED = True
except ImportError:
    IMPERSONATE_SUPPORTED = False
import requests
import re
import time
import zipfile
import json
from dotenv import load_dotenv

load_dotenv()

# ── SpotiFLAC: use the internal module ─────────────────────────────────────
_SPOTIFLAC_PATH = os.path.join(os.path.dirname(__file__), "SpotiFLAC-Module-Version-main")
sys.path.insert(0, os.path.abspath(_SPOTIFLAC_PATH))
try:
    from SpotiFLAC import SpotiFLAC as _SpotiFLAC
    SPOTIFLAC_AVAILABLE = True
except ImportError:
    SPOTIFLAC_AVAILABLE = False
    logging.getLogger("music-api").warning(
        "SpotiFLAC module not found at %s — lossless downloads will fall back to yt-dlp",
        _SPOTIFLAC_PATH
    )

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("music-api")

app = FastAPI(title="REIATSU Music API (Embed Scraper Bypass)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOAD_DIR = os.getenv("OUTPUT_DIR", "/tmp/downloads")
try:
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR, exist_ok=True)
except Exception as e:
    logger.warning(f"Could not create download directory {DOWNLOAD_DIR}: {e}. Falling back to /tmp")
    DOWNLOAD_DIR = "/tmp"

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
    # Upgraded Streaming Engine: Priority Local yt-dlp Extraction + Invidious Fallback
    try:
        # Extract video ID for metadata and fallback purposes
        video_id = q
        if "watch?v=" in q:
            video_id = q.split("watch?v=")[1].split("&")[0]
        elif "youtu.be/" in q:
            video_id = q.split("youtu.be/")[1].split("?")[0]
        elif "music.youtube.com" in q:
            video_id = q.split("watch?v=")[1].split("&")[0]

        # 1. Prioritize yt-dlp with Search Bypass (extremely reliable, avoids bot-detection blocks)
        def extract_with_ytdlp(query_or_id: str):
            # Check if it looks like a video ID or a URL containing video ID
            vid = query_or_id
            if "watch?v=" in query_or_id:
                vid = query_or_id.split("watch?v=")[1].split("&")[0]
            elif "youtu.be/" in query_or_id:
                vid = query_or_id.split("youtu.be/")[1].split("?")[0]
            elif "music.youtube.com" in query_or_id:
                vid = query_or_id.split("watch?v=")[1].split("&")[0]

            # Use ytsearch1 on the ID to bypass YouTube's strict watch page bot blocks!
            url_to_extract = f"ytsearch1:{vid}"
            
            ydl_opts = {
                'format': 'bestaudio/best',
                'quiet': True,
                'no_warnings': True,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url_to_extract, download=False)
                if 'entries' in info and len(info['entries']) > 0:
                    entry = info['entries'][0]
                    return {
                        "stream_url": entry.get('url'),
                        "title": entry.get('title', 'YouTube Audio'),
                        "thumbnail": entry.get('thumbnail') or f"https://img.youtube.com/vi/{entry.get('id')}/maxresdefault.jpg",
                        "user_agent": "Mozilla/5.0"
                    }
                elif 'url' in info:
                    return {
                        "stream_url": info.get('url'),
                        "title": info.get('title', 'YouTube Audio'),
                        "thumbnail": info.get('thumbnail') or f"https://img.youtube.com/vi/{info.get('id')}/maxresdefault.jpg",
                        "user_agent": "Mozilla/5.0"
                    }
            return None

        try:
            logger.info(f"Attempting premium local yt-dlp search extraction for: {q}")
            result = await asyncio.to_thread(extract_with_ytdlp, q)
            if result and result.get("stream_url"):
                logger.info(f"Premium yt-dlp stream resolved successfully for: {result.get('title')}")
                return result
        except Exception as ytdlp_err:
            logger.warning(f"Premium yt-dlp extraction failed: {ytdlp_err}. Falling back to Invidious...")

        # 2. Fallback: Invidious Bridge (The Decentralized Backup Powerhouse)
        invidious_instances = [
            "https://inv.tux.rs",
            "https://invidious.snopyta.org",
            "https://invidious.sethforprivacy.com",
            "https://invidious.flokinet.to",
            "https://inv.river.group"
        ]
        
        async with aiohttp.ClientSession() as session:
            for instance in invidious_instances:
                try:
                    # Invidious has a 'latest_version' endpoint that redirects to the stream
                    stream_url = f"{instance}/latest_version?id={video_id}&itag=140" # itag 140 is M4A audio
                    logger.info(f"Trying Invidious instance: {instance} for ID: {video_id}")
                    
                    # We check if the link is actually reachable
                    async with session.head(stream_url, allow_redirects=True, timeout=5) as resp:
                        if resp.status == 200 or resp.status == 302:
                            return {
                                "stream_url": str(resp.url) if resp.url else stream_url,
                                "title": "Streamed via Invidious",
                                "thumbnail": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
                                "user_agent": "Mozilla/5.0"
                            }
                except Exception as inv_e:
                    logger.warning(f"Invidious instance {instance} failed: {inv_e}")
                    continue
        
        raise Exception("All streaming engines and backup instances failed to provide a stream")

    except Exception as e:
        logger.error(f"Playback failed: {e}")
        raise HTTPException(status_code=500, detail=f"Playback currently unavailable. Error: {str(e)}")

@app.get("/audio-proxy")
async def audio_proxy(request: Request, url: str, ua: str = "Mozilla/5.0"):
    range_header = request.headers.get("Range")
    headers = {"User-Agent": ua}
    if range_header:
        headers["Range"] = range_header

    session = aiohttp.ClientSession()
    try:
        resp = await session.get(url, headers=headers)
        status_code = resp.status
        
        # Build headers to return to the browser
        out_headers = {
            "Accept-Ranges": "bytes",
            "Content-Type": resp.headers.get("Content-Type", "audio/mpeg"),
            "Cache-Control": "no-cache"
        }
        if "Content-Range" in resp.headers:
            out_headers["Content-Range"] = resp.headers["Content-Range"]
        if "Content-Length" in resp.headers:
            out_headers["Content-Length"] = resp.headers["Content-Length"]

        async def stream_generator():
            try:
                async for chunk in resp.content.iter_chunked(1024 * 64):
                    yield chunk
            finally:
                resp.close()
                await session.close()

        return StreamingResponse(
            stream_generator(),
            status_code=status_code,
            headers=out_headers,
            media_type=out_headers["Content-Type"]
        )
    except Exception as e:
        await session.close()
        raise HTTPException(status_code=500, detail=str(e))

# ── Improved Download Tracking ───────────────────────────────────────────
class DownloadStatus:
    def __init__(self):
        self.completed = {} # url -> file_path
        self.locks = {}     # url -> asyncio.Lock()
        self.progress = {}  # url -> status_string (e.g. "Downloading 5/56")

dl_manager = DownloadStatus()

@app.get("/download-status")
async def get_download_status(url: str):
    if url in dl_manager.completed:
        return {"status": "completed", "file": os.path.basename(dl_manager.completed[url])}
    
    status = dl_manager.progress.get(url, "queued")
    return {"status": status}

@app.get("/download")
async def download_track(url: str, name: Optional[str] = None, artist: Optional[str] = None, background_tasks: BackgroundTasks = None):
    engine = "SpotiFLAC (Lossless)" if ("spotify.com" in url and SPOTIFLAC_AVAILABLE) else "yt-dlp (Fallback)"
    
    # We trigger the download in background, but the client will follow up with /download-file
    background_tasks.add_task(run_download, url)
    
    encoded_url = urllib.parse.quote(url)
    return {
        "message": f"Download queued via {engine}",
        "engine": engine,
        "url": url,
        "name": name,
        "artist": artist,
        "downloadUrl": f"/api/music/download-file?url={encoded_url}"
    }

@app.get("/download-file")
async def download_file(url: str):
    # This will wait if a download is already in progress for this URL
    file_path = await run_download(url)
    
    if not file_path or not os.path.exists(file_path):
        # Last ditch effort: scan for newest file if path tracking failed
        file_path = find_newest_file(DOWNLOAD_DIR)
        
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Download failed or file could not be located on server.")

    filename = os.path.basename(file_path)
    media_type = "audio/flac" if file_path.endswith(".flac") else "audio/mpeg"
    return FileResponse(file_path, media_type=media_type, filename=filename)

def find_newest_file(directory):
    newest_file = None
    newest_time = 0
    for root, _, files in os.walk(directory):
        for f in files:
            if f.endswith(('.flac', '.mp3', '.m4a', '.wav', '.ogg', '.opus', '.webm')):
                fp = os.path.join(root, f)
                try:
                    mtime = os.path.getmtime(fp)
                    if mtime > newest_time:
                        newest_time = mtime
                        newest_file = fp
                except Exception:
                    pass
    return newest_file

async def run_download(url: str) -> Optional[str]:
    """
    Routes downloads based on source and returns the path to the downloaded file.
    """
    if url in dl_manager.completed:
        path = dl_manager.completed[url]
        if os.path.exists(path):
            return path
        else:
            del dl_manager.completed[url]

    if url not in dl_manager.locks:
        dl_manager.locks[url] = asyncio.Lock()

    async with dl_manager.locks[url]:
        # Double check after acquiring lock
        if url in dl_manager.completed:
            return dl_manager.completed[url]

        logger.info(f"Starting download for: {url}")
        start_time = time.time()
        is_spotify_url = "spotify.com" in url
        if is_spotify_url and SPOTIFLAC_AVAILABLE:
            def spotiflac_sync():
                try:
                    logger.info("[SpotiFLAC] Attempting lossless download...")
                    dl_manager.progress[url] = "Initializing SpotiFLAC..."
                    # SpotiFLAC will handle tracks, albums, and playlists
                    _SpotiFLAC(
                        url=url,
                        output_dir=DOWNLOAD_DIR,
                        services=["tidal", "qobuz", "deezer"],
                        quality="lossless",
                        threads=4
                    )
                    return True
                except Exception as e:
                    logger.error(f"[SpotiFLAC] Failed: {e}")
                    return False
            
            # Since SpotiFLAC doesn't easily expose progress callbacks, 
            # we'll update based on folder changes or just general state
            dl_manager.progress[url] = "Downloading tracks..."
            success = await asyncio.to_thread(spotiflac_sync)
            
            # Find what file was created
            if success:
                dl_manager.progress[url] = "Verifying files..."
                # Give it a second to flush to disk
                await asyncio.sleep(1)
                
                # Check for directories (playlists/albums)
                for entry in os.listdir(DOWNLOAD_DIR):
                    ep = os.path.join(DOWNLOAD_DIR, entry)
                    if os.path.isdir(ep):
                        mtime = os.path.getmtime(ep)
                        if mtime > start_time:
                            # It's a new directory, zip it!
                            dl_manager.progress[url] = "Creating ZIP archive..."
                            zip_path = ep + ".zip"
                            logger.info(f"[ZIP] Creating zip for playlist: {zip_path}")
                            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                                for root, _, files in os.walk(ep):
                                    for file in files:
                                        file_path = os.path.join(root, file)
                                        arcname = os.path.relpath(file_path, ep)
                                        zipf.write(file_path, arcname)
                            
                            dl_manager.completed[url] = zip_path
                            return zip_path

                # Check for individual files
                candidate = None
                newest_mtime = 0
                for root, _, files in os.walk(DOWNLOAD_DIR):
                    for f in files:
                        if f.endswith(('.flac', '.m4a', '.mp3')):
                            fp = os.path.join(root, f)
                            mtime = os.path.getmtime(fp)
                            if mtime > start_time and mtime > newest_mtime:
                                newest_mtime = mtime
                                candidate = fp
                
                if candidate:
                    logger.info(f"[SpotiFLAC] Download successful: {candidate}")
                    dl_manager.completed[url] = candidate
                    return candidate
                else:
                    logger.warning("[SpotiFLAC] Could not find newly created file, falling back to yt-dlp.")
            else:
                logger.warning("[SpotiFLAC] Process failed or returned False, falling back to yt-dlp.")

        # ── yt-dlp fallback (or direct search) ───────────────────────────────
        logger.info("[yt-dlp] Using fallback downloader.")

        def get_spotify_track_list(spotify_url: str):
            """
            Fetch track names from a Spotify playlist/album using the public embed JSON.
            Returns a dict with 'title' and 'tracks' (list of 'Artist - Track' strings).
            Returns None if not a collection or if fetch fails.
            """
            is_collection = "/playlist/" in spotify_url or "/album/" in spotify_url
            if not is_collection:
                return None

            try:
                parts = spotify_url.rstrip("/").split("/")
                resource_id = parts[-1].split("?")[0]
                resource_type = parts[-2]  # "playlist" or "album"

                embed_url = f"https://open.spotify.com/embed/{resource_type}/{resource_id}"
                headers = {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
                    "Accept": "text/html",
                }
                resp = requests.get(embed_url, headers=headers, timeout=15)
                resp.raise_for_status()

                # The embed page has a __NEXT_DATA__ script tag with full track data
                next_data_match = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.+?)</script>', resp.text, re.DOTALL)
                if not next_data_match:
                    logger.warning("[Playlist] No __NEXT_DATA__ found in embed page")
                    return None

                data = json.loads(next_data_match.group(1))

                # Navigate: props -> pageProps -> state -> data -> entity -> trackList
                entity = (
                    data.get("props", {})
                        .get("pageProps", {})
                        .get("state", {})
                        .get("data", {})
                        .get("entity", {})
                )

                playlist_title = entity.get("name", "playlist")
                track_list_raw = entity.get("trackList", [])

                if not track_list_raw:
                    logger.warning("[Playlist] trackList is empty in embed data")
                    return {"title": playlist_title, "tracks": []}

                # Each item has "title" (track name) and "subtitle" (artist)
                tracks = []
                for item in track_list_raw:
                    title = item.get("title", "").strip()
                    artist = item.get("subtitle", "").strip()
                    if title:
                        query = f"{artist} - {title}" if artist else title
                        tracks.append(query)

                logger.info(f"[Playlist] Fetched {len(tracks)} tracks from '{playlist_title}'")
                return {"title": playlist_title, "tracks": tracks[:100]}

            except Exception as e:
                logger.error(f"[Playlist] Failed to fetch track list: {e}")
                return None


        def download_single_track_ytdlp(search_query: str, out_dir: str) -> Optional[str]:
            """Download a single track to out_dir and return its path."""
            final_query = f"ytsearch1:{search_query}" if not search_query.startswith("http") else search_query
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': os.path.join(out_dir, '%(title)s.%(ext)s'),
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'flac',
                    'preferredquality': '320',
                }],
                'quiet': True,
                'no_warnings': True,
            }
            before = set(os.listdir(out_dir))
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                try:
                    ydl.extract_info(final_query, download=True)
                except Exception as e:
                    logger.warning(f"[yt-dlp] Failed for '{search_query}': {e}")
                    return None
            after = set(os.listdir(out_dir))
            new_files = after - before
            for f in new_files:
                if f.endswith(('.flac', '.m4a', '.mp3')):
                    return os.path.join(out_dir, f)
            return None

        is_spotify = "spotify.com" in url
        is_collection = is_spotify and ("/playlist/" in url or "/album/" in url)

        if is_collection:
            # Playlist/Album fallback: download all tracks individually, then ZIP
            logger.info("[Fallback] Detected Spotify collection, fetching track list...")
            dl_manager.progress[url] = "Fetching playlist tracks..."
            
            collection_info = await asyncio.to_thread(get_spotify_track_list, url)
            
            if collection_info and collection_info.get("tracks"):
                tracks_list = collection_info["tracks"]
                safe_title = re.sub(r'[<>:"/\\|?*]', '_', collection_info["title"])[:60]
                playlist_dir = os.path.join(DOWNLOAD_DIR, safe_title)
                os.makedirs(playlist_dir, exist_ok=True)
                
                total = len(tracks_list)
                logger.info(f"[Fallback] Downloading {total} tracks to '{safe_title}'...")
                
                for i, track_name in enumerate(tracks_list, 1):
                    dl_manager.progress[url] = f"Downloading track {i}/{total}: {track_name[:40]}..."
                    logger.info(f"[Fallback] [{i}/{total}] {track_name}")
                    await asyncio.to_thread(download_single_track_ytdlp, track_name, playlist_dir)
                
                # Count what we actually got
                downloaded_files = [
                    f for f in os.listdir(playlist_dir)
                    if f.endswith(('.flac', '.m4a', '.mp3'))
                ]
                
                if downloaded_files:
                    dl_manager.progress[url] = f"Creating ZIP of {len(downloaded_files)} tracks..."
                    zip_path = os.path.join(DOWNLOAD_DIR, f"{safe_title}.zip")
                    logger.info(f"[ZIP] Creating {zip_path} with {len(downloaded_files)} files")
                    
                    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        for f in os.listdir(playlist_dir):
                            fp = os.path.join(playlist_dir, f)
                            if os.path.isfile(fp):
                                zipf.write(fp, f)
                    
                    dl_manager.completed[url] = zip_path
                    return zip_path
                else:
                    logger.error("[Fallback] No tracks were downloaded successfully.")
            else:
                logger.warning("[Fallback] Could not retrieve track list. Falling back to single search.")

        # Single track fallback
        if is_spotify:
            # Resolve title via OEmbed for single tracks
            search_query = url
            try:
                oembed_resp = requests.get(f"https://open.spotify.com/oembed?url={url}", timeout=5)
                if oembed_resp.status_code == 200:
                    search_query = oembed_resp.json().get("title", url)
                    logger.info(f"[Fallback] Resolved track title: {search_query}")
            except Exception as e:
                logger.warning(f"[Fallback] OEmbed resolution failed: {e}")
        else:
            search_query = url
        
        dl_manager.progress[url] = f"Searching YouTube for: {search_query[:50]}..."
        result_path = await asyncio.to_thread(download_single_track_ytdlp, search_query, DOWNLOAD_DIR)
        
        if result_path and os.path.exists(result_path):
            logger.info(f"[yt-dlp] Resolved file: {result_path}")
            dl_manager.completed[url] = result_path
            return result_path
        
        return None

@app.get("/trending")
async def trending(limit: int = 20):
    try:
        from ytmusicapi import YTMusic
        ytmusic = YTMusic()
        charts = ytmusic.get_charts(country="US")
        
        # Videos in charts is often a list of playlists (Trending 20, etc.)
        videos_data = charts.get("videos", [])
        songs = []
        
        if isinstance(videos_data, list) and len(videos_data) > 0:
            # Try to get the first trending playlist
            playlist_id = videos_data[0].get("playlistId")
            if playlist_id:
                playlist = ytmusic.get_playlist(playlist_id, limit=limit)
                songs = playlist.get("tracks", [])
        
        # If still no songs, check if it's the newer version with 'items'
        if not songs and isinstance(charts, dict):
            songs = charts.get("videos", {}).get("items", [])

        tracks = []
        for item in songs[:limit]:
            tracks.append({
                "id": item.get("videoId"),
                "name": item.get("title"),
                "artist": item.get("artists", [{}])[0].get("name", "Unknown"),
                "album": item.get("album", {}).get("name") if item.get("album") else "Trending",
                "poster": item.get("thumbnails", [{}])[-1].get("url"),
                "url": f"https://music.youtube.com/watch?v={item.get('videoId')}",
                "duration_ms": item.get("duration_ms")
            })
        return tracks
    except Exception as e:
        logger.error(f"Trending fetch failed: {e}")
        return []

@app.get("/latest")
async def latest(limit: int = 20):
    try:
        from ytmusicapi import YTMusic
        ytmusic = YTMusic()
        
        # Search for actual newly released songs directly, ensuring 100% valid videoIds and high-fidelity playable tracks!
        search_results = ytmusic.search("new releases", filter="songs", limit=limit)
        
        tracks = []
        for item in search_results:
            v_id = item.get("videoId")
            if not v_id:
                continue
            tracks.append({
                "id": v_id,
                "name": item.get("title"),
                "artist": item.get("artists", [{}])[0].get("name", "Unknown"),
                "album": item.get("album", {}).get("name") if item.get("album") else "New Release",
                "poster": item.get("thumbnails", [{}])[-1].get("url"),
                "url": f"https://music.youtube.com/watch?v={v_id}",
                "duration_ms": (item.get("duration_seconds") * 1000) if item.get("duration_seconds") else None
            })
        return tracks
    except Exception as e:
        logger.error(f"Latest fetch failed: {e}")
        return []

@app.get("/popular-artists")
async def popular_artists(limit: int = 20):
    try:
        from ytmusicapi import YTMusic
        ytmusic = YTMusic()
        charts = ytmusic.get_charts(country="US")
        
        # Artists in charts is a list of artist objects
        artists_data = charts.get("artists", [])
        if isinstance(artists_data, dict):
            artists_data = artists_data.get("items", [])
        
        artists = []
        for item in artists_data[:limit]:
            artists.append({
                "id": item.get("browseId"),
                "name": item.get("artist") or item.get("title"),
                "artist": item.get("artist") or item.get("title"),
                "album": "Artist",
                "poster": item.get("thumbnails", [{}])[-1].get("url"),
                "url": f"https://music.youtube.com/browse/{item.get('browseId')}",
                "duration_ms": None
            })
        return artists
    except Exception as e:
        logger.error(f"Popular artists fetch failed: {e}")
        return []

CURATED_ALBUMS = [
    # Hollywood (6)
    {
        "id": "MPREb_TH6Wut5eTMQ",
        "name": "After Hours",
        "artist": "The Weeknd",
        "poster": "https://yt3.googleusercontent.com/JDKz3Anlyo49xBhFcFx13QD_Tk4-kqdiYTo15gtkL93nE8biWyZ7o0BPyW6RnXVxcXaJ5DgU5nJ_0NjJ=w544-h544-l90-rj",
        "category": "Hollywood",
        "year": "2020"
    },
    {
        "id": "MPREb_FWIMEPTHFsY",
        "name": "Starboy",
        "artist": "The Weeknd",
        "poster": "https://yt3.googleusercontent.com/dcxXIIlest09vnvKznWM9VWQXu1EL7lKxBzXGzwgmVjmMNBm1dEWT_0qn1xrEZYyKF_qRE1TLq8P_JY_mQ=w544-h544-l90-rj",
        "category": "Hollywood",
        "year": "2016"
    },
    {
        "id": "MPREb_K8qWMWVqXGi",
        "name": "Random Access Memories",
        "artist": "Daft Punk",
        "poster": "https://yt3.googleusercontent.com/N55arCGj69gtw6thXK8JUPisxoVYiwuIEQ7I6SGlkEyNcSJ7xIWPe76Vuu1SiUqRyx5w9qvR_zV8fV3CWQ=w544-h544-l90-rj",
        "category": "Hollywood",
        "year": "2013"
    },
    {
        "id": "MPREb_IRSjexVmMMl",
        "name": "21",
        "artist": "Adele",
        "poster": "https://yt3.googleusercontent.com/ep9CisZ7lNiZJk7zYAdBcT0TUgs898yKs87UT98q3byr3aaNnF-KzHr0T66X41RqAkuCcY7kUYZnd2BL=w544-h544-l90-rj",
        "category": "Hollywood",
        "year": "2011"
    },
    {
        "id": "MPREb_T5s950Swfdy",
        "name": "÷ (Deluxe)",
        "artist": "Ed Sheeran",
        "poster": "https://yt3.googleusercontent.com/xpDEOr2TeqEn1QpXosXhqtj149FzNnTgAG3oqPnpTxTbQk-oceO90Sz4Axq0s4Jp_QLGQha_um6_EG3WGQ=w544-h544-l90-rj",
        "category": "Hollywood",
        "year": "2017"
    },
    {
        "id": "MPREb_B7NkMWS9hMM",
        "name": "UTOPIA",
        "artist": "Travis Scott",
        "poster": "https://yt3.googleusercontent.com/eBvJuWpjg0Mx8DBa5WIhCzEopXyMnxkjWSU895BDGjTpNeqrliLrv3zGqNNuCUoXL1EkEAr5VQ3cx2pW=w544-h544-l90-rj",
        "category": "Hollywood",
        "year": "2023"
    },
    # Bollywood (12)
    {
        "id": "MPREb_E4GfUXfDfhy",
        "name": "Aashiqui 2",
        "artist": "Jeet Gannguli",
        "poster": "https://yt3.googleusercontent.com/3q33amH9hzn1dO8IeAX7TMb1QtEVfvVbqd2eSCaelOXNVmfMjbpDYdqD2HSiXtNP6i5Es7oynkWU2NfOXA=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2013"
    },
    {
        "id": "MPREb_RcOqUyfS2Bi",
        "name": "Kabir Singh",
        "artist": "Various Artists",
        "poster": "https://yt3.googleusercontent.com/loAKTa9XpvZzV-TORspRPC978Kk_u2l6tYlHTHm-sYfwjmKsJdShoxbmLoPKoq9eZgq-uzpoRPtqEWX09w=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2019"
    },
    {
        "id": "MPREb_E9Diy6kXmlV",
        "name": "Rockstar",
        "artist": "A.R. Rahman",
        "poster": "https://yt3.googleusercontent.com/KYw74XSQwtKPbZTrHMNEBAnEMg1P1gNGwymnZwBSjstbqSE-MpigGlTIy6IZvC-ERlRkeP0c7VTiZObS=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2011"
    },
    {
        "id": "MPREb_QFpeH3GzBe4",
        "name": "Yeh Jawaani Hai Deewani",
        "artist": "Various Artists",
        "poster": "https://yt3.googleusercontent.com/8WRsPwoMoabdu5ISlf9f7tGGPzd2I7CTaWxc8qd6GYjaEBreC2Yw0KWMId6Y2vUTqSkt7GdlUi4NAXyf=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2013"
    },
    {
        "id": "MPREb_osPrFMAjxV5",
        "name": "Dilwale Dulhania Le Jayenge",
        "artist": "Jatin-Lalit",
        "poster": "https://yt3.googleusercontent.com/GXqE3weSuEMhnDKWru2pLWcsgSWL87tfwNJUu2oiOlU5lIMFb1_W9KLBG7T8Z0rkEiEkLx6MkNZYXTqYKg=w544-h544-s-l90-rj",
        "category": "Bollywood",
        "year": "1995"
    },
    {
        "id": "MPREb_ppzycyJ77pl",
        "name": "Tamasha",
        "artist": "A.R. Rahman",
        "poster": "https://yt3.googleusercontent.com/AT2wfk1PvKjnHO7BzH2i2NkAvqRy_oZNEq48QGBlLJb51AuguCiR3mzp99X1uFdZezAkoSJ2WGjUU-HXZg=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2015"
    },
    {
        "id": "MPREb_suGXcALkg8R",
        "name": "Ae Dil Hai Mushkil",
        "artist": "Pritam",
        "poster": "https://yt3.googleusercontent.com/0eoKSZD2aThVTG85MaO4j6r_pVMmDlvnlMWmhGEn9WBak9Ncu9uFRYh82uKZqqouebyaBcI4WLhvQrml=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2016"
    },
    {
        "id": "MPREb_iE3Pd08juWf",
        "name": "Shershaah",
        "artist": "Tanishk Bagchi",
        "poster": "https://yt3.googleusercontent.com/iL_YgaRWLLzfwYP1mL9mTl0776jHYymJnsNcQlkzztzVEks8z__hMIKIvMfggcaqLah3pdQxR1NcWnPf=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2021"
    },
    {
        "id": "MPREb_fw5ch8iDQNC",
        "name": "Zindagi Na Milegi Dobara",
        "artist": "Shankar-Ehsaan-Loy",
        "poster": "https://yt3.googleusercontent.com/FgYMxJ3LGubtPl2bnTZo1QycILXaw19rXO8-QsP26vvQJN6MTHz--1FoM6t7FdkKvRvMv6ZMI2DYWfT5Gw=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2011"
    },
    {
        "id": "MPREb_TeNNqIVw9cn",
        "name": "Lagaan",
        "artist": "A.R. Rahman",
        "poster": "https://yt3.googleusercontent.com/K4yAOhTBdzugH8OPlGS_bYSFfzoPuaZKutzXx-gWJFN_3esvN0K58KyYK0hPl-erfqq69NKd3vhzWrLy=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2001"
    },
    {
        "id": "MPREb_H7hXbSZvh9z",
        "name": "Animal",
        "artist": "Various Artists",
        "poster": "https://yt3.googleusercontent.com/gBqzGGhYtTMyI6wvr6qoRFn7r_N2Vogm_10y1heNRNlCOUFTozMJHfz6wBH5yrHlgwUEPSrOlT8ab-w=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2023"
    },
    {
        "id": "MPREb_DauSX8EtLu0",
        "name": "Jab We Met",
        "artist": "Pritam",
        "poster": "https://yt3.googleusercontent.com/RssJqEN-oB10xf7OunqlgijfxH0sDNiQXsnARif7RCYfXVjPqSPvihn_7Ggg8zGEsWALnDvBxIm1GreR=w544-h544-l90-rj",
        "category": "Bollywood",
        "year": "2007"
    }
]

@app.get("/albums")
async def albums():
    return CURATED_ALBUMS

@app.get("/album/{album_id}")
async def get_album(album_id: str):
    try:
        from ytmusicapi import YTMusic
        ytmusic = YTMusic()
        album = ytmusic.get_album(album_id)
        
        poster_url = album['thumbnails'][-1]['url'] if album.get('thumbnails') else ""
        tracks = []
        for index, t in enumerate(album.get('tracks', [])):
            v_id = t.get('videoId')
            if not v_id:
                continue
            tracks.append({
                "id": v_id,
                "name": t.get('title'),
                "artist": t.get('artists', [{}])[0].get('name') if t.get('artists') else (album['artists'][0]['name'] if album.get('artists') else 'Unknown Artist'),
                "album": album.get('title'),
                "poster": poster_url,
                "url": f"https://music.youtube.com/watch?v={v_id}",
                "duration_ms": (t.get('duration_seconds') * 1000) if t.get('duration_seconds') else None
            })
            
        return {
            "id": album_id,
            "name": album.get('title'),
            "artist": album['artists'][0]['name'] if album.get('artists') else 'Unknown Artist',
            "poster": poster_url,
            "year": album.get('year'),
            "tracks": tracks
        }
    except Exception as e:
        logger.error(f"Album fetch failed for {album_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/lyrics")
async def get_lyrics(track_name: str, artist_name: str, duration_ms: Optional[float] = None):
    import re as _re
    import aiohttp

    def clean_track_name(name: str) -> str:
        """Strip featured artists and other suffixes that trip up lyric databases."""
        cleaned = _re.sub(r'\s*[\(\[](feat\.?|ft\.?|with|prod\.?|featuring|x)[^\)\]]*[\)\]]', '', name, flags=_re.IGNORECASE)
        cleaned = _re.sub(r'\s*-\s*(Radio Edit|Live|Remix|Acoustic|Version|Official|Extended Mix).*$', '', cleaned, flags=_re.IGNORECASE)
        return cleaned.strip()

    def clean_artist_name(name: str) -> str:
        """Extract primary artist, ignoring featured guests."""
        for sep in [",", " & ", " feat.", " Feat.", " ft.", " Ft.", " x ", " X "]:
            if sep in name:
                name = name.split(sep)[0]
        return name.strip()

    clean_track = clean_track_name(track_name)
    clean_artist = clean_artist_name(artist_name)
    _timeout = aiohttp.ClientTimeout(total=8)

    async def try_get(session, t_name, a_name):
        try:
            params = {"track_name": t_name, "artist_name": a_name}
            async with session.get("https://lrclib.net/api/get", params=params, timeout=_timeout) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data and (data.get("plainLyrics") or data.get("syncedLyrics")):
                        return data
        except Exception as e:
            logger.warning(f"try_get failed for '{t_name}' / '{a_name}': {e}")
        return None

    async def try_search(session, query):
        try:
            async with session.get("https://lrclib.net/api/search", params={"q": query}, timeout=_timeout) as resp:
                if resp.status == 200:
                    results = await resp.json()
                    if results and len(results) > 0:
                        return results[0]
        except Exception as e:
            logger.warning(f"try_search failed for query '{query}': {e}")
        return None

    try:
        async with aiohttp.ClientSession() as session:
            result = await try_get(session, track_name, artist_name)
            if result:
                return result

            if clean_track != track_name or clean_artist != artist_name:
                result = await try_get(session, clean_track, clean_artist)
                if result:
                    return result

            result = await try_search(session, f"{clean_artist} {clean_track}")
            if result:
                return result

            result = await try_search(session, clean_track)
            if result:
                return result

            result = await try_search(session, f"{artist_name} {track_name}")
            if result:
                return result

        return {"plainLyrics": None, "syncedLyrics": None}
    except Exception as e:
        logger.error(f"Lyrics fetch failed for {artist_name} - {track_name}: {e}")
        return {"plainLyrics": None, "syncedLyrics": None}

@app.get("/artist/resolve-id")
async def resolve_artist_id(name: str):
    try:
        from ytmusicapi import YTMusic
        ytmusic = YTMusic()
        
        # Clean and extract the primary artist
        primary_name = name
        # Split on common dividers
        for sep in [",", " & ", " feat. ", " Feat. ", " and ", " ft. ", " Ft. "]:
            if sep in primary_name:
                primary_name = primary_name.split(sep)[0]
        
        primary_name = primary_name.strip()
        if primary_name.endswith("("):
            primary_name = primary_name[:-1].strip()
            
        logger.info(f"Resolving artist ID for cleaned name: '{primary_name}' (original: '{name}')")
        
        # Search without filter to avoid the finicky 400 Bad Request error
        results = ytmusic.search(primary_name)
        for res in results:
            if res.get("resultType") == "artist":
                artists_list = res.get("artists", [])
                if artists_list:
                    artist_id = artists_list[0].get("id") or res.get("browseId")
                    if artist_id:
                        logger.info(f"Successfully resolved '{name}' to ID: {artist_id}")
                        return {"id": artist_id}
                        
        # Fallback to direct artists filter if general search doesn't find it
        try:
            filtered_results = ytmusic.search(primary_name, filter="artists")
            if filtered_results:
                return {"id": filtered_results[0].get("browseId")}
        except Exception as filter_err:
            logger.warn(f"Artists filter search fallback failed: {filter_err}")
            
        return {"id": None}
    except Exception as e:
        logger.error(f"Failed to resolve artist id for {name}: {e}")
        return {"id": None}

@app.get("/artist/{artist_id}")
async def get_artist(artist_id: str):
    try:
        from ytmusicapi import YTMusic
        ytmusic = YTMusic()
        artist = ytmusic.get_artist(artist_id)
        
        poster_url = artist['thumbnails'][-1]['url'] if artist.get('thumbnails') else ""
        
        tracks = []
        songs_sec = artist.get('songs', {})
        raw_tracks = []
        
        if songs_sec:
            playlist_id = songs_sec.get('browseId')
            if playlist_id:
                try:
                    playlist = ytmusic.get_playlist(playlist_id, limit=30)
                    raw_tracks = playlist.get('tracks', [])
                except Exception as pl_err:
                    logger.error(f"Failed to fetch artist playlist {playlist_id}: {pl_err}")
                    raw_tracks = songs_sec.get('results', [])
            else:
                raw_tracks = songs_sec.get('results', [])
                
        for t in raw_tracks:
            v_id = t.get('videoId')
            if not v_id:
                continue
                
            # Parse artist name
            t_artists = t.get('artists', [])
            artist_name = t_artists[0].get('name') if t_artists else (artist.get('name') or 'Unknown Artist')
            
            # Parse album name
            album_name = 'Single'
            t_album = t.get('album')
            if t_album:
                if isinstance(t_album, dict):
                    album_name = t_album.get('name', 'Single')
                else:
                    album_name = str(t_album)
                    
            # Parse poster
            t_thumbnails = t.get('thumbnails', [])
            t_poster = t_thumbnails[-1].get('url') if t_thumbnails else poster_url
            
            tracks.append({
                "id": v_id,
                "name": t.get('title'),
                "artist": artist_name,
                "album": album_name,
                "poster": t_poster,
                "url": f"https://music.youtube.com/watch?v={v_id}",
                "duration_ms": (t.get('duration_seconds') * 1000) if t.get('duration_seconds') else None
            })
            
        return {
            "id": artist_id,
            "name": artist.get('name'),
            "description": artist.get('description'),
            "followers": artist.get('subscribers') or artist.get('monthlyListeners') or "Popular Artist",
            "poster": poster_url,
            "tracks": tracks
        }
    except Exception as e:
        logger.error(f"Artist fetch failed for {artist_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("[music-api] Embed Scraper Bypass engine initialized. Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
