// Simple mock feed for Beyond portal
export default async function handler(req, res) {
  res.status(200).json([
    {
      id: "beyond-demo-1",
      title: "Beyond the Horizon",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://placehold.co/400x225",
      description: "A mysterious journey beyond the known world.",
      pubDate: "2026-05-12"
    }
  ]);
}
