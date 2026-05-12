# REIATSU (霊圧)

<div align="center">
  <img src="./reiatsu_banner_1778080050417.png" alt="REIATSU Banner" width="100%">
  <br />
  <p><i>A high-performance, self-hosted multimedia streaming platform built with a brutalist digital aesthetic.</i></p>
  
  ![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)
  ![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TS-blue?style=for-the-badge)
  ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
</div>

---

## 🌌 The Vision | ビジョン

Reiatsu is designed for speed, stability, and a unique visual identity. It moves away from generic streaming layouts, utilizing a high-contrast "Vintage Digital" aesthetic inspired by classic poster design and halftone printing.

## 🚀 Features | 特徴

- **Tri-Interface System**: Seamlessly switch between **Anime**, **Cinema**, and **Music** interfaces.
- **Interactive Halftone Engine**: A custom-built Canvas background with mouse-reactive wave interference patterns.
- **Neo-Vintage UI**: A premium dark theme using a Pantone-inspired color palette (`#1A1A1A` and `#DCC9A9`).
- **High-Performance Streaming**: Optimized frontend logic designed for zero-lag interactions.
- **Unified Command Palette**: Global search (press `/`) that scans across anime and cinema databases.

## 🛠️ Tech Stack | 技術スタック

- **Frontend**: React 19, Vite, TypeScript, Framer Motion
- **Anime Backend**: Node.js, Hono, Scrapers (Anime-API)
- **Cinema Backend**: Next.js, Drizzle ORM, Neon DB, Postgres
- **Styling**: Vanilla CSS Modules (Brutalist Design System)

## 📁 Project Structure | プロジェクト構造

```text
REIATSU/
├── frontend/           # React + Vite application (Main UI)
├── anime-api/          # Hono-based API for anime metadata & streams
├── cinema-api/         # Next.js-based backend for movies & TV series
└── config/             # Shared configurations
```

## 📦 Getting Started | 開始方法

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/otzua/REIATSU.git
   cd REIATSU
   ```

2. **Frontend:**
   ```bash
   cd frontend && npm install && npm run dev
   ```

3. **Anime API:**
   ```bash
   cd anime-api && npm install && npm run dev
   ```

4. **Cinema API:**
   ```bash
   cd cinema-api && npm install && npm run dev
   ```

## 📈 Interfaces | インターフェース

- **霊 ANIME**: The primary interface for streaming anime with schedule and tracking.
- **映 CINEMA**: A dedicated space for movies and TV series powered by the Cinema API.
- **音 MUSIC**: (Under Reconstruction) A high-fidelity music streaming experience.

## 🗺️ Roadmap | ロードマップ

- [x] High-performance Halftone Engine
- [x] Neo-Vintage Design System
- [x] Minimalist Brutalist Navbar
- [x] Unified Search (Command Palette)
- [x] Cinema API Integration
- [x] Anime Schedule & Tracking
- [ ] Music Section Reconstruction (Wiped for fresh start)
- [ ] HLS Video Player Customization

## 📄 License | ライセンス

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with passion by [otzua](https://github.com/otzua).*
