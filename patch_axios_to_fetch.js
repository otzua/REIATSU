import fs from 'fs';

const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

// We will implement a small fetch helper to replace axios
const fetchHelper = `
async function fetchJson(url, options = {}) {
  const { params, method = 'GET', body, timeout = 10000, ...rest } = options;
  const urlObj = new URL(url);
  if (params) {
    Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key]));
  }
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const fetchOptions = {
      method,
      signal: controller.signal,
      ...rest
    };
    if (body) {
      fetchOptions.body = JSON.stringify(body);
      fetchOptions.headers = { ...fetchOptions.headers, 'Content-Type': 'application/json' };
    }
    const res = await fetch(urlObj.toString(), fetchOptions);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const data = await res.json();
    return { data };
  } finally {
    clearTimeout(id);
  }
}
`;

// Insert the fetchHelper after imports
content = content.replace("import { HanimeClient } from '../hanime/dist/index.js';", "import { HanimeClient } from '../hanime/dist/index.js';\n" + fetchHelper);

// Replace all axios.get with fetchJson
content = content.replace(/await axios\.get\(/g, "await fetchJson(");

// Replace all axios.post with fetchJson(..., { method: 'POST', body: ... })
content = content.replace(/await axios\.post\(([^,]+),\s*(\{[\s\S]*?\})\s*,\s*(\{.*?\})\s*\)/g, "await fetchJson($1, { method: 'POST', body: $2, ...$3 })");
content = content.replace(/await axios\.post\(([^,]+),\s*(\{[\s\S]*?\})\s*\)/g, "await fetchJson($1, { method: 'POST', body: $2 })");

// Remove axios import
content = content.replace("import axios from 'axios';\n", "");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced axios with fetchJson!');
