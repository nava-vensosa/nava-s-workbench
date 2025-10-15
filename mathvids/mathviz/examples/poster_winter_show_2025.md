# ITP/IMA Winter Show 2025 Poster
# Aspect Ratio: 2:3 (Portrait) - 1200x1800 pixels
# Inspired by computational art and data visualization aesthetics

# Initialize scene with custom aspect ratio
init scene winter_show_2025
set scene resolution=custom width=1200 height=1800 fps=30 background=#0a0a12

# Create main frame (full poster)
create frame main position=[0, 0] width=1200 height=1800
set frame main background=#0a0a12 alpha=1.0

# ========================================
# BACKGROUND: Topological Surface (Torus)
# ========================================

# Create torus topology using parametric equations
# x = (R + r*cos(v)) * cos(u)
# y = (R + r*cos(v)) * sin(u)
# z = r * sin(v)
# Project to 2D with perspective

create body torus_wireframe parent=main type=wireframe geometry=torus
set body torus_wireframe position=[600, 900] size=800
set body torus_wireframe color=#1a4d6d thickness=1.5 alpha=0.3
set body torus_wireframe rotation=[30, 45, 0]

# Add topology lines (meridians and parallels)
create body meridian_1 parent=main type=line parametric_3d="[(2+cos(t))*cos(0), (2+cos(t))*sin(0), sin(t)]"
set body meridian_1 color=#2d7fa5 thickness=2 alpha=0.5 domain=[0, 6.28]

create body meridian_2 parent=main type=line parametric_3d="[(2+cos(t))*cos(1.57), (2+cos(t))*sin(1.57), sin(t)]"
set body meridian_2 color=#2d7fa5 thickness=2 alpha=0.5 domain=[0, 6.28]

# ========================================
# QUATERNION VISUALIZATIONS (Middle Layer)
# ========================================

# Quaternion rotation visualization: q = cos(θ/2) + sin(θ/2)(xi + yj + zk)
# Visualized as rotating vector field

