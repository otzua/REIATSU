import fs from 'fs';

const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/if \\(acceptRanges\\) c\\.header\\('Accept-Ranges', acceptRanges\\);/g, `c.header('Accept-Ranges', 'bytes');`);

fs.writeFileSync(filePath, content, 'utf8');
