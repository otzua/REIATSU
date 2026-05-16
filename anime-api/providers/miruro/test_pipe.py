import httpx
import base64
import json
import asyncio

def _encode_pipe_request(payload: dict) -> str:
    return base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')

async def test_pipe(domain):
    url = f"https://www.{domain}/api/secure/pipe"
    payload = {
        "path": "episodes",
        "method": "GET",
        "query": {"anilistId": 21},
        "body": None,
        "version": "0.1.0",
    }
    encoded_req = _encode_pipe_request(payload)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": f"https://www.{domain}/",
    }
    
    print(f"Testing {domain}...")
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, http2=False) as client:
        try:
            res = await client.get(f"{url}?e={encoded_req}", headers=headers)
            print(f"[{domain}] Status: {res.status_code}")
            if res.status_code == 200:
                print(f"[{domain}] SUCCESS!")
                return True
        except Exception as e:
            print(f"[{domain}] Error: {str(e)}")
    return False

async def main():
    domains = ["miruro.bz", "miruro.ru", "miruro.tv", "miruro.to", "miruro.ms"]
    for domain in domains:
        if await test_pipe(domain):
            print(f"\nFOUND WORKING DOMAIN: {domain}")
            break

if __name__ == "__main__":
    asyncio.run(main())
