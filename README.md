# REIATSU (霊圧)

A high-performance, self-hosted anime streaming platform built with a brutalist digital aesthetic.

![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TS-blue?style=for-the-badge)

## 🌌 The Vision | ビジョン

Reiatsu is designed for speed, stability, and a unique visual identity. Moving away from generic streaming layouts, it utilizes a high-contrast "Vintage Digital" aesthetic inspired by classic poster design and halftone printing.

## 🚀 Features | 特徴

- **Interactive Halftone Engine**: A custom-built Canvas background with mouse-reactive wave interference patterns.
- **Neo-Vintage UI**: A premium dark theme using the Pantone-inspired color palette (`#1A1A1A` and `#DCC9A9`).
- **High-Performance Streaming**: Optimized frontend logic designed for zero-lag interactions even on low-end devices.
- **Multilingual Support**: Built-in support for Japanese typography (`Noto Sans JP`).

## 🛠️ Tech Stack | 技術スタック

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Vanilla CSS Modules (Brutalist Design System)
- **Animation**: Framer Motion & Custom Canvas API
- **Backend**: Node.js / TypeScript (In Development)

## 📈 Performance | パフォーマンス

The project prioritizes low-level optimizations to ensure smooth 60FPS rendering:
- **DPR Scaling**: Intelligent canvas scaling to maintain sharpness without taxing the GPU.
- **Interference Math**: Pre-calculated wave factors to reduce per-frame CPU cycles.
- **Non-Linear Falloff**: Optimized proximity detection for interactive elements.

## 🗺️ Roadmap | ロードマップ

### Phase 1: Foundation (Current)
- [x] High-performance Halftone Engine
- [x] Dark Mode Design System
- [x] Project Structure & Git Integration

### Phase 2: Core UI
- [ ] Minimalist Brutalist Navbar
- [ ] Anime Metadata Grid
- [ ] Dynamic Search Overlay

### Phase 3: Streaming & API
- [ ] Integration with High-Performance Anime-API
- [ ] HLS Video Player Customization
- [ ] Global State Management (Zustand)

## 📦 Getting Started | 開始方法

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/otzua/REIATSU.git
   ```
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🎨 Design System | デザイン

| Color | Hex | Purpose |
| --- | --- | --- |
| Deep Black | `#1A1A1A` | Background / Void |
| Premium Cream | `#DCC9A9` | Text / Accents |
| Accent Red | `#B83A2D` | Highlights |
| Forest Green | `#4E6851` | Secondary |

---

*Built with passion by [otzua](https://github.com/otzua).*
