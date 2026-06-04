export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const pathParts = params.path || [];
  const remainingPath = pathParts.join('/');
  const searchParams = url.search;
  
  // Inject API key server-side — the key is stored as a Cloudflare Pages env var
  // so it never appears in the frontend bundle
  const targetUrlObj = new URL(`https://api.tmdb.org/3/${remainingPath}${searchParams}`);
  const TMDB_KEY = context.env?.VITE_TMDB_API_KEY || 'd131017ccc6e5462a81c9304d21476de';
  if (!targetUrlObj.searchParams.has('api_key')) {
    targetUrlObj.searchParams.set('api_key', TMDB_KEY);
  }
  return handleProxy(request, targetUrlObj.toString());
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
