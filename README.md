# 🚀 SpyShoot – Space Shooter (UI + Game Plan)

A minimal, retro-inspired space spy shooter with smart gameplay logic  
UI inspired by Framer Space Shooter component

## 🎮 Game Overview

- **Genre**: 2D Space Shooter / Arcade
- **Platform**: Web (HTML + Canvas + JavaScript)
- **Style**: Retro / Pixel / Minimal UI
- **Core Twist**: Not all enemies should be shot (Spy Logic)

## 🧠 Core Gameplay Loop

```
START GAME → Player moves ship → Enemies & rocks spawn → Player decides:
    - Shoot
    - Avoid
    - Scan
→ Collisions detected → Score & Energy updated → Difficulty increases → Game Over / Restart
```

## 🎨 UI Inspiration

Inspired by **Framer – Space Shooter**:
- Minimal arcade HUD
- Pixel typography
- Clean starfield background
- Simple score-first UI

## 🧩 UI Layout (Top-Down)

```
+--------------------------------------------------+
| SCORE: 1200             ENERGY: ████░░░          |
| SCAN: READY                                      |
|                                                  |
|                                                  |
|            🚀  PLAYER SHIP                        |
|                                                  |
|     🪨   👾   🪨    👽   🪨                         |
|                                                  |
|                                                  |
| MOVE: ← ↑ ↓ →   SHOOT: SPACE   SCAN: S            |
+--------------------------------------------------+
```

## 🧭 HUD Elements

### 1️⃣ Score
- **Position**: Top-Left
- **Font**: Pixel / Arcade
- **Color**: White or Neon Green

```
SCORE: 2450
```

### 2️⃣ Energy Bar
- **Position**: Top-Right
- **Visual**: Block-based bar

```
ENERGY: ████░░░
```

**Rules**:
- Shooting → −1
- Scanning → −2/sec
- Destroy enemy → + energy

### 3️⃣ Scanner Indicator
- **Position**: Under score
- **States**: READY | ACTIVE | COOLDOWN

```
SCAN: ACTIVE
```

## 🕹️ Player Controls

| Key | Action |
|-----|--------|
| ⬅️ ⬆️ ⬇️ ➡️ | Move Ship |
| SPACE | Shoot |
| S | Scanner Mode |
| P | Pause |
| R | Restart |

## 👾 Game Objects

### 🪨 Rock (Asteroid)
- Moves straight down
- Must be destroyed
- Collision with player → damage
- Bullet + Rock → +10 Score

### 👾 Alien Ship
- Zig-zag movement
- Optional shooting
- Safe to destroy
- Bullet + Alien → +20 Score

### 🛰️ Spy Alien (Special)
- Looks similar to alien ship
- Shooting is a mistake
- Bullet + Spy Alien → −30 Score, −Energy

## 🔍 Scanner Mechanic (Core Feature)

**Purpose**: Identify real enemies vs spy aliens

### Scanner Rules
- Activated with **S**
- Highlights objects:
  - 🔴 **Red** → Enemy
  - 🟢 **Green** → Spy Alien
- Drains energy continuously
- Scanner ON → Energy −2 per second

## 🧮 Difficulty Scaling

Every 30 seconds:
- Enemy speed ↑
- Spawn rate ↑
- More spy aliens

```javascript
if (timePlayed > 30s) {
  difficulty++;
}
```

## 💥 Game Over Conditions

- Energy reaches 0
- Player collides with large rock

```
GAME OVER
Press R to Restart
```

## 🛠️ Tech Stack

- HTML5 Canvas
- Vanilla JavaScript
- CSS (Pixel UI styling)
- Optional: Sound effects

## 📁 Project Structure

```
spyshoot/
├── index.html
├── style.css
├── game.js
├── package.json
├── vite.config.js
└── src/
    ├── entities/
    │   └── PlayerShip.js
    ├── systems/
    │   └── InputSystem.js
    └── utils/
        └── GameConstants.js
```

## ✨ Visual Style Guide

- **Background**: Black + starfield
- **Colors**:
  - White
  - Neon Green
  - Red (danger)
- **Animations**:
  - Small explosions
  - Screen flash on hit
- **Font**: Pixel / Arcade

## 🚀 Future Enhancements

- Boss level
- Power-ups
- Mobile touch controls
- Sound & music
- Leaderboard

## 🧠 Developer Principle

> Simple UI + Smart Logic = Fun Game

This UI keeps attention on:
- Decisions
- Timing
- Strategy

## 🔥 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## 📝 Development Status

- [x] Project structure setup
- [x] Basic HTML5 Canvas
- [x] Game loop implementation
- [x] HUD and UI styling
- [ ] Player movement system
- [ ] Shooting mechanics
- [ ] Scanner system
- [ ] Enemy spawning
- [ ] Collision detection
- [ ] Difficulty progression

---

**Let's build something fun! 🚀**