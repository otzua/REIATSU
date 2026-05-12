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

## 🌌 The Vision | ビジョン

**Reiatsu** is an open-source multimedia engine designed for speed, privacy, and aesthetic dominance. It provides a unified, self-hosted platform for streaming **Anime**, **Movies**, and **Music** without the bloat of corporate trackers or restrictive interfaces.

Built with a high-contrast "Vintage Digital" aesthetic, Reiatsu transforms the act of consumption into an interactive experience.

## 🚀 Key Features | 特徴

- **Open Source & Transparent**: 100% open source. Audit the code, self-host the data, and contribute to the evolution.
- **Tri-Interface Ecosystem**: A single application for three distinct worlds:
  - **霊 ANIME**: High-performance anime streaming with integrated scheduling.
  - **映 CINEMA**: A cinematic gateway for movies and TV series.
  - **音 MUSIC**: A high-fidelity, aesthetic music experience (currently being rebuilt).
- **Brutalist Halftone Engine**: A unique, mouse-reactive background engine that responds to your presence.
- **Unified Command Palette**: Press `/` to search across all media types instantly.
- **Self-Hosted Privacy**: No telemetry, no trackers. You own your watch history and your data.

## 🛠️ Tech Stack | 技術スタック

- **Frontend**: React 19, Vite, TypeScript, Framer Motion
- **Anime API (Hono)**: A lightweight, high-performance Node.js service for anime scraping and metadata.
- **Cinema API (Next.js)**: A robust backend utilizing Drizzle ORM and Neon DB for movie management.
- **Design**: Vanilla CSS Modules with a focus on typography and motion.

## 📁 Project Structure | プロジェクト構造

```text
REIATSU/
├── frontend/           # The core React + Vite application
├── anime-api/          # Open-source API for anime scraping & streams
├── cinema-api/         # Scalable backend for movies & series
└── config/             # Global configuration tokens
```

## 📦 Deployment | デプロイ

### Local Development

1. **Clone the Source:**
   ```bash
   git clone https://github.com/otzua/REIATSU.git
   cd REIATSU
   ```

2. **Run All-in-One (Recommended):**
   *Each directory contains its own `package.json`. Follow the installation steps in each folder or use a workspace runner.*

   - **Frontend**: `cd frontend && npm install && npm run dev`
   - **Anime API**: `cd anime-api && npm install && npm run dev`
   - **Cinema API**: `cd cinema-api && npm install && npm run dev`

## 🤝 Contributing | 貢献する

Reiatsu is a community-driven project. We welcome all contributions—from code and documentation to UI/UX suggestions and bug reports.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🗺️ Roadmap | ロードマップ

- [x] High-performance Halftone Engine
- [x] Neo-Vintage Design System
- [x] Unified Global Search
- [x] Cinema API Integration
- [x] Anime Schedule & Tracking
- [ ] Music Section Reconstruction (Currently in progress)
- [ ] Self-Hosting Docker Suite
- [ ] PWA Support for Mobile Streaming

## 📄 License | ライセンス

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with passion and the spirit of open source by [otzua](https://github.com/otzua).*
