import pkg from '@consumet/extensions';
// @consumet/extensions structure: pkg.PROVIDERS.ADULT.Eporner ?
console.log(Object.keys(pkg));
const Eporner = pkg.PROVIDERS ? pkg.PROVIDERS.ADULT.Eporner : undefined;

(async () => {
  try {
    if (!Eporner) {
      console.log("Eporner not found in providers");
      process.exit(1);
    }
    const ep = new Eporner();
    const s = await ep.search('milf');
    console.log("Success! Found:", s.results.length);
    if(s.results.length > 0) {
      console.log(s.results[0]);
      
      const v = await ep.fetchVideoSources(s.results[0].id);
      console.log(v);
    }
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
})();
