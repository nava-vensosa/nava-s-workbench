# ITP/IMA Winter Show 2025 - Poster Examples

## Overview

Three computational poster designs for the ITP/IMA Winter Show 2025, featuring:
- **Topological graphs** (torus, Möbius strip, Klein bottle)
- **Quaternion visualizations** (Hopf fibration, rotation fields)
- **Wave functions** (quantum interference, standing waves)

## Poster Variants

### 1. `poster_winter_show_2025.md` (Main)
**Theme**: Quantum Topology
- Torus topology background
- Quaternion rotation field
- Wave function interference
- Color scheme: Deep blue, cyan, electric purple
- Aesthetic: Dark, technical, data-driven

**Best for**: Digital displays, projection mapping

### 2. `poster_winter_show_2025_variant_light.md` (Coming)
**Theme**: Bright Computational
- Klein bottle topology
- Quaternion ribbons
- Fourier series visualization
- Color scheme: White background, vibrant accent colors
- Aesthetic: Clean, modern, academic

**Best for**: Print posters, daytime display

### 3. `poster_winter_show_2025_variant_glitch.md` (Coming)
**Theme**: Digital Glitch Art
- Möbius strip topology
- Quaternion noise field
- Wave collapse visualization
- Color scheme: RGB split, chromatic aberration
- Aesthetic: Glitchy, experimental, internet art

**Best for**: Social media, digital screens, youth appeal

## How to Use (Once Phase 3 is Complete)

### Load and Preview
```bash
# In MathViz console
> load examples/poster_winter_show_2025.md
> run
```

### Export Static Poster
```bash
# High-res for print (8"x12" at 300 DPI)
> export image winter_show_poster.png resolution=2400x3600
```

### Export Animated Version
```bash
# 20-second loop for digital display
> export video winter_show_animated.mp4 duration=20.0 resolution=1200x1800
```

### Export Multiple Formats
```bash
# Print
> export image poster_print.png resolution=2400x3600

# Instagram post (square)
> export image poster_square.png resolution=1080x1080

# Instagram story (vertical)
> export image poster_story.png resolution=1080x1920

# Twitter/X
> export video poster_twitter.mp4 duration=10.0 resolution=1280x720
```

## Poster Specifications

### Main Poster
- **Aspect Ratio**: 2:3 (Portrait)
- **Resolution**: 1200x1800 (preview), 2400x3600 (print)
- **Format**: PNG for print, MP4 for animation
- **Duration**: 20 seconds (animated version)
- **Colors**:
  - Background: `#0a0a12` (Dark navy)
  - Primary: `#06ffa5` (Electric cyan)
  - Secondary: `#8338ec` (Vibrant purple)
  - Accent: `#ff006e` (Hot pink)
  - Highlight: `#3a86ff` (Bright blue)

### Typography
- **Main Title**: 120pt, bold, white with glow
- **Subtitle**: 56pt, regular, electric cyan
- **Year**: 96pt, bold, vibrant purple
- **Details**: 24-32pt, varying alphas

### Visual Elements

