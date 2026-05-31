const fs = require('fs');
const css = fs.readFileSync('frontend/src/pages/Watch.module.css', 'utf8');
const activeMatch = css.match(/\.active\b/);
console.log("activeMatch:", activeMatch ? true : false);
