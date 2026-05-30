# REIATSU (霊圧) - Open Source Multimedia Platform

<div align="center">
  <img src="./reiatsu_banner_1778080050417.png" alt="REIATSU Banner" width="100%">
  <br />
  <p><i>The ultimate open-source, self-hosted streaming service for Anime, Movies, and Music.</i></p>
  
  ![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)
  ![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TS-blue?style=for-the-badge)
  ![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=for-the-badge)
  ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
</div>

---

## Overview

Reiatsu is a self-hosted multimedia platform designed for streaming anime, movies, and music. Originally built as a personal project, it provides a unified interface without trackers or restricted accessibility. It focuses on speed, privacy, and a customized frontend experience.

## Features

- **Open Source**: Fully open source, allowing you to audit the code and self-host your data.
- **Privacy Focused**: No telemetry or external trackers. Your watch history and data remain local.
- **Unified Media Interfaces**:
  - **Anime**: Stream anime with integrated scheduling.
  - **Cinema**: Movie and TV series interface featuring a 12-month release calendar with timeline navigation and TMDB proxying to prevent ISP blocking.
  - **Music**: Music portal with YouTube Music stream resolution, dynamic artist pages, and integrated lossless FLAC background downloading via SpotiFLAC.
- **Cross-Section Tracking**: Automatically tracks progress across all sections with persistent local history logs and a dedicated MyList page.
- **HLS Segment Proxy**: A backend system to bypass CDN restrictions and ensure stable video playback across all regions.
- **Global Search**: Press `/` to search across all media types instantly.
- **Custom UI**: Features a high-contrast vintage design with real-time backdrop blurring and reactive halftone backgrounds.

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Framer Motion, Hls.js
- **Anime/Beyond API (Hono)**: Node.js service for stream resolution, AlphaAPIs extraction, Miruro provider integration with Hanime fallback, and HLS proxying.
- **Cinema API**: Frontend/backend integration utilizing TMDB via dedicated proxies.
- **Music API (FastAPI)**: Python backend utilizing `ytmusicapi`, `yt-dlp`, and the custom `SpotiFLAC` downloading engine.
- **Design**: Vanilla CSS Modules.

## Project Structure

```text
REIATSU/
├── frontend/           # The core React + Vite application
├── anime-api/          # API for Anime & Beyond extraction, Miruro provider + HLS Proxy
├── music-api/          # FastAPI backend for music, artist/album lookup, and streaming proxy
├── SpotiFLAC-Module-Version-main/ # Lossless background FLAC downloader integration
├── ocean-api/          # Legacy/Backup extraction logic
└── config/             # Global configuration tokens
```

## Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/otzua/REIATSU.git
   cd REIATSU
   ```

2. **Run the application:**
   Each directory contains its own dependencies and local server configuration. You can run the entire stack using the root `package.json` scripts:
   ```bash
   npm run dev
   ```

   - **Frontend**: Runs on port 5173
   - **Anime API**: Runs on port 4001
   - **Music API**: Runs on port 8000

## Contributing

While Reiatsu is developed primarily as a closed-circle project for personal use, it remains open-source. Suggestions, bug reports, and improvements are welcome.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## Roadmap

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Created by [otzua](https://github.com/otzua).

