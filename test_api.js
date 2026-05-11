import { anime } from './anime-api/providers/anikai/index.js';

anime.getHome().then(res => {
    console.log("Spotlight:");
    res.spotlightAnimes.slice(0, 3).forEach(a => console.log(a.name, a.poster));
    console.log("Latest:");
    res.latestEpisodeAnimes.slice(0, 3).forEach(a => console.log(a.name, a.poster));
}).catch(console.error);
