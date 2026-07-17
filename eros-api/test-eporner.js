import Eporner from 'epornerapi';
// Or perhaps import * as Eporner from 'epornerapi';

(async () => {
  try {
    const e = new Eporner();
    const results = await e.search('milf');
    console.log("Success!", results.length);
    console.log(results[0]);
  } catch (err) {
    console.log("Error:", err);
  }
})();
