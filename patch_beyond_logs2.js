import fs from 'fs';
const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "const episodes = seriesRes.data?.data?.episodes || [];",
  "const episodes = seriesRes.data?.data?.episodes || [];\n          console.log('Series Slug:', seriesSlug, 'Episodes length:', episodes.length);"
);

content = content.replace(
  "if (targetUrl.includes('/videos/')) {",
  "console.log('TargetUrl before videos check:', targetUrl);\n        if (targetUrl.includes('/videos/')) {"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched again!');