create body quat_field parent=main type=vector_field function="[cos(t)*x - sin(t)*y, sin(t)*x + cos(t)*y]"
set body quat_field position=[600, 900] grid_spacing=60 arrow_scale=30
set body quat_field color_by_magnitude gradient=[#ff006e, #fb5607, #ffbe0b] range=[0, 5]
set body quat_field scale_by_magnitude min_scale=0.4 max_scale=1.2 range=[0, 5]
set body quat_field alpha=0.7

# Quaternion path (Hopf fibration projection)
create body hopf_fiber parent=main type=line parametric="[300*cos(t), 450*sin(2*t)]"
set body hopf_fiber position=[600, 900] domain=[0, 6.28]
set body hopf_fiber color=#8338ec thickness=3 glow_intensity=0.6
set body hopf_fiber color_gradient stops=[(0.0, #8338ec), (0.5, #3a86ff), (1.0, #8338ec)]

# Secondary fiber
create body hopf_fiber_2 parent=main type=line parametric="[250*sin(t), 400*cos(3*t)]"
set body hopf_fiber_2 position=[600, 900] domain=[0, 6.28]
set body hopf_fiber_2 color=#3a86ff thickness=2 glow_intensity=0.4
set body hopf_fiber_2 alpha=0.8

# ========================================
# WAVE FUNCTIONS (Foreground)
# ========================================

# Quantum wave function: ψ(x) = e^(-x²/2) * cos(kx)
create body wave_1 parent=main type=line function="80*exp(-(x*x)/(200*200))*cos(0.03*x)"
set body wave_1 position=[0, 1200] domain=[-600, 600]
set body wave_1 color=#06ffa5 thickness=3 glow_intensity=0.8 glow_color=#06ffa5

# Interference pattern
create body wave_2 parent=main type=line function="60*exp(-(x*x)/(250*250))*sin(0.025*x)"
set body wave_2 position=[0, 1220] domain=[-600, 600]
set body wave_2 color=#48cae4 thickness=2.5 glow_intensity=0.6 glow_color=#48cae4

# Standing wave
create body wave_3 parent=main type=line function="100*sin(0.02*x)*exp(-(x*x)/(300*300))"
set body wave_3 position=[0, 1180] domain=[-600, 600]
set body wave_3 color=#90e0ef thickness=2 glow_intensity=0.5 glow_color=#90e0ef
set body wave_3 alpha=0.7

# Probability density (|ψ|²)
create body probability parent=main type=shape fill_under="50*exp(-(x*x)/(150*150))"
set body probability position=[0, 1250] domain=[-600, 600]
set body probability fill=#06ffa5 fill_alpha=0.15 stroke=none

# ========================================
# PARTICLE SYSTEM (Ambient)
# ========================================

# Data particles floating through space
create body particles_1 parent=main type=particles count=200 spawn=random
set body particles_1 color=#ffffff size=2 lifetime=5.0 alpha=0.3
set body particles_1 velocity_field="[0.1*sin(0.01*y), -0.05*cos(0.01*x)]"

create body particles_2 parent=main type=particles count=100 spawn=circle radius=400
set body particles_2 position=[600, 600] color=#8338ec size=3 lifetime=8.0 alpha=0.5
set body particles_2 velocity=radial speed=20

# ========================================
# GRID SYSTEM (Technical Aesthetic)
# ========================================

# Subtle grid for computational feel
create body grid parent=main type=grid style=cartesian step=100 range=[0, 1200]
set body grid color=#1a1a2e thickness=0.5 alpha=0.1

# Accent lines
create body accent_line_1 parent=main type=line start=[100, 0] end=[100, 1800]
set body accent_line_1 color=#ff006e thickness=1 alpha=0.3

create body accent_line_2 parent=main type=line start=[1100, 0] end=[1100, 1800]
set body accent_line_2 color=#3a86ff thickness=1 alpha=0.3

# ========================================
# TYPOGRAPHY
# ========================================

# Main title: ITP/IMA
create body title_itp parent=main type=text content="ITP/IMA" position=[600, 300]
set body title_itp font=custom_sans size=120 weight=bold color=#ffffff
set body title_itp tracking=0.15 kerning=tight
set body title_itp glow_intensity=0.4 glow_color=#ffffff

# Subtitle: Winter Show
create body title_show parent=main type=text content="WINTER SHOW" position=[600, 420]
set body title_show font=custom_sans size=56 weight=regular color=#06ffa5
set body title_show tracking=0.5 kerning=wide
set body title_show glow_intensity=0.6 glow_color=#06ffa5

# Year: 2025
create body title_year parent=main type=text content="2025" position=[600, 520]
set body title_year font=custom_mono size=96 weight=bold color=#8338ec
set body title_year tracking=0.1
set body title_year glow_intensity=0.5 glow_color=#8338ec

# ========================================
# DETAILS (Bottom)
# ========================================

# Date and location
create body info_date parent=main type=text content="December 13-14" position=[600, 1600]
set body info_date font=custom_sans size=32 color=#ffffff alpha=0.9

create body info_location parent=main type=text content="370 Jay Street, Brooklyn" position=[600, 1650]
set body info_location font=custom_sans size=28 color=#48cae4 alpha=0.8

create body info_time parent=main type=text content="6:00 PM - 9:00 PM" position=[600, 1700]
set body info_time font=custom_sans size=24 color=#90e0ef alpha=0.7

# Small technical details (aesthetic)
create body detail_coord parent=main type=text content="40.6942°N, 73.9867°W" position=[150, 1750]
set body detail_coord font=custom_mono size=14 color=#1a4d6d alpha=0.5

create body detail_code parent=main type=text content="MATRIX_DIM: 2:3 | RENDER: QUATERNION" position=[950, 1750]
set body detail_code font=custom_mono size=14 color=#1a4d6d alpha=0.5

# ========================================
# ANIMATIONS (20 second loop)
# ========================================

# Torus rotation
animate body torus_wireframe rotation=[30, 45, 0] to rotation=[30, 405, 360] duration=20.0 easing=linear loop=true

# Quaternion field rotation
animate body quat_field rotation_time=0 to rotation_time=6.28 duration=20.0 easing=linear loop=true

# Wave oscillation
animate body wave_1 phase=0 to phase=6.28 duration=4.0 easing=linear loop=true
animate body wave_2 phase=0 to phase=6.28 duration=5.0 easing=linear loop=true
animate body wave_3 phase=0 to phase=6.28 duration=3.5 easing=linear loop=true

# Particle flow
animate body particles_1 flow_time=0 to flow_time=20 duration=20.0 easing=linear loop=true
animate body particles_2 flow_time=0 to flow_time=20 duration=20.0 easing=linear loop=true

# Hopf fiber rotation
animate body hopf_fiber phase=0 to phase=6.28 duration=10.0 easing=ease_in_out loop=true
animate body hopf_fiber_2 phase=0 to phase=6.28 duration=8.0 easing=ease_in_out loop=true

# Text glow pulsing
animate body title_itp glow_intensity=0.4 to glow_intensity=0.8 duration=3.0 easing=ease_in_out loop=true alternate=true
animate body title_show glow_intensity=0.6 to glow_intensity=1.0 duration=2.5 easing=ease_in_out loop=true alternate=true

# ========================================
# EXPORT
# ========================================

# Export as static poster
export image poster_winter_2025.png resolution=2400x3600 quality=high

# Export as animated version (20 second loop for digital display)
export video poster_winter_2025_animated.mp4 duration=20.0 resolution=1200x1800 fps=30
