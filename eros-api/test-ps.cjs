const Pornsearch = require('pornsearch');
(async () => {
  const search = new Pornsearch('milf', 'redtube');
  const videos = await search.videos();
  console.log(videos[0]);
})();
