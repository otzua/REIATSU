import httpx
import base64
import json
import asyncio
import gzip

def _encode_pipe_request(payload: dict) -> str:
    return base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')

def _decode_pipe_response(encoded_str: str) -> dict:
    try:
        encoded_str += '=' * (4 - len(encoded_str) % 4)
        compressed = base64.urlsafe_b64decode(encoded_str)
        return json.loads(gzip.decompress(compressed).decode('utf-8'))
    except Exception as e:
        print(f"Decode error: {e}")
        return {}

async def test_path(path):
    url = f"https://www.miruro.bz/api/secure/pipe"
    payload = {
        "path": path,
        "method": "GET",
        "query": {},
        "body": None,
        "version": "0.1.0",
    }
    encoded_req = _encode_pipe_request(payload)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://www.miruro.bz/",
    }
    
    print(f"Testing path: {path}...")
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, http2=False) as client:
        try:
            res = await client.get(f"{url}?e={encoded_req}", headers=headers)
            print(f"Status: {res.status_code}")
            if res.status_code == 200:
                data = _decode_pipe_response(res.text.strip())
                print(f"SUCCESS! Keys: {data.keys()}")
                return data
        except Exception as e:
            print(f"Error: {str(e)}")
    return None

async def main():
    # Try common home paths
    paths = ["home", "spotlight", "trending", "popular", "latest", "top-10"]
    for path in paths:
        res = await test_path(path)
        if res:
            print(f"FOUND WORKING PATH: {path}")
            # print(json.dumps(res, indent=2)[:500])

if __name__ == "__main__":
    asyncio.run(main())