#### Topological Graph (Torus)
- Large background element
- Wireframe rendering
- Subtle rotation animation
- Color: Muted blue (#1a4d6d)

#### Quaternion Visualization
- Vector field with magnitude coloring
- Hopf fibration paths
- Rotation over 10-20 second cycle
- Colors: Purple to blue gradient

#### Wave Functions
- Three overlapping wave equations
- Gaussian envelope
- Interference patterns
- Glow effects for quantum aesthetic
- Colors: Cyan family (#06ffa5 to #90e0ef)

#### Particle System
- 200-300 ambient particles
- Subtle motion following vector fields
- Low opacity (0.3-0.5)
- Adds depth and movement

## Design Inspiration

### ITP/IMA Aesthetic
- **Computational**: Math-driven, generative
- **Experimental**: Pushing boundaries of form
- **Technical**: Code as medium
- **Interdisciplinary**: Art + Engineering + Design

### Historical References
- Early computer graphics (Ivan Sutherland)
- Generative art (Casey Reas, Processing)
- Data visualization (Edward Tufte)
- Glitch art (Rosa Menkman)
- Cyberpunk aesthetics (Blade Runner, Ghost in the Shell)

## Color Palettes

### Palette 1: Quantum (Used in main poster)
```
Background: #0a0a12 (Dark navy)
Primary:    #06ffa5 (Electric cyan)
Secondary:  #8338ec (Vibrant purple)
Accent 1:   #ff006e (Hot pink)
Accent 2:   #3a86ff (Bright blue)
Highlight:  #ffbe0b (Golden yellow)
```

### Palette 2: Academic (Light variant)
```
Background: #f8f9fa (Off-white)
Primary:    #0077b6 (Deep blue)
Secondary:  #d00000 (Red)
Accent 1:   #faa307 (Orange)
Accent 2:   #06d6a0 (Teal)
Text:       #023047 (Dark blue-gray)
```

### Palette 3: Glitch (Digital variant)
```
Background: #000000 (Pure black)
Primary:    #ff0000 (Pure red)
Secondary:  #00ff00 (Pure green)
Accent 1:   #0000ff (Pure blue)
Accent 2:   #ff00ff (Magenta)
Accent 3:   #00ffff (Cyan)
```

## Mathematical Elements Explained

### Torus Topology
A doughnut-shaped surface - fundamental in topology for studying continuous deformations. Parametric equations:
```
x = (R + r*cos(v)) * cos(u)
y = (R + r*cos(v)) * sin(u)
z = r * sin(v)
```

### Quaternions
Extension of complex numbers to 4D, used for 3D rotations:
```
q = w + xi + yj + zk
where i² = j² = k² = ijk = -1
```

### Hopf Fibration
Beautiful way to visualize 4D sphere (S³) as circles in 3D space. Each point in S² corresponds to a circle in S³.

### Wave Functions
Quantum mechanics: ψ(x) describes probability amplitude
```
ψ(x) = A * e^(-x²/2σ²) * e^(ikx)
Probability density: |ψ(x)|²
```

## Customization

### Change Colors
```md
# Edit color values in the .md file
set body title_show color=#YOUR_COLOR
set body wave_1 color=#YOUR_COLOR glow_color=#YOUR_COLOR
```

### Adjust Text
```md
# Edit text content
create body title_itp parent=main type=text content="YOUR TEXT"

# Edit positioning
set body title_itp position=[600, 300]
```

### Change Animations
```md
# Speed up/slow down
animate body torus_wireframe rotation=[30, 45, 0] to rotation=[30, 405, 360] duration=10.0

# Change easing
animate body wave_1 phase=0 to phase=6.28 easing=bounce
```

## Production Checklist

### For Print
- [ ] Export at 2400x3600 (or higher)
- [ ] Check bleed area (0.125" on all sides)
- [ ] Keep important text in safe zone
- [ ] Use PNG format, highest quality
- [ ] Verify colors in CMYK if professional print
- [ ] Test print at small scale first

### For Digital Display
- [ ] Export at 1200x1800 (or native resolution)
- [ ] Test on target device
- [ ] Optimize file size (< 5MB for web)
- [ ] Check readability at distance
- [ ] Ensure 30fps for animations

### For Social Media
- [ ] Instagram Post: 1080x1080
- [ ] Instagram Story: 1080x1920
- [ ] Twitter: 1200x675 or 1280x720 (video)
- [ ] Facebook: 1200x630
- [ ] Include alt text description

## Timeline

- **Phase 3** (Command Parser): Load and preview posters
- **Phase 5** (Math Engine): Full mathematical visualizations
- **Phase 6** (Animation): Smooth animated versions
- **Phase 8** (Advanced Rendering): Glow effects, gradients
- **Phase 13** (Export): High-res image and video export

## Credits

Designed for ITP/IMA Winter Show 2025
Created with MathViz - Mathematical Visualization Engine
Inspired by computational art, quantum physics, and topology

---

**Questions?** Check the main documentation or open an issue!
