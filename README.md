# REIATSU (霊圧)

<div align="center">
  <img src="./reiatsu_banner_1778080050417.png" alt="REIATSU Banner" width="100%">
  <br />
  <p><i>A high-performance, self-hosted anime streaming platform built with a brutalist digital aesthetic.</i></p>
  
  ![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)
  ![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TS-blue?style=for-the-badge)
  ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
</div>

---

## 🌌 The Vision | ビジョン

Reiatsu is designed for speed, stability, and a unique visual identity. Moving away from generic streaming layouts, it utilizes a high-contrast "Vintage Digital" aesthetic inspired by classic poster design and halftone printing.

## 🚀 Features | 特徴

- **Interactive Halftone Engine**: A custom-built Canvas background with mouse-reactive wave interference patterns.
- **Neo-Vintage UI**: A premium dark theme using the Pantone-inspired color palette (`#1A1A1A` and `#DCC9A9`).
- **High-Performance Streaming**: Optimized frontend logic designed for zero-lag interactions even on low-end devices.
- **Multilingual Support**: Built-in support for Japanese typography (`Noto Sans JP`).

## 🛠️ Tech Stack | 技術スタック

- **Frontend**: React 18, Vite, TypeScript, Framer Motion
- **Backend**: Node.js, Express, TypeScript (Integration with High-Performance Anime-API)
- **Styling**: Vanilla CSS Modules (Brutalist Design System)
- **Animation**: Custom Canvas API for background interference

## 📁 Project Structure | プロジェクト構造

```text
REIATSU/
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages
│   │   └── styles/     # Global CSS and Design Tokens
├── backend/            # Node.js + Express server
│   ├── src/
│   │   ├── routes/     # API Endpoints
│   │   └── services/   # Business logic & Scrapers
└── docs/               # Project documentation
```

## 📦 Getting Started | 開始方法

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/otzua/REIATSU.git
   cd REIATSU
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Setup Backend:**
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```

## 📈 Performance | パフォーマンス

The project prioritizes low-level optimizations to ensure smooth 60FPS rendering:
- **DPR Scaling**: Intelligent canvas scaling to maintain sharpness without taxing the GPU.
- **Interference Math**: Pre-calculated wave factors to reduce per-frame CPU cycles.
- **Non-Linear Falloff**: Optimized proximity detection for interactive elements.

## 🎨 Design System | デザイン

| Color | Hex | Purpose |
| --- | --- | --- |
| Deep Black | `#1A1A1A` | Background / Void |
| Premium Cream | `#DCC9A9` | Text / Accents |
| Accent Red | `#B83A2D` | Highlights |
| Forest Green | `#4E6851` | Secondary |

## 🗺️ Roadmap | ロードマップ

- [x] High-performance Halftone Engine
- [x] Dark Mode Design System
- [ ] Minimalist Brutalist Navbar
- [ ] Anime Metadata Grid
- [ ] Integration with High-Performance Anime-API
- [ ] HLS Video Player Customization

## 📄 License | ライセンス

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with passion by [otzua](https://github.com/otzua).*
