import cloudscraper from 'cloudscraper';

(async () => {
  try {
    const res = await cloudscraper.get('https://www.eporner.com/');
    console.log("Success! Length:", res.length);
  } catch (e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
})();
