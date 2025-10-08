# Mathematical Visualization Engine - Project Description

## Vision
A C++ GUI application for creating educational mathematical visualization videos through live-coding with a three-panel interface. The system uses a simple, hierarchical workflow: **Scene → Frame → Body**, making it easy to learn and use while providing powerful control over mathematical animations.

## Application Interface

The application features a **three-panel GUI** inspired by tmux and Vim workflows:

```
┌─────────────────────────────────────────────┐
│                                             │
│      VIEW PANEL (Animation Display)         │ ← Top 2/3 of screen
│      Real-time visualization                │
│                                             │
├──────────────────────┬──────────────────────┤
│  SCRIPT PANEL        │  CONSOLE PANEL       │ ← Bottom 1/3
│  (Command Log)       │  (Live Input)        │
│  Vim editor          │  Command line        │
└──────────────────────┴──────────────────────┘
```

### Panel Navigation
- **Prefix + h/j/k/l**: Switch between panels (like tmux)
  - Default prefix: `Ctrl+B`
  - `h` = left (Script), `k` = up (View), `l` = right (Console)
- Visual indicator shows active panel

### Panel Functions

#### View Panel (Top)
- Displays the animation in real-time
- Shows immediate visual feedback as commands execute
- 30fps playback

#### Script Panel (Bottom-left)
- Command history/log with **full Vim motions**
- Edit previously executed commands
- Navigation: h/j/k/l, gg/G, w/b/e, 0/$
- Editing: i/a/o, dd/yy/p, visual mode
- Save/load: :w, :wq
- Represents the animation's .md script file

#### Console Panel (Bottom-right)
- Live command input with immediate execution
- Console output (success messages, errors, warnings)
- Command history (up/down arrows)
- Special commands:
  - `run` or `r` - Execute entire script from Script Panel
  - `run -gg 10` or `r -gg 10` - Execute from line 10 onward
- All executed commands are logged to Script Panel

## User Experience Philosophy

### Linear, Intuitive Workflow
The application enforces a natural creative process:
1. **Initialize a Scene** - Your canvas and output settings
2. **Create Frames** - Coordinate systems where your content lives
3. **Instantiate Bodies** - The visual elements (graphs, text, particles, etc.)
4. **Apply Animations & Constraints** - Make things move and relate to each other

This hierarchy is strict but simple: every body belongs to a frame, every frame belongs to a scene. The system warns you if you try to skip steps, but lets you proceed.

### Two Workflows

#### Live Coding Workflow (Primary)
1. Launch application (GUI opens)
2. Type commands in Console Panel
3. See immediate results in View Panel
4. Commands automatically logged to Script Panel
5. Edit script with Vim motions if needed
6. Run full animation with `run` command
7. Export to video when satisfied

#### Script Execution Workflow
1. Load existing .md file into Script Panel (`:e filename.md`)
2. Execute entire script with `run`
3. Execute from specific line with `run -gg N`
4. Edit and re-run sections as needed

### Headless Export Mode
For batch rendering without GUI:
```bash
./mathviz --export script.md --output video.mp4
```

Everything is state-based with smooth interpolations - no timeline management required.

## Core Hierarchy

```
Scene (The Project)
├── Frame 1 (Coordinate System)
│   ├── Body 1 (Text, Line, Shape, etc.)
│   ├── Body 2
│   └── Body 3
├── Frame 2 (Can superimpose over Frame 1)
│   ├── Body 4
│   └── Body 5
└── Frame 3
    └── Body 6
```

## Coordinate System & Units

### Scene Origin
- Desktop Mode (1920x1080): Origin at screen center (960, 540)
- Mobile Mode (1080x1920): Origin at screen center (540, 960)

### Positioning
- **Frames**: Positioned via (X, Y) coordinates relative to scene origin
- **Bodies**: Positioned via (X, Y) coordinates relative to parent frame's center

### rem System
- **Desktop Mode**: 1rem optimized for horizontal computer viewing (baseline ~16px recommended)
- **Mobile Mode**: 1rem optimized for vertical phone viewing (baseline ~24px recommended for readability)
- All text sizes, thickness values, and spacing can use rem units

