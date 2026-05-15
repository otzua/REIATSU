// providers/anikoto/parser.js
import { load, text, attr, each, num } from '../../utils/dom.js';

// ─── Pagination helpers ──────────────────────────────────────────────
function getLastPage($) {
  const lastHref = $('nav .pagination li:last-child a.page-link').attr('href');
  if (lastHref) {
    const m = lastHref.match(/page=(\d+)/);
    if (m) return parseInt(m[1], 10);
  }
  let max = 1;
  $('nav .pagination .page-item .page-link').each((_, el) => {
    const n = parseInt($(el).text().trim(), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return max;
}

function getCurrentPage($) {
  return num($('nav .pagination .page-item.active .page-link').text().trim()) || 1;
}

function extractId(href) {
  if (!href) return null;
  return href
    .replace(/^https?:\/\/[^\/]+\/watch\//, '')
    .replace(/^\/watch\//, '')
    .replace(/\/ep-\d+.*$/, '')
    .replace(/^\//, '')
    .trim() || null;
}

function extractTipId($, el) {
  return $(el).find('.ani.poster').attr('data-tip') ||
         $(el).find('[data-tip]').first().attr('data-tip') || null;
}

function parseGenreList($) {
  return each($, '#menu ul li ul.c4 li a', el =>
    (el.attr('title') || el.find('h3').text() || '').trim()
  ).filter(Boolean);
}

function parseEpisodes($, ctx) {
  const subText = $(ctx).find('.ep-status.sub span').text().trim();
  const dubText = $(ctx).find('.ep-status.dub span').text().trim();
  return {
    sub: subText ? (parseInt(subText, 10) || 1) : null,
    dub: dubText ? (parseInt(dubText, 10) || 1) : null,
  };
}

function parseSrcset(srcset) {
  if (!srcset) return null;
  const parts = srcset
    .split(',')
    .map((entry) => entry.trim().split(/\s+/)[0])
    .filter(Boolean);
  if (parts.length === 0) return null;
  return parts[parts.length - 1];
}

function normalizePosterUrl(url) {
  if (!url) return null;
  return String(url).trim().replace(/^['"]|['"]$/g, '');
}

function upscalePosterUrl(url) {
  const normalized = normalizePosterUrl(url);
  if (!normalized) return null;

  if (normalized.includes('image.tmdb.org/t/p/')) {
    return normalized.replace(/\/w\d+\//, '/original/');
  }

  if (normalized.includes('/media/anime/cover/small/')) {
    return normalized.replace('/media/anime/cover/small/', '/media/anime/cover/large/');
  }

  if (normalized.includes('/media/anime/cover/medium/')) {
    return normalized.replace('/media/anime/cover/medium/', '/media/anime/cover/large/');
  }

  return normalized;
}

function extractPosterFromImage($, root) {
  const img = $(root).find('img').first();
  if (!img.length) return null;

  const bestFromSet = parseSrcset(
    img.attr('data-srcset') ||
    img.attr('srcset')
  );

  const candidate =
    img.attr('data-src') ||
    img.attr('data-original') ||
    img.attr('data-lazy-src') ||
    bestFromSet ||
    img.attr('src') ||
    null;

  return upscalePosterUrl(candidate);
}

function extractPosterFromStyle($, root, selector) {
  const style = $(root).find(selector).first().attr('style') || '';
  const raw = style.match(/url\(['"]?([^)'"]+)['"]?\)/)?.[1] || null;
  return upscalePosterUrl(raw);
}

function parseAitem($, el) {
  const posterLink = $(el).find('.ani.poster a, a.poster').first();
  const href = posterLink.attr('href') || $(el).find('a').first().attr('href');
  const id = extractId(href);
  const tipId = extractTipId($, el);
  const nameEl = $(el).find('.name, .title, .d-title').first();
  return {
    id,
    tipId,
    name: nameEl.text().trim() || nameEl.attr('data-jp') || '',
    jname: nameEl.attr('data-jp') || null,
    poster: extractPosterFromImage($, el),
    type: $(el).find('.meta .right').first().text().trim() || null,
    episodes: parseEpisodes($, el),
  };
}

const TYPE_SLUGS = new Set(['movie', 'tv', 'ova', 'ona', 'special', 'music']);

function toApiUrl(siteHref, providerName) {
  if (!siteHref || siteHref === 'javascript:;') return null;
  const base = `/api/v2/${providerName}`;
  const genreMatch = siteHref.match(/^\/genre\/(.+)$/);
  if (genreMatch) return `${base}/genre/${genreMatch[1]}`;
  const azMatch = siteHref.match(/^\/az-list\/?(.*)$/);
  if (azMatch !== null) return azMatch[1] ? `${base}/azlist/${azMatch[1]}` : `${base}/azlist`;
  const watchMatch = siteHref.match(/\/watch\/(.+)$/);
  if (watchMatch) return `${base}/anime/${extractId(watchMatch[0])}`;
  const slug = siteHref.replace(/^\//, '');
  if (slug.startsWith('type/')) return `${base}/type/${slug.replace('type/', '')}`;
  if (TYPE_SLUGS.has(slug)) return `${base}/type/${slug}`;
  if (slug === 'filter') return `${base}/search`;
  if (slug === 'random') return `/api/v2/${providerName}/random`;
  if (slug === 'home') return `${base}/home`;
  if (slug === 'latest-updated') return `${base}/category/latest-updated`;
  if (slug === 'new-release') return `${base}/category/new-release`;
  if (slug === 'most-viewed') return `${base}/category/most-viewed`;
  if (slug.startsWith('status/')) return `${base}/category/${slug}`;
  return siteHref;
}

// ─── Detail extraction helpers ───────────────────────────────────────
function detailValue($, baseSelector, label) {
  let result = null;
  $(baseSelector).find('div').each((_, div) => {
    if ($(div).text().trim().startsWith(label)) {
      const span = $(div).find('> span').first();
      if (span.length) {
        // Get only direct text, not nested links
        const clone = span.clone();
        clone.find('a').remove();
        result = clone.text().trim() || span.find('a').first().text().trim() || null;
      } else {
        result = $(div).text().replace(label, '').trim() || null;
      }
      return false;
    }
  });
  return result;
}

function detailLinks($, baseSelector, label) {
  const result = [];
  $(baseSelector).find('div').each((_, div) => {
    if ($(div).text().trim().startsWith(label)) {
      $(div).find('a').each((_, a) => {
        const spanText = $(a).find('span').text().trim();
        const linkText = $(a).text().trim();
        result.push(spanText || linkText);
      });
      return false;
    }
  });
  return result;
}

// ─── Core parsers ────────────────────────────────────────────────────

export function parseNavMenu(html, providerName = 'anikoto') {
  const $ = load(html);
  const genres = each($, '#menu ul li ul.c4 li a', (el) => ({
    name: (el.attr('title') || el.find('h3').text() || '').trim(),
    url: toApiUrl(el.attr('href'), providerName),
  })).filter(g => g.name);
  const types = each($, '#menu ul li ul.c1 li a', (el) => ({
    name: (el.attr('title') || el.find('h3').text() || '').trim(),
    url: toApiUrl(el.attr('href'), providerName),
  })).filter(t => t.name);
  const links = [];
  $('#menu > ul > li > a').each((_, a) => {
    const href = $(a).attr('href');
    const name = $(a).clone().find('i, ul, h3').remove().end().text().trim();
    if (href && href !== 'javascript:;' && name && name !== 'Genre' && name !== 'Types') {
      links.push({ name, url: toApiUrl(href, providerName) });
    }
  });
  return {
    brand: { link: $('header .logo a').attr('href') || '/home', logo: $('header .logo img').attr('src') || null },
    buttons: { menu: true, search: true, watch2gether: null, random: '/random' },
    search: { action: `/api/v2/${providerName}/search`, placeholder: $('header input[name="keyword"]').attr('placeholder') || 'Search anime...', filter_link: `/api/v2/${providerName}/search` },
    menu: { genres, types, links },
    browse: {
      url: `/api/v2/${providerName}/search`,
      sortOptions: [
        { label: 'Default', value: 'default' }, { label: 'Latest Updated', value: 'latest-updated' },
        { label: 'Latest Added', value: 'latest-added' }, { label: 'Score', value: 'score' },
        { label: 'Name A-Z', value: 'name-az' }, { label: 'Release Date', value: 'release-date' },
        { label: 'Most Viewed', value: 'most-viewed' }, { label: 'Number of episodes', value: 'number_of_episodes' },
      ],
      filters: {
        type: ['Movie', 'Music', 'ONA', 'OVA', 'Special', 'TV'],
        status: ['finished-airing', 'currently-airing', 'not-yet-aired'],
        season: ['fall', 'summer', 'spring', 'winter'],
        rating: ['PG', 'PG-13', 'G', 'R', 'R+', 'Rx'],
        language: ['sub', 'dub'],
      },
    },
    language: ['en', 'jp'],
  };
}

export function parseHome(html) {
  const $ = load(html);
  const genres = parseGenreList($);
  const spotlightAnimes = each($, '#hotest .item', (el, i) => ({
    id: extractId($(el).find('a.btn.play').attr('href') || ''),
    name: $(el).find('.title.d-title').text().trim() || null,
    jname: $(el).find('.title.d-title').attr('data-jp') || null,
    poster: extractPosterFromStyle($, el, '.image div'),
    description: $(el).find('.synopsis').text().trim() || null,
    rating: $(el).find('.meta i.rating').text().trim() || null,
    rank: i + 1,
    otherInfo: [$(el).find('.meta i.quality').text().trim(), $(el).find('.meta i.date').text().trim()].filter(Boolean),
    genres: [],
    episodes: { 
      sub: $(el).find('.meta i.sub').parent().text().match(/sub\s*(\d+)/i)?.[1] 
        ? parseInt($(el).find('.meta i.sub').parent().text().match(/sub\s*(\d+)/i)[1], 10) 
        : ($(el).find('.meta i.sub').length ? 1 : null),
      dub: $(el).find('.meta i.dub').parent().text().match(/dub\s*(\d+)/i)?.[1]
        ? parseInt($(el).find('.meta i.dub').parent().text().match(/dub\s*(\d+)/i)[1], 10)
        : ($(el).find('.meta i.dub').length ? 1 : null)
    },
  }));
  const latestEpisodeAnimes = each($, '#recent-update .ani.items .item', (el) => ({
    id: extractId($(el).find('.ani.poster a').attr('href')),
    tipId: extractTipId($, el),
    name: $(el).find('.name.d-title').attr('data-jp') || $(el).find('.name.d-title').text().trim() || null,
    jname: $(el).find('.name.d-title').attr('data-jp') || null,
    poster: extractPosterFromImage($, el),
    type: $(el).find('.meta .right').first().text().trim() || null,
    episodes: parseEpisodes($, el),
  }));
  const newReleases = each($, '.top-tables section[data-name="new-release"] .scaff.items a.item', (el) => ({
    id: extractId(el.attr('href')),
    name: $(el).find('.name.d-title').attr('data-jp') || $(el).find('.name.d-title').text().trim() || null,
    jname: $(el).find('.name.d-title').attr('data-jp') || null,
    poster: extractPosterFromImage($, el),
    type: null,
    episodes: parseEpisodes($, el),
  }));
  const topUpcomingAnimes = each($, '.top-tables section[data-name="new-added"] .scaff.items a.item', (el) => ({
    id: extractId(el.attr('href')),
    name: $(el).find('.name.d-title').attr('data-jp') || $(el).find('.name.d-title').text().trim() || null,
    jname: $(el).find('.name.d-title').attr('data-jp') || null,
    poster: extractPosterFromImage($, el),
    type: null,
    episodes: parseEpisodes($, el),
  }));
  const today = each($, '.tab-content[data-name="day"] .scaff.side.items a.item', (el) => {
    const rankClass = el.attr('class')?.match(/rank(\d+)/)?.[1];
    return {
      id: extractId(el.attr('href')),
      rank: rankClass ? parseInt(rankClass, 10) : null,
      name: $(el).find('.name.d-title').attr('data-jp') || $(el).find('.name.d-title').text().trim() || null,
      poster: extractPosterFromImage($, el),
      episodes: parseEpisodes($, el),
    };
  });
  const week = each($, '.tab-content[data-name="week"] .scaff.side.items a.item', (el) => {
    const rankClass = el.attr('class')?.match(/rank(\d+)/)?.[1];
    return {
      id: extractId(el.attr('href')),
      rank: rankClass ? parseInt(rankClass, 10) : null,
      name: $(el).find('.name.d-title').attr('data-jp') || $(el).find('.name.d-title').text().trim() || null,
      poster: extractPosterFromImage($, el),
      episodes: parseEpisodes($, el),
    };
  });
  const month = each($, '.tab-content[data-name="month"] .scaff.side.items a.item', (el) => {
    const rankClass = el.attr('class')?.match(/rank(\d+)/)?.[1];
    return {
      id: extractId(el.attr('href')),
      rank: rankClass ? parseInt(rankClass, 10) : null,
      name: $(el).find('.name.d-title').attr('data-jp') || $(el).find('.name.d-title').text().trim() || null,
      poster: extractPosterFromImage($, el),
      episodes: parseEpisodes($, el),
    };
  });
  return { genres, spotlightAnimes, latestEpisodeAnimes, newReleases, topUpcomingAnimes, top10Animes: { today, day: [], week, month } };
}

export function parseIndex(html) {
  const $ = load(html);
  return {
    meta: {
      title: $('title').text().trim() || null,
      description: $('meta[name="description"]').attr('content') || null,
      ogImage: $('meta[property="og:image"]').attr('content') || null,
      canonical: $('link[rel="canonical"]').attr('href') || null,
    },
    mostSearched: each($, '.search-term a.item', el => ({ label: el.text().trim().replace(/,?\s*$/, ''), keyword: el.text().trim().replace(/,?\s*$/, '') })),
    genres: parseGenreList($),
    azList: each($, 'footer .azlist ul li a', el => ({ label: el.text().trim(), href: el.attr('href') || null })).filter(a => a.label),
    footerMenu: each($, 'footer .inline-links ul li a', el => ({ label: $(el).find('span').text().trim() || el.text().trim(), href: el.attr('href') || null })).filter(m => m.label),
  };
}

export function parseSearchFromHtml(html) {
  const $ = load(html);
  const animes = each($, '#list-items .item, .items .item, .ani.item', el => parseAitem($, el));
  const cur = getCurrentPage($);
  const last = getLastPage($);
  return { animes, currentPage: cur, totalPages: last, hasNextPage: cur < last, totalCount: null };
}

export function parseAzListFromHtml(html) {
  const $ = load(html);
  const animes = each($, '#list-items .item, .items .item', el => parseAitem($, el));
  const cur = getCurrentPage($);
  const last = getLastPage($);
  return { sortOption: 'all', animes, currentPage: cur, totalPages: last, hasNextPage: cur < last };
}

export function parseListPage(html) {
  const $ = load(html);
  const title = $('.head .title').first().text().trim() || null;
  const animes = each($, '#list-items .item, .items .item', el => parseAitem($, el));
  const cur = getCurrentPage($);
  const last = getLastPage($);
  return { title, animes, currentPage: cur, totalPages: last, hasNextPage: cur < last };
}

// ─── Watch page HTML parser ─────────────────────────────────────────
export function parseAnime(html) {
  const $ = load(html);
  const animeId = $('#watch-main').attr('data-id') || null;
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const dataUrl = $('#watch-main').attr('data-url') || '';
  const slugFromUrl = extractId(dataUrl || canonical);
  
  const name = text($, '.ani-name, h1.title.d-title, .head .title') || 
    $('meta[property="og:title"]').attr('content')?.replace(/^Watch\s+/, '').replace(/^Anime\s+/, '').replace(/\s+Watch\s+Online.*$/i, '').replace(/\s+Episode\s+\d+.*$/i, '').trim() || 
    'Unknown Anime';
  const jname = attr($, '.ani-name, h1.title.d-title', 'data-jp');
  const poster = upscalePosterUrl(
    attr($, '.poster img, .ani-poster img', 'data-src') ||
    attr($, '.poster img, .ani-poster img', 'src') ||
    $('meta[property="og:image"]').attr('content') ||
    null
  );
  
  // Synonyms from .names div - all semicolon-separated items
  const synonymsRaw = text($, '.binfo .info .names');
  const synonyms = synonymsRaw || null;
  
  const description = text($, '.synopsis .shorting .content') || $('meta[property="og:description"]').attr('content') || null;
  const rating = text($, '.meta i.rating');
  const hasSub = $('.meta i.sub').length > 0;
  const hasDub = $('.meta i.dub').length > 0;
  
  const firstMeta = '.bmeta .meta:first-child';
  const lastMeta = '.bmeta .meta:last-child';
  
  const type = detailValue($, firstMeta, 'Type:');
  const premiered = detailLinks($, firstMeta, 'Premiered:')[0] || null;
  const aired = detailValue($, firstMeta, 'Aired:');
  const status = detailLinks($, firstMeta, 'Status:')[0] || detailValue($, firstMeta, 'Status:');
  const genres = detailLinks($, firstMeta, 'Genres:');
  
  const score = detailValue($, lastMeta, 'MAL:');
  const duration = detailValue($, lastMeta, 'Duration:');
  const episodesRaw = detailValue($, lastMeta, 'Episodes:');
  const episodesTotal = episodesRaw === '?' ? null : parseInt(episodesRaw, 10) || null;
  const studios = detailLinks($, lastMeta, 'Studios:');
  const producers = detailLinks($, lastMeta, 'Producers:');
  
  // MAL ID from sync data or watch page
  let malId = $('#watch-page').attr('data-mal-id') || $('#watch-main').attr('data-mal-id') || null;
  let alId = $('#watch-page').attr('data-al-id') || $('#watch-main').attr('data-al-id') || null;

  try {
    const sync = JSON.parse($('#syncData').text());
    if (sync.mal_id) malId = sync.mal_id;
    if (sync.ani_id) alId = sync.ani_id;
  } catch (_) {}

  
  // Recommended (last sidebar section)
  const recommended = each($, '.sidebar > section.w-side-section:last-child .scaff.side.items a.item', (el) => {
    const href = el.attr('href');
    const typeText = $(el).find('.meta span.dot').eq(0).text().trim();
    const epsText = $(el).find('.meta span.dot').eq(1).text().trim();
    const yearText = $(el).find('.meta span.dot').eq(2).text().trim();
    return {
      id: extractId(href),
      name: $(el).find('.name.d-title').attr('data-jp') || $(el).find('.name.d-title').text().trim() || null,
      jname: $(el).find('.name.d-title').attr('data-jp') || null,
      poster: extractPosterFromImage($, el),
      type: typeText || null,
      duration: null,
      episodes: { sub: parseInt(epsText, 10) || null, dub: null },
      year: parseInt(yearText, 10) || null,
    };
  });

  // Seasons (Try multiple common selectors for Zoro/Anikoto clones)
  let seasons = each($, '.os-list .item, .ss-list .item, .seasons-list .item', (el) => {
    const link = el.find('a');
    return {
      id: link.attr('href')?.split('/').pop() || '',
      title: link.attr('title') || el.text().trim(),
      isCurrent: el.hasClass('active') || el.find('a').hasClass('active')
    };
  });

  // Fallback 1: Check "Related" for items with same name + Season/Number
  if (seasons.length === 0 && name && name !== 'Unknown Anime') {
    const currentName = name.split('Season')[0].split('Part')[0].split(':')[0].trim();
    $('.related .item, .recommended .item, .ani-related .item').each((_, el) => {
      const relName = $(el).find('.name, .title').text().trim();
      const relId = $(el).find('a').attr('href')?.split('/').pop();
      if (relId && relName.toLowerCase().includes(currentName.toLowerCase()) && 
          (relName.toLowerCase().includes('season') || relName.toLowerCase().includes('arc') || relName.match(/ [IVXLC]+$/i))) {
        seasons.push({
          id: relId,
          title: relName,
          isCurrent: false
        });
      }
    });
  }

  // Ensure current anime is in the list
  if (!seasons.find(s => s.isCurrent)) {
    seasons.unshift({ id: animeId, title: name, isCurrent: true });
  }

  // Deduplicate and sort by title
  seasons = seasons.filter((s, i, a) => a.findIndex(t => t.id === s.id) === i);
  
  return {
    anime: { id: slugFromUrl || animeId, animeId, name, jname, synonyms, japanese: jname, poster, description, type, rating,
      episodes: { sub: hasSub ? 1 : null, dub: hasDub ? 1 : null }, duration, premiered, aired, broadcast: null, status, score,
      episodesTotal, country: null, genres, studios, producers, malId, alId },
    related: [],
    recommended,
    seasons,
  };
}

// ─── JSON API parsers ──────────────────────────────────────────────

export function parseAnimeFromJson(data) {
  if (!data.ok) throw new Error('Invalid JSON API response');
  const d = data.data.anime;
  return {
    anime: {
      id: String(d.id), animeId: String(d.id),
      name: d.title, jname: d.native || null,
      synonyms: d.alternative || null, japanese: d.native || null,
      poster: upscalePosterUrl(d.poster), description: d.description?.replace(/<[^>]+>/g, '') || null,
      type: d.terms_by_type?.type?.[0] || null, rating: d.rating || null,
      episodes: { sub: d.is_sub || null, dub: d.is_dub || null },
      duration: d.duration || null, premiered: null, aired: d.aired || null,
      broadcast: null, status: d.status || null, score: null,
      episodesTotal: parseInt(d.episodes, 10) || null, country: null,
      genres: d.terms_by_type?.genre || [],
      studios: d.terms_by_type?.studios || [],
      producers: d.terms_by_type?.producers || [],
      malId: d.mal_id || null, alId: d.ani_id || null,
    },
    related: [], recommended: [], seasons: [],
  };
}

export function parseEpisodesFromJson(data) {
  if (!data.ok) throw new Error('Invalid JSON API response');
  const anime = data.data.anime;
  const episodesList = data.data.episodes || [];
  return {
    totalEpisodes: episodesList.length,
    malId: anime.mal_id || null,
    alId: anime.ani_id || null,
    episodes: episodesList.map(ep => ({
      number: ep.number,
      title: ep.title || `${anime.title} - Episode ${ep.number}`,
      isFiller: false,
      hasSub: !!ep.embed_url?.sub,
      hasDub: !!ep.embed_url?.dub,
      sources: {
        ...(ep.embed_url?.sub ? { sub: ep.embed_url.sub } : {}),
        ...(ep.embed_url?.dub ? { dub: ep.embed_url.dub } : {}),
      },
    })),
  };
}

// ─── Smart merge: JSON + HTML data ─────────────────────────────────
export function mergeAnimeData(jsonResult, htmlResult) {
  const j = jsonResult?.anime || {};
  const h = htmlResult?.anime || {};

  // Helper: pick first value that's not null/undefined/empty-string/"unknown"
  const val = (...args) => {
    for (const v of args) {
      if (v !== null && v !== undefined && v !== '' && v !== 'unknown') return v;
    }
    return args[0]; // return first even if null
  };

  // Helper: pick best array (not empty, not just ["unknown"])
  const arr = (jsonArr, htmlArr) => {
    const jArr = (jsonArr || []).filter(v => v && v !== 'unknown');
    const hArr = (htmlArr || []).filter(v => v && v !== 'unknown');
    if (jArr.length > 0) return jArr;
    if (hArr.length > 0) return hArr;
    // Both empty after filtering - use raw arrays
    return (jsonArr?.length > 0) ? jsonArr : (htmlArr || []);
  };

  // Clean duration (remove duplicate "min")
  const cleanDuration = (d) => {
    if (!d) return null;
    return d.replace(/\s*min\s*min$/i, ' min').replace(/min min$/i, 'min').trim() || null;
  };

  const merged = {
    id: val(j.id, h.id),
    animeId: val(j.animeId, h.animeId),
    name: val(j.name, h.name),
    jname: val(j.jname, h.jname),
    synonyms: val(j.synonyms, h.synonyms),  // JSON has full semicolon list
    japanese: val(j.japanese, h.japanese),
    poster: val(j.poster, h.poster),
    description: val(h.description, j.description),  // HTML description is usually richer
    type: val(h.type, j.type),                       // HTML type is more accurate
    rating: val(h.rating, j.rating),
    episodes: {
      sub: val(j.episodes?.sub, h.episodes?.sub),
      dub: val(j.episodes?.dub, h.episodes?.dub),
    },
    duration: cleanDuration(val(h.duration, j.duration)),
    premiered: val(h.premiered, j.premiered),
    aired: val(h.aired, j.aired),
    broadcast: val(j.broadcast, h.broadcast),
    status: val(h.status, j.status),
    score: val(h.score, j.score),
    episodesTotal: val(j.episodesTotal, h.episodesTotal),
    country: val(j.country, h.country),
    genres: arr(j.genres, h.genres),
    studios: arr(j.studios, h.studios),
    producers: arr(j.producers, h.producers),
    malId: val(j.malId, h.malId),
    alId: val(j.alId, h.alId),
  };

  const jsonRelated = jsonResult?.related || [];
  const htmlRelated = htmlResult?.related || [];
  const jsonRecommended = jsonResult?.recommended || [];
  const htmlRecommended = htmlResult?.recommended || [];

  const seen = new Set();
  const dedupe = (items) => (items || []).filter(item => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  return {
    anime: merged,
    seasons: htmlResult?.seasons || [],
    related: dedupe([...jsonRelated, ...htmlRelated]),
    recommended: dedupe([...jsonRecommended, ...htmlRecommended]),
  };
}
