export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const pathParts = params.path || [];
  
  const remainingPath = pathParts.join('/');
  const searchParams = url.search;
  
  let targetUrl = '';
  
  if (pathParts[0] === 'music') {
    if (pathParts[1] === 'audio-proxy') {
      targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return new Response('Missing url parameter', { status: 400 });
      }
      return handleAudioProxy(request, targetUrl, url);
    }
    const subpath = pathParts.slice(1).join('/');
    targetUrl = `https://music-api-sigma-neon.vercel.app/${subpath}${searchParams}`;
  } else if (pathParts[0] === 'cinema') {
    const subpath = pathParts.slice(1).join('/');
    targetUrl = `https://cinema-api-sglaxy936-6784s-projects.vercel.app/${subpath}${searchParams}`;
  } else if (pathParts[0] === 'anime') {
    const subpath = pathParts.slice(1).join('/');
    targetUrl = `https://reiatsu-anime-api.otzuaa.workers.dev/${subpath}${searchParams}`;
  } else {
    targetUrl = `https://reiatsu-anime-api.otzuaa.workers.dev/api/${remainingPath}${searchParams}`;
  }
  
  return handleProxy(request, targetUrl);
}

async function handleAudioProxy(request, targetUrl, originalUrl) {
  const headers = new Headers(request.headers);
  headers.delete('host');
  
  const ua = originalUrl.searchParams.get('ua');
  if (ua) {
    headers.set('User-Agent', ua);
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: headers
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    // Strip content-disposition so browsers don't treat it as an attachment download (which blocks playback)
    responseHeaders.delete('content-disposition');

    // Normalise Content-Type: HTMLMediaElement rejects video/* with MEDIA_ERR_SRC_NOT_SUPPORTED,
    // and YouTube serves video/mp4 for muxed itags (e.g. 18) that yt-dlp may fall back to.
    // Mirrors the logic in music-api/main.py:/audio-proxy, which this function bypasses.
    const mimeHint = originalUrl.searchParams.get('mime');
    const upstreamType = (res.headers.get('Content-Type') || '').split(';')[0].trim();

    if (mimeHint && mimeHint.startsWith('audio/')) {
      responseHeaders.set('Content-Type', mimeHint);
    } else if (upstreamType.startsWith('video/')) {
      responseHeaders.set('Content-Type', upstreamType === 'video/webm' ? 'audio/webm' : 'audio/mp4');
    } else if (!upstreamType || upstreamType === 'application/octet-stream') {
      responseHeaders.set('Content-Type', /\.webm|itag=25[01]|itag=249/.test(targetUrl) ? 'audio/webm' : 'audio/mp4');
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

async function handleProxy(request, targetUrl) {
  const headers = new Headers(request.headers);
  headers.delete('host');
  
  const init = {
    method: request.method,
    headers: headers,
  };
  
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.clone().body;
  }
  
  try {
    const res = await fetch(targetUrl, init);
    const responseHeaders = new Headers(res.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
