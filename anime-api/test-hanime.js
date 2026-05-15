import { HanimeClient } from './hanime/dist/index.js';
const client = new HanimeClient();
client.getHentaiVideo('overflow-episode-1').then(console.log).catch(console.error);
