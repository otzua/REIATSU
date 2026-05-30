import fs from 'fs';
const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "console.log('Series Slug:', seriesSlug, 'Episodes length:', episodes.length);",
  "console.log('Series Slug:', seriesSlug, 'Episodes length:', episodes.length, 'Series Data:', JSON.stringify(seriesRes.data));"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched again!');