## Getting Started: A User's First Session

### Step 1: Initialize a Scene
```
> init scene video_01
> set scene resolution=desktop fps=30 background=#1a1a1a
```

### Step 2: Create a Frame
```
> create frame main position=[0, 0] width=1600 height=900
> set frame main border_thickness=0 background=#000000 alpha=1.0
```

### Step 3: Add Bodies
```
> create body line axis_x parent=main type=line start=[-800, 0] end=[800, 0]
> set body axis_x color=#333333 thickness=2

> create body graph parent=main type=line function="sin(x)" domain=[-6.28, 6.28]
> set body graph color=#3498db thickness=3
```

### Step 4: Animate
```
> animate body graph draw_in duration=2.0 easing=ease_in_out
> animate body graph glow intensity=0.0 to intensity=0.5 duration=1.0
```

That's it. The user has created a scene, positioned a frame, drawn a graph, and animated it.

## Body Types

### Text
Letters and mathematical notation with full typographic control.
```
create body title parent=main type=text content="The Derivative" position=[0, 400]
set body title font=custom_serif size=48 color=#ffffff tracking=0.02
animate body title write_in duration=3.0 style=handwriting
```

### Lines
Straight lines, curves, or function graphs.
```
create body curve parent=main type=line function="x^2" domain=[-5, 5]
set body curve color=#e74c3c thickness=3 glow=0.3

# Variable thickness along the line
set body curve thickness_profile points=[2, 5, 2] interpolation=linear
```

### Points
Dots or markers, often used for important coordinates.
```
create body marker parent=main type=point position=[2, 4]
set body marker radius=8 color=#f39c12 glow=0.6
```

### Shapes
Closed polygons, circles, ellipses.
```
create body circle parent=main type=shape geometry=circle radius=100 center=[0, 0]
set body circle fill=#9b59b6 fill_alpha=0.3 stroke=#9b59b6 stroke_thickness=2
animate body circle draw_in duration=2.0
```

### Wireframes
3D geometric structures rendered in perspective.
```
create body cube parent=main type=wireframe geometry=cube size=200
set body cube color=#1abc9c thickness=2 rotation=[45, 30, 0]
animate body cube rotation=[45, 30, 0] to rotation=[45, 390, 0] duration=5.0
```

### Grids
Cartesian or polar coordinate grids.
```
create body coords parent=main type=grid style=cartesian step=50 range=[-400, 400]
set body coords color=#333333 thickness=1 alpha=0.5
```

### Particles
Particle systems for dynamic effects.
```
create body particles parent=main type=particles count=100 spawn=circle radius=50
set body particles color=#f39c12 size=4 lifetime=2.0
attach body particles to_function="sin(x)" velocity=10
```

### Surfaces
3D mathematical surfaces.
```
create body surface parent=main type=surface function="sin(sqrt(x^2 + y^2))/sqrt(x^2 + y^2)"
set body surface domain_x=[-5, 5] domain_y=[-5, 5] resolution=50
set body surface color_gradient=[#3498db, #e74c3c] interpolation=linear
```

### Vector_Fields
Directional fields showing gradients or custom vector functions. Arrows can vary in color and size based on field strength (vector magnitude).
```
# Basic vector field
create body field parent=main type=vector_field function="[-y, x]"
set body field grid_spacing=50 arrow_scale=20 color=#95a5a6

# Field strength visualization via color gradient
set body field color_by_magnitude gradient=[#3498db, #e74c3c] range=[0, 10]
# Arrows are blue where magnitude is low, red where magnitude is high

# Field strength visualization via arrow size
set body field scale_by_magnitude min_scale=0.3 max_scale=1.5 range=[0, 10]
# Arrows shrink to 30% size at magnitude 0, grow to 150% at magnitude 10

# Combined: color and size both indicate strength
set body field color_by_magnitude gradient=[#3498db, #f39c12, #e74c3c] range=[0, 10]
set body field scale_by_magnitude min_scale=0.5 max_scale=2.0 range=[0, 10]
```

