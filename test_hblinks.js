const url = "https://hblinks.org/archives/113030";
fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }})
  .then(r => r.text())
  .then(t => {
    // try to find iframe or download links
    const matches = t.match(/<iframe[^>]+src="([^"]+)"/g);
    console.log("iframes:", matches);
    const links = t.match(/<a[^>]+href="([^"]+)"/g);
    console.log("links:", links?.slice(0, 10));
  })
  .catch(console.error);
