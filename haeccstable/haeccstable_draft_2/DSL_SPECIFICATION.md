# Haeccstable DSL Specification

**Complete Language Reference for Haeccstable Draft 2**

---

## Table of Contents

1. [Grammar](#grammar)
2. [Type System](#type-system)
3. [Variable Declarations](#variable-declarations)
4. [Function Definitions](#function-definitions)
5. [Object-Oriented Syntax](#object-oriented-syntax)
6. [Layer-Based Architecture](#layer-based-architecture)
7. [Imperative Commands](#imperative-commands)
8. [Process Blocks](#process-blocks)
9. [Built-in Functions](#built-in-functions)
10. [Video Operations](#video-operations)
11. [Audio Operations](#audio-operations)
12. [Graphics Operations](#graphics-operations)
13. [Filter Operations](#filter-operations)
14. [Complete Examples](#complete-examples)

---

## Grammar

### EBNF Specification

```ebnf
program          ::= statement*
statement        ::= comment | variable_decl | function_def | command | process_def | assignment

comment          ::= "//" text | "#" text

variable_decl    ::= var_type identifier ("=" expression)?
var_type         ::= "video_invar" | "video_outvar" | "audio_invar" | "audio_outvar"
                   | "number_var" | "window_var" | "layer_obj" | "var" | "func"

function_def     ::= "func" identifier "(" params ")" "=" expression

assignment       ::= identifier "=" expression
                   | identifier "." identifier "=" expression

command          ::= expression ";" expression
                   | identifier "." identifier
                   | identifier "(" arg_list ")"

process_def      ::= "process" process_identifier "(" params ")" "{" statement* "return" expression "}"
params           ::= (identifier ("," identifier)*)?

expression       ::= literal | identifier | function_call | process_call | binary_op | method_call | property_access
literal          ::= number | string | tuple
number           ::= integer | float | rational
rational         ::= integer "/" integer
string           ::= '"' text '"'
tuple            ::= "(" expression ("," expression)* ")"

function_call    ::= identifier "(" arg_list ")"
process_call     ::= process_identifier "(" arg_list ")"
method_call      ::= identifier "." identifier "(" arg_list ")"
property_access  ::= identifier "." identifier

arg_list         ::= (expression ("," expression)*)? | named_arg ("," named_arg)*
named_arg        ::= identifier "=" expression

binary_op        ::= expression operator expression
operator         ::= "+" | "-" | "*" | "/" | "%" | "^"

identifier       ::= [a-zA-Z_][a-zA-Z0-9_]*
process_identifier ::= "$" [a-zA-Z_][a-zA-Z0-9_]*
```

---

## Type System

### Primitive Types

```haeccstable
number         // 42, 3.14, 3/2 (rational)
string         // "hello", "Output Window"
boolean        // true, false
tuple          // (1920, 1080), (100, 0), (1.0, 0.8, 0.4)
```

### Variable Type Qualifiers

```haeccstable
// Video types
video_invar      // Input video streams (captures, files) - read-only sources
video_outvar     // Output video streams (processed, generated) - writable

// Audio types
audio_invar      // Input audio streams (microphone, files) - read-only sources
audio_outvar     // Output audio streams (synthesis, processed) - playback targets

// Other types
number_var       // Numeric values and parameters
window_var       // Cocoa window references
layer_obj        // Composition layers for video
var              // Generic variables (numbers, strings, etc.)
func             // Function definitions
```

### Type Directionality

**Input variables (`invar`):**
- Represent data sources (cameras, microphones, files)
- Read-only in nature
- Cannot be modified, only read and processed

**Output variables (`outvar`):**
- Represent data sinks (speakers, displays via layers)
- Can have properties modified (mix, frequency, waveform)
- Can be started/stopped (play/stop)

### Type Inference

Variables are strongly typed based on their declaration and initialization:

```haeccstable
video_invar webcam = capture(0)      // webcam is video input stream
audio_outvar tone = sine(440)        // tone is audio output for playback
var x = 3                            // x is number (inferred)
func ratio(x, y) = x / y             // ratio is a function
```

### Type Checking

Operations are type-checked at runtime:

```haeccstable
layer1.cast(webcam)           // ✓ video_invar can be cast to layer
window1.project(layer1)       // ✓ layer_obj can be projected to window
tone.play                     // ✓ audio_outvar can be played
webcam.play                   // ✗ Error: Cannot play video_invar
```

---

## Variable Declarations

### video_invar (Input Video)

**Syntax:** `video_invar <name> = <source>`

**Sources:**
```haeccstable
video_invar webcam = capture(0)                 // Webcam at index 0
video_invar file = load("video.mp4")            // Load video file
video_invar screen = capture_screen(0)          // Screen capture
```

**Characteristics:**
- Read-only video streams
- Can be cast to layers
- Can be processed by filters (sobel, dog, etc.)
- Cannot be played directly (must go through layer → window)

### video_outvar (Output Video)

**Syntax:** `video_outvar <name> = <expression>`

**Usage:**
```haeccstable
video_outvar filtered = sobel(webcam, threshold=0.15)
video_outvar processed = ascii_filter(webcam)
```

**Characteristics:**
- Results of video processing
- Can be cast to layers
- Represent processed video data

### audio_invar (Input Audio)

**Syntax:** `audio_invar <name> = <source>`

**Sources:**
```haeccstable
audio_invar mic = capture_audio(0)              // Microphone input
audio_invar audio_file = load_audio("sound.wav")
```

**Characteristics:**
- Read-only audio streams
- Can be analyzed/visualized
- Cannot be mixed or played directly (read-only)

### audio_outvar (Output Audio)

**Syntax:** `audio_outvar <name> = <generator>`

**Generators:**
```haeccstable
audio_outvar tone = sine(440)                   // Sine wave at 440Hz
audio_outvar square = square(220)               // Square wave
audio_outvar tri = triangle(330)                // Triangle wave
audio_outvar saw = sawtooth(110)                // Sawtooth wave
```

**Characteristics:**
- Audio outputs for playback
- Have properties: `frequency`, `waveform`, `amplitude`, `mix`
- Can be played/stopped
- Can be modified with `.set()` or property assignment

### number_var

**Syntax:** `number_var <name> = <value>`

**Values:**
```haeccstable
number_var ratio = 3/2                          // Rational number (preserved)
number_var freq = 440                           // Integer
number_var scale = 0.5                          // Float
number_var calculated = freq * ratio            // Expression (660)
```

### var (Generic Variables)

**Syntax:** `var <name> [= <value>]`

**Usage:**
```haeccstable
var x                                           // Declare without value
var y
var base_freq = 440                             // Declare with value
x = 3                                           // Assign later
y = 2
```

**Characteristics:**
- Type inferred from value
- Can be reassigned
- Typically used for numbers, strings, booleans

### window_var

**Syntax:** `window_var <name> = window(<title>, <width>, <height>)`

```haeccstable
window_var win1 = window("Output", 1920, 1080)
window_var win2 = window("ASCII", 1920, 1080)
window_var fullhd = window("Main", 1920, 1080)
```

**Methods:**
- `window.project(layer)` - Project a layer onto the window

### layer_obj

**Syntax:** `layer_obj <name> = layer(<name>, <width>, <height>)`

```haeccstable
layer_obj mainLayer = layer("Main", 1920, 1080)
layer_obj wideLayer = layer("Widescreen", 1920, 1080)
layer_obj squareLayer = layer("Square", 1080, 1080)
```

**Methods:**
- `layer.cast(video)` - Cast a video stream onto the layer
- Can be projected onto windows

---

## Function Definitions

### Syntax

**Single-line lambda functions:**
```haeccstable
func <name>(<parameters>) = <expression>
```

### Examples

```haeccstable
// Simple math function
func ratio(x, y) = x / y

// Multi-parameter
func add(a, b) = a + b

// Using other functions
func freq_ratio(base, x, y) = base * ratio(x, y)

// Complex expressions
func lerp(a, b, t) = a + (b - a) * t
```

### Usage

```haeccstable
var x = 3
var y = 2
var result = ratio(x, y)                        // result = 1.5

number_var base = 440
audio_outvar freq2 = sine(base * ratio(3, 2))  // 660 Hz
```

### Scope

Functions are global once defined and can be used anywhere in the session.

---

## Object-Oriented Syntax

### Method Calls

**Syntax:** `object.method(arguments)`

```haeccstable
// Layer methods
widescreenLayer.cast(webcam)

// Window methods
win1.project(widescreenLayer)

// Audio methods (no arguments)
freq1.play
freq2.play
```

### Property Access

**Reading properties:**
```haeccstable
object.property
```

**Setting properties:**
```haeccstable
object.property = value
```

### Property Assignment Examples

```haeccstable
// Audio mixing (stereo panning)
freq1.mix = (100, 0)          // 100% left, 0% right
freq2.mix = (0, 100)          // 0% left, 100% right
freq3.mix = (50, 50)          // Center

// Waveform change
tone.waveform = "triangle"

// Frequency change
tone.frequency = 880
```

### Available Properties by Type

**audio_outvar properties:**
- `frequency` (number) - Oscillator frequency in Hz
- `waveform` (string) - "sine", "square", "triangle", "sawtooth"
- `amplitude` (number) - 0.0 to 1.0
- `mix` (tuple) - (left_percent, right_percent)

**layer_obj properties:**
- `opacity` (number) - 0.0 to 1.0
- `position` (tuple) - (x, y)
- `scale` (tuple) - (scale_x, scale_y)

---

## Layer-Based Architecture

### Concept

The layer-based architecture provides compositional control over video:

```
Video Source (video_invar)
    ↓ cast
Layer (layer_obj)
    ↓ project
Window (window_var)
    ↓
Display (Cocoa NSWindow)
```

### Creating Layers

```haeccstable
layer_obj layerName = layer("Display Name", width, height)
```

**Parameters:**
- `name` - Human-readable layer name (string)
- `width` - Layer width in pixels (number)
- `height` - Layer height in pixels (number)

### Casting Video to Layers

```haeccstable
layerName.cast(video_source)
```

**What it does:**
- Binds a video stream to a layer
- Video is rendered at layer resolution
- Automatically handles scaling/cropping
- Multiple layers can cast the same source

### Projecting Layers to Windows

```haeccstable
windowName.project(layer)
```

**What it does:**
- Displays layer content in window
- Real-time rendering at 60fps
- Window shows layer's current state
- One layer per window

### Complete Workflow Example

```haeccstable
// 1. Create video source
video_invar webcam = capture(0)

// 2. Create window
window_var win = window("Output", 1920, 1080)

// 3. Create layer
layer_obj mainLayer = layer("Main", 1920, 1080)

// 4. Cast video to layer
mainLayer.cast(webcam)

// 5. Project layer to window
win.project(mainLayer)
```

### Multi-Layer Composition

```haeccstable
// Same source, different aspect ratios
video_invar webcam = capture(0)

window_var wideWin = window("16:9", 1920, 1080)
window_var squareWin = window("1:1", 1080, 1080)

layer_obj wideLayer = layer("Wide", 1920, 1080)
layer_obj squareLayer = layer("Square", 1080, 1080)

wideLayer.cast(webcam)
squareLayer.cast(webcam)

wideWin.project(wideLayer)
squareWin.project(squareLayer)
```

### Processing Before Casting

```haeccstable
video_invar webcam = capture(0)
video_outvar filtered = $sobel(webcam, threshold=0.15)

layer_obj originalLayer = layer("Original", 1920, 1080)
layer_obj filteredLayer = layer("Filtered", 1920, 1080)

originalLayer.cast(webcam)
filteredLayer.cast(filtered)

win1.project(originalLayer)
win2.project(filteredLayer)
```

---

## Imperative Commands

### Semicolon Operator (Simultaneous Execution)

**Syntax:** `command1; command2; command3`

**Purpose:** Execute multiple commands at exactly the same time.

```haeccstable
// Start two audio outputs simultaneously
freq1.play; freq2.play

// Cast to multiple layers at once
layer1.cast(webcam); layer2.cast(webcam)

// Combined operations
freq1.play; freq2.play; layer.cast(webcam)
```

**Use cases:**
- Synchronized audio playback
- Simultaneous visual updates
- Atomicity (all or nothing execution)

### Legacy Commands (Still Supported)

These commands work but layer-based approach is preferred:

```haeccstable
// Direct show (bypasses layer system)
show(webcam, win1)                    // Creates implicit layer

// Direct play
play(tone, left)                      // Equivalent to tone.mix = (100, 0); tone.play

// Direct draw
draw(lissajous(L, R), win)           // Creates implicit layer for graphics
```

---

## Process Blocks

**Syntax:**
```haeccstable
process $<name>(<parameters>) {
    <statements>
    return <expression>
}
```

**Important:** All process names must begin with `$` prefix. This distinguishes processes from regular functions and makes it clear when filter operations are being invoked.

### Process Variables

Inside processes, intermediate variables don't need type qualifiers:

```haeccstable
process $edge_detect(input) {
    edges = $sobel(input, threshold=0.15)       // No type needed
    enhanced = $dog(edges, sigma1=1.0, sigma2=2.0)
    return enhanced
}
```

### Nested Processes

```haeccstable
process $edge_detect(input) {
    return $sobel(input, threshold=0.15)
}

process $ascii_pipeline(input) {
    edges = $edge_detect(input)                 // Call other process
    binary = $threshold(edges, level=0.4)
    masked = $multiply(input, binary)
    ascii_img = $ascii(masked, chars=" .:-=+*#%@", size=8)
    return $gooch(ascii_img, warm=(1.0,0.8,0.4), cool=(0.2,0.4,0.8))
}

video_invar webcam = capture(0)
video_outvar result = $ascii_pipeline(webcam)

layer_obj asciiLayer = layer("ASCII", 1920, 1080)
asciiLayer.cast(result)
win.project(asciiLayer)
```

### Built-in vs User-Defined Processes

**Built-in processes** are provided by the system (implemented in C++ with Accelerate/Metal):
- `$sobel`, `$dog`, `$gaussian_blur`, `$ascii`, `$gooch`, etc.
- All video filter operations use the `$` prefix

**User-defined processes** are declared in `.haec` files:
- Must start with `$` prefix in declaration: `process $my_filter(input) { ... }`
- Called with `$` prefix: `result = $my_filter(webcam)`

**Loaded processes** from C++ files via `load_process()`:
- Functions in C++ file automatically get `$` prefix when registered
- Example: `advanced_sobel()` in C++ becomes `$advanced_sobel()` in DSL

---

## Built-in Functions

### Video Sources

```haeccstable
capture(index)                    // Capture from video device (returns video_invar)
load(filename)                    // Load video file (returns video_invar)
capture_screen(index)             // Screen capture (returns video_invar)
```

### Audio Generators

```haeccstable
sine(frequency)                   // Sine wave (returns audio_outvar)
square(frequency)                 // Square wave (returns audio_outvar)
triangle(frequency)               // Triangle wave (returns audio_outvar)
sawtooth(frequency)               // Sawtooth wave (returns audio_outvar)
```

### Audio Sources

```haeccstable
capture_audio(index)              // Audio input device (returns audio_invar)
load_audio(filename)              // Load audio file (returns audio_invar)
```

### Window Management

```haeccstable
window(title, width, height)      // Create window (returns window_var)
```

### Layer Management

```haeccstable
layer(name, width, height)        // Create composition layer (returns layer_obj)
```

### Graphics/Visualization

```haeccstable
lissajous(audio_L, audio_R, scale=1.0)      // Lissajous curve (returns drawable)
waveform(audio)                              // Waveform display (returns drawable)
spectrogram(audio)                           // Frequency spectrum (returns drawable)
```

### Process Loading

```haeccstable
load_process(filename)                       // Load C++ filter process from file
```

**Purpose:** Load custom C++ filter implementations with tunable parameters.

**Behavior:**
- Parses C++ filter file and extracts all callable functions and their parameters
- Registers functions in dossier.json with full parameter specifications
- Makes functions available for use in DSL processes
- Parameters become tunable in real-time

**Example:**
```haeccstable
// Load custom edge detection filters
load_process("filters/advanced_sobel.cpp")

// Now all functions from the file are available with $ prefix
video_outvar edges = $advanced_sobel(webcam, threshold=0.15, kernel_size=3)

// Parameters are exposed in dossier.json and can be modified:
// {
//   "processes": {
//     "$advanced_sobel": {
//       "source": "filters/advanced_sobel.cpp",
//       "parameters": {
//         "threshold": { "type": "float", "range": [0.0, 1.0], "default": 0.15 },
//         "kernel_size": { "type": "int", "range": [3, 7], "default": 3 },
//         "normalize": { "type": "bool", "default": true }
//       }
//     }
//   }
// }
```

**C++ File Requirements:**
- Functions must have signature: `CVPixelBuffer* function_name(CVPixelBuffer* input, ...)`
- Parameters must use standard types: `float`, `int`, `bool`, `(float, float, float)`
- Parameter ranges specified with comments: `// @param threshold [0.0, 1.0] Edge sensitivity`
- Functions are automatically bridged to Swift via Objective-C++ and registered with `$` prefix

**See:** [ARCHITECTURE.md - C++ Process System](#) for implementation details

---

## Video Operations

**Note:** All video processing operations are processes and must use the `$` prefix.

### Luminance & Color

```haeccstable
$luminance_extract(video, exposure=1.0, attenuation=1.0)
// Extracts luminance from RGB video
// exposure: Brightness multiplier (0.0-5.0)
// attenuation: Luminance exponent for contrast (0.0-5.0)
// Returns: video_outvar (greyscale)

$downscale(video, factor=2)
// Downscales video for performance
// factor: Reduction factor (2, 4, 8, etc.)
// Returns: video_outvar
```

### Edge Detection Filters

```haeccstable
$sobel(video, threshold=0.15, direction="both")
// Sobel edge detection
// threshold: Edge sensitivity (0.0-1.0)
// direction: "horizontal", "vertical", "both"
// Returns: video_outvar (edge map)

$sobel_with_angles(video, threshold=0.15, direction="vertical")
// Sobel with directional angle information
// Returns edge map with angle data for ASCII orientation
// Returns: video_outvar (edge map + angles)

$dog(video, sigma1=1.0, sigma2=2.0, tau=0.98)
// Difference of Gaussians for edge enhancement
// sigma1: Inner Gaussian radius
// sigma2: Outer Gaussian radius (should be > sigma1)
// tau: DoG threshold for detail preservation (0.0-1.1)
// Returns: video_outvar (enhanced edges)
```

### Blur & Smoothing

```haeccstable
$gaussian_blur(video, sigma=1.0, direction="both", kernel_size=5)
// Gaussian blur filter
// sigma: Blur strength (0.0-5.0)
// direction: "horizontal", "vertical", "both"
// kernel_size: Convolution kernel size (1-10)
// Returns: video_outvar

$kuwahara(video, kernel_size=5)
// Edge-preserving filter
// kernel_size: Size of analysis window
// Returns: video_outvar
```

### Depth-Based Operations

```haeccstable
$depth_to_normals(video, depth_scale=1.0)
// Reconstructs 3D surface normals from depth buffer
// Provides geometric edge information
// depth_scale: Depth sensitivity multiplier
// Returns: video_outvar (normal map)

$edge_detect_depth(video, normals, depth_threshold=1.0,
                   normal_threshold=1.0, depth_cutoff=1000.0)
// Combined depth and normal-based edge detection
// normals: Normal map from $depth_to_normals()
// depth_threshold: Sensitivity to depth discontinuities (0.0-5.0)
// normal_threshold: Sensitivity to surface orientation changes (0.0-5.0)
// depth_cutoff: Maximum distance for edge detection (0.0-1000.0)
// Returns: video_outvar (depth edges)

$depth_falloff(video, falloff=0.5, offset=100.0)
// Applies distance-based fading
// falloff: How quickly content fades with distance (0.0-1.0)
// offset: Distance where fading begins (0.0-1000.0)
// Returns: video_outvar

$combine_edges(dog_edges, depth_edges, sobel_angles, edge_threshold=32)
// Combines multiple edge detection sources
// edge_threshold: Minimum edge pixels per 8x8 tile (0-64)
// Returns: video_outvar (combined edge map)
```

### Transformations

```haeccstable
$threshold(video, level=0.5)
// Binary threshold
// level: Threshold value (0.0-1.0)
// Returns: video_outvar (binary mask)

$multiply(video1, video2)
// Element-wise multiplication
// Returns: video_outvar

$add(video1, video2)
// Element-wise addition
// Returns: video_outvar

$blend(video1, video2, alpha=0.5)
// Alpha blend two videos
// alpha: Blend factor (0.0=video1, 1.0=video2)
// Returns: video_outvar
```

### Stylization

```haeccstable
$ascii(video, edges=None, luminance=None, chars=" .:-=+*#%@",
       size=8, use_edges=false, invert_luminance=false)
// ASCII art rendering
// video: Input video stream
// edges: Optional edge map for character orientation
// luminance: Optional luminance map (overrides video luminance)
// chars: String of characters (dark to bright)
// size: Character size in pixels (4, 6, 8, 10, 12)
// use_edges: Orient characters based on edge angles
// invert_luminance: Reverse brightness mapping
// Returns: video_outvar

$gooch(video, warm=(1.0,0.8,0.4), cool=(0.2,0.4,0.8),
       base_color_blend=0.0)
// Gooch shading (technical illustration style)
// warm: RGB tuple for warm tone (highlights)
// cool: RGB tuple for cool tone (shadows)
// base_color_blend: Mix with original colors (0.0-1.0)
// Returns: video_outvar
```

### Example Usage

```haeccstable
video_invar webcam = capture(0)

// Simple edge detection
video_outvar edges = $sobel(webcam, threshold=0.15)
video_outvar enhanced = $dog(edges, sigma1=1.0, sigma2=2.0)
video_outvar binary = $threshold(enhanced, level=0.4)

layer_obj edgeLayer = layer("Edges", 1920, 1080)
edgeLayer.cast(binary)
win.project(edgeLayer)

// Advanced depth-aware pipeline
luminance = $luminance_extract(webcam, exposure=1.0, attenuation=1.0)
normals = $depth_to_normals(webcam, depth_scale=1.0)
depth_edges = $edge_detect_depth(webcam, normals,
                                  depth_threshold=1.0,
                                  normal_threshold=1.0)
combined = $combine_edges(enhanced, depth_edges, edges, edge_threshold=32)
ascii_out = $ascii(webcam, edges=combined, luminance=luminance,
                   chars=" .:-=+*#%@", size=8, use_edges=true)
result = $depth_falloff(ascii_out, falloff=0.5, offset=100.0)
```

---

## Audio Operations

### Waveform Modification

```haeccstable
// Using property assignment
tone.waveform = "sine"
tone.waveform = "square"
tone.waveform = "triangle"
tone.waveform = "sawtooth"

// Legacy set() command (still supported)
set(tone, "waveform", "triangle")
```

### Frequency Control

```haeccstable
// Using property assignment
tone.frequency = 440
tone.frequency = base * ratio(3, 2)

// Legacy set() command
set(tone, "frequency", 660)
```

### Amplitude Control

```haeccstable
// Using property assignment
tone.amplitude = 0.5                // 0.0 - 1.0

// Legacy set() command
set(tone, "amplitude", 0.8)
```

### Stereo Mixing

```haeccstable
// Mix property (left%, right%)
freq1.mix = (100, 0)                // Hard left
freq2.mix = (0, 100)                // Hard right
freq3.mix = (50, 50)                // Center
freq4.mix = (75, 25)                // Left-biased

// Legacy play command
play(freq1, left)                   // Equivalent to mix = (100, 0); play
play(freq2, right)                  // Equivalent to mix = (0, 100); play
```

### Playback Control

```haeccstable
// Start playback
tone.play

// Stop playback
tone.stop

// Simultaneous playback
freq1.play; freq2.play; freq3.play
```

---

## Graphics Operations

### Lissajous Curves

```haeccstable
draw(lissajous(L, R), window)
draw(lissajous(L, R, scale=0.5), window)     // Scaled down
```

**Parameters:**
- `L` - Left audio channel (audio_outvar or audio_invar)
- `R` - Right audio channel (audio_outvar or audio_invar)
- `scale` - Size multiplier (default 1.0)

**Drawing to windows:**
```haeccstable
audio_outvar freq1 = sine(440)
audio_outvar freq2 = sine(660)

window_var vizWin = window("Lissajous", 1920, 1080)

draw(lissajous(freq1, freq2, scale=0.5), vizWin)
```

### Waveform Display

```haeccstable
draw(waveform(tone), window)
```

Shows time-domain waveform.

### Spectrogram

```haeccstable
draw(spectrogram(mic), window)
```

Shows frequency spectrum over time.

---

## Filter Operations

**Note:** All filter operations are implemented in C++ for performance and can be loaded/customized using `load_process()`. Default implementations are built-in. All process calls require the `$` prefix.

### $luminance_extract(input, exposure, attenuation)

Extracts luminance (greyscale) from RGB video.

**Parameters:**
- `input`: video_invar or video_outvar
- `exposure`: Brightness multiplier (0.0 - 5.0, default: 1.0)
- `attenuation`: Luminance exponent for contrast adjustment (0.0 - 5.0, default: 1.0)

**Returns:** video_outvar (greyscale)

**Algorithm:** Computes luminance using standard formula: `L = 0.299*R + 0.587*G + 0.114*B`, then applies `L' = (L * exposure)^attenuation`

```haeccstable
video_outvar luminance = $luminance_extract(webcam, exposure=1.5, attenuation=0.8)
```

### $sobel(input, threshold, direction)

Edge detection using Sobel operator.

**Parameters:**
- `input`: video_invar or video_outvar
- `threshold`: Edge sensitivity (0.0 - 1.0, default: 0.15)
- `direction`: "horizontal", "vertical", or "both" (default: "both")

**Returns:** video_outvar (grayscale edge map)

**Algorithm:** 3x3 convolution with Sobel kernels, gradient magnitude calculation, threshold application

```haeccstable
video_outvar edges = $sobel(webcam, threshold=0.15, direction="both")
video_outvar edges_h = $sobel(webcam, threshold=0.15, direction="horizontal")
```

### $sobel_with_angles(input, threshold, direction)

Sobel edge detection with directional angle information for ASCII character orientation.

**Parameters:**
- `input`: video_invar or video_outvar
- `threshold`: Edge sensitivity (0.0 - 1.0, default: 0.15)
- `direction`: Must be "vertical" for angle computation

**Returns:** video_outvar (edge map with embedded angle data)

**Algorithm:** Computes both horizontal and vertical gradients, calculates edge angles using `atan2(Gy, Gx)` for character orientation

```haeccstable
video_outvar sobel_angles = $sobel_with_angles(dog_edges, threshold=0.15, direction="vertical")
```

### $dog(input, sigma1, sigma2, tau)

Difference of Gaussians for edge enhancement.

**Parameters:**
- `input`: video_invar or video_outvar
- `sigma1`: Inner Gaussian radius (0.0 - 5.0, default: 1.0)
- `sigma2`: Outer Gaussian radius (0.0 - 5.0, default: 2.0, should be > sigma1)
- `tau`: DoG threshold for detail preservation (0.0 - 1.1, default: 0.98)

**Returns:** video_outvar (enhanced edges)

**Algorithm:** Applies two Gaussian blurs with different radii, subtracts them, applies tau threshold

```haeccstable
video_outvar enhanced = $dog(edges, sigma1=1.0, sigma2=2.0, tau=0.98)
```

### $gaussian_blur(input, sigma, direction, kernel_size)

Gaussian blur filter.

**Parameters:**
- `input`: video_invar or video_outvar
- `sigma`: Blur strength (0.0 - 5.0, default: 1.0)
- `direction`: "horizontal", "vertical", or "both" (default: "both")
- `kernel_size`: Convolution kernel size (1 - 10, default: 5)

**Returns:** video_outvar

**Algorithm:** Separable Gaussian convolution using vDSP for performance

```haeccstable
blurred_h = $gaussian_blur(video, sigma=1.0, direction="horizontal", kernel_size=5)
blurred = $gaussian_blur(blurred_h, sigma=1.0, direction="vertical", kernel_size=5)
```

### $depth_to_normals(input, depth_scale)

Reconstructs 3D surface normals from depth buffer for geometric edge detection.

**Parameters:**
- `input`: video_invar or video_outvar (with depth channel)
- `depth_scale`: Depth sensitivity multiplier (0.1 - 10.0, default: 1.0)

**Returns:** video_outvar (normal map)

**Algorithm:** Uses linearized depth to reconstruct 3D positions, computes surface normals via cross product of neighboring vertices

```haeccstable
video_outvar normals = $depth_to_normals(webcam, depth_scale=1.0)
```

### $edge_detect_depth(input, normals, depth_threshold, normal_threshold, depth_cutoff)

Combined depth and normal-based edge detection.

**Parameters:**
- `input`: video_invar or video_outvar (with depth channel)
- `normals`: Normal map from `depth_to_normals()`
- `depth_threshold`: Sensitivity to depth discontinuities (0.0 - 5.0, default: 1.0)
- `normal_threshold`: Sensitivity to surface orientation changes (0.0 - 5.0, default: 1.0)
- `depth_cutoff`: Maximum distance for edge detection (0.0 - 1000.0, default: 1000.0)

**Returns:** video_outvar (depth-based edge map)

**Algorithm:** Compares depth differences between neighboring pixels, uses normal deviation to detect surface boundaries, eliminates edges beyond cutoff distance

```haeccstable
depth_edges = $edge_detect_depth(webcam, normals,
                                  depth_threshold=1.0,
                                  normal_threshold=1.0,
                                  depth_cutoff=1000.0)
```

### $combine_edges(dog_edges, depth_edges, sobel_angles, edge_threshold)

Combines multiple edge detection sources.

**Parameters:**
- `dog_edges`: DoG edge map
- `depth_edges`: Depth-based edge map
- `sobel_angles`: Sobel edge map with angle information
- `edge_threshold`: Minimum edge pixels per 8x8 tile (0 - 64, default: 32)

**Returns:** video_outvar (combined edge map with angle data)

**Algorithm:** Merges edge information from all sources, preserves angle data from Sobel, applies threshold per tile

```haeccstable
combined = $combine_edges(dog_edges, depth_edges, sobel_angles, edge_threshold=32)
```

### $depth_falloff(input, falloff, offset)

Applies distance-based fading to create depth perception.

**Parameters:**
- `input`: video_invar or video_outvar
- `falloff`: How quickly content fades with distance (0.0 - 1.0, default: 0.5)
- `offset`: Distance where fading begins (0.0 - 1000.0, default: 100.0)

**Returns:** video_outvar

**Algorithm:** Applies exponential fade based on depth: `alpha = exp(-falloff * max(0, depth - offset))`

```haeccstable
video_outvar faded = $depth_falloff(ascii_img, falloff=0.5, offset=100.0)
```

### $threshold(input, level)

Binary threshold.

**Parameters:**
- `input`: video_invar or video_outvar
- `level`: Threshold value (0.0 - 1.0, default: 0.5)

**Returns:** video_outvar (binary mask)

**Algorithm:** Pixels above level become white (1.0), pixels below become black (0.0)

```haeccstable
video_outvar binary = $threshold(enhanced, level=0.4)
```

### $multiply(input1, input2)

Element-wise multiplication.

**Parameters:**
- `input1`: video_invar or video_outvar
- `input2`: video_invar or video_outvar (must match dimensions)

**Returns:** video_outvar

**Algorithm:** Per-pixel multiplication, useful for applying masks

```haeccstable
video_outvar masked = $multiply(webcam, binary_mask)
```

### $downscale(input, factor)

Downscales video for performance optimization.

**Parameters:**
- `input`: video_invar or video_outvar
- `factor`: Reduction factor (2, 4, 8, 16, default: 2)

**Returns:** video_outvar

**Algorithm:** Box filter downsampling, preserves color and luminance

```haeccstable
video_outvar downscaled = $downscale(luminance, factor=8)
```

### $ascii(input, edges, luminance, chars, size, use_edges, invert_luminance)

ASCII art rendering with edge-aware character orientation.

**Parameters:**
- `input`: video_invar or video_outvar
- `edges`: Optional edge map for character orientation (from `combine_edges()` or `sobel_with_angles()`)
- `luminance`: Optional luminance map (from `luminance_extract()`, overrides input luminance)
- `chars`: String of characters ordered dark to bright (default: `" .:-=+*#%@"`)
- `size`: Character size in pixels - 4, 6, 8, 10, 12 (default: 8)
- `use_edges`: Whether to orient characters based on edge angles (default: false)
- `invert_luminance`: Reverse brightness mapping (default: false)

**Returns:** video_outvar

**Algorithm:**
- Divides frame into `size × size` pixel tiles
- Samples luminance (or provided luminance map) for each tile
- If `use_edges=true`, reads edge angle and rotates character to match
- Selects character from `chars` based on average tile brightness
- Renders character using Metal compute shader with pre-generated character atlas

```haeccstable
// Simple ASCII (luminance only)
video_outvar ascii_img = $ascii(webcam, chars=" .:-=+*#%@", size=8)

// Edge-aware ASCII (Acerola style)
video_outvar ascii_img = $ascii(
    input=webcam,
    edges=combined_edges,
    luminance=luminance_map,
    chars=" .:-=+*#%@",
    size=8,
    use_edges=true,
    invert_luminance=false
)

// High-density ASCII
video_outvar dense = $ascii(webcam,
    chars=" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    size=6)
```

### $gooch(input, warm, cool, base_color_blend)

Gooch shading (technical illustration style).

**Parameters:**
- `input`: video_invar or video_outvar
- `warm`: RGB tuple for warm tone (highlights) - e.g., (1.0, 0.8, 0.4)
- `cool`: RGB tuple for cool tone (shadows) - e.g., (0.2, 0.4, 0.8)
- `base_color_blend`: Mix with original image colors (0.0 - 1.0, default: 0.0)

**Returns:** video_outvar

**Algorithm:**
- Computes surface brightness from luminance
- Interpolates between `cool` and `warm` colors based on brightness
- If `base_color_blend > 0`, mixes with original image colors: `result = gooch_color * (1 - blend) + original_color * blend`
- Implements Gooch shading model for technical illustration effects

```haeccstable
// Pure Gooch shading (no original colors)
video_outvar shaded = $gooch(ascii_img,
    warm=(1.0, 0.8, 0.4),
    cool=(0.2, 0.4, 0.8),
    base_color_blend=0.0)

// Gooch with partial color preservation
video_outvar colored = $gooch(ascii_img,
    warm=(1.0, 0.8, 0.4),
    cool=(0.2, 0.4, 0.8),
    base_color_blend=0.3)  // 30% original colors

// Different color schemes
video_outvar pastel = $gooch(video, warm=(1.0, 0.9, 0.7), cool=(0.3, 0.5, 0.9))
video_outvar saturated = $gooch(video, warm=(1.0, 0.5, 0.2), cool=(0.1, 0.2, 0.5))
```

---

## Complete Examples

### Example 1: Videocat (Dual Windows with Layers)

```haeccstable
// Goal: Webcam to two windows with different aspect ratios

video_invar webcam = capture(0)

window_var win1 = window("Output 1", 1920, 1080)
window_var win2 = window("Output 2", 1920, 1080)

layer_obj widescreenLayer = layer("Widescreen", 1920, 1080)
layer_obj fullscreenLayer = layer("Fullscreen", 1440, 1080)

widescreenLayer.cast(webcam)
fullscreenLayer.cast(webcam)

win1.project(widescreenLayer)
win2.project(fullscreenLayer)
```

### Example 2: Lissajous Stereo Synthesis

```haeccstable
// Goal: Stereo sine tones with visual Lissajous

var x
var y
func ratio(x, y) = x / y
var base_freq = 440
x = 3
y = 2

audio_outvar freq1 = sine(base_freq)
audio_outvar freq2 = sine(base_freq * ratio(x, y))

freq1.mix = (100, 0)    // 100% left channel, 0% right channel
freq2.mix = (0, 100)    // 0% left, 100% right

window_var lissajousAnimationWindow = window("Lissajous", 1920, 1080)

freq1.play; freq2.play  // Trigger both simultaneously

draw(lissajous(freq1, freq2, scale=0.5), lissajousAnimationWindow)

// Modify at runtime:
// freq1.waveform = "triangle"
// x = 4; y = 3
// freq2.frequency = base_freq * ratio(x, y)
```

### Example 3: Acerola ASCII Filter

```haeccstable
// Goal: Edge-enhanced ASCII with Gooch shading

video_invar webcam = capture(0)

window_var original = window("Original", 1920, 1080)
window_var filtered = window("ASCII", 1920, 1080)

process $ascii_filter(input) {
    // Edge detection
    edges = $sobel(input, threshold=0.15)

    // Edge enhancement
    enhanced = $dog(edges, sigma1=1.0, sigma2=2.0)

    // Binary mask
    binary = $threshold(enhanced, level=0.4)

    // Apply mask to original
    masked = $multiply(input, binary)

    // ASCII rendering
    ascii_img = $ascii(masked, chars=" .:-=+*#%@", size=8)

    // Gooch shading
    result = $gooch(ascii_img, warm=(1.0,0.8,0.4), cool=(0.2,0.4,0.8))

    return result
}

layer_obj originalLayer = layer("Original", 1920, 1080)
layer_obj asciiLayer = layer("ASCII", 1920, 1080)

originalLayer.cast(webcam)
asciiLayer.cast($ascii_filter(webcam))

original.project(originalLayer)
filtered.project(asciiLayer)
```

### Example 4: Interactive Audio Control

```haeccstable
// Combined audio + video with interactive control

var base = 220
var x = 4
var y = 3

func ratio(x, y) = x / y

audio_outvar L = sine(base)
audio_outvar R = sine(base * ratio(x, y))

L.mix = (100, 0)
R.mix = (0, 100)

window_var audioWin = window("Audio Viz", 1920, 1080)
window_var lissajousWin = window("Lissajous", 1920, 1080)

L.play; R.play

draw(waveform(L), audioWin)
draw(lissajous(L, R), lissajousWin)

// Runtime modifications:
// L.waveform = "square"
// R.waveform = "triangle"
// base = 440
// L.frequency = base
// R.frequency = base * ratio(x, y)
```

### Example 5: Multi-Layer Composition

```haeccstable
// Multiple layers with different processing

video_invar webcam = capture(0)

// Create processed versions
video_outvar edges = $sobel(webcam, threshold=0.15)
video_outvar blurred = $gaussian_blur(webcam, sigma=2.0)
video_outvar ascii = $ascii_filter(webcam)

// Create windows and layers
window_var win1 = window("Original", 960, 540)
window_var win2 = window("Edges", 960, 540)
window_var win3 = window("Blurred", 960, 540)
window_var win4 = window("ASCII", 960, 540)

layer_obj layer1 = layer("L1", 960, 540)
layer_obj layer2 = layer("L2", 960, 540)
layer_obj layer3 = layer("L3", 960, 540)
layer_obj layer4 = layer("L4", 960, 540)

// Cast all at once
layer1.cast(webcam); layer2.cast(edges); layer3.cast(blurred); layer4.cast(ascii)

// Project to windows
win1.project(layer1)
win2.project(layer2)
win3.project(layer3)
win4.project(layer4)
```

---

## Comments

```haeccstable
// Single line comment

# Alternative comment style

video_invar webcam = capture(0)  // Inline comment
```

---

## Error Handling

**Type Errors:**
```haeccstable
win.project(webcam)              // Error: Cannot project video_invar directly (need layer)
webcam.play                      // Error: video_invar has no play method
tone.cast(webcam)                // Error: audio_outvar cannot cast video
```

**Undefined Variables:**
```haeccstable
layer1.cast(undefined_var)       // Error: Variable 'undefined_var' not defined
```

**Invalid Parameters:**
```haeccstable
edges = sobel(webcam, threshold=2.0)  // Error: threshold must be 0.0-1.0
layer1 = layer("L1", -100, 1080)      // Error: width must be positive
```

**Method Errors:**
```haeccstable
webcam.project(layer1)           // Error: video_invar has no project method
number_var x = 5
x.play                           // Error: number_var has no play method
```

---

## Reserved Keywords

```
video_invar, video_outvar, audio_invar, audio_outvar
number_var, window_var, layer_obj
var, func, process, return
left, right, mono
true, false
```

---

## Naming Conventions

**Variables:** `snake_case` or `camelCase`
```haeccstable
video_invar my_webcam = capture(0)
var base_freq = 440
var baseFreq = 440          // Also valid
```

**Functions:** `snake_case` or `camelCase`
```haeccstable
func edge_detect(input) = sobel(input, threshold=0.15)
func calcRatio(x, y) = x / y
```

**Processes:** `snake_case`
```haeccstable
process ascii_filter(input) { ... }
process apply_effects(video) { ... }
```

**Layers/Windows:** Descriptive names
```haeccstable
layer_obj mainLayer = layer("Main Display", 1920, 1080)
window_var outputWindow = window("ASCII Output", 1920, 1080)
```

---

This DSL specification provides the complete language reference for Haeccstable Draft 2, incorporating the layer-based architecture, object-oriented syntax, and function definitions. For system architecture, see [ARCHITECTURE.md](ARCHITECTURE.md). For implementation details, see [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
