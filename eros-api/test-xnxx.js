import xnxx from 'xnxx-scraper';

(async () => {
  try {
    const s = await xnxx.search('milf', 1);
    console.log("Success! Found:", s.length);
    if(s.length > 0) {
      console.log(s[0]);
      
      const v = await xnxx.download(s[0].link);
      console.log(v);
    }
  } catch (e) {
    console.error("Error:", e);
  }
})();
