import xv from '@rodrigogs/xvideos';

(async () => {
  try {
    console.log("Searching...");
    const s = await xv.videos.search({ k: 'milf' });
    console.log("Success! Found:", s.videos.length);
    if (s.videos.length > 0) {
      console.log(s.videos[0]);
      
      const v = await xv.videos.details(s.videos[0]);
      console.log(v);
    }
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
})();
