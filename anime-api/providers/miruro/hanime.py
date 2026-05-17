import httpx
import asyncio
from typing import Optional, List, Dict
import json
import re

HANIME_SEARCH_API = "https://search.htv-services.com"
HANIME_VIDEO_API = "https://hanime.tv/api/v8/video"
WATCHHENTAI_API = "https://watchhentai-api-main.vercel.app/api"

async def get_hanime_episodes(anilist_id: int, anime_title: str) -> List[Dict]:
    """
    Search for a title on Hanime and WatchHentai and return merged episodes for Miruro integration.
    """
    clean_title = re.sub(r'\b(OVA|TV|MOVIE|THE ANIMATION|ANIMATION|UNCENSORED|CENSORED)\b', '', anime_title, flags=re.IGNORECASE).strip()
    
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
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Referer": "https://hanime.tv/",
        "Origin": "https://hanime.tv",
    }
    
    episodes = []
    
    async with httpx.AsyncClient(timeout=10.0, headers=headers, http2=True) as client:
        try:
            # 1. Search Hanime
            print(f"[Hanime] Searching for: '{clean_title}'")
            res = await client.post(HANIME_SEARCH_API, json=payload)
            print(f"[Hanime] Search status: {res.status_code}")
            
            if res.status_code == 200:
                data = res.json()
                hits_raw = data.get("hits", "[]")
                hits = json.loads(hits_raw) if isinstance(hits_raw, str) else hits_raw
                print(f"[Hanime] Got {len(hits) if hits else 0} hits from Hanime")
                
                for i, hit in enumerate(reversed(hits)):
                    ep_num = i + 1
                    name = hit.get("name", "")
                    num_match = re.search(r'(\d+)$', name)
                    if num_match:
                        ep_num = int(num_match.group(1))
                    
                    episodes.append({
                        "id": f"hanime:{hit['slug']}",
                        "hanime_slug": hit['slug'],
                        "number": ep_num,
                        "title": f"[HN] {name}",
                        "url": f"https://hanime.tv/videos/hentai/{hit['slug']}"
                    })

            # 2. Search WatchHentai
            print(f"[Hanime] Also searching WatchHentai for: '{clean_title}'")
            wh_res = await client.get(f"{WATCHHENTAI_API}/search", params={"q": clean_title})
            if wh_res.status_code == 200:
                wh_data = wh_res.json().get("data", {}).get("results", [])
                print(f"[Hanime] Got {len(wh_data) if wh_data else 0} hits from WatchHentai")
                
                for hit in wh_data:
                    hit_url = hit.get("url", "")
                    if "/series/" in hit_url:
                        series_slug = hit_url.split('/')[-2]
                        print(f"[Hanime] Fetching series episodes for: {series_slug}")
                        s_res = await client.get(f"{WATCHHENTAI_API}/series/{series_slug}")
                        if s_res.status_code == 200:
                            s_data = s_res.json().get("data", {}).get("episodes", [])
                            for ep in s_data:
                                ep_url = ep.get("url", "")
                                ep_slug = ep_url.split('/')[-2]
                                episodes.append({
                                    "id": f"wh:{ep_slug}",
                                    "hanime_slug": f"wh:{ep_slug}",
                                    "number": float(ep.get("number", 0)),
                                    "title": f"[WH] {ep.get('title') or f'Episode {ep.get('number')}'}",
                                    "url": ep_url
                                })
                    elif "/videos/" in hit_url:
                        ep_slug = hit_url.split('/')[-2]
                        episodes.append({
                            "id": f"wh:{ep_slug}",
                            "hanime_slug": f"wh:{ep_slug}",
                            "number": 1.0,
                            "title": f"[WH] {hit.get('title', '')}",
                            "url": hit_url
                        })
            
            # Sort by number and then by title to keep it organized
            episodes.sort(key=lambda x: (x["number"], x["title"]))
            return episodes
            
        except Exception as e:
            print(f"[Hanime] Search failed: {str(e)}")
            return episodes if episodes else []

