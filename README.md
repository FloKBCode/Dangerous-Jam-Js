# TRUST NO ONE

## Description
TRUST NO ONE is a 2D runner game made with P5.js.
The player runs automatically and must jump or crouch to avoid obstacles.
The game contains three phases where the rules change and the player must adapt to survive.

## Gameplay
The character runs automatically from left to right.
The player must react quickly to obstacles and objects appearing in the world.

### Controls
- Jump: Arrow Up or Space  
- Crouch: Arrow Down or S  
- Start Game: Enter  
- Pause/Resume: P  
- Restart after Game Over: R

### Objective
Survive as long as possible and reach the highest score.
The score increases with the distance traveled.

## Game Phases

### Phase 1 — Calm
The world looks safe and colorful.
- Coins = +10 points
- Spikes = -3 HP
- Blue diamond = +3 HP
- Barriers = -3 HP

### Phase 2 — Fear
The environment becomes darker and the rules change.
- Coins = -3 HP ⚠️
- Spikes = +3 HP + 5 points ⚠️
- Blue diamond = -3 HP ⚠️
- Barriers = -3 HP

### Phase 3 — Chaos
The world becomes hostile and unpredictable.
- Coins = -3 HP ⚠️
- Blue diamond = +3 HP + 5 points
- Red diamond = -6 HP ⚠️
- Barriers = -3 HP

## Technologies
- HTML
- CSS
- JavaScript
- P5.js

## Installation
1. Download the project
2. Open index.html in your browser

## Project Structure
index.html — main entry point  
css/style.css — styles and visual effects  
js/sketch.js — main game loop  
js/player.js — player movement  
js/world.js — world generation  
js/obstacle.js — obstacles  
js/phaseManager.js — phase management  
js/ui.js — user interface  
js/screens.js — start, pause and game over screens  
assets/ — sprites and sounds  

## Team
- 🔧 Florence — Lead Developer
- ⚡ Marly — Developer
- 🎨 Sarah — Developer
- 📋 Mariame — Documentation

## Play Online
[**Play TRUST NO ONE on itch.io**](https://itch.io/)