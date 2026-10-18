---
name: interactive-clothing-rail
description: Builds and deploys interactive 3D retail clothing rail sliders inspired by luxury fashion drops (Higgsfield 'Off the Rail'). Enforces 1:1 scale physics, exponential neighbor push math, Web Audio friction sound, 3D hanger flip transitions, mobile floating navigation, and automated garment asset standardization.
---

# Interactive 3D Retail Clothing Rail Engine

Use this skill whenever the user requests:
- An interactive clothing rack, clothing rail, or fashion garment slider.
- High-converting boutique retail experiences inspired by Higgsfield's *"Off the Rail"*.
- 3D hanger swivel physics, interactive clothes push-aside effects, or fabric breeze sway.
- Virtual showrooms, fashion drops, streetwear collection lookbooks, or luxury retail interfaces.

---

## 📐 Golden Architectural Mandates

### 1. The 1:1 Scale Consistency Rule (NEVER Shrink Side Profiles)
* **The Trap:** Side-profile images of hanging clothes are narrower than front images. Placing both in fixed-width containers or using naive object-contain crushes the side view into a miniature 120px silhouette, destroying realism.
* **The Rule:** Front and side garment images MUST share the exact same physical height (h-[390px] sm:h-[410px]) with max-w-none. A side-hanging sleeve and a front-facing sleeve must match 1:1 in vertical proportions.

### 2. The =4$ Hook Apex Calibration Rule
* All garment photos (front and side) must be mounted on a standardized canvas (e.g., \text{px}$ canvas height).
* The top-most non-zero pixel of the metal hanger hook (the apex) MUST sit exactly at pixel row =4$.
* This guarantees that when clothes slide along the rail bar, the hooks remain seated flush on the rail line without vertical bouncing.

### 3. Pure Cutouts & Light Ambient Contact Shadows
* Garments must be isolated on 100% transparent alpha channels (.png or .webp).
* **NEVER** apply heavy dark gaussian drop-shadows (drop-shadow-2xl or black halos) behind garments. Real studio fashion photography relies on clean edge definition and soft ambient contact shadows (gba(0, 0, 0, 0.05)).

### 4. Zero External Audio Assets (Web Audio API Synthesis)
* Do not load .mp3 files for mechanical rail sounds (avoids network delays, 404s, and mobile autoplay blocks).
* Synthesize the metallic friction sound procedurally via Web Audio API bandpass-filtered triangle oscillators (osc.frequency: 340Hz -> 150Hz, ilter: 850Hz, duration: 50ms).

### 5. Mobile-First Interaction (Floating Navigation & Touch Gestures)
* Touchscreens do NOT support mouse hover. Never rely exclusively on hover states.
* On mobile screens (< 640px):
  * Provide floating circular navigation buttons (< and >) at the edges of the rail.
  * Listen for horizontal touch swipe gestures (onTouchStart / onTouchEnd).
  * Translate the rail container dynamically so the active garment is **dead-center in the smartphone screen**.
  * Provide a [⊞ View All] toggle to let users view all garments resting sideways across the rail.

---

## 🧮 Mathematical Physics Models

### A. Physical Push-Aside Neighbor Displacement
When garment $ expands to front-facing view, neighbors push outward along the rail:

\text{Displacement}(j) = \begin{cases} 
-D_0 \cdot e^{k \cdot (j - i)} & \text{if } j < i \quad (\text{left neighbors}) \\
+D_0 \cdot e^{-k \cdot (j - i)} & \text{if } j > i \quad (\text{right neighbors}) \\
0 & \text{if } j = i \quad (\text{active piece})
\end{cases}

* Recommended parameters:  = 105\text{px}$,  = 0.4$.
* **Pendulum Tilt:** The nearest neighbor tilts by $\pm 2.5^\circ$ (	ransform-origin: 50% 0px), decaying to ^\circ$ after \text{ms}$.

### B. 3D Detail Modal Hanger Flip
When stepping through garments in the detail modal (ChevronLeft / ChevronRight):
* **Phase 1 (Out):** Current garment rotates in 3D: 	ransform: perspective(1000px) rotateY(-80deg) scale(0.95) skewY(2deg) with opacity fading to .15$.
* **Phase 2 (In):** Next garment enters from otateY(80deg) into otateY(0deg) with @keyframes clothBreeze fabric oscillation settling.

---

## 🖼️ Garment Asset Preparation Workflow

### Option 1: User Uploads Their Own Photos
If the user provides garment images:
1. Ensure both **Front View** and **Side Profile View** exist for each product.
2. If side photos are missing, run scripts/generate_side_mockup.py to synthesize a side drape proxy or ask user for profile shots.
3. Run the automated asset standardization script:
   `ash
   python scripts/standardize_garment_assets.py --input raw_photos/ --output public/assets/garments/ --apex-y 4 --height 760
   `

### Option 2: Generating Mockups with AI (e.g. Imagen / Midjourney / Blender)
When generating garment assets from scratch:
* **Front View Prompt:**
  "Studio fashion catalog photography of [garment description] hanging on a sleek wooden hanger with thin chrome metal hook, isolated on pure white background, perfectly centered, ultra-sharp textile details, soft studio lighting, full body shot."
* **Side Profile View Prompt:**
  "Studio fashion catalog photography side profile view of [garment description] hanging on a slim wooden hanger viewed from the side with vertical chrome hook, draped fabric silhouette, isolated on pure white background, realistic textile fold, 8k."
* Remove white backgrounds with embg (embg i input.jpg output.png) and calibrate with standardize_garment_assets.py.

---

## 📦 Component Blueprint

The system consists of 4 modular React components:
1. ClothingRail.tsx: Master coordinator managing rail state (ctiveIndex = null for all-sideways resting mode), displacement math, Web Audio friction, mobile floating arrows, and touch swiping.
2. RailHanger.tsx: Physical hanger component rendering the side and front image layers with width transitions (65px resting $\to$ 280px active) and fabric breeze keyframes.
3. RailOverviewHud.tsx: Minimalist product title, price, and "SEE AVAILABILITY" button positioned directly below the active cloth hem.
4. ProductDetail.tsx: Focused 3D modal with Y-axis swivel transitions, colorway swatches, size selector, and Add to Bag cart actions.
