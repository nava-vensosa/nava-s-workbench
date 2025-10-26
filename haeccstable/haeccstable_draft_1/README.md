# Haeccstable

**Terminal-native live coding environment for real-time video composition and mathematical animation**


## What is Haeccstable?

Haeccstable is a live coding environment for graphics, animation, video editing, and function modeling. It combines the immediacy of live coding with the power of layer-based video composition and Manim-style mathematical animation, all driven by a functional domain-specific language designed for real-time video manipulation and educational content creation.

Think of it as **After Effects meets Vim meets Manim**, running entirely from your terminal with real-time performance.

### Core Features

- **Terminal-Based REPL** - Run from command line, no GUI overhead
- **Functional DSL** - Clean, declarative language for video composition
- **After Effects-Style Layers** - composition with transforms, scaling, rotation, opacity
- **Real-Time GPU Rendering** - Metal API for 60fps @ 4K with sub-16ms latency
- **Mathematical Animation** - Manim-like LaTeX, parametric surfaces, vector fields, stereographic projections
- **Multi-Monitor Output** - Separate windowed outputs with borderless/fullscreen modes
- **Zero-Copy Video Pipeline** - CVPixelBuffer → IOSurface → MTLTexture for minimal latency
- **Project-Based Workflow** - Directory structure with composition files and state tracking

## Quick Start

### Prerequisites

- macOS 11.0+ (Metal support required)
- Python 3.11+
- Haskell GHC 9.x (for DSL interpreter)
- C++ compiler with C++17 support
- Video input device (webcam, capture card, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/haeccstable.git
cd haeccstable

# Build the project (builds C++ renderer and Haskell interpreter)
make build

# Run the REPL
python3 haeccstable.py
```

### Your First Composition

```bash
# Start Haeccstable
$ python3 haeccstable.py
haeccstable v1.0 - Terminal Live Coding Environment

# Select an example project
haeccstable> select_composition simple_passthrough/
Loaded project: simple_passthrough

# Open a monitor window
haeccstable> open_monitor monitor1
Created window 'monitor1' (1920x1080)

# Run the composition
haeccstable> run main.txt
Executing main.txt...
Composition loaded successfully!

# You should now see your webcam feed in the monitor1 window!
```

## REPL Commands

### Project Management

| Command | Description |
|---------|-------------|
| `select_composition [directory]/` | Load a project from haeccstable_projects/ |
| `run [filename].txt` | Execute a composition file |
| `update dossier.json` | Save current state to dossier.json |

### Monitor Control

| Command | Description |
|---------|-------------|
| `open_monitor [name]` | Open a new monitor window |
| `close_monitor [name]` | Close a monitor window |
| `[name].borderless` | Set window to borderless mode |
| `[name].fullscreen` | Set window to fullscreen mode |

### Direct DSL Input

You can enter any DSL statement directly:

```bash
haeccstable> in_var camera = webcam;
Created input variable 'camera'

haeccstable> layer1.opacity(50);
Set layer 'layer1' opacity to 50%
```

## DSL Basics

### Simple Video Passthrough

```
in_var camera = webcam;
out_var display = monitor1;

layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);
display.project(video, 0);
```

### Picture-in-Picture

```
in_var mainCam = webcam;
in_var overlayCam = usb_camera_1;
out_var output = monitor1;

# Background layer
layer_obj background;
background.canvas = (1920, 1080);
mainCam.cast(background);
background.transform(0, 0);
background.scale(1.0, 1.0);

# PiP layer (small corner overlay)
layer_obj pip;
pip.canvas = (1920, 1080);
overlayCam.cast(pip);
pip.transform(1400, 780);
pip.scale(0.25, 0.25);

# Composite (z-index ordering)
output.project(background, 0);
output.project(pip, 1);
```

### Mathematical Animation

```
out_var display = monitor1;

# 3D parametric surface
math_obj surface;
surface.type = "parametric_surface";
surface.equation_x = "u * cos(v)";
surface.equation_y = "u * sin(v)";
surface.equation_z = "sin(u) + cos(v)";
surface.u_range = (0, 6.28);
surface.v_range = (0, 6.28);
surface.time_param = t;
surface.rotation = (20, t * 20, 0);

layer_obj surface_layer;
surface_layer.canvas = (1920, 1080);
surface.render(surface_layer);

display.project(surface_layer, 0);
```

## Project Structure

Each Haeccstable project lives in `haeccstable_projects/` and contains:

```
my_project/
├── main.txt        # Main composition file
├── dossier.json    # State tracking (monitors, variables, layers)
└── helper.txt      # Optional additional files
```

### Creating a New Project

```bash
# Create project directory
mkdir haeccstable_projects/my_composition/

# Create main.txt
cat > haeccstable_projects/my_composition/main.txt << 'EOF'
in_var camera = webcam;
out_var display = monitor1;

layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);
display.project(video, 0);
EOF

# Create dossier.json
echo '{}' > haeccstable_projects/my_composition/dossier.json
```

## Use Cases

### 1. Educational Mathematics Content
Create Manim-style animated explanations of complex mathematics, integrated with live presentation footage for YouTube/online courses.

### 2. Live Performance / VJing
Write code live to manipulate video sources in real-time during performances, with mathematical visualizations as generative backgrounds.

### 3. Video Prototyping
Quickly iterate on video composition ideas with code instead of clicking through menus.

### 4. Multi-Platform Content
Simultaneously preview desktop (16:9) and mobile (9:16) layouts of the same composition for social media.

### 5. Research Visualization
Demonstrate complex mathematical structures (quaternions, octonions, fiber bundles) with interactive stereographic projections.

### 6. Live Streaming with Graphics
Route video with mathematical overlays to separate monitor windows for OBS/streaming software integration.

## Why Haeccstable?

### vs After Effects
- ✅ Real-time code execution instead of timeline-based editing
- ✅ Terminal-based instead of GUI-heavy interface
- ✅ Live coding workflow instead of render-and-wait
- ✅ Mathematical rendering for educational content

### vs TouchDesigner
- ✅ Declarative functional syntax instead of node-based programming
- ✅ Terminal-native instead of heavy application
- ✅ Text-first workflow for version control
- ✅ Native mathematical visualization

### vs Resolume/VDMX
- ✅ Full functional programming language instead of MIDI mapping
- ✅ Layer-based composition with command-line control
- ✅ Mathematical animation support

### vs Manim
- ✅ Real-time preview instead of offline rendering
- ✅ Live video integration for hybrid content
- ✅ Interactive parameter control via REPL
- ✅ Terminal-based workflow

## Example Projects

Haeccstable includes 10 example projects in `haeccstable_projects/`:

| Project | Description |
|---------|-------------|
| `simple_passthrough/` | Basic webcam to monitor passthrough |
| `dual_monitor_setup/` | Desktop (16:9) + mobile (9:16) outputs |
| `picture_in_picture/` | Layered composition with z-index |
| `multi_source_mix/` | Quad-split with four camera sources |
| `mobile_portrait/` | Portrait video for 9:16 displays |
| `layered_transparency/` | Three semi-transparent layers |
| `octonion_visualization/` | Mathematical octonion construction |
| `stereographic_projection/` | 3D geometry visualization |
| `vector_field_3d/` | 3D vector field gradient flow |
| `parametric_surface/` | Time-evolving 3D surface animation |

## Performance

- **60fps @ 4K** on M1/M2 Macs
- **Sub-16ms latency** from camera to screen
- **Zero-copy video pipeline** minimizes memory bandwidth
- **GPU-accelerated compositing** via Metal API

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Implementation guide for developers
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete DSL language reference
---

