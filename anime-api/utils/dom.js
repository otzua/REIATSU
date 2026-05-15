import * as cheerio from 'cheerio';

export function load(html) {
  return cheerio.load(html);
}

export function text($, selector, ctx = null) {
  const el = ctx ? $(selector, ctx) : $(selector);
  return el.first().text().trim() || null;
}

export function attr($, selector, attribute, ctx = null) {
  const el = ctx ? $(selector, ctx) : $(selector);
  return el.first().attr(attribute) || null;
}

export function each($, selector, fn) {
  const results = [];
  $(selector).each((i, el) => results.push(fn($(el), i)));
  return results;
}

export function num(str) {
  if (!str) return null;
  const m = str.match(/\d+/);
  if (m) {
    const n = parseInt(m[0], 10);
    return isNaN(n) ? null : n;
  }
  return null;
}
