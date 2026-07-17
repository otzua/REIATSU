import pkg from '@justalk/pornhub-api';
const { search } = pkg;

(async () => {
  try {
    const s = await search('milf', 'views', null);
    console.log("Success! Found:", s.results.length);
    console.log(s.results[0]);
  } catch (e) {
    console.error("Error:", e);
  }
})();