async def get_hanime_sources(slug: str) -> Optional[Dict]:
    """
    Get M3U8 sources from Hanime video API, with WatchHentai fallback.
    """
    is_wh = slug.startswith("wh:")
    actual_slug = slug.split(":")[-1] if ":" in slug else slug
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Referer": "https://hanime.tv/",
    }
    
    async with httpx.AsyncClient(timeout=15.0, headers=headers, follow_redirects=True, http2=True) as client:
        try:
            best_stream = None
            all_streams = []

            # 1. Try Hanime API only if not explicitly WatchHentai
            if not is_wh:
                res = await client.get(f"{HANIME_VIDEO_API}?id={actual_slug}")
                if res.status_code == 200:
                    data = res.json()
                    manifest = data.get("videos_manifest") or data.get("videosManifest", {})
                    servers = manifest.get("servers", [])
                    
                    for server in servers:
                        streams = server.get("streams", [])
                        if streams:
                            for s in streams:
                                u = s['url']
                                # Skip placeholder/broken domains
                                if "streamable.cloud" in u: continue
                                
                                all_streams.append({
                                    "url": f"/api/beyond/proxy-m3u8?url={u}",
                                    "quality": str(s.get("height", "1080p")),
                                    "isM3U8": True
                                })
                            if all_streams:
                                best_stream = all_streams[0]
                                break

            # 2. If Hanime failed (or is skipped), try WatchHentai extraction
            if not best_stream:
                print(f"[Hanime] Trying WatchHentai for {actual_slug}...")
                
                # If it's a known WatchHentai slug, use the watch API directly
                if is_wh:
                    watch_res = await client.get(f"{WATCHHENTAI_API}/watch/{actual_slug}")
                    if watch_res.status_code == 200:
                        wh_data = watch_res.json()
                        if wh_data.get("success"):
                            v_data = wh_data.get("data", {})
                            player = v_data.get("player", {})
                            sources = player.get("sources", [])
                            
                            # If no sources array, try the single src
                            if not sources and player.get("src"):
                                sources = [{"src": player["src"], "label": "HD"}]
                                
                            for s in sources:
                                file_url = s.get("src") or s.get("file")
                                if not file_url: continue
                                
                                is_m3u8 = ".m3u8" in file_url.lower()
                                all_streams.append({
                                    "url": f"/api/beyond/proxy-m3u8?url={file_url}" if is_m3u8 else f"/api/beyond/proxy-video?url={file_url}",
                                    "quality": s.get("label", "HD"),
                                    "isM3U8": is_m3u8
                                })
                            if all_streams:
                                return all_streams

                # Fallback: Search for the title
                clean_title = actual_slug.replace('-', ' ').strip()
                # Remove common suffixes
                clean_title = re.sub(r'\b(episode|ep)?\s*\d+\b', '', clean_title, flags=re.IGNORECASE).strip()
                
                search_res = await client.get(f"{WATCHHENTAI_API}/search", params={"q": clean_title})
                if search_res.status_code == 200:
                    results = search_res.json().get("data", {}).get("results", [])
                    if results:
                        target_url = results[0]["url"]
                        watch_slug = None
                        
                        if "/series/" in target_url:
                            series_slug = target_url.split("/series/")[1].split("/")[0]
                            series_res = await client.get(f"{WATCHHENTAI_API}/series/{series_slug}")
                            if series_res.status_code == 200:
                                episodes = series_res.json().get("data", {}).get("episodes", [])
                                # Try to match episode number
                                ep_match = re.search(r'(\d+)$', actual_slug)
                                ep_num = int(ep_match.group(1)) if ep_match else 1
                                
                                matched_ep = next((e for e in episodes if e.get("number") == ep_num), None) or (episodes[0] if episodes else None)
                                if matched_ep:
                                    target_url = matched_ep["url"]
                        
                        if "/videos/" in target_url:
                            watch_slug = target_url.split("/videos/")[1].split("/")[0]
                        
                        if watch_slug:
                            watch_res = await client.get(f"{WATCHHENTAI_API}/watch/{watch_slug}")
                            if watch_res.status_code == 200:
                                wdata = watch_res.json().get("data", {})
                                player = wdata.get("player", {})
                                sources = player.get("sources", [])
                                if not sources and player.get("src"):
                                    sources = [{"src": player["src"], "label": "1080p"}]
                                
                                if sources:
                                    for s in sources:
                                        is_m3u8 = s["src"].endswith(".m3u8") or "m3u8" in s["src"]
                                        proxy_path = "/api/beyond/proxy-m3u8" if is_m3u8 else "/api/beyond/proxy-video"
                                        all_streams.append({
                                            "url": f"{proxy_path}?url={s['src']}",
                                            "quality": s.get("label", "1080p"),
                                            "isM3U8": is_m3u8
                                        })
                                    best_stream = all_streams[0]

            if all_streams:
                return {
                    "sources": all_streams,
                    "subtitles": [],
                    "intro": {"start": 0, "end": 0},
                    "outro": {"start": 0, "end": 0}
                }
                
            return None
        except Exception as e:
            print(f"[Hanime] Sources fallback failed for {actual_slug}: {str(e)}")
            return None