## Visual Properties & Controls

### Color & Gradients
```
# Solid color
set body line1 color=#3498db

# Gradient along body (from start to end)
set body line2 color_gradient points=[#3498db, #e74c3c, #f39c12] interpolation=linear

# Gradient with custom stops (0.0 to 1.0 along body length)
set body line3 color_gradient stops=[(0.0, #3498db), (0.7, #e74c3c), (1.0, #f39c12)] interpolation=exponential
```

### Thickness Control
```
# Fixed thickness
set body line1 thickness=3

# Variable thickness along body
set body line2 thickness_profile points=[2, 8, 2] interpolation=linear
set body line3 thickness_profile stops=[(0.0, 2), (0.3, 8), (1.0, 2)] interpolation=logarithmic
```

### Opacity
```
set body graph alpha=0.8
animate body graph alpha=0.8 to alpha=0.0 duration=1.5
```

### Glow Effects
```
# Bodies emit a soft glow
set body line glow_intensity=0.5 glow_color=#3498db glow_radius=10
animate body line glow_intensity=0.0 to glow_intensity=1.0 duration=2.0
```

## Animation System

### Drawing Animations
Bodies are revealed stroke-by-stroke as if drawn by hand.

```
# Text: Written letter by letter, stroke by stroke
animate body title write_in duration=3.0 style=handwriting

# Lines/Shapes: Traced from start to end
animate body circle draw_in duration=2.0 easing=ease_out

# Surfaces: Built up progressively
animate body surface build_in direction=radial duration=4.0
```

### Opacity Fades
```
animate body graph fade_in duration=1.5
animate body graph fade_out duration=1.0
animate body graph alpha=1.0 to alpha=0.3 duration=2.0
```

### Movement
```
animate body point position=[0, 0] to position=[5, 5] duration=3.0 easing=ease_in_out
```

### Property Interpolation
```
animate body line thickness=2 to thickness=8 duration=2.0
animate body circle radius=50 to radius=200 duration=3.0
animate frame main position=[0, 0] to position=[200, 100] duration=2.5
```

### Easing Functions
Available: `linear`, `ease_in`, `ease_out`, `ease_in_out`, `exponential`, `logarithmic`, `bounce`

## Constraints System

### Purpose
Constraints establish geometric relationships between bodies that are maintained during animations.

### Constraint Types

#### Colinear
Points or line segments lie on the same line.
```
constrain colinear bodies=[point1, point2, point3]
```

#### Cotangent
A line is tangent to a curve at a point.
```
constrain cotangent line=tangent_line curve=parabola at=point_contact
```

#### Perpendicular
Two lines meet at 90 degrees.
```
constrain perpendicular bodies=[line1, line2]
```

#### Parallel
Lines maintain parallel orientation.
```
constrain parallel bodies=[line1, line2, line3]
```

#### Concentric
Circles/ellipses share the same center.
```
constrain concentric bodies=[circle1, circle2, circle3]
```

#### Equal_Length
Line segments maintain equal length.
```
constrain equal_length bodies=[segment1, segment2]
```

### Multi-Body Constraints
```
constrain parallel bodies=[line1, line2, line3, line4]
constrain colinear bodies=[p1, p2, p3, p4, p5]
```

### Constraint Conflict Detection
If constraints conflict, the system throws an error:
```
ERROR: Conflicting constraints - line1 cannot be both parallel and perpendicular to line2
```

### Constraints During Animation
Constraints are upheld in real-time. If `point1` moves and is constrained colinear with `point2` and `point3`, the system adjusts the others to maintain the relationship.

## Frame Properties & Animation

### Creating Frames
```
create frame overlay position=[0, 0] width=800 height=600
```

### Frame Properties
```
# Border (can be transparent or have thickness)
set frame overlay border_thickness=3 border_color=#3498db

# Background
set frame overlay background=#000000 alpha=0.8

# No padding - bodies are positioned directly within frame coordinate space
```

