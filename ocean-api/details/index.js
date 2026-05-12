// Details handler
export default async function handler(req, res) {
  const { slug } = req.query;
  res.status(200).json({
    info: [{
      id: 1,
      urlname: slug,
      videoname: "Beyond the Horizon",
      description: "This is a detailed description for " + slug,
      releasedate: "2026-05-12",
      uploaddate: "2026-05-12",
      coverimg: "https://placehold.co/400x225",
      series: null,
      status: 1,
      recentrelease: 1
    }],
    genres: [{ genre: "Sci-Fi" }]
  });
}
