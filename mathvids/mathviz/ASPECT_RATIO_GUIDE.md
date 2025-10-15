# Aspect Ratio & Resolution Guide

## Overview

MathViz supports custom aspect ratios for posters, videos, and animations. You can specify any resolution or use presets.

## Resolution Modes

### Built-in Presets

```md
# Desktop 1080p (16:9)
set scene resolution=desktop_1080p

# Mobile Vertical (9:16)
set scene resolution=mobile_vertical

# Custom aspect ratio
set scene resolution=custom width=1200 height=1800
```

### Common Aspect Ratios

| Format | Ratio | Resolution | Use Case |
|--------|-------|------------|----------|
| **Poster (Portrait)** | 2:3 | 1200x1800 | Print posters, flyers |
| **Poster (Large)** | 2:3 | 2400x3600 | High-res print |
| **Instagram Post** | 1:1 | 1080x1080 | Square social media |
| **Instagram Story** | 9:16 | 1080x1920 | Vertical mobile |
| **Desktop HD** | 16:9 | 1920x1080 | YouTube, screens |
| **4K** | 16:9 | 3840x2160 | High-res video |
| **Cinema** | 21:9 | 2560x1080 | Widescreen |
| **A4 Paper** | 1:1.414 | 2480x3508 | Print (300 DPI) |

## Poster Generation

### 2:3 Portrait Poster (Standard)

```md
init scene my_poster
set scene resolution=custom width=1200 height=1800
set scene background=#000000

# Create full-screen frame
create frame main position=[0, 0] width=1200 height=1800
```

### 3:4 Social Media Poster

```md
init scene social_poster
set scene resolution=custom width=1080 height=1440
set scene background=#0a0a12

create frame main position=[0, 0] width=1080 height=1440
```

### Square Format (1:1)

```md
init scene square_art
set scene resolution=custom width=2000 height=2000
set scene background=#ffffff

create frame main position=[0, 0] width=2000 height=2000
```

## Coordinate System

### Understanding Coordinates

- **Origin**: Always at center of canvas
- **X-axis**: Horizontal (left = negative, right = positive)
- **Y-axis**: Vertical (top = positive, bottom = negative)

For a 1200x1800 poster:
- Origin: `(600, 900)`
- Top-left: `(0, 0)`
- Top-right: `(1200, 0)`
- Bottom-left: `(0, 1800)`
- Bottom-right: `(1200, 1800)`
- Center: `(600, 900)`

### Positioning Elements

```md
# Center of poster
create body title parent=main type=text content="CENTERED"
set body title position=[600, 900]

# Top of poster
create body header parent=main type=text content="HEADER"
set body header position=[600, 200]

# Bottom of poster
create body footer parent=main type=text content="FOOTER"
set body footer position=[600, 1700]
```

## Automated Aspect Ratio Changes

### Morphing Between Ratios

```md
# Start with 16:9
init scene morph_demo
set scene resolution=desktop_1080p

# ... create content ...

# Morph to 2:3 poster over 5 seconds
animate scene resolution=desktop_1080p to resolution=custom(1200,1800) duration=5.0

# Morph back
animate scene resolution=custom(1200,1800) to resolution=desktop_1080p duration=5.0
```

### Responsive Layouts

```md
# Define content that adapts to aspect ratio
create frame responsive parent=main position=[0, 0] width=100% height=100%
set frame responsive layout=responsive

# Elements will reposition based on aspect ratio
create body title parent=responsive type=text content="ADAPTIVE"
set body title position=center_top offset=[0, 50]

create body footer parent=responsive type=text content="Info"
set body footer position=center_bottom offset=[0, -50]
```

## Export Options

### Static Image Export

```md
# Export high-res poster
export image poster.png resolution=2400x3600 quality=high

# Export for web
export image poster_web.jpg resolution=1200x1800 quality=medium

# Export thumbnail
export image thumb.png resolution=400x600 quality=medium
```

### Animated Export

```md
# Animated poster (MP4)
export video poster_animated.mp4 duration=10.0 resolution=1200x1800 fps=30

# GIF for social media
export gif poster.gif duration=5.0 resolution=600x900 fps=15

# High-res video
export video poster_hd.mp4 duration=20.0 resolution=2400x3600 fps=60
```

