import fs from 'fs';
const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "let searchRes = await fetchJson(`${WATCHHENTAI_API}/search`, { params: { q: cleanTitle }, timeout: 8000 });",
  "console.log('cleanTitle:', cleanTitle);\n      let searchRes = await fetchJson(`${WATCHHENTAI_API}/search`, { params: { q: cleanTitle }, timeout: 8000 });\n      console.log('searchRes results length:', searchRes.data?.data?.results?.length);"
);

content = content.replace(
  "const fallbackSlug = slug.replace(/-/g, '-').replace(/(\\d+)$/, 'episode-$1');",
  "console.log('Executing fallback block! fallbackSlug:', slug.replace(/-/g, '-').replace(/(\\d+)$/, 'episode-$1'));\n        const fallbackSlug = slug.replace(/-/g, '-').replace(/(\\d+)$/, 'episode-$1');"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched!');
