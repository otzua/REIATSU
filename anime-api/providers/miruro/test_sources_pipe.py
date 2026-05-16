"""
Multi-domain sources test - finds which Miruro domain can serve streaming sources.
"""
import asyncio, base64, json, gzip, httpx

DOMAINS = ["miruro.bz", "miruro.ru", "miruro.ms", "miruro.com"]

def encode(payload):
    return base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')

def decode(text):
    text += '=' * (4 - len(text) % 4)
    compressed = base64.urlsafe_b64decode(text)
    return json.loads(gzip.decompress(compressed).decode())

def make_headers(domain):
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": f"https://www.{domain}/",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": f"https://www.{domain}",
    }

async def test_domain(client, domain):
    pipe_url = f"https://www.{domain}/api/secure/pipe"
    headers = make_headers(domain)
    print(f"\n{'='*50}")
    print(f"Testing domain: {domain}")
    
    # Step 1: Get episodes
    try:
        ep_payload = {"path": "episodes", "method": "GET", "query": {"anilistId": 21}, "body": None, "version": "0.1.0"}
        r1 = await client.get(f"{pipe_url}?e={encode(ep_payload)}", headers=headers)
        print(f"  Episodes status: {r1.status_code}")
        if r1.status_code != 200:
            print(f"  Episodes failed - skipping sources test")
            return False
        
        data = decode(r1.text.strip())
        providers = data.get("providers", {})
        print(f"  Providers: {list(providers.keys())}")
        
        # Find first valid episode
        ep_id = None
        ep_provider = None
        for prov_name, prov_data in providers.items():
            eps = prov_data.get("episodes", {}).get("sub", [])
            if eps and isinstance(eps[0], dict) and "id" in eps[0]:
                ep_id = eps[0]["id"]  # Already base64 encoded by Miruro
                ep_provider = prov_name
                break
        
        if not ep_id:
            print("  No episode IDs found")
            return False
        
        print(f"  Episode ID (raw, already b64): {ep_id[:40]}...")
        
        # Step 2: Test sources - using raw ep_id (NOT re-encoding it)
        src_payload = {
            "path": "sources",
            "method": "GET",
            "query": {"episodeId": ep_id, "provider": ep_provider, "category": "sub", "anilistId": 21},
            "body": None,
            "version": "0.1.0",
        }
        r2 = await client.get(f"{pipe_url}?e={encode(src_payload)}", headers=headers)
        print(f"  Sources status (raw id): {r2.status_code}")
        if r2.status_code == 200:
            src = decode(r2.text.strip())
            streams = src.get("sources", src.get("streams", []))
            print(f"  ✅ SUCCESS! Got {len(streams)} stream(s)")
            for s in streams[:2]:
                print(f"     {s.get('url','')[:80]}")
            return True
        else:
            print(f"  ❌ Failed: {r2.text[:100]}")
            
    except Exception as e:
        print(f"  Error: {e}")
    return False

async def main():
    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
        for domain in DOMAINS:
            success = await test_domain(client, domain)
            if success:
                print(f"\n🎯 WORKING DOMAIN: {domain}")
                break
        else:
            print("\n❌ No working domain found for sources")

asyncio.run(main())
