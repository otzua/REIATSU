import fs from 'fs';
const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'const episodes = seriesRes.data?.data?.episodes || [];',
  `const episodes = seriesRes.data?.data?.episodes || [];
          console.log('[Details Path] Series Slug:', seriesSlug, 'Episodes length:', episodes.length, 'seriesRes data:', JSON.stringify(seriesRes.data));`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Details log patched!');
