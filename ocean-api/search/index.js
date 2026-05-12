// Search handler
export default async function handler(req, res) {
  const { q } = req.query;
  res.status(200).json([
    {
      id: "beyond-demo-1",
      title: "Beyond the Horizon (Search: " + q + ")",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://placehold.co/400x225",
      description: "Match found for " + q
    }
  ]);
}
