import fs from 'fs';

const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/} catch \(error\) {\n    return c\.text\('Failed to proxy m3u8', 500\);\n  }/g, `} catch (error) {
    return c.text('Failed to proxy m3u8: ' + (error.message || error.toString()), 500);
  }`);

content = content.replace(/} catch \(error\) {\n    return c\.text\('Failed to proxy image', 500\);\n  }/g, `} catch (error) {
    return c.text('Failed to proxy image: ' + (error.message || error.toString()), 500);
  }`);

fs.writeFileSync(filePath, content, 'utf8');
