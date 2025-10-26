# Haeccstable DSL API Reference

**Complete language specification for the Haeccstable Domain-Specific Language**

---

## Table of Contents

1. [Grammar](#grammar)
2. [Type System](#type-system)
3. [Variable Declarations](#variable-declarations)
4. [Layer Operations](#layer-operations)
5. [Mathematical Objects](#mathematical-objects)
6. [Timeline & Animation](#timeline--animation)
7. [Effect Chains](#effect-chains)
8. [Filter Pipeline](#filter-pipeline)
9. [Device Naming](#device-naming)
10. [Import System](#import-system)

---

## Grammar

### EBNF Specification

```ebnf
program       ::= statement*
statement     ::= comment | import | var_decl | in_var | out_var
                | layer_obj | math_obj | timeline | buffer_obj | assignment | method_call

comment       ::= "//" text | "#" text
import        ::= "import" filepath

var_decl      ::= "var" identifier "=" value
in_var        ::= "in_var" identifier "=" device_name
out_var       ::= "out_var" identifier "=" monitor_name
layer_obj     ::= "layer_obj" identifier
math_obj      ::= "math_obj" identifier
timeline      ::= "timeline" identifier
buffer_obj    ::= "buffer_obj" identifier

assignment    ::= object "." property "=" value
method_call   ::= object "." method "(" args ")"

property      ::= identifier
method        ::= identifier
args          ::= arg ("," arg)*
arg           ::= expression

expression    ::= literal | identifier | tuple
literal       ::= number | string
tuple         ::= "(" number "," number ")" | "(" number "," number "," number ")"

device_name   ::= "webcam" | "usb_camera_" digit | "hdmi_input" | "video_file_" digit
monitor_name  ::= "monitor" digit
```

---

## Type System

### Primitive Types

```
String    : "hello world"
Int       : 42
Float     : 3.14
Tuple2    : (x, y)
Tuple3    : (x, y, z)
Bool      : true | false (in mathematical expressions)
```

### Object Types

```
in_var     : Video input source
out_var    : Monitor output target
layer_obj  : Compositable layer
buffer_obj : Intermediate texture buffer for filter pipelines
math_obj   : Mathematical visualization
timeline   : Animation timeline
```

### Type Checking

The interpreter performs static type checking:

```
layer.canvas = (1920, 1080)  ✓  Tuple2 expected
layer.canvas = "invalid"     ✗  Type error
layer.opacity(100)           ✓  Int/Float expected
layer.opacity("50%")         ✗  Type error
```

---

## Variable Declarations

### String Variable

```
var myName = "Haeccstable";
```

**Type**: String

### Input Variable

```
in_var camera = webcam;
in_var hdmi = hdmi_input;
in_var file = video_file_1;
```

**Type**: `in_var`
**Purpose**: Binds a video source to a named variable
**Device Names**: See [Device Naming](#device-naming)

### Output Variable

```
out_var display = monitor1;
out_var mobile = monitor2;
```

**Type**: `out_var`
**Purpose**: Binds a monitor window to a named variable
**Monitor Names**: `monitor1`, `monitor2`, etc.

### Layer Object

```
layer_obj myLayer;
layer_obj background;
```

**Type**: `layer_obj`
**Purpose**: Creates a compositable video layer

### Mathematical Object

```
math_obj equation;
math_obj surface;
```

**Type**: `math_obj`
**Purpose**: Creates a mathematical visualization

### Timeline Object

```
timeline anim;
```

**Type**: `timeline`
**Purpose**: Creates an animation timeline

### Buffer Object

```
buffer_obj edges;
buffer_obj temp;
```

**Type**: `buffer_obj`
**Purpose**: Creates an intermediate texture buffer for filter pipelines

---

## Layer Operations

### Properties

#### canvas

**Type**: `Tuple2 (Int, Int)`

Sets the layer's render resolution.

```
layer.canvas = (1920, 1080);
layer.canvas = (3840, 2160);  // 4K
```

#### opacity

**Type**: `Int` (0-100)

Sets layer transparency (0 = invisible, 100 = opaque).

```
layer.opacity(100);   // Fully opaque
layer.opacity(50);    // Semi-transparent
layer.opacity(0);     // Invisible
```

### Methods

#### cast(layer)

**Signature**: `in_var.cast(layer_obj)`

Binds a video source to a layer.

```
in_var camera = webcam;
layer_obj video;
camera.cast(video);
```

#### transform(x, y)

**Signature**: `layer.transform(Float, Float)`

Sets layer position in pixels from bottom-left corner.

```
layer.transform(0, 0);         // Bottom-left
layer.transform(960, 540);     // Center (for 1920x1080)
layer.transform(1400, 780);    // Bottom-right corner
```

**Coordinate System**: Bottom-left origin (Metal/GPU convention)

#### scale(sx, sy)

**Signature**: `layer.scale(Float, Float)`

Sets scaling factors (1.0 = 100%, 0.5 = 50%, 2.0 = 200%).

```
layer.scale(1.0, 1.0);    // Original size
layer.scale(0.5, 0.5);    // Half size
layer.scale(2.0, 2.0);    // Double size
layer.scale(1.0, -1.0);   // Vertical flip
```

#### rot(degrees, yAxis)

**Signature**: `layer.rot(Float, Float)`

Sets rotation in degrees.

```
layer.rot(0, 0);      // No rotation
layer.rot(45, 0);     // 45° rotation in XY plane
layer.rot(0, 30);     // 30° rotation around Y-axis (3D)
layer.rot(90, 0);     // Quarter turn
```

#### blend_mode(mode)

**Signature**: `layer.blend_mode(String)`

Sets blending mode.

```
layer.blend_mode("normal");     // Standard alpha blending
layer.blend_mode("add");        // Additive blending (light effects)
layer.blend_mode("multiply");   // Multiply (darkening)
layer.blend_mode("screen");     // Screen (lightening)
layer.blend_mode("overlay");    // Overlay blend
```

**Modes**:
- `"normal"` - Standard alpha blending
- `"add"` - Additive (for glow/light effects)
- `"multiply"` - Multiplicative (for darkening)
- `"screen"` - Screen blend (for lightening)
- `"overlay"` - Combination of multiply and screen

#### effect(name, ...params)

**Signature**: `layer.effect(String, ...)`

Applies a visual effect with parameters.

```
layer.effect("blur", 5.0);                      // Gaussian blur
layer.effect("brightness", 1.2);                // Increase brightness
layer.effect("chromakey", (0, 255, 0), 0.3);   // Green screen removal
```

See [Effect Chains](#effect-chains) for complete list.

#### project(layer, zIndex)

**Signature**: `out_var.project(layer_obj, Int)`

Adds a layer to the output at specified z-index.

```
output.project(background, 0);  // Renders first (back)
output.project(foreground, 1);  // Renders on top
output.project(overlay, 2);     // Renders last (front)
```

**Z-Index**: Lower values render first (background), higher values render on top (foreground).

---

## Mathematical Objects

### Common Properties

```
math_obj.type = "latex" | "parametric_surface" | "vector_field" |
                "vector_field_3d" | "stereographic_projection" |
                "octonion_construction"
```

### LaTeX Rendering

```
math_obj equation;
equation.type = "latex";
equation.content = "E = mc^2";
equation.color = (255, 255, 255);  // RGB
equation.size = 72;                // Font size in points
```

**Render to layer**:
```
layer_obj math_layer;
equation.render(math_layer);
```

### Parametric Surface

```
math_obj surface;
surface.type = "parametric_surface";
surface.equation_x = "u * cos(v)";
surface.equation_y = "u * sin(v)";
surface.equation_z = "sin(u) + cos(v)";
surface.u_range = (0, 6.28318);       // 0 to 2π
surface.v_range = (0, 6.28318);
surface.u_steps = 60;                 // Grid resolution
surface.v_steps = 60;
surface.time_param = t;               // Animate with time variable
surface.rotation = (20, t * 20, 0);   // (theta, phi, psi) in degrees
surface.wireframe = false;            // Solid or wireframe
surface.shading = "smooth";           // "flat" or "smooth"
surface.color_by_param = "v";         // Color by u, v, or height
surface.color_gradient = "rainbow";   // Color scheme
```

**Equations**: JavaScript-like syntax supporting:
- Arithmetic: `+`, `-`, `*`, `/`, `^` (power)
- Functions: `sin`, `cos`, `tan`, `sqrt`, `abs`, `exp`, `log`
- Variables: `u`, `v`, `t` (time)
- Constants: `pi`, `e`

### 2D Vector Field

```
math_obj field;
field.type = "vector_field";
field.field_x = "-y";
field.field_y = "x";
field.grid_size = (20, 20);       // Number of arrows
field.arrow_scale = 0.5;
field.color_by_magnitude = true;
field.time_param = t;
```

### 3D Vector Field

```
math_obj field3d;
field3d.type = "vector_field_3d";
field3d.field_x = "-y / (x*x + y*y + z*z)^1.5";
field3d.field_y = "x / (x*x + y*y + z*z)^1.5";
field3d.field_z = "0";
field3d.grid_size = (10, 10, 10);
field3d.bounds = ((-3, 3), (-3, 3), (-3, 3));
field3d.arrow_scale = 0.3;
field3d.camera_rotation = (t * 15, t * 10, 0);
```

### Stereographic Projection

```
math_obj stereo;
stereo.type = "stereographic_projection";
stereo.object = "torus";                  // sphere, torus, klein_bottle
stereo.projection_point = (0, 0, 2);
stereo.camera_theta = 45 + t * 5;
stereo.camera_phi = 30;
stereo.time_param = t;
stereo.wireframe = false;
stereo.color_by_height = true;
```

### Octonion Visualization

```
math_obj octonion;
octonion.type = "octonion_construction";
octonion.step = 3;                        // 0=reals, 1=complex, 2=quaternion, 3=octonion
octonion.visualization = "penrose_bitwistor";
octonion.rotation = (30, 45, t * 10);
octonion.time_param = t;
octonion.show_basis_vectors = true;
octonion.color_scheme = "spectral";       // rainbow, spectral, monochrome
```

---

## Timeline & Animation

### Create Timeline

```
timeline anim;
anim.duration = 10.0;  // seconds
```

### Add Keyframes

```
timeline.keyframe(time, property_reference, value)
```

**Examples**:

```
timeline anim;
anim.duration = 10.0;

// Animate scale
anim.keyframe(0.0, layer.scale, (0.5, 0.5));
anim.keyframe(5.0, layer.scale, (1.0, 1.0));
anim.keyframe(10.0, layer.scale, (0.5, 0.5));

// Animate rotation
anim.keyframe(0.0, layer.rot, (0, 0));
anim.keyframe(10.0, layer.rot, (360, 0));

// Animate opacity
anim.keyframe(0.0, layer.opacity, 0);
anim.keyframe(3.0, layer.opacity, 100);
```

### Easing Functions

```
anim.easing = "linear";         // Linear interpolation
anim.easing = "ease_in";        // Accelerate
anim.easing = "ease_out";       // Decelerate
anim.easing = "ease_in_out";    // Smooth S-curve
```

---

## Effect Chains

Effects are applied in the order specified.

### Color Effects

```
layer.effect("brightness", multiplier);      // 1.0 = normal, >1 = brighter
layer.effect("contrast", multiplier);        // 1.0 = normal, >1 = more contrast
layer.effect("saturation", multiplier);      // 1.0 = normal, 0 = grayscale
layer.effect("hue_shift", degrees);          // Rotate hue (0-360)
```

### Blur Effects

```
layer.effect("blur", radius);                // Gaussian blur (pixels)
layer.effect("glow", radius, intensity);     // Glow effect
```

### Keying Effects

```
layer.effect("chromakey", (r, g, b), threshold);  // Remove color
layer.effect("luma_key", threshold);              // Remove by brightness
```

### Distortion Effects

```
layer.effect("lens_distort", amount);             // Barrel/pincushion (-1 to 1)
layer.effect("wave", amplitude, frequency, time); // Wave distortion
```

### Stylization Effects

```
layer.effect("vignette", strength);    // Darken edges (0-1)
layer.effect("sharpen", amount);       // Sharpen (0-2)
layer.effect("film_grain", intensity); // Add noise (0-1)
```

### Multi-Effect Example

```
layer_obj processed;
processed.canvas = (1920, 1080);
camera.cast(processed);

// Chain effects (applied in order)
processed.effect("blur", 2.0);
processed.effect("brightness", 1.1);
processed.effect("contrast", 1.2);
processed.effect("saturation", 0.8);
processed.effect("vignette", 0.5);
```

---

## Filter Pipeline

### Overview

The filter pipeline system enables composable, multi-pass image processing through intermediate texture buffers (`buffer_obj`). Unlike built-in effects, filters are low-level primitives that users compose to create complex processing pipelines.

**Key Concepts**:
- **buffer_obj**: Intermediate texture storage for multi-pass operations
- **Filter Primitives**: Low-level operations (Sobel, Kuwahara, Gaussian, etc.)
- **Texture Ping-Pong**: Alternating between buffers for multi-pass pipelines
- **Composability**: Complex effects built from simple primitives

### buffer_obj Properties

#### canvas

**Type**: `Tuple2 (Int, Int)`

Sets the buffer's texture resolution.

```
buffer_obj edges;
edges.canvas = (1920, 1080);
edges.canvas = (3840, 2160);  // 4K
```

#### format

**Type**: `String`

Sets the pixel format for the buffer.

```
buffer_obj edges;
edges.format = "r8";         // Single-channel 8-bit (grayscale)
edges.format = "rg16f";      // Two-channel 16-bit float
edges.format = "rgba8";      // Four-channel 8-bit (default)
edges.format = "rgba16f";    // Four-channel 16-bit float (HDR)
```

**Pixel Formats**:
- `"r8"` - Single-channel 8-bit (grayscale) - Use for edge detection, masks
- `"rg16f"` - Two-channel 16-bit float - Use for gradient fields, flow maps
- `"rgba8"` - Four-channel 8-bit (standard RGB) - Default for color buffers
- `"rgba16f"` - Four-channel 16-bit float - Use for HDR, intermediate calculations

### Filter Primitives

All filter primitives follow the pattern:
```
source.filter_name(output_buffer, ...parameters)
```

#### sobel(output, threshold)

**Signature**: `layer.sobel(buffer_obj, Float)`

Applies Sobel edge detection. Outputs edge magnitude as grayscale.

```
buffer_obj edges;
edges.canvas = (1920, 1080);
edges.format = "r8";

layer.sobel(edges, 0.15);  // threshold: 0.0-1.0
```

**Parameters**:
- `output`: Target buffer_obj to write edge map
- `threshold`: Edge detection sensitivity (0.0 = all edges, 1.0 = strong edges only)

**Output**: Single-channel grayscale (0 = no edge, 1 = strong edge)

#### kuwahara(output, kernel_size)

**Signature**: `layer.kuwahara(buffer_obj, Int)`

Applies Kuwahara filter for edge-preserving smoothing.

```
buffer_obj smoothed;
smoothed.canvas = (1920, 1080);
smoothed.format = "rgba8";

layer.kuwahara(smoothed, 5);  // kernel_size: 3, 5, 7, 9
```

**Parameters**:
- `output`: Target buffer_obj
- `kernel_size`: Filter window size (larger = more smoothing)

**Output**: RGBA color with preserved edges

#### gaussian(output, sigma)

**Signature**: `layer.gaussian(buffer_obj, Float)`

Applies Gaussian blur.

```
buffer_obj blurred;
blurred.canvas = (1920, 1080);
blurred.format = "rgba8";

layer.gaussian(blurred, 2.0);  // sigma: blur amount
```

**Parameters**:
- `output`: Target buffer_obj
- `sigma`: Blur radius (0.5 = subtle, 5.0 = heavy blur)

**Output**: Blurred RGBA color

#### dog(output, sigma1, sigma2)

**Signature**: `layer.dog(buffer_obj, Float, Float)`

Applies Difference of Gaussians for edge enhancement.

```
buffer_obj edges_enhanced;
edges_enhanced.canvas = (1920, 1080);
edges_enhanced.format = "r8";

edges.dog(edges_enhanced, 1.0, 2.0);  // sigma1 < sigma2
```

**Parameters**:
- `output`: Target buffer_obj
- `sigma1`: Inner Gaussian radius (smaller)
- `sigma2`: Outer Gaussian radius (larger)

**Output**: Edge-enhanced single-channel (edges = bright, flat areas = dark)

#### multiply(input, output)

**Signature**: `layer.multiply(buffer_obj, buffer_obj)`

Multiplies two textures element-wise.

```
buffer_obj result;
result.canvas = (1920, 1080);
result.format = "rgba8";

layer.multiply(mask, result);  // layer * mask → result
```

**Parameters**:
- `input`: Buffer to multiply with the layer
- `output`: Target buffer_obj for result

#### add(input, output)

**Signature**: `layer.add(buffer_obj, buffer_obj)`

Adds two textures element-wise.

```
buffer_obj result;
result.canvas = (1920, 1080);
result.format = "rgba8";

layer.add(other_layer, result);  // layer + other_layer → result
```

#### threshold(output, level)

**Signature**: `layer.threshold(buffer_obj, Float)`

Applies hard threshold (values above level → 1, below → 0).

```
buffer_obj binary;
binary.canvas = (1920, 1080);
binary.format = "r8";

edges.threshold(binary, 0.5);  // Convert to binary edge map
```

**Parameters**:
- `output`: Target buffer_obj
- `level`: Threshold value (0.0-1.0)

#### ascii(output, char_size, chars)

**Signature**: `layer.ascii(buffer_obj, Int, String)`

Converts image to ASCII art representation.

```
buffer_obj ascii_output;
ascii_output.canvas = (1920, 1080);
ascii_output.format = "rgba8";

layer.ascii(ascii_output, 8, " .:-=+*#%@");  // char_size: pixels per character
```

**Parameters**:
- `output`: Target buffer_obj
- `char_size`: Pixel size of each ASCII character (4, 6, 8, 10)
- `chars`: String of characters ordered from dark to bright

### Multi-Pass Pipeline Examples

#### Example 1: Sobel Edge Detection

```
in_var camera = webcam;
out_var display = monitor1;

# Video layer
layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);

# Edge detection
buffer_obj edges;
edges.canvas = (1920, 1080);
edges.format = "r8";
video.sobel(edges, 0.15);

# Output edges
display.project(edges, 0);
```

#### Example 2: Kuwahara Artistic Filter

```
in_var camera = webcam;
out_var display = monitor1;

layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);

# Kuwahara smoothing
buffer_obj smoothed;
smoothed.canvas = (1920, 1080);
smoothed.format = "rgba8";
video.kuwahara(smoothed, 7);

display.project(smoothed, 0);
```

#### Example 3: Sobel → DoG → ASCII Pipeline

**Complete multi-pass pipeline for ASCII art with edge enhancement**

```
in_var camera = webcam;
out_var display = monitor1;

# Source video
layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);

# Pass 1: Sobel edge detection
buffer_obj edges;
edges.canvas = (1920, 1080);
edges.format = "r8";
video.sobel(edges, 0.15);

# Pass 2: Difference of Gaussians for edge enhancement
buffer_obj edges_refined;
edges_refined.canvas = (1920, 1080);
edges_refined.format = "r8";
edges.dog(edges_refined, 1.0, 2.0);

# Pass 3: Threshold to binary edge map
buffer_obj edges_binary;
edges_binary.canvas = (1920, 1080);
edges_binary.format = "r8";
edges_refined.threshold(edges_binary, 0.4);

# Pass 4: Multiply edge map with video (edge masking)
buffer_obj masked_video;
masked_video.canvas = (1920, 1080);
masked_video.format = "rgba8";
video.multiply(edges_binary, masked_video);

# Pass 5: ASCII conversion
buffer_obj ascii_art;
ascii_art.canvas = (1920, 1080);
ascii_art.format = "rgba8";
masked_video.ascii(ascii_art, 8, " .:-=+*#%@");

# Output final result
display.project(ascii_art, 0);
```

**Pipeline Flow**:
1. `video` → Sobel → `edges` (grayscale edge map)
2. `edges` → DoG → `edges_refined` (enhanced edges)
3. `edges_refined` → Threshold → `edges_binary` (binary edges)
4. `video` × `edges_binary` → `masked_video` (edges only)
5. `masked_video` → ASCII → `ascii_art` (final output)

#### Example 4: Dual-Pass Kuwahara + Edge Overlay

```
in_var camera = webcam;
out_var display = monitor1;

layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);

# Artistic smoothing
buffer_obj smoothed;
smoothed.canvas = (1920, 1080);
smoothed.format = "rgba8";
video.kuwahara(smoothed, 7);

# Edge detection on smoothed image
buffer_obj edges;
edges.canvas = (1920, 1080);
edges.format = "r8";
smoothed.sobel(edges, 0.2);

# Combine smoothed + edges
buffer_obj final_output;
final_output.canvas = (1920, 1080);
final_output.format = "rgba8";
smoothed.add(edges, final_output);

display.project(final_output, 0);
```

### Importable Filter Pipelines

Filters can be organized into reusable .txt files:

**filters/ascii_pipeline.txt**:
```
# Requires: layer_obj 'video' and out_var 'display'
buffer_obj edges;
edges.canvas = (1920, 1080);
edges.format = "r8";
video.sobel(edges, 0.15);

buffer_obj edges_refined;
edges_refined.canvas = (1920, 1080);
edges_refined.format = "r8";
edges.dog(edges_refined, 1.0, 2.0);

buffer_obj edges_binary;
edges_binary.canvas = (1920, 1080);
edges_binary.format = "r8";
edges_refined.threshold(edges_binary, 0.4);

buffer_obj masked_video;
masked_video.canvas = (1920, 1080);
masked_video.format = "rgba8";
video.multiply(edges_binary, masked_video);

buffer_obj ascii_art;
ascii_art.canvas = (1920, 1080);
ascii_art.format = "rgba8";
masked_video.ascii(ascii_art, 8, " .:-=+*#%@");

display.project(ascii_art, 0);
```

**main.txt**:
```
in_var camera = webcam;
out_var display = monitor1;

layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);

import filters/ascii_pipeline.txt
```

---

## Device Naming

### Video Input Devices

| Device Name | Description |
|-------------|-------------|
| `webcam` | Default built-in webcam |
| `usb_camera_1` | USB camera (index 1) |
| `usb_camera_2` | USB camera (index 2) |
| `hdmi_input` | HDMI capture card |
| `video_file_1` | Video file input |
| `ndi_source_1` | NDI network source |
| `syphon_input` | Syphon texture input |

**Device Enumeration**: Available devices are listed in `dossier.json` after running `update dossier.json`.

### Monitor Outputs

| Monitor Name | Default Resolution |
|--------------|-------------------|
| `monitor1` | 1920x1080 (landscape) |
| `monitor2` | 1080x1920 (portrait) |
| `monitor3` | Custom |

**Note**: Monitors must be opened with the REPL command `open_monitor [name]` before use.

---

## Import System

### Import Syntax

```
import filename.txt
import helper/setup.txt
```

**Behavior**:
- Searches for file relative to current project directory
- Executes each line of imported file sequentially
- Imported code can reference variables from parent

**Example**:

**main.txt**:
```
import setup.txt
import layers.txt
```

**setup.txt**:
```
in_var camera = webcam;
out_var display = monitor1;
```

**layers.txt**:
```
layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);
display.project(video, 0);
```

---

## Complete Example

```
# Educational Math Presentation
# Combines live presenter with mathematical visualization

# Input & Output
in_var presenter = webcam;
out_var screen = monitor1;

# Video layer (presenter in corner)
layer_obj video;
video.canvas = (1920, 1080);
presenter.cast(video);
video.transform(1200, 50);
video.scale(0.35, 0.35);

# Mathematical visualization (background)
math_obj surface;
surface.type = "parametric_surface";
surface.equation_x = "sin(u) * cos(v)";
surface.equation_y = "sin(u) * sin(v)";
surface.equation_z = "cos(u) + t/10";
surface.u_range = (0, 3.14159);
surface.v_range = (0, 6.28318);
surface.time_param = t;
surface.rotation = (t * 20, t * 30, 0);

layer_obj math_bg;
math_bg.canvas = (1920, 1080);
surface.render(math_bg);

# LaTeX annotation
math_obj equation;
equation.type = "latex";
equation.content = "f(u,v) = (\\sin u \\cos v, \\sin u \\sin v, \\cos u)";
equation.color = (255, 255, 255);
equation.size = 48;

layer_obj text_layer;
text_layer.canvas = (1920, 1080);
equation.render(text_layer);
text_layer.transform(50, 950);

# Composite all layers
screen.project(math_bg, 0);       # Background: math visualization
screen.project(video, 1);          # Middle: presenter video
screen.project(text_layer, 2);     # Top: equation text
```

---

## Type Reference

### Summary Table

| Type | Syntax | Example |
|------|--------|---------|
| String | `"..."` | `"Haeccstable"` |
| Int | `123` | `42` |
| Float | `1.23` | `3.14159` |
| Tuple2 | `(x, y)` | `(1920, 1080)` |
| Tuple3 | `(x, y, z)` | `(255, 128, 0)` |
| in_var | `in_var name = device` | `in_var cam = webcam` |
| out_var | `out_var name = monitor` | `out_var display = monitor1` |
| layer_obj | `layer_obj name` | `layer_obj video` |
| buffer_obj | `buffer_obj name` | `buffer_obj edges` |
| math_obj | `math_obj name` | `math_obj surface` |
| timeline | `timeline name` | `timeline anim` |

---

This API reference provides the complete specification for the Haeccstable DSL. For implementation details, see [IMPLEMENTATION.md](IMPLEMENTATION.md). For system architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).
