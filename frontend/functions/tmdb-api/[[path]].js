export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const pathParts = params.path || [];
  const remainingPath = pathParts.join('/');
  const searchParams = url.search;
  
  const targetUrl = `https://api.tmdb.org/3/${remainingPath}${searchParams}`;
  return handleProxy(request, targetUrl);
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
