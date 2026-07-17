import xvideos from '@rodrigogs/xvideos';

(async () => {
  try {
    const s = await xvideos.videos.search({ k: 'milf' });
    console.log("Success! Found:", s.videos.length);
    console.log(s.videos[0]);
    
    // get video details
    const details = await xvideos.videos.details(s.videos[0].url);
    console.log(details.files);
  } catch (e) {
    console.error("Error:", e);
  }
})();
