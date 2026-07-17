import ytdl from 'youtube-dl-exec';

(async () => {
  try {
    const videoUrl = 'https://www.eporner.com/video-iIeJ3aXn0kG/I-gave-this-girl-princess-treatment/';
    const info = await ytdl(videoUrl, {
      dumpJson: true,
      noWarnings: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true
    });
    
    console.log("Formats available:");
    info.formats.forEach(f => {
      console.log(f.format_id, f.url.substring(0, 50));
    });
  } catch(e) {
    console.error(e);
  }
})();
