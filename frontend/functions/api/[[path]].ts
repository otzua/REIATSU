export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  let targetUrl = "";

  if (path.startsWith("/api/music/")) {
    targetUrl = "https://music-api-sigma-neon.vercel.app/" + path.replace("/api/music/", "");
  } else if (path.startsWith("/api/beyond/")) {
    targetUrl = "https://anime-api-alpha-kohl.vercel.app/api/beyond/" + path.replace("/api/beyond/", "");
  } else if (path.startsWith("/api/anime/")) {
    targetUrl = "https://anime-api-alpha-kohl.vercel.app/" + path.replace("/api/anime/", "");
  } else if (path.startsWith("/api/cinema/")) {
    targetUrl = "https://cinema-api-sglaxy936-6784s-projects.vercel.app/" + path.replace("/api/cinema/", "");
  } else if (path.startsWith("/tmdb-api/")) {
    targetUrl = "https://twilight-cake-defb.hunternisha55.workers.dev/3/" + path.replace("/tmdb-api/", "");
  }

  if (targetUrl) {
    // Forward the request to the target URL
    const newRequest = new Request(targetUrl + url.search, {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      redirect: 'follow'
    });
    
    // We need to handle headers specifically sometimes, but this is a basic proxy
    return fetch(newRequest);
  }

  return context.next();
};