### Animating Frames
When a frame moves, all child bodies move with it.
```
# Move frame (and all its bodies)
animate frame overlay position=[0, 0] to position=[400, 200] duration=3.0

# Fade frame and all bodies
animate frame overlay alpha=1.0 to alpha=0.0 duration=2.0

# Animate border
animate frame overlay border_thickness=0 to border_thickness=5 duration=1.5
```

### Superimposed Frames
Frames can overlap. Useful for layering content or picture-in-picture effects.
```
create frame main position=[0, 0] width=1600 height=900
create frame inset position=[600, -300] width=400 height=300
set frame inset border_thickness=2 border_color=#ffffff background=#000000
```

## Mathematical Capabilities (Desmos-Level)

### 2D Functions
```
# Explicit
create body f parent=main type=line function="x^2 - 4"

# Implicit
create body circle parent=main type=shape implicit="x^2 + y^2 - 25"

# Parametric
create body spiral parent=main type=line parametric="[t*cos(t), t*sin(t)]" domain=[0, 12.56]
```

### 3D Surfaces & Curves
```
create body paraboloid parent=main type=surface function="x^2 + y^2"
create body helix parent=main type=line parametric_3d="[cos(t), sin(t), t]" domain=[0, 12.56]
```

### 4D+ Projections
Visualize 3D slices of 4D objects with switchable projection methods.
```
create body hypersphere parent=main type=surface implicit_4d="x^2 + y^2 + z^2 + w^2 - 1"
set body hypersphere projection=stereographic w_slice=0.5
set body hypersphere projection=perspective  # Switch projection method
set body hypersphere projection=orthographic
```

### Calculus Visualization
```
# Derivative
create body f parent=main type=line function="x^2"
create body df parent=main type=line function="derivative(f, x)" color=#e74c3c

# Integral (area under curve)
create body area parent=main type=shape fill_under="sin(x)" domain=[0, 3.14]
set body area fill=#3498db alpha=0.3

# Tangent line
create body tangent parent=main type=line tangent_to=f at_x=2
```

### Vector Fields & Particle Attachment
```
# Gradient field
create body grad_field parent=main type=vector_field function="gradient(x^2 + y^2)"

# Particles following field
create body particles parent=main type=particles count=200
attach body particles to_vector_field=grad_field velocity=5

# Particles following function path
attach body particles to_function="sin(x)" mode=trace
```

## Workflow: Command Sequence

### Typical User Workflow
1. **Initialize scene** with resolution and output settings
2. **Create frames** and position them in scene space
3. **Instantiate bodies** within frames with visual properties
4. **Apply constraints** for geometric relationships
5. **Animate bodies and frames** with interpolations
6. **Export** or continue iterating in live mode

### Example: Complete Script
```markdown
# Initialize
init scene derivative_demo
set scene resolution=desktop fps=30 background=#1a1a1a output=output/derivative.mp4

# Create main frame
create frame main position=[0, 0] width=1600 height=900
set frame main border_thickness=0 background=transparent

# Create coordinate grid
create body grid parent=main type=grid style=cartesian step=50 range=[-800, 450]
set body grid color=#333333 thickness=1 alpha=0.3

# Create function
create body f parent=main type=line function="0.5*x^2" domain=[-20, 20]
set body f color=#3498db thickness=4 glow_intensity=0.4

# Animate function drawing in
animate body f draw_in duration=2.0 easing=ease_out

# Create point on curve
create body point parent=main type=point position=[4, 8]
set body point radius=8 color=#f39c12 glow_intensity=0.8
constrain body point on_curve=f

# Create tangent line
create body tangent parent=main type=line slope=4 intercept=-8
set body tangent color=#e74c3c thickness=3 style=dashed
constrain cotangent line=tangent curve=f at=point

# Animate point sliding along curve (tangent follows due to constraint)
animate body point position=[4, 8] to position=[-6, 18] duration=4.0 easing=linear

# Add text label
create body label parent=main type=text content="Slope = f'(x)" position=[200, 300]
set body label font=main_sans size=36 color=#ffffff
animate body label write_in duration=1.5
```

## Resolution Modes

