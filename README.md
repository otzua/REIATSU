# REIATSU (霊圧) - Open Source Multimedia Platform

<div align="center">
  <img src="./frontend/public/favicon.svg" alt="REIATSU Logo" width="150" height="150">
  
  [![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Inter&weight=500&size=18&pause=1500&color=A9A9A9&center=true&vCenter=true&width=600&lines=The+ultimate+self-hosted+streaming+service.;Stream+Anime,+Movies,+and+Music.;Fast,+Private,+and+Beautiful.)](https://git.io/typing-svg)
  
  ![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)
  ![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TS-blue?style=for-the-badge)
  ![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=for-the-badge)
  ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
</div>

---

## The Vision | ビジョン

**Reiatsu** is a personal open-source multimedia engine designed for speed, privacy, and aesthetic dominance. Originally built as a passion project for friends and family, it provides a unified, self-hosted platform for streaming **Anime**, **Movies**, and **Music** without the bloat of corporate trackers or restrictive interfaces.

Built with a high-contrast "Vintage Digital" aesthetic, Reiatsu transforms the act of consumption into an interactive experience.

## Key Features | 特徴

- **Open Source & Transparent**: 100% open source. Audit the code, self-host the data, and run it for your own circle.
- **Tri-Interface Ecosystem**: A single application for three distinct worlds:
  - **霊 ANIME**: High-performance anime streaming with integrated scheduling.
  - **映 CINEMA**: A cinematic gateway for movies and TV series, now featuring an interactive **12-Month Release Calendar** with desktop-optimized timeline navigation and anti-ISP blocking TMDB proxying.
  - **音 MUSIC**: A high-fidelity, aesthetic music portal with seamless YouTube Music stream resolution, dynamic artist pages, curated album views, and integrated lossless FLAC background downloading via SpotiFLAC.
- **Unified History & MyList System**: Automatically track your progress across all sections (Anime, Cinema, Music, Beyond) with persistent local history logs and a dedicated MyList page.
- **Creator Profile / About Me**: A sleek, integrated developer profile modal showcasing tech-stack and personal links in place of bloated authentication systems.
- **Glassmorphic UI**: High-fidelity glass surfaces with real-time backdrop blurring and reactive halftone backgrounds.

## Design Philosophy | デザイン
Reiatsu is built on the **Neo-Vintage Digital** aesthetic. We combine 90s brutalism with modern glassmorphism to create an interface that feels both nostalgic and futuristic. Every element is designed to respond to user interaction, creating a living multimedia environment.

- **Brutalist Halftone Engine**: A unique, mouse-reactive background engine that responds to your presence.
- **HLS Segment Proxy**: A robust backend system to bypass CDN restrictions and ensure stable video playback across all regions.
- **Unified Command Palette**: Press `/` to search across all media types instantly.
- **Self-Hosted Privacy**: No telemetry, no trackers. You own your watch history and your data.

## Tech Stack | 技術スタック

- **Frontend**: React 19, Vite, TypeScript, Framer Motion, Hls.js (Deployed live on Vercel)
- **Anime/Beyond API (Hono)**: A lightweight, high-performance Node.js service for scraping, WatchHentai stream resolution, AlphaAPIs extraction, Miruro provider integration with Hanime fallback, and HLS proxying (Deployed live on Vercel Serverless Functions).
- **Cinema API**: A robust frontend/backend integration utilizing TMDB via dedicated proxies to bypass regional ISP blocks.
- **Music API (FastAPI)**: A powerful Python backend utilizing `ytmusicapi`, `yt-dlp`, and the custom `SpotiFLAC` lossless downloading engine.
- **Design**: Vanilla CSS Modules with a focus on typography and motion.

## Project Structure | プロジェクト構造

```text
REIATSU/
├── frontend/           # The core React + Vite application
├── anime-api/          # API for Anime & Beyond extraction, Miruro provider + HLS Proxy
├── music-api/          # FastAPI backend for music, artist/album lookup, and streaming proxy
├── SpotiFLAC-Module-Version-main/ # Lossless background FLAC downloader integration
├── ocean-api/          # Legacy/Backup extraction logic
└── config/             # Global configuration tokens
```

## Deployment | デプロイ

### Local Development

1. **Clone the Source:**
   ```bash
   git clone https://github.com/otzua/REIATSU.git
   cd REIATSU
   ```

2. **Run All-in-One (Recommended):**
   *Each directory contains its own dependencies and local server configuration. You can easily run the entire stack using the root `package.json` scripts:*

   ```bash
   npm run dev
   ```

   - **Frontend**: Runs on 5173
   - **Anime API**: Runs on 4001
   - **Music API**: Runs on 8000

## Contributing | 貢献する

While Reiatsu is developed primarily as a closed-circle project for personal use, it remains open-source. Suggestions, bug reports, and UX improvements are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap | ロードマップ

- [x] High-performance Halftone Engine
- [x] Neo-Vintage Design System
- [x] Unified Global Search
- [x] Cinema API Integration & ISP-Block Proxying
- [x] Anime Schedule & Tracking
- [x] Beyond Portal & HLS Proxy Integration
- [x] Music Section Reconstruction & Lossless Sync Engine
- [x] Interactive Cinema Release Calendar & Timeline
- [x] Cross-Section User History Tracking (MyList)
- [x] Creator Profile / About Me Modal
- [ ] Self-Hosting Docker Suite
- [ ] PWA Support for Mobile Streaming

## Legal & DMCA Disclaimer | 免責事項

REIATSU is an open-source multimedia indexing and proxying software. 
- **No Hosting:** This project **does not host, upload, or store any copyrighted media files** (video, audio, or otherwise) on its servers. 
- **Indexing Only:** All content presented within the application is accessed and scraped from independent, third-party services over which the developers of REIATSU have no control.
- **Personal Use:** This software is provided "as is" for educational and personal use only. Users are solely responsible for ensuring that their use of this software complies with the local laws and regulations of their jurisdiction.
- **DMCA:** Any copyright infringement claims should be directed to the respective third-party hosting providers. Since we do not host the files, we cannot take them down.

By using this software, you acknowledge and agree to these terms.

## License | ライセンス

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with passion and the spirit of open source by [otzua](https://github.com/otzua).*

