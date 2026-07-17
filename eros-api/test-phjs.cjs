const { PornHub } = require('pornhub.js');
const pornhub = new PornHub();

(async () => {
  try {
    const s = await pornhub.searchVideo('milf');
    console.log("Success! Found:", s.data.length);
    if(s.data.length > 0) {
      console.log(s.data[0]);
      
      const v = await pornhub.video(s.data[0].url);
      console.log(v);
    }
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
})();