### Desktop 1080p (1920x1080)
- Aspect ratio: 16:9
- Origin: (960, 540)
- Optimized for: YouTube landscape, laptop screens
- rem baseline: ~16px

### Mobile Vertical (1080x1920)
- Aspect ratio: 9:16
- Origin: (540, 960)
- Optimized for: YouTube Shorts, Instagram Reels, TikTok
- rem baseline: ~24px (larger for mobile readability)

## Font System Integration

### Font Application (Separate Program)
A companion application for designing custom fonts:
- Glyph-level design canvas
- Serif and ligature editing
- Kerning pair adjustments
- Tracking, leading, and weight controls
- Export to .ttf (with metadata) or binary .font format

### Using Fonts in Visualization Engine
```
# Reference font file
set body title font=fonts/custom_serif.ttf size=48
set body equation font=fonts/math_notation.font size=36

# Typography controls
set body title tracking=0.05 kerning=metric ligatures=enabled leading=1.2
```

### Hot Reload
In live mode, updating a font file immediately reflects changes in the visualization.

## File Structure

```
project/
├── config.md                      # Global scene settings
├── scripts/
│   ├── intro.md                   # Command scripts for export mode
│   ├── derivatives.md
│   └── fourier_series.md
├── fonts/
│   ├── custom_serif.ttf
│   ├── math_notation.font
│   └── handwriting.ttf
├── definitions/                   # Reusable definitions (optional)
│   ├── styles.md                  # Color themes, font presets
│   └── templates.md               # Body templates
└── output/
    ├── frames/                    # Rendered frame sequences
    └── videos/                    # Final exported videos
```

## Command Syntax Philosophy

### Verb-Noun-Property Pattern
Commands follow a consistent structure:
- `create <type> <name> <properties>`
- `set <target> <properties>`
- `animate <target> <changes>`
- `constrain <type> <bodies>`

### Property Assignment
All properties use `key=value` pairs:
```
set body line color=#3498db thickness=3 glow=0.5
```

### Natural Interpolation
Animations always interpolate from current state to target state:
```
animate body circle radius=50 to radius=200 duration=3.0
```

## Technical Architecture

### Core Components
1. **Command Parser** - Markdown and stdin parsing
2. **Scene Graph Manager** - Hierarchical scene/frame/body relationships
3. **Math Engine** - Function evaluation, symbolic calculus, 4D projections
4. **Constraint Solver** - Maintains geometric relationships during animations
5. **Interpolation System** - Smooth transitions with configurable easing
6. **OpenGL Renderer** - Real-time GPU-accelerated rendering
7. **Export Pipeline** - Frame capture and FFmpeg encoding

### Language & Libraries
- **C++** for performance, OpenGL integration, and FFmpeg compatibility
- **OpenGL 4.5+** for modern shader pipeline and GPU acceleration
- **FFmpeg (libav)** for video encoding
- **GLM** for vector/matrix mathematics
- **Custom parser** for markdown command syntax

### Rendering Pipeline
1. Parse command from stdin or script file
2. Update scene graph with target state
3. Interpolation engine generates intermediate frames
4. For each frame:
   - Apply constraints
   - Render scene graph via OpenGL
   - (Export mode) Capture framebuffer to video stream
   - (Live mode) Display to window at 30fps

## Success Criteria

A successful implementation provides:
1. **Ease of Learning** - Users can create their first animation within 10 minutes
2. **Visual Quality** - Desmos-level mathematical visualization with smooth animations
3. **Performance** - Real-time 30fps in live mode, efficient batch export
4. **Flexibility** - Supports both quick explorations and complex scripted videos
5. **Reliability** - Deterministic script execution, reproducible renders
6. **Integration** - Seamless compatibility with custom font design application
7. **Power** - Handles advanced math (calculus, 4D projections, vector fields, constraints)

## Next Steps

With this project description finalized, the next phase is:
1. **Implementation Guide** - Technical architecture, module design, development phases
2. **Test & Control** - Build a minimal prototype to validate workflow
3. **Full Development** - Iterative implementation of all features