### Multiple Aspect Ratios

```md
# Export same design in multiple formats
export image poster_print.png resolution=2400x3600    # 2:3 poster
export image poster_square.png resolution=2000x2000   # 1:1 square
export image poster_story.png resolution=1080x1920    # 9:16 story
export image poster_wide.png resolution=1920x1080     # 16:9 wide
```

## Best Practices

### Print Posters (2:3)

- **Resolution**: At least 2400x3600 (300 DPI at 8"x12")
- **Bleed**: Add 0.125" on all sides
- **Safe zone**: Keep text 0.25" from edges
- **Format**: PNG or PDF for print

### Digital Display

- **Resolution**: 1200x1800 is sufficient
- **Format**: PNG or JPEG
- **Optimization**: Use medium quality for web

### Animation

- **FPS**: 30 fps for smooth motion
- **Duration**: 10-20 seconds for loops
- **File size**: Use H.264 codec for efficiency

## Example Workflows

### Workflow 1: Print Poster

```md
# High-res print poster
init scene print_poster
set scene resolution=custom width=2400 height=3600
set scene background=#ffffff

# ... design poster ...

export image final_poster.png resolution=2400x3600 quality=high
export pdf final_poster.pdf resolution=2400x3600 bleed=0.125
```

### Workflow 2: Animated Instagram Story

```md
# Vertical animated story
init scene insta_story
set scene resolution=mobile_vertical  # 1080x1920

# ... design animation ...

export video story.mp4 duration=15.0 resolution=1080x1920 fps=30
```

### Workflow 3: Multi-Format Campaign

```md
# Create once, export everywhere
init scene campaign
set scene resolution=custom width=2000 height=2000  # Square as base

# ... design content ...

# Export all formats
export image poster_print.png resolution=2400x3600
export image instagram_post.png resolution=1080x1080
export image instagram_story.png resolution=1080x1920
export video twitter.mp4 duration=10.0 resolution=1280x720 fps=30
```

## Advanced: Dynamic Aspect Ratio

### Aspect Ratio Animation

```md
# Poster that morphs aspect ratios
init scene morphing_poster
set scene resolution=custom width=1920 height=1080

# Scene at 16:9
# ... design for widescreen ...

# Morph to portrait
animate scene aspect_ratio=16:9 to aspect_ratio=2:3 duration=3.0 easing=ease_in_out

# All bodies automatically reposition based on responsive rules
```

### Conditional Layouts

```md
# Different layouts for different ratios
if scene.aspect_ratio > 1.5 {
    # Widescreen layout
    set body title position=[960, 200]
    set body content layout=horizontal
} else if scene.aspect_ratio < 0.75 {
    # Tall portrait layout
    set body title position=[center_x, 300]
    set body content layout=vertical
} else {
    # Square layout
    set body content layout=grid rows=3 cols=3
}
```

## Resolution Reference

### Common Print Sizes (300 DPI)

| Size | Aspect | Pixels @ 300 DPI |
|------|--------|------------------|
| 8"x12" | 2:3 | 2400x3600 |
| 11"x17" | 1.55:1 | 3300x5100 |
| 18"x24" | 3:4 | 5400x7200 |
| 24"x36" | 2:3 | 7200x10800 |

### Screen Sizes

| Device | Aspect | Resolution |
|--------|--------|------------|
| iPhone 14 | 19.5:9 | 1179x2556 |
| iPad Pro | 4:3 | 2048x2732 |
| MacBook Pro | 16:10 | 3024x1964 |
| 4K Monitor | 16:9 | 3840x2160 |

## Tips

1. **Design at 1x**, export at higher resolution
2. **Use vector elements** when possible (bodies scale better)
3. **Test on target device** before final export
4. **Keep text readable** - minimum 14pt for print, 24px for screens
5. **Check bleed areas** for print work
6. **Optimize file size** for web delivery

Your ITP/IMA Winter Show 2025 poster is designed at 1200x1800 (2:3 ratio) and can be exported at 2400x3600 for print!
