import { fetchPage } from './lib/scrape.js';
import { normalizeImage, extractMetadata, scrapePostList, scrapePagination } from './lib/helper.js';

function scrapeFeaturedShows(html) {
  const featured = [];
  for (const m of html.matchAll(
    /<div[^>]*class="[^"]*gs_logo_single--wrapper[^"]*"[^>]*>(.*?)<\/div>\s*(?=<div[^>]*class="[^"]*gs_logo_single--wrapper|<\/div>)/gs
  )) {
    const c = m[1];
    const img  = c.match(/<img[^>]+src="([^"]+)"[^>]*(?:title|alt)="([^"]+)"/);
    const link = c.match(/<a[^>]+href="([^"]+)"/);
    const src  = c.match(/srcset="([^"]+)"/);
    if (img || link) {
      featured.push({
        title:     img?.[2] ?? '',
        image:     normalizeImage(img?.[1]),
        searchUrl: link?.[1] ?? '',
        srcset:    src?.[1] ?? null,
      });
    }
  }
  return featured;
}

function scrapeLatestEpisodes(html) {
  const episodes = [];
  const section = html.match(
    /<section[^>]*id="widget_list_episodes-8"[^>]*>[\s\S]*?<ul[^>]*class="post-lst[^"]*"[^>]*>([\s\S]*?)<\/ul>/
  )?.[1];
  if (!section) return episodes;

  for (const item of section.matchAll(
    /<li[^>]*>\s*<article[^>]*class="[^"]*episodes[^"]*"[^>]*>([\s\S]*?)<\/article>\s*<\/li>/g
  )) {
    const c = item[1];
    const numEpi = c.match(/<span[^>]*class="[^"]*num-epi[^"]*"[^>]*>(.*?)<\/span>/)?.[1]?.trim() ?? '';
    const epNum  = numEpi.match(/(\d+)x(\d+)/);
    episodes.push({
      title:         c.match(/<h2[^>]*class="[^"]*entry-title[^"]*"[^>]*>(.*?)<\/h2>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '',
      episodeNumber: epNum ? { season: +epNum[1], episode: +epNum[2], full: numEpi } : { full: numEpi },
      image:         normalizeImage(c.match(/<img[^>]+src="([^"]+)"/)?.[1]),
      imageAlt:      c.match(/<img[^>]+alt="([^"]+)"/)?.[1] ?? '',
      url:           c.match(/<a[^>]+href="([^"]+)"[^>]*class="lnk-blk"/)?.[1] ?? '',
      timeAgo:       c.match(/<span[^>]*class="[^"]*time[^"]*"[^>]*>(.*?)<\/span>/)?.[1]?.trim() ?? '',
    });
  }
  return episodes;
}

async function test() {
  const { html, baseUrl } = await fetchPage('/');
  const featured = scrapeFeaturedShows(html);
  const latestEpisodes = scrapeLatestEpisodes(html);
  const latestSeries = scrapePostList(html, 'widget_list_movies_series-2');
  const latestMovies = scrapePostList(html, 'widget_list_movies_series-3');
  console.log(JSON.stringify({ featured, latestEpisodes, latestSeries, latestMovies }, null, 2));
}

test().catch(console.error);
