import asyncio
from playwright.async_api import async_playwright
import re
import json

async def scrape_spotify(url):
    print(f"Starting Playwright for {url}...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            title = await page.title()
            print(f"Playlist Title: {title}")
            
            # Extract JSON data from script tags
            html = await page.content()
            
            # Spotify often embeds state in <script id="initial-state" type="text/plain">
            # Or in __NEXT_DATA__ (old Spotify)
            # Or in script tags with JSON
            
            # Let's just find text that looks like a track artist - track name
            # Or use a simpler selector:
            tracks = await page.eval_on_selector_all(
                '[data-testid="track-list"] [role="row"]',
                '''elements => elements.map(el => {
                    const titleEl = el.querySelector('a[data-testid="internal-track-link"]');
                    const title = titleEl ? titleEl.innerText : "";
                    
                    const artistEls = el.querySelectorAll('a[href*="/artist/"]');
                    const artists = Array.from(artistEls).map(a => a.innerText).join(", ");
                    
                    if (title && artists) return `${artists} - ${title}`;
                    return null;
                }).filter(t => t !== null)'''
            )
            
            if not tracks:
                # Try fallback selector
                tracks = await page.eval_on_selector_all(
                    'div[data-testid="tracklist-row"]',
                    '''elements => elements.map(el => el.innerText)'''
                )
                print(f"Raw track rows: {len(tracks)}")
                
            print(f"Found {len(tracks)} tracks:")
            for t in tracks[:10]:
                print(f"- {t}")
                
        except Exception as e:
            print(f"Playwright error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_spotify("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"))
