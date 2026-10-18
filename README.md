# 🧥 Interactive 3D Retail Clothing Rail Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React 18+](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)

A hyper-realistic, physics-driven 3D interactive clothing rail for modern e-commerce drops and virtual showrooms. Inspired by luxury retail drops (such as Higgsfield's viral *"Off the Rail"* drop).

---

## ✨ Features

- **🎯 1:1 Scale Consistency:** Side-profile silhouette and front-facing view share identical real-world vertical proportions (h-[390px] sm:h-[410px]). No miniature side artifacts.
- **⚡ Exponential Neighbor Push Math:** When an item is pulled forward, adjacent garments smoothly push aside along the rail with exponential damping ( \cdot e^{-k \Delta}$) and a natural pendulum tilt ($\pm 2.5^\circ$).
- **🔊 Zero-Asset Metallic Audio:** Synthesizes the physical friction of steel hangers scraping against a steel rod in real-time via the **Web Audio API** — zero MP3s or network requests required.
- **🔄 3D Swivel Hanger Flip:** Navigating through garments in the detail modal triggers physical 3D Y-axis swivels (otateY(-80deg) $\to$ otateY(0deg)) paired with a @keyframes clothBreeze fabric sway.
- **📱 Mobile-First Experience:** 
  - Floating circular < and > navigation arrows.
  - Native touch swipe support (drag thumb left/right to browse).
  - Dynamic active garment centering.
  - [⊞ View All] toggle to inspect all pieces resting sideways across the rail.
- **🛠️ Automated Asset Standardization Pipeline:** Built-in Python CLI tools to automatically detect hook apex coordinates, standardize apex rows to =4$, and export web-ready transparent PNGs.

---

## 🚀 Quickstart

### 1. Clone & Run the Template
`ash
git clone https://github.com/your-username/interactive-clothing-rail.git
cd interactive-clothing-rail
npm install
npm run dev
`

### 2. Install as an AI Agent Skill (Antigravity / Claude Code / Cursor)
Copy the SKILL.md file into your agent's skills directory:
`ash
# For Google Antigravity
cp SKILL.md ~/.gemini/config/skills/interactive-clothing-rail/SKILL.md

# For Claude Code / Cursor
cp SKILL.md .cursor/skills/interactive-clothing-rail.md
`
Once installed, simply prompt your agent:
> *"Build an interactive clothing rail slider for my streetwear brand using interactive-clothing-rail."*

---

## 📸 Asset Requirements (How to Prepare Your Clothes)

To achieve retail realism, each product needs **two transparent PNG images**:

| Asset Name | Description | Canvas Size | Calibration Standard |
| :--- | :--- | :--- | :--- |
| *-front.png | Front view on hanger | 565 × 760 px | Hook apex locked at row =4$ |
| *-side.png | Side drape view on hanger | 200 × 760 px | Hook apex locked at row =4$ |

### Automated Standardization Script
You don't need to manually align pixels in Photoshop. Place your raw cutout images in a folder and run:

`ash
python scripts/standardize_garment_assets.py --input raw_photos/ --output public/assets/garments/ --apex-y 4 --height 760
`
This script:
1. Automatically detects the highest non-zero pixel of the metal hanger hook.
2. Centers the garment horizontally.
3. Scales the canvas so the apex sits exactly at row =4$.

### Generating Mockups with AI (Midjourney / Flux / Imagen / Blender)
If you do not have physical photos:
1. **Front View Prompt:**
   > Studio fashion catalog photography of [describe piece, e.g. oversized streetwear hoodie] hanging on a minimalist dark wooden hanger with vertical chrome metal hook, pure white background, perfectly centered, ultra-sharp textile detail, soft diffused lighting.
2. **Side Profile Prompt:**
   > Studio fashion catalog photography side profile view of [describe piece] hanging on a slim wooden hanger viewed from the side, chrome hook, natural fabric drape silhouette, pure white background, 8k.
3. Remove backgrounds using embg:
   `ash
   rembg i raw_front.jpg public/assets/garments/my-hoodie-front.png
   rembg i raw_side.jpg public/assets/garments/my-hoodie-side.png
   `
4. Run standardize_garment_assets.py.

---

## 📂 Repository Structure

`
├── SKILL.md                          # The AI Agent Skill definition (formulas, rules, prompt guides)
├── README.md                         # Documentation & getting started
├── package.json                      # NPM package metadata
├── scripts/
│   ├── standardize_garment_assets.py # Automatic apex alignment & scale calibration CLI
│   └── generate_side_mockup.py       # Helper to synthesize side drape from front photo
├── src/
│   ├── components/
│   │   ├── ClothingRail.tsx          # Rail stage, displacement math, mobile gestures & resting state
│   │   ├── RailHanger.tsx            # Physics hanger with width animation & breeze keyframes
│   │   ├── RailOverviewHud.tsx       # Minimalist Title + Price + "SEE AVAILABILITY" button
│   │   └── ProductDetail.tsx         # 3D hanger flip modal with colorway swatches & size picker
│   ├── audio/
│   │   └── usePipeSound.ts           # Web Audio API procedural metallic pipe friction synthesizer
│   └── styles/
│       └── rail-physics.css          # Keyframes for @keyframes clothBreeze & 3D transforms
`

---

## 📄 License
MIT License. Free for personal and commercial e-commerce applications.
