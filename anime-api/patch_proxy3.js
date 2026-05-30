import fs from 'fs';

const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/} catch \(error\) {\n    return c\.text\('Failed to proxy m3u8: ' \+ \(error\.message \|\| error\.toString\(\)\), 500\);\n  }/g, `} catch (error) {
    console.error('M3U8 Proxy Error:', error, error.stack);
    return c.text('Failed to proxy m3u8: ' + (error.message || error.toString()), 500);
  }`);

fs.writeFileSync(filePath, content, 'utf8');
