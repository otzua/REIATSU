export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response('Missing target url parameter', { status: 400 });
    }

    // Determine the appropriate referer based on the target domain
    let referer = 'https://hanime.tv/';
    if (targetUrl.includes('hstorage.xyz') || targetUrl.includes('watchhentai')) {
      referer = 'https://watchhentai.net/';
    }

    // Construct headers for the outgoing request
    const headers = new Headers(request.headers);
    headers.set('Referer', referer);
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    
    // Remove headers that might cause issues with Cloudflare's fetch
    headers.delete('Host');
    headers.delete('CF-Connecting-IP');
    headers.delete('X-Forwarded-For');
    headers.delete('X-Real-IP');

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        redirect: 'follow'
      });

      // Create a new response to modify headers before sending back to the client
      const newResponse = new Response(response.body, response);
      
      // Handle CORS for seamless browser playback
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Range');
      
      // Cache segments for improved performance
      if (targetUrl.includes('.ts') || targetUrl.includes('.jpg') || targetUrl.includes('.png')) {
        newResponse.headers.set('Cache-Control', 'public, max-age=86400');
      } else {
        newResponse.headers.set('Cache-Control', 'no-cache');
      }

      // If it's an M3U8 playlist, rewrite the segment URLs to point to this worker
      if (targetUrl.includes('.m3u8')) {
        let manifest = await response.text();
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        
        manifest = manifest.replace(/^(?!#)(.+)$/gm, (match) => {
          const segmentUrl = match.startsWith('http') ? match : baseUrl + match;
          // You can choose to either return the absolute URL (to stream directly from CDN)
          // or proxy the segments through the worker by wrapping them.
          // Returning the absolute CDN URL is optimal for performance.
          return segmentUrl; 
        });

        return new Response(manifest, {
          status: response.status,
          headers: newResponse.headers
        });
      }

      return newResponse;
    } catch (error) {
      return new Response(`Failed to proxy media: ${error.message}`, { status: 500 });
    }
  }
};
