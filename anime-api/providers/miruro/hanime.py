import httpx
import asyncio
from typing import Optional, List, Dict
import json
import re

HANIME_SEARCH_API = "https://search.htv-services.com"
HANIME_VIDEO_API = "https://hanime.tv/api/v8/video"

async def get_hanime_episodes(anilist_id: int, anime_title: str) -> List[Dict]:
    """
    Search for a title on Hanime and return as episodes for Miruro integration.
    """
    clean_title = re.sub(r'\b(OVA|TV|MOVIE|THE ANIMATION)\b', '', anime_title, flags=re.IGNORECASE).strip()
    
    payload = {
        "search_text": clean_title,
        "tags": [],
        "tags_mode": "AND",
        "brands": [],
        "blacklist": [],
        "order_by": "created_at_unix",
        "ordering": "desc",
        "page_number": 1
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            res = await client.post(HANIME_SEARCH_API, json=payload)
            if res.status_code != 200:
                return []
            
            data = res.json()
            hits_raw = data.get("hits", "[]")
            hits = json.loads(hits_raw) if isinstance(hits_raw, str) else hits_raw
            
            if not hits:
                return []
                
            episodes = []
            for i, hit in enumerate(reversed(hits)):
                ep_num = i + 1
                name = hit.get("name", "")
                num_match = re.search(r'(\d+)$', name)
                if num_match:
                    ep_num = int(num_match.group(1))
                
                episodes.append({
                    "id": f"hanime:{hit['slug']}",
                    "hanime_slug": hit['slug'], # Store the real slug for get_sources
                    "number": ep_num,
                    "title": name,
                    "url": f"https://hanime.tv/videos/hentai/{hit['slug']}"
                })
            
            episodes.sort(key=lambda x: x["number"])
            return episodes
        except Exception as e:
            print(f"[Hanime] Search failed: {str(e)}")
            return []

async def get_hanime_sources(slug: str) -> Optional[Dict]:
    """
    Get M3U8 sources from Hanime video API.
    """
    actual_slug = slug.split(":")[-1] if ":" in slug else slug
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            res = await client.get(f"{HANIME_VIDEO_API}?id={actual_slug}")
            if res.status_code != 200:
                return None
            
            data = res.json()
            manifest = data.get("videos_manifest") or data.get("videosManifest", {})
            servers = manifest.get("servers", [])
            
            if not servers:
                return None
                
            for server in servers:
                streams = server.get("streams", [])
                if streams:
                    sources = []
                    for s in streams:
                        sources.append({
                            "url": f"https://reiatsu-sigma.vercel.app/api/beyond/proxy-m3u8?url={s['url']}",
                            "quality": str(s.get("height", "1080p")),
                            "isM3U8": True
                        })
                    
                    return {
                        "sources": sources,
                        "subtitles": [],
                        "intro": {"start": 0, "end": 0},
                        "outro": {"start": 0, "end": 0}
                    }
            return None
        except Exception as e:
            print(f"[Hanime] Sources failed for {actual_slug}: {str(e)}")
            return None
