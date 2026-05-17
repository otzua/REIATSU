export interface ToonFeatured {
  title: string;
  image: string;
  searchUrl: string;
  srcset?: string;
}

export interface ToonEpisode {
  title: string;
  episodeNumber: {
    season?: number;
    episode?: number;
    full: string;
  };
  image: string;
  imageAlt?: string;
  url: string;
  timeAgo: string;
}

export interface ToonItem {
  title: string;
  image: string;
  url: string;
}

export interface ToonHomeData {
  featured: ToonFeatured[];
  latestEpisodes: ToonEpisode[];
  latestSeries: ToonItem[];
  latestMovies: ToonItem[];
}

const mockData: ToonHomeData = {
  featured: [
    { title: "Ben 10", image: "https://images.unsplash.com/photo-1618519764620-7403abdbf951?w=1200&q=80", searchUrl: "#" },
    { title: "Teen Titans", image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=1200&q=80", searchUrl: "#" },
  ],
  latestEpisodes: [
    { title: "Ben 10 - Secret of the Omnitrix", episodeNumber: { full: "S01E01" }, image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80", url: "#", timeAgo: "2 hours ago" },
    { title: "Teen Titans - Final Exam", episodeNumber: { full: "S01E01" }, image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=500&q=80", url: "#", timeAgo: "4 hours ago" },
    { title: "Generator Rex - The Day That Everything Changed", episodeNumber: { full: "S01E01" }, image: "https://images.unsplash.com/photo-1580477665999-3163a6bb856d?w=500&q=80", url: "#", timeAgo: "1 day ago" },
    { title: "Young Justice - Independence Day", episodeNumber: { full: "S01E01" }, image: "https://images.unsplash.com/photo-1559981421-3e0c0d712e3b?w=500&q=80", url: "#", timeAgo: "2 days ago" },
  ],
  latestSeries: [
    { title: "Adventure Time", image: "https://images.unsplash.com/photo-1578632292332-df3af80d28bf?w=500&q=80", url: "#" },
    { title: "Regular Show", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80", url: "#" },
    { title: "Avatar: The Last Airbender", image: "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=500&q=80", url: "#" },
    { title: "The Amazing World of Gumball", image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=500&q=80", url: "#" },
  ],
  latestMovies: [
    { title: "Justice League: Doom", image: "https://images.unsplash.com/photo-1536440136628-8198177306c6?w=500&q=80", url: "#" },
    { title: "Batman: Under the Red Hood", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80", url: "#" },
  ]
};

// Proxied via vite config locally, but Vercel requires actual URL or similar in production
// We will use /toon-api for proxy
export const toonApi = {
  getHome: async (): Promise<ToonHomeData> => {
    try {
      const res = await fetch('/toon-api/home');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (!data || !data.data || !data.data.featured || data.data.featured.length === 0) {
          console.warn("Toon API returned empty data, falling back to mock data.");
          return mockData;
      }
      return data.data;
    } catch (error) {
      console.warn('Error fetching toon home, falling back to mock data:', error);
      return mockData;
    }
  }
};

