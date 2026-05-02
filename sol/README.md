# SOL 🔴
### *Your red dot on a red planet.*

> One planet. Eight billion dots. Plant yours.

A collaborative terraforming experience — every marker planted nudges Mars a little closer to life.

---

## Stack
- **Three.js** — 3D Mars globe
- **Supabase** — realtime dot storage
- **Claude API** — AI mission log generation
- **Vite** — build tool
- **Vercel** — hosting + edge functions

---

## Setup

### 1. Clone & install
```bash
git clone https://github.com/you/sol
cd sol
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
```
Fill in:
- `VITE_SUPABASE_URL` — from your Supabase project settings
- `VITE_SUPABASE_ANON_KEY` — from Supabase project settings
- `VITE_APP_URL` — your deployment URL

### 3. Supabase schema
In your Supabase dashboard → SQL Editor, run `supabase-schema.sql`.

### 4. Mars texture (optional but recommended)
Download the NASA Mars surface texture:
- Source: https://nasa3d.arc.nasa.gov/detail/mar0kuu2 (free, public domain)
- Save as: `public/textures/mars.jpg`
- Without it, the globe renders with a solid procedural color (still looks fine).

### 5. Claude API (mission logs)
- Add `ANTHROPIC_API_KEY` to your **Vercel environment variables** (never in `.env` client-side)
- The edge function lives at `api/mission-log.js`
- Without the key, mission logs fall back to a template-based version

### 6. Dev server
```bash
npm run dev
```

### 7. Deploy
```bash
npm run build
# Deploy dist/ to Vercel, Netlify, or any static host
# Vercel will auto-detect the /api folder for edge functions
```

---

## Project Structure
```
sol/
├── index.html              # App shell
├── api/
│   └── mission-log.js      # Vercel Edge Function (Claude API proxy)
├── public/
│   └── textures/
│       └── mars.jpg        # NASA Mars texture (you provide)
├── supabase-schema.sql     # Run this in Supabase SQL editor
└── src/
    ├── main.js             # App entry — wires everything
    ├── style.css           # Design tokens + all styles
    ├── globe.js            # Three.js Mars globe
    ├── db.js               # Supabase client + queries
    ├── ui.js               # DOM interactions
    ├── ai.js               # Mission log generation
    ├── colonies.js         # Colony auto-formation logic
    ├── resources.js        # Resource tile definitions
    ├── terraforming.js     # Progress calculation
    └── share.js            # X share card
```

---

## Features
- 🌍 **3D Mars globe** — drag to rotate, click to plant
- 🚀 **Three item types** — Rocket, Habitat, Rover
- 🔒 **Time capsules** — seal messages until a future launch window
- 🏘️ **Colony formation** — 5+ habitats auto-cluster and name themselves
- ⛏️ **Resource tiles** — ice deposits, lava tubes, ore zones give badges
- 📡 **Realtime** — see others plant live
- 🌱 **Terraforming** — Mars visually evolves as community grows
- 📝 **Mission logs** — Claude generates a personal log entry per plant
- 🐦 **Share on X** — auto-composed tweet with coordinates

---

## Roadmap
- [ ] X OAuth login (persistent dot ownership)
- [ ] Mobile touch support
- [ ] OG image generation (server-side Mars screenshot per dot)
- [ ] Notification when someone plants near you
- [ ] Colony leaderboard