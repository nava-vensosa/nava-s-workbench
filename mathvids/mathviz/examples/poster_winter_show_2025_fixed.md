# ITP/IMA Winter Show 2025 Poster - FIXED COORDINATES
# Aspect Ratio: 2:3 (Portrait) - 1200x1800 pixels
# OpenGL coordinate system: (0,0) at bottom-left

# Initialize scene
init scene winter_show_2025
set scene resolution=custom width=1200 height=1800 fps=30 background=#0a0a12

# Create main frame (full poster)
create frame main position=[0, 0] width=1200 height=1800
set frame main background=#0a0a12 alpha=1.0

# ========================================
# GRID (for testing positioning)
# ========================================
create body grid parent=main type=grid
set body grid color=#1a4d6d thickness=1.0 alpha=0.3

# ========================================
# ACCENT LINES (sides)
# ========================================
create body accent_line_1 parent=main type=line
set body accent_line_1 color=#8338ec thickness=2 alpha=0.4

create body accent_line_2 parent=main type=line
set body accent_line_2 color=#8338ec thickness=2 alpha=0.4

# ========================================
# TYPOGRAPHY (OpenGL coords: Y flipped)
# ========================================

# Main title: ITP/IMA (near top: 1800 - 300 = 1500)
create body title_itp parent=main type=text content="ITP/IMA" position=[600, 1500]
set body title_itp font_size=120 color=#ffffff
set body title_itp glow_intensity=0.8 glow_color=#ffffff

# Subtitle: WINTER SHOW (below title: 1800 - 420 = 1380)
create body title_show parent=main type=text content="WINTER SHOW" position=[600, 1380]
set body title_show font_size=56 color=#06ffa5
set body title_show glow_intensity=0.8 glow_color=#06ffa5

# Year: 2025 (below subtitle: 1800 - 520 = 1280)
create body title_year parent=main type=text content="2025" position=[600, 1280]
set body title_year font_size=96 color=#8338ec
set body title_year glow_intensity=0.7 glow_color=#8338ec

# ========================================
# MIDDLE SECTION - Wave lines
# ========================================

# Wave 1 (centered: 1800 - 900 = 900)
create body wave_1 parent=main type=line
set body wave_1 color=#06ffa5 thickness=3 alpha=0.8

# Wave 2
create body wave_2 parent=main type=line
set body wave_2 color=#48cae4 thickness=2.5 alpha=0.7

# Wave 3
create body wave_3 parent=main type=line
set body wave_3 color=#90e0ef thickness=2 alpha=0.6

# ========================================
# BOTTOM SECTION - Event details
# ========================================

# Date (near bottom: 1800 - 1600 = 200)
create body info_date parent=main type=text content="December 13-14" position=[600, 200]
set body info_date font_size=32 color=#ffffff

# Location (1800 - 1650 = 150)
create body info_location parent=main type=text content="370 Jay Street, Brooklyn" position=[600, 150]
set body info_location font_size=28 color=#48cae4

# Time (1800 - 1700 = 100)
create body info_time parent=main type=text content="6:00 PM - 9:00 PM" position=[600, 100]
set body info_time font_size=24 color=#90e0ef

# Technical details (1800 - 1750 = 50)
create body detail_coord parent=main type=text content="40.6942N 73.9867W" position=[150, 50]
set body detail_coord font_size=14 color=#1a4d6d

create body detail_code parent=main type=text content="MATRIX_DIM: 2:3 | RENDER: QUATERNION" position=[800, 50]
set body detail_code font_size=14 color=#1a4d6d

# ========================================
# EXPORT
# ========================================
export image poster_winter_2025_fixed.png resolution=1200x1800
