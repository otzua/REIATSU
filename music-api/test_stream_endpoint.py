import asyncio
from main import stream

async def test():
    try:
        # Test with a real query/video ID
        res = await stream("9HzMR9abGAI")
        print("STREAM ENDPOINT RESULT:")
        print("  Title:", res.get("title"))
        print("  Thumbnail:", res.get("thumbnail"))
        print("  Stream URL:", res.get("stream_url")[:120] if res.get("stream_url") else None)
    except Exception as e:
        print("STREAM ENDPOINT FAILED:", e)

asyncio.run(test())
