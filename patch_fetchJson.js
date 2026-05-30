import fs from 'fs';
const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

// Modify fetchJson to always append a timestamp to bust cache
content = content.replace(
  'const urlObj = new URL(url);',
  `const urlObj = new URL(url);
  urlObj.searchParams.append('_t', Date.now().toString());`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('fetchJson patched with cache buster!');
