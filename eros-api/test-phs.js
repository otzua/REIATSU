import phsearch from 'phsearch';

(async () => {
  try {
    const s = await phsearch.search('milf');
    console.log("Success! Found:", s.length);
    if(s.length > 0) {
      console.log(s[0]);
    }
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
})();
