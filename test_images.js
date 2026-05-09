import { getHome } from './anime-api/providers/anikoto/anime.js';
getHome().then(res => {
  console.log("Spotlight poster:", res.spotlightAnimes[0]?.poster);
  console.log("New Release poster:", res.newReleases[0]?.poster);
}).catch(console.error);
