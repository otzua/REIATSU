const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 8080;

let browserPromise = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true, // run in background
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
  }
  return browserPromise;
}

app.get('*', async (req, res) => {
  const targetHost = req.headers['x-hostname'] || 'hanime1.me';
  
  // Build the full target URL, preserving the path and query string
  const targetUrl = `https://${targetHost}${req.originalUrl}`;
  console.log(`[Proxy] Fetching: ${targetUrl}`);

  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    
    // Set a solid user agent just in case
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');

    // Go to the target URL and wait for network idle to ensure CF challenge finishes
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 15000 });

    // Ensure we passed the cloudflare "Just a moment..." challenge
    const content = await page.content();
    if (content.includes('cf_chl_opt') || content.includes('Just a moment...')) {
        // Wait another 5 seconds for Turnstile to redirect
        await new Promise(r => setTimeout(r, 5000));
    }

    const finalHtml = await page.content();
    res.send(finalHtml);

  } catch (error) {
    console.error(`[Proxy] Error fetching ${targetUrl}:`, error);
    res.status(500).send('Proxy fetch failed: ' + error.message);
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[Proxy] Puppeteer Stealth Cloudflare Bypass running at http://127.0.0.1:${PORT}`);
});
