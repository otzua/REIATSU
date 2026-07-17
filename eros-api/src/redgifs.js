import axios from 'axios';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getRedgifsToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  try {
    const res = await axios.get('https://api.redgifs.com/v2/auth/temporary');
    cachedToken = res.data.token;
    tokenExpiresAt = Date.now() + 32400000;
    return cachedToken;
  } catch (err) {
    console.error('Failed to get Redgifs token:', err.message);
    throw err;
  }
}

export async function searchRedgifs(query, page = 1) {
  const token = await getRedgifsToken();
  const res = await axios.get(`https://api.redgifs.com/v2/gifs/search`, {
    params: { search_text: query, count: 24, page },
    headers: { Authorization: `Bearer ${token}` }
  });

  const gifs = res.data.gifs || [];
  return {
    videos: gifs.map(g => ({
      id: g.id,
      title: g.tags ? g.tags.join(' ') : 'Redgifs Video',
      views: g.views,
      rate: Math.floor(Math.random() * 20) + 80,
      duration: Math.round(g.duration || 0) + 's',
      added: new Date(g.createDate * 1000).toISOString().split('T')[0],
      keywords: g.tags ? g.tags.join(', ') : '',
      thumbnail: g.urls?.thumbnail || g.urls?.poster || '',
      embed: g.urls?.html || '',
      url: g.urls?.sd || g.urls?.hd || ''
    }))
  };
}

export async function getRedgifsDetails(id) {
  const token = await getRedgifsToken();
  const res = await axios.get(`https://api.redgifs.com/v2/gifs/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const g = res.data.gif;
  if (!g) throw new Error('Video not found');

  return {
    id: g.id,
    title: g.tags ? g.tags.join(' ') : 'Redgifs Video',
    views: g.views,
    rate: Math.floor(Math.random() * 20) + 80,
    duration: Math.round(g.duration || 0) + 's',
    added: new Date(g.createDate * 1000).toISOString().split('T')[0],
    keywords: g.tags ? g.tags.join(', ') : '',
    thumbnail: g.urls?.thumbnail || g.urls?.poster || '',
    embed: g.urls?.html || '',
    url: g.urls?.sd || g.urls?.hd || '',
    sources: [
      { url: g.urls?.hd, quality: '1080p' },
      { url: g.urls?.sd, quality: '720p' }
    ].filter(s => s.url)
  };
}
