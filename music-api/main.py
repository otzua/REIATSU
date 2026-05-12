import os
import glob
from fastapi import FastAPI, Query, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import aiohttp
import yt_dlp
import asyncio
from typing import List, Optional
from dotenv import load_dotenv

# Add standard macOS Python user bin directory patterns
for user_bin in glob.glob(os.path.expanduser("~/Library/Python/*/bin")):
    if user_bin not in os.environ.get("PATH", ""):
        os.environ["PATH"] = f"{user_bin}:{os.environ.get('PATH', '')}"

# Prepend Homebrew bin so it takes absolute precedence over outdated pip versions of yt-dlp
homebrew_bin = "/opt/homebrew/bin"
path_without_hb = os.environ.get("PATH", "").replace(homebrew_bin, "").replace("::", ":").strip(":")
os.environ["PATH"] = f"{homebrew_bin}:{path_without_hb}"

load_dotenv()

app = FastAPI(title="REIATSU Music API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Optional Spotify integration ──────────────────────────────────────────────
# Spotify search requires a Spotify Premium account linked to the developer app
# (as of Spotify's Nov 2024 API policy change). If credentials are not available
# or valid, the API gracefully falls back to YouTube-based search.

SPOTIFY_ENABLED = False
sp = None

_client_id = os.getenv("SPOTIPY_CLIENT_ID")
_client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")

if _client_id and _client_secret:
    try:
        import spotipy
        from spotipy.oauth2 import SpotifyClientCredentials
        auth_manager = SpotifyClientCredentials(client_id=_client_id, client_secret=_client_secret)
        sp = spotipy.Spotify(auth_manager=auth_manager)
        SPOTIFY_ENABLED = True
        print("[music-api] Spotify integration enabled.")
    except Exception as e:
        print(f"[music-api] Spotify init failed: {e}. Using YouTube search only.")
else:
    print("[music-api] No Spotify credentials — using YouTube search only.")

DOWNLOAD_DIR = os.getenv("DOWNLOAD_DIR", "downloads")
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _yt_search_tracks(q: str, limit: int = 20) -> list:
    """Search YouTube for music tracks and return a normalised track list."""
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,  # Don't download, just get metadata
    }
    search_query = f"ytsearch{limit}:{q}"
    results = []
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(search_query, download=False)
        for entry in info.get('entries', []):
            if not entry:
                continue
            # Thumbnail: pick largest available
            thumbnails = entry.get('thumbnails') or []
            poster = thumbnails[-1]['url'] if thumbnails else entry.get('thumbnail')
            # Parse "Artist - Title" from YouTube title if possible
            title = entry.get('title', '')
            artist = entry.get('uploader', 'Unknown Artist').replace(' - Topic', '')
            # Attempt split on " - "
            if ' - ' in title:
                parts = title.split(' - ', 1)
                artist = parts[0].strip()
                name = parts[1].strip()
            else:
                name = title

            results.append({
                'id': entry.get('id', ''),
                'name': name,
                'artist': artist,
                'album': '',
                'poster': poster or '',
                'url': entry.get('webpage_url') or f"https://www.youtube.com/watch?v={entry.get('id','')}",
                'duration_ms': int(entry.get('duration', 0)) * 1000,
                'source': 'youtube',
            })
    return results


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/search")
async def search(q: str = Query(..., min_length=1), limit: int = 20):
    """
    Search for tracks.
    - Uses Spotify if credentials are configured and valid.
    - Falls back to YouTube search otherwise.
    """
    # Try Spotify first
    if SPOTIFY_ENABLED and sp:
        try:
            results = sp.search(q=q, limit=limit, type="track")
            tracks = []
            for item in results["tracks"]["items"]:
                tracks.append({
                    "id": item["id"],
                    "name": item["name"],
                    "artist": item["artists"][0]["name"],
                    "album": item["album"]["name"],
                    "poster": item["album"]["images"][0]["url"] if item["album"]["images"] else "",
                    "url": item["external_urls"]["spotify"],
                    "duration_ms": item["duration_ms"],
                    "source": "spotify",
                })
            return tracks
        except Exception as e:
            print(f"[music-api] Spotify search failed: {e}. Falling back to YouTube.")

    # YouTube fallback
    try:
        return _yt_search_tracks(q, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stream")
async def stream(q: str = Query(..., min_length=1)):
    """
    Get a direct streamable audio URL from YouTube.
    Pass 'Artist - Track Name' as `q` for best accuracy.
    If `q` looks like a YouTube URL, it's used directly.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'extractor_args': {
            'youtube': {
                'player_client': ['android']
            }
        }
    }

    # If q is a YouTube URL, use it directly; otherwise do a search
    is_yt_url = 'youtube.com/watch' in q or 'youtu.be/' in q
    search_query = q if is_yt_url else f"ytsearch1:{q}"

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(search_query, download=False)
            entry = info if is_yt_url else (info.get('entries') or [None])[0]
            if not entry:
                raise HTTPException(status_code=404, detail="No stream found")
                
            # Extract http headers used by yt-dlp
            http_headers = entry.get('http_headers', {})
            user_agent = http_headers.get('User-Agent') or http_headers.get('user-agent')

            return {
                "stream_url": entry['url'],
                "title": entry.get('title'),
                "thumbnail": entry.get('thumbnail'),
                "user_agent": user_agent,
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download")
async def download_track(
    url: str, 
    background_tasks: BackgroundTasks,
    name: Optional[str] = None,
    artist: Optional[str] = None
):
    """Download the track to the server in the background."""
    background_tasks.add_task(run_download, url, name, artist)
    return {"message": "Download started in background", "url": url, "name": name, "artist": artist}


async def run_download(url: str, name: Optional[str] = None, artist: Optional[str] = None):
    # Automatic routing: Spotify vs YouTube
    is_youtube = 'youtube.com' in url or 'youtu.be' in url
    
    success = False
    
    if is_youtube:
        command = f'yt-dlp -x --audio-format flac -o "{DOWNLOAD_DIR}/%(title)s.%(ext)s" "{url}"'
        print(f"[music-api] Running direct YouTube download command: {command}")
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        if process.returncode == 0:
            print(f"[music-api] Direct YouTube Downloaded successfully: {url}")
            success = True
        else:
            print(f"[music-api] Error downloading direct YouTube {url}: {stderr.decode()}")
    else:
        # Spotify link or plain text search query. Let's try spot_flac script first.
        is_spotify = 'spotify.com' in url
        
        if is_spotify:
            # Resolve path to SuperSPOTDL/spot_flac.py
            script_dir = os.path.dirname(os.path.abspath(__file__))
            spot_flac_path = os.path.abspath(os.path.join(script_dir, "..", "SuperSPOTDL", "spot_flac.py"))
            import sys
            command = f'"{sys.executable}" "{spot_flac_path}" "{url}"'
            print(f"[music-api] Running Spotify download command: {command}")
            sub_env = os.environ.copy()
            sub_env["DOWNLOAD_DIR"] = os.path.abspath(DOWNLOAD_DIR)
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=sub_env
            )
            stdout, stderr = await process.communicate()
            if process.returncode == 0:
                print(f"[music-api] Spotify Downloaded successfully via spot_flac: {url}")
                success = True
            else:
                print(f"[music-api] Spotify download via spot_flac failed with return code {process.returncode}: {stderr.decode()}")
        
        # If the Spotify downloader failed or we were given a plain text query, fall back to yt-dlp search!
        if not success and (name or artist or not is_spotify):
            query = f"{artist} - {name}" if (artist and name) else url
            # Escape double quotes in title/artist for the command line
            escaped_query = query.replace('"', '\\"')
            command = f'yt-dlp -x --audio-format flac -o "{DOWNLOAD_DIR}/%(title)s.%(ext)s" "ytsearch1:{escaped_query}"'
            print(f"[music-api] Running premium yt-dlp fallback search and download for: {query}")
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            if process.returncode == 0:
                print(f"[music-api] Fallback downloaded successfully using ytsearch: {query}")
                success = True
            else:
                print(f"[music-api] Fallback downloading {query} failed: {stderr.decode()}")


@app.get("/audio-proxy")
async def audio_proxy(
    request: Request, 
    url: str = Query(..., min_length=1),
    ua: Optional[str] = Query(None)
):
    """
    Proxy audio/video streams from YouTube's server to the client's browser.
    This resolves the classic '403 Forbidden' YouTube stream URL restriction.
    By forwarding Range headers and matching User-Agents, it fully supports seeking,
    pausing, and buffering under HTML5 player controls with standard 206 Partial Content.
    """
    # Forward any incoming Range headers from the browser
    range_header = request.headers.get("range")
    
    # Use the passed-in User-Agent that yt-dlp used, otherwise fallback to standard browser UA
    user_agent = ua or "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    
    headers = {
        "User-Agent": user_agent,
    }
    if range_header:
        headers["Range"] = range_header
    
    try:
        session = aiohttp.ClientSession()
        response = await session.get(url, headers=headers)
        
        # Capture and forward all relevant streaming/cache/content headers
        headers_to_forward = {}
        for h in ["Content-Range", "Content-Length", "Accept-Ranges", "Content-Type", "Cache-Control"]:
            if h in response.headers:
                headers_to_forward[h] = response.headers[h]
        
        status_code = response.status
        
        async def stream_generator():
            try:
                async for chunk in response.content.iter_chunked(65536):
                    yield chunk
            finally:
                await response.release()
                await session.close()
                
        return StreamingResponse(
            stream_generator(), 
            status_code=status_code,
            headers=headers_to_forward
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")


@app.get("/status")
async def status():
    return {
        "status": "online",
        "engine": "yt-dlp",
        "spotify": SPOTIFY_ENABLED,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
