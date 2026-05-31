<div align="center">
  <img src="./frontend/public/favicon.svg" alt="REIATSU Logo" width="180" height="180">
  
  [![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Inter&weight=500&size=20&pause=1500&color=A9A9A9&center=true&vCenter=true&width=600&lines=The+ultimate+self-hosted+streaming+service.;Stream+Anime,+Movies,+and+Music.;Fast,+Private,+and+Beautiful.)](https://git.io/typing-svg)
  
  ![Status](https://img.shields.io/badge/Status-Production_Ready-orange?style=for-the-badge&logo=cloudflare)
  ![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TS-blue?style=for-the-badge&logo=react)
  ![Open Source](https://img.shields.io/badge/Open%20Source-Free-red?style=for-the-badge&logo=github)
  ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
</div>

---

<br/>

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Milky%20Way.png" alt="Milky Way" width="25" height="25" /> The Vision | ビジョン

**Reiatsu (霊圧)** is a personal, premium open-source multimedia engine designed for speed, privacy, and absolute aesthetic dominance. Originally built as a passion project, it provides a unified, highly polished platform for streaming **Anime**, **Movies**, and **Music** without the bloat of corporate trackers, ads, or restrictive interfaces.

Built with a high-contrast **"Neo-Vintage Digital"** aesthetic, Reiatsu transforms the act of consumption into an interactive, visually stunning experience.

*(Insert Demo GIF here: Record a 10-second webm/gif of you navigating the platform and place it here)*
```html
<!-- <img src="./assets/demo.gif" width="100%" style="border-radius: 12px; margin-top: 20px;"> -->
```

<br/>

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png" alt="Sparkles" width="25" height="25" /> Core Features | 特徴

REIATSU is divided into three primary ecosystems, plus a hidden fourth sector. 

### 1. 霊 ANIME (Anime Streaming)
- **High-Performance Playback:** Custom HLS proxying bypasses CDN restrictions for buffer-free streaming.
- **Interactive Schedule:** View current seasonal airing schedules with beautiful card layouts.
- **MyList Integration:** Automatically tracks your watch history and progress locally.

### 2. 映 CINEMA (Movies & TV)
- **TMDB ISP-Bypass:** Dedicated API proxies bypass regional ISP blocks on movie metadata and posters.
- **12-Month Release Calendar:** A highly interactive desktop timeline to track upcoming movie and TV releases.
- **Dynamic Backdrop UI:** Glassmorphic surfaces that blur and react to the movie's cinematic posters.

### 3. 音 MUSIC (High-Fidelity Audio)
- **Lossless SpotiFLAC Integration:** Download music in true lossless **FLAC quality** in the background.
- **YouTube Music Resolution:** Seamlessly resolves and plays tracks with no ads or interruptions.
- **Live Synchronized Lyrics:** Apple Music-style flowing lyrics that sync perfectly to the beat in a dedicated view.

### 4. <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/No%20One%20Under%20Eighteen.png" alt="18+" width="25" height="25" /> BEYOND (The Secret Sector)
REIATSU features a completely hidden portal for mature content, protected by discrete trigger mechanics.
- **Access Method 1:** Tap the REIATSU logo in the top left corner **5 times rapidly**.
- **Access Method 2:** Simply press the `H` key anywhere on the site.
- **Features:** AlphaAPIs and WatchHentai stream resolution with custom HLS proxying for stable playback.

<br/>

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Keyboard.png" alt="Keyboard" width="25" height="25" /> Keyboard Shortcuts | ショートカット

Navigate the platform like a power user without touching your mouse:

| Key | Action | Description |
| :---: | :--- | :--- |
| <kbd>/</kbd> | **Global Search** | Instantly opens the command palette to search across all media types. |
| <kbd>S</kbd> | **Section Switcher** | Toggles the overlay to quickly jump between Anime, Cinema, and Music. |
| <kbd>H</kbd> | **Beyond Portal** | Instantly unlocks and teleports you into (or out of) the secret Beyond sector. |
| <kbd>Esc</kbd> | **Close Menus** | Closes any active search bars, switchers, or modal windows. |

<br/>

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Artist%20Palette.png" alt="Palette" width="25" height="25" /> Design Philosophy | デザイン

Reiatsu is built on a custom design system combining **90s Brutalism** with modern **Glassmorphism**.

- **Brutalist Halftone Engine**: A unique, mouse-reactive background engine that responds to your cursor's presence.
- **No Component Libraries:** 100% custom Vanilla CSS Modules. No Tailwind, no Bootstrap. Pure mathematical precision.
- **Self-Hosted Privacy**: No telemetry, no trackers. Your data lives and dies in your local browser storage.

<br/>

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Building%20Construction.png" alt="Construction" width="25" height="25" /> Architecture & Deployment

REIATSU is built to run effortlessly on modern serverless infrastructure.

- **Frontend:** React 19, Vite, TypeScript, Framer Motion, Hls.js *(Optimized for Cloudflare Pages)*
- **Anime/Beyond API:** Hono.js edge worker for high-speed scraping and HLS stream proxying *(Optimized for Cloudflare Workers)*
- **Music API:** FastAPI (Python) backend utilizing `ytmusicapi` and `yt-dlp` for SpotiFLAC extraction *(Optimized for Vercel)*

### Local Setup
```bash
git clone https://github.com/otzua/REIATSU.git
cd REIATSU

# Install all dependencies and start the unified local dev servers (Frontend, APIs)
npm run dev
```

<br/>

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Balance%20Scale.png" alt="Scale" width="25" height="25" /> Legal & DMCA Disclaimer | 免責事項

REIATSU is strictly an open-source multimedia indexing and proxying software interface. 

- **Zero Hosting:** This project **does not host, upload, or store any copyrighted media files** (video, audio, or otherwise) on its servers. 
- **Indexing Only:** All content presented within the application is accessed and scraped from independent, third-party services over which the developers of REIATSU have no control.
- **Personal Use:** This software is provided "as is" for educational and personal use only. Users are solely responsible for ensuring that their use of this software complies with the local laws and regulations of their jurisdiction.
- **DMCA Claims:** Any copyright infringement claims should be directed to the respective third-party hosting providers (e.g., TMDB, YouTube, etc.). Since we do not host the files, we cannot take them down.

By using this software, you acknowledge and agree to these terms.

<br/>

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Scroll.png" alt="Scroll" width="25" height="25" /> License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---
<div align="center">
  <i>Built with passion, caffeine, and the spirit of open source by <a href="https://github.com/otzua">otzua</a>.</i>
</div>
