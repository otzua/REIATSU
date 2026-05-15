import { HanimeClient } from './hanime/dist/index.js';
const client = new HanimeClient();
client.getHentaiVideo('maki-chan-to-now').then(res => console.log(res.hentai_video.id)).catch(err => console.error("ERROR", err.message, err.status));
