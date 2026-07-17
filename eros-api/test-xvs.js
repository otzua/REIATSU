import xv from 'xvideos-scraper';

(async () => {
  try {
    const s = await xv.searchVideo({ search: 'milf' });
    console.log("Success! Found:", s.length);
    if(s.length > 0) {
      console.log(s[0]);
      
      const v = await xv.getVideoData({ videoUrl: s[0].video });
      console.log(v);
    }
  } catch (e) {
    console.error("Error:", e);
  }
})();
