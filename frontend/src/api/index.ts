const BASE_URL = 'https://anime-api-henna.vercel.app/anime/gogoanime';

export const fetchTrending = async (page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/top-airing?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch trending');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

export const searchAnime = async (query: string, page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/${query}?page=${page}`);
    if (!response.ok) throw new Error('Failed to search anime');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching anime:', error);
    return [];
  }
};

export const fetchAnimeInfo = async (id: string) => {
  try {
    const response = await fetch(`${BASE_URL}/info/${id}`);
    if (!response.ok) throw new Error('Failed to fetch info');
    return await response.json();
  } catch (error) {
    console.error('Error fetching info:', error);
    return null;
  }
};

export const fetchEpisodeSources = async (episodeId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/watch/${episodeId}`);
    if (!response.ok) throw new Error('Failed to fetch sources');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sources:', error);
    return null;
  }
};
