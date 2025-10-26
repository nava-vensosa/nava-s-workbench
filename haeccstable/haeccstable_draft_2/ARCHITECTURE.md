# Haeccstable Architecture

**System Architecture for Draft 2 - Layer-Based Compositional Design**

---

## Table of Contents

1. [Overview](#overview)
2. [Component Diagram](#component-diagram)
3. [Layer Architecture](#layer-architecture)
4. [Data Flow](#data-flow)
5. [Inter-Process Communication](#inter-process-communication)
6. [Video Pipeline](#video-pipeline)
7. [Audio Pipeline](#audio-pipeline)
8. [Layer Management](#layer-management)
9. [DSL Parser Architecture](#dsl-parser-architecture)
10. [State Management](#state-management)
11. [Performance Considerations](#performance-considerations)

---

## Overview

Haeccstable is a multi-process, multi-language live coding environment with four integrated layers:

1. **Python Terminal** - User interface, DSL parsing, and command dispatch
2. **Swift App** - Layer composition, window management, audio synthesis, state coordination
3. **Metal Rendering** - GPU-accelerated video processing and composition
4. **C++ DSP** - Performance-critical filters and math operations

### Key Design Decisions

- **Layer-Based Composition**: Video → Layer → Window pipeline for flexible composition
- **Object-Oriented DSL**: Method calls and property access for intuitive control
- **Type Directionality**: Input (`invar`) vs Output (`outvar`) for data flow clarity
- **Unix Socket IPC**: Python ↔ Swift communication with JSON protocol
- **Zero-Copy Video**: IOSurface shared memory for efficient texture transfer
- **AudioKit**: Swift-native audio synthesis with property-based control
- **Metal-Only**: No OpenGL (macOS 11+ requirement)
- **Live Rendering**: Real-time processing at 60fps

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    TERMINAL LAYER (Python)                  │
│  ┌────────────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Curses UI         │  │ DSL Parser   │  │ IPC Client  │ │
│  │  - 3-pane layout   │  │ - Lexer      │  │ - Socket    │ │
│  │  - Vim motions     │  │ - Parser     │  │ - JSON      │ │
│  │  - Focus switching │  │ - Type check │  │ - Commands  │ │
│  │  - Mode system     │  │ - AST gen    │  │ - Responses │ │
│  └────────────────────┘  └──────────────┘  └─────────────┘ │
│           │                       │                  │       │
│           └───────────────────────┴──────────────────┘       │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    │ Unix Socket
                                    │ (JSON commands)
┌───────────────────────────────────┼──────────────────────────┐
│                    SWIFT APP LAYER                           │
│  ┌────────────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Command Server    │  │ Window Mgr   │  │ AudioKit    │ │
│  │  - Socket listener │  │ - NSWindow   │  │ - Synth     │ │
│  │  - JSON parsing    │  │ - Lifecycle  │  │ - Effects   │ │
│  │  - Dispatch        │  │ - Events     │  │ - Playback  │ │
│  └────────────────────┘  └──────────────┘  └─────────────┘ │
│           │                       │                  │       │
│           ├───────────────────────┤                  │       │
│  ┌────────┴────────┐  ┌───────────┴──────┐  ┌───────┴─────┐│
│  │  State Manager  │  │ Layer Manager     │  │ AVFoundation││
│  │  - Variables    │  │ - Composition     │  │ - Camera    ││
│  │  - Functions    │  │ - Casting         │  │ - Mic       ││
│  │  - Processes    │  │ - Projection      │  │ - Files     ││
│  │  - dossier.json │  │ - Properties      │  │             ││
│  └─────────────────┘  └───────────┬──────┘  └─────────────┘│
│                                   │                          │
│                       ┌───────────┴──────────┐               │
│                       │ Metal Coordinator    │               │
│                       │ - Render loop (60fps)│               │
│                       │ - Texture management │               │
│                       │ - Pipeline config    │               │
│                       └──────────────────────┘               │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────┐
│               METAL RENDERING LAYER                          │
│  ┌────────────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Render Pipeline   │  │ Shaders      │  │ Textures    │ │
│  │  - Vertex shader   │  │ - Gooch      │  │ - IOSurface │ │
│  │  - Fragment shader │  │ - ASCII      │  │ - MTLTexture│ │
│  │  - Compute shader  │  │ - Passthrough│  │ - Cache     │ │
│  │  - Layer comp      │  │ - Lissajous  │  │ - Layers    │ │
│  └────────────────────┘  └──────────────┘  └─────────────┘ │
│           │                       │                          │
│           └───────────────────────┘                          │
│                      │                                       │
└──────────────────────┼───────────────────────────────────────┘
                       │ C++ Bridge
┌──────────────────────┼───────────────────────────────────────┐
│               C++ DSP/FILTER LAYER                           │
│  ┌────────────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Filters           │  │ Math         │  │ SIMD        │ │
│  │  - Sobel           │  │ - Convolution│  │ - Accelerate│ │
│  │  - DoG             │  │ - Gradients  │  │ - vDSP      │ │
│  │  - Kuwahara        │  │ - Threshold  │  │ - vImage    │ │
│  │  - Gaussian        │  │ - Multiply   │  │ - NEON      │ │
│  └────────────────────┘  └──────────────┘  └─────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Layer Architecture

### Conceptual Model

The layer-based architecture provides compositional control over video display:

```
Video Source (video_invar)
         ↓
    Processing (optional)
         ↓
Video Output (video_outvar)
         ↓
    layer.cast(video)
         ↓
Layer Object (layer_obj)
         ↓
  window.project(layer)
         ↓
Window Display (window_var)
         ↓
Cocoa NSWindow
```

### Layer Properties

Each layer (`layer_obj`) has:

- **Dimensions**: Width × Height in pixels
- **Video Source**: Video stream cast to layer
- **Global Default Properties**:
  - `defaultOpacity`: 0.0 to 1.0 (used if no window override)
  - `defaultPosition`: (x, y) offset
  - `defaultScale`: (scale_x, scale_y)
- **Render Target**: Metal texture (IOSurface-backed)

### Multi-Layer Window Composition

**NEW**: Windows support multiple layers with independent properties per window.

#### Layer Stack Model

Each window maintains an ordered stack of layers:

```
Window "Output"
  ├─ Layer "background" (priority: 1, opacity: 1.0)
  ├─ Layer "videoFeed" (priority: 2, opacity: 0.8)
  └─ Layer "overlay" (priority: 10, opacity: 0.5)
```

**Key Features**:
1. **Layer Reuse**: Same layer can appear on multiple windows
2. **Per-Window Properties**: Layer has different opacity/position/scale on each window
3. **Priority-Based Ordering**: Integer priority determines z-order (higher = front)
4. **Unlimited Layers**: No hard limit, performance-bound only
5. **Independent Updates**: Change layer priority/opacity without affecting other windows

#### Window-Specific Layer Properties

Each window maintains per-layer overrides:

```swift
struct WindowLayer {
    let layerName: String       // Reference to layer_obj
    var priority: Int           // Z-order (higher = front)
    var opacity: Double?        // Override (0.0-1.0), nil = use layer default
    var position: [Double]?     // Override [x, y], nil = use layer default
    var scale: [Double]?        // Override [x_scale, y_scale], nil = use layer default
}
```

#### DSL Syntax for Multi-Layer Composition

```haeccstable
# Create layers
layer_obj bg = layer("Background", 1920, 1080)
layer_obj video = layer("Video", 1920, 1080)
layer_obj overlay = layer("Overlay", 1920, 1080)

# Set global defaults
bg.opacity = 1.0
video.opacity = 0.8

# Project layers onto window with priorities
window.project(bg, 1)        # Background at priority 1
window.project(video, 2)     # Video in front at priority 2
window.project(overlay, 10)  # Overlay on top at priority 10

# Modify window-specific layer properties
window.layeropacity(video, 50)           # 50% opacity on this window only
window.layerpriority(overlay, 3)         # Reorder: overlay between bg and video
window.layerposition(video, (100, 200))  # Offset video layer
window.layerscale(overlay, (0.5, 0.5))   # Scale overlay to 50%

# Remove layer from specific window
window.remove(overlay)
```

### Multi-Layer Benefits

1. **Flexible Composition**: Unlimited layers per window with priority control
2. **Layer Reuse**: Same layer appears on multiple windows with different properties
3. **Independent Processing**: Different filters per layer
4. **Real-time Reordering**: Change layer stack order programmatically
5. **Mathematical Control**: Priority as integer enables calculated layer ordering
6. **Aspect Ratio Control**: Same source, different layer dimensions
7. **Hybrid Properties**: Global defaults + window-specific overrides
8. **Decoupling**: Video processing independent of window management

---

## Data Flow

### Command Execution Flow

```
User Input (Terminal)
         ↓
DSL Parser (Python)
    - Lexical analysis
    - Syntax parsing
    - Type checking
    - AST generation
         ↓
Command Generation
    - JSON serialization
    - IPC message format
         ↓
Unix Socket (IPC)
         ↓
Command Server (Swift)
    - JSON deserialization
    - Command routing
         ↓
Command Handlers
    ├─→ Variable creation
    ├─→ Function definition
    ├─→ Layer management
    ├─→ Window management
    ├─→ Audio synthesis
    └─→ Property updates
         ↓
State Manager
    - Update dossier.json
    - Track variables
    - Track functions/processes
         ↓
Response (JSON)
         ↓
Python UI Update
    - Dossier refresh
    - Log append
```

### Video Frame Flow

```
Video Source
    ↓
AVCaptureSession (Swift)
    ↓
CVPixelBuffer
    ↓
[Optional: C++ Filter]
    ↓
IOSurface (Shared Memory)
    ↓
MTLTexture (Metal)
    ↓
Layer Render Target
    ↓
[Optional: Metal Shader]
    ↓
Window Framebuffer
    ↓
Display (60fps)
```

### Audio Sample Flow

```
AudioKit Oscillator
    ↓
AVAudioEngine
    ↓
Audio Buffer (Tap)
    ├─→ Stereo Mixer
    │       ↓
    │   CoreAudio Output
    │       ↓
    │   Speakers
    │
    └─→ Visualization (Parallel)
            ↓
        Lissajous/Waveform
            ↓
        Metal Rendering
            ↓
        Window Display
```

---

## Inter-Process Communication

### IPC Protocol (JSON over Unix Socket)

**Socket Path:** `/tmp/haeccstable.sock`

**Message Format:**
```json
{
  "type": "command_type",
  "data": { ... }
}
```

### Variable Declaration Messages

**video_invar:**
```json
{
  "type": "video_invar",
  "name": "webcam",
  "source": "capture",
  "index": 0
}
```

**audio_outvar:**
```json
{
  "type": "audio_outvar",
  "name": "freq1",
  "generator": "sine",
  "frequency": 440
}
```

**Generic var:**
```json
{
  "type": "var",
  "name": "x",
  "value": 3
}
```

**Function definition:**
```json
{
  "type": "func",
  "name": "ratio",
  "params": ["x", "y"],
  "expression": "x / y"
}
```

### Layer Management Messages

**Create layer:**
```json
{
  "type": "layer_obj",
  "name": "mainLayer",
  "label": "Main Display",
  "width": 1920,
  "height": 1080
}
```

**Cast video to layer:**
```json
{
  "type": "method_call",
  "object": "mainLayer",
  "method": "cast",
  "args": ["webcam"]
}
```

**Project layer to window:**
```json
{
  "type": "method_call",
  "object": "win1",
  "method": "project",
  "args": ["mainLayer"]
}
```

### Property Assignment Messages

**Audio mix:**
```json
{
  "type": "property_set",
  "object": "freq1",
  "property": "mix",
  "value": [100, 0]
}
```

**Audio waveform:**
```json
{
  "type": "property_set",
  "object": "freq1",
  "property": "waveform",
  "value": "triangle"
}
```

**Layer opacity:**
```json
{
  "type": "property_set",
  "object": "layer1",
  "property": "opacity",
  "value": 0.8
}
```

### Simultaneous Execution Messages

**Semicolon operator:**
```json
{
  "type": "simultaneous",
  "commands": [
    {
      "type": "method_call",
      "object": "freq1",
      "method": "play"
    },
    {
      "type": "method_call",
      "object": "freq2",
      "method": "play"
    }
  ]
}
```

### Response Messages

**Success response:**
```json
{
  "status": "success",
  "message": "Layer mainLayer created",
  "dossier_update": {
    "layers": {
      "mainLayer": {
        "width": 1920,
        "height": 1080,
        "video_source": "webcam"
      }
    }
  }
}
```

**Error response:**
```json
{
  "status": "error",
  "message": "Cannot project video_invar directly (need layer)",
  "line": 5
}
```

---

## Video Pipeline

### Layer-Based Video Architecture

#### 1. Video Source Creation

**DSL:**
```haeccstable
video_invar webcam = capture(0)
```

**Swift:**
```swift
class VideoInputVariable {
    let name: String
    let captureSession: AVCaptureSession
    var pixelBuffer: CVPixelBuffer?

    func startCapture() {
        // AVCaptureSession setup
        // CVPixelBuffer output
    }
}
```

#### 2. Video Processing (Optional)

**DSL:**
```haeccstable
video_outvar edges = sobel(webcam, threshold=0.15)
```

**Swift → C++ Bridge:**
```swift
class VideoOutputVariable {
    let name: String
    let sourceVariable: VideoInputVariable
    let filter: FilterType
    var processedBuffer: CVPixelBuffer?

    func apply() {
        processedBuffer = FilterBridge.sobel(
            input: sourceVariable.pixelBuffer,
            threshold: 0.15
        )
    }
}
```

**C++ Filter:**
```cpp
CVPixelBuffer* sobel_filter(CVPixelBuffer* input, float threshold) {
    // Lock pixel buffer
    // Apply Sobel convolution (vImage)
    // Threshold
    // Return processed buffer
}
```

#### 3. Layer Creation

**DSL:**
```haeccstable
layer_obj mainLayer = layer("Main", 1920, 1080)
```

**Swift:**
```swift
class Layer {
    let name: String
    let displayName: String
    let width: Int
    let height: Int
    var videoSource: VideoVariable?
    var texture: MTLTexture?
    var ioSurface: IOSurface?

    var opacity: Float = 1.0
    var position: (Float, Float) = (0, 0)
    var scale: (Float, Float) = (1, 1)

    init(name: String, displayName: String, width: Int, height: Int) {
        self.name = name
        self.displayName = displayName
        self.width = width
        self.height = height

        // Create IOSurface for zero-copy
        self.ioSurface = IOSurface(
            width: width,
            height: height,
            pixelFormat: kCVPixelFormatType_32BGRA
        )

        // Create Metal texture from IOSurface
        self.texture = metalDevice.makeTexture(fromIOSurface: ioSurface!)
    }
}
```

#### 4. Cast Video to Layer

**DSL:**
```haeccstable
mainLayer.cast(webcam)
```

**Swift:**
```swift
extension Layer {
    func cast(_ video: VideoVariable) {
        self.videoSource = video

        // Update render loop to use this video source
        MetalCoordinator.shared.bindLayer(self, to: video)
    }
}
```

**Metal Rendering:**
```swift
class MetalCoordinator {
    func render(layer: Layer, to window: NSWindow) {
        guard let video = layer.videoSource,
              let pixelBuffer = video.currentBuffer,
              let layerTexture = layer.texture else { return }

        // Create Metal texture from pixel buffer
        let sourceTexture = textureCache.createTexture(from: pixelBuffer)

        // Render to layer texture (with scaling if needed)
        renderCommandEncoder.setFragmentTexture(sourceTexture, index: 0)
        renderCommandEncoder.setFragmentTexture(layerTexture, index: 1)
        renderCommandEncoder.drawPrimitives(...)

        // Present to window
        commandBuffer.present(window.drawable)
        commandBuffer.commit()
    }
}
```

#### 5. Project Layer to Window

**DSL:**
```haeccstable
win1.project(mainLayer)
```

**Swift:**
```swift
extension NSWindow {
    func project(_ layer: Layer) {
        self.layer = layer

        // Metal view displays layer.texture
        (self.contentView as? MTKView)?.layer = layer
    }
}
```

### Zero-Copy Pipeline

```
CVPixelBuffer (Camera)
         ↓
   [IOSurface backed]
         ↓
  MTLTexture (read)
         ↓
  C++ Filter (optional)
         ↓
  CVPixelBuffer (filtered)
         ↓
   [IOSurface backed]
         ↓
  MTLTexture (read)
         ↓
  Layer Texture (write)
         ↓
   [IOSurface backing]
         ↓
  Window Display
```

**Key:** All stages use IOSurface, no CPU copies.

---

## Audio Pipeline

### Audio Synthesis with Properties

#### 1. Audio Variable Creation

**DSL:**
```haeccstable
audio_outvar freq1 = sine(440)
```

**Swift:**
```swift
class AudioOutputVariable {
    let name: String
    var oscillator: AKOscillator
    var mixer: AKMixer

    // Properties
    var frequency: Double {
        get { oscillator.frequency }
        set { oscillator.frequency = newValue }
    }

    var waveform: String {
        get { oscillatorType }
        set {
            switch newValue {
            case "sine": oscillator = AKOscillator(waveform: .sine)
            case "square": oscillator = AKOscillator(waveform: .square)
            case "triangle": oscillator = AKOscillator(waveform: .triangle)
            case "sawtooth": oscillator = AKOscillator(waveform: .sawtooth)
            default: break
            }
        }
    }

    var amplitude: Double {
        get { oscillator.amplitude }
        set { oscillator.amplitude = newValue }
    }

    var mix: (Double, Double) = (0, 0) {
        didSet {
            updateStereoMix()
        }
    }

    func updateStereoMix() {
        let (left, right) = mix
        mixer.pan = (right - left) / 100.0  // -1.0 to 1.0
        mixer.volume = (left + right) / 200.0
    }
}
```

#### 2. Property Assignment

**DSL:**
```haeccstable
freq1.mix = (100, 0)
freq1.waveform = "triangle"
```

**Swift Handling:**
```swift
func handlePropertySet(object: String, property: String, value: Any) {
    guard let audioVar = stateManager.audioVariables[object] else {
        return sendError("Undefined variable: \(object)")
    }

    switch property {
    case "mix":
        guard let tuple = value as? [Double], tuple.count == 2 else {
            return sendError("Invalid mix value")
        }
        audioVar.mix = (tuple[0], tuple[1])

    case "waveform":
        guard let waveform = value as? String else {
            return sendError("Invalid waveform value")
        }
        audioVar.waveform = waveform

    case "frequency":
        guard let freq = value as? Double else {
            return sendError("Invalid frequency value")
        }
        audioVar.frequency = freq

    case "amplitude":
        guard let amp = value as? Double else {
            return sendError("Invalid amplitude value")
        }
        audioVar.amplitude = amp

    default:
        return sendError("Unknown property: \(property)")
    }

    updateDossier()
}
```

#### 3. Playback Control

**DSL:**
```haeccstable
freq1.play; freq2.play
```

**Swift:**
```swift
extension AudioOutputVariable {
    func play() {
        oscillator.start()
        audioEngine.attach(oscillator)
        audioEngine.connect(oscillator, to: mixer)
    }

    func stop() {
        oscillator.stop()
        audioEngine.detach(oscillator)
    }
}
```

#### 4. Simultaneous Execution

**Swift:**
```swift
func handleSimultaneous(commands: [Command]) {
    // Execute all at once (same timestamp)
    let group = DispatchGroup()

    for command in commands {
        group.enter()
        DispatchQueue.global().async {
            self.execute(command)
            group.leave()
        }
    }

    group.wait()  // Synchronize
}
```

### Audio Visualization

**Lissajous Rendering:**

```swift
class LissajousRenderer {
    func render(left: AudioOutputVariable, right: AudioOutputVariable, scale: Float) {
        // Install tap on audio engine
        let bufferSize: AVAudioFrameCount = 1024

        left.mixer.installTap(onBus: 0, bufferSize: bufferSize) { buffer, time in
            let leftSamples = buffer.floatChannelData?[0]
            let rightSamples = right.mixer.lastBuffer?.floatChannelData?[0]

            // Calculate Lissajous points
            var points: [SIMD2<Float>] = []
            for i in 0..<Int(bufferSize) {
                let x = leftSamples[i] * scale
                let y = rightSamples[i] * scale
                points.append(SIMD2(x, y))
            }

            // Render to Metal texture
            self.renderPoints(points, to: window)
        }
    }
}
```

---

## Layer Management

### Layer Manager (Swift)

```swift
class LayerManager {
    private var layers: [String: Layer] = [:]

    func createLayer(name: String, displayName: String, width: Int, height: Int) -> Layer {
        let layer = Layer(
            name: name,
            displayName: displayName,
            width: width,
            height: height
        )
        layers[name] = layer
        return layer
    }

    func getLayer(_ name: String) -> Layer? {
        return layers[name]
    }

    func castVideo(layerName: String, videoName: String) {
        guard let layer = layers[layerName],
              let video = stateManager.getVideo(videoName) else {
            return
        }

        layer.cast(video)
        updateDossier()
    }

    func setLayerProperty(layerName: String, property: String, value: Any) {
        guard let layer = layers[layerName] else { return }

        switch property {
        case "opacity":
            if let opacity = value as? Float {
                layer.opacity = opacity
            }
        case "position":
            if let pos = value as? [Float], pos.count == 2 {
                layer.position = (pos[0], pos[1])
            }
        case "scale":
            if let scale = value as? [Float], scale.count == 2 {
                layer.scale = (scale[0], scale[1])
            }
        default:
            break
        }
    }
}
```

---

## DSL Parser Architecture

### Parser Components (Python)

```python
class DSLParser:
    def __init__(self):
        self.lexer = Lexer()
        self.parser = Parser()
        self.type_checker = TypeChecker()
        self.state = StateTracker()

    def parse_statement(self, line: str) -> Command:
        # 1. Lexical analysis
        tokens = self.lexer.tokenize(line)

        # 2. Syntax parsing
        ast = self.parser.parse(tokens)

        # 3. Type checking
        self.type_checker.check(ast, self.state)

        # 4. Command generation
        return self.generate_command(ast)
```

### Parsing New Syntax Elements

**Function definition:**
```python
def parse_function(self, tokens):
    # func ratio(x, y) = x / y
    if tokens[0].type != 'FUNC':
        return None

    name = tokens[1].value
    params = self.parse_params(tokens[2:])
    expression = self.parse_expression(tokens_after_equals)

    return {
        'type': 'func',
        'name': name,
        'params': params,
        'expression': expression
    }
```

**Method call:**
```python
def parse_method_call(self, tokens):
    # layer.cast(webcam)
    if '.' not in [t.value for t in tokens]:
        return None

    object_name = tokens[0].value
    method_name = tokens[2].value  # after dot
    args = self.parse_args(tokens[4:])  # inside parens

    return {
        'type': 'method_call',
        'object': object_name,
        'method': method_name,
        'args': args
    }
```

**Property assignment:**
```python
def parse_property_set(self, tokens):
    # freq1.mix = (100, 0)
    if '.' not in tokens or '=' not in tokens:
        return None

    object_name = tokens[0].value
    property_name = tokens[2].value  # after dot
    value = self.parse_expression(tokens_after_equals)

    return {
        'type': 'property_set',
        'object': object_name,
        'property': property_name,
        'value': value
    }
```

**Semicolon operator:**
```python
def parse_simultaneous(self, tokens):
    # freq1.play; freq2.play
    if ';' not in [t.value for t in tokens]:
        return self.parse_single_command(tokens)

    commands = []
    current_tokens = []

    for token in tokens:
        if token.value == ';':
            commands.append(self.parse_single_command(current_tokens))
            current_tokens = []
        else:
            current_tokens.append(token)

    # Last command after final semicolon
    commands.append(self.parse_single_command(current_tokens))

    return {
        'type': 'simultaneous',
        'commands': commands
    }
```

---

## State Management

### Dossier Structure (dossier.json)

```json
{
  "timestamp": "2025-10-26 14:30:00",

  "devices": {
    "video": [
      {
        "index": 0,
        "name": "FaceTime HD Camera (Built-in)",
        "resolution": [1920, 1080],
        "framerate": 30
      }
    ],
    "audio": [
      {
        "index": 0,
        "name": "Built-in Microphone",
        "channels": 2,
        "samplerate": 48000
      }
    ]
  },

  "variables": {
    "webcam": {
      "type": "video_invar",
      "source": "capture",
      "device": 0,
      "resolution": [1920, 1080]
    },
    "freq1": {
      "type": "audio_outvar",
      "generator": "sine",
      "frequency": 440,
      "waveform": "sine",
      "amplitude": 0.8,
      "mix": [100, 0],
      "playing": true
    },
    "x": {
      "type": "var",
      "value": 3
    },
    "base_freq": {
      "type": "var",
      "value": 440
    }
  },

  "functions": {
    "ratio": {
      "params": ["x", "y"],
      "expression": "x / y"
    }
  },

  "processes": {
    "ascii_filter": {
      "params": ["input"],
      "body": "..."
    }
  },

  "layers": {
    "mainLayer": {
      "displayName": "Main Display",
      "width": 1920,
      "height": 1080,
      "videoSource": "webcam",
      "opacity": 1.0,
      "position": [0, 0],
      "scale": [1.0, 1.0]
    }
  },

  "windows": {
    "win1": {
      "title": "Output 1",
      "size": [1920, 1080],
      "layer": "mainLayer",
      "visible": true
    }
  }
}
```

### State Manager (Swift)

```swift
class StateManager {
    var videoVariables: [String: VideoVariable] = [:]
    var audioVariables: [String: AudioOutputVariable] = [:]
    var genericVariables: [String: Any] = [:]
    var functions: [String: Function] = [:]
    var processes: [String: Process] = [:]
    var layers: [String: Layer] = [:]
    var windows: [String: NSWindow] = [:]

    func updateDossier() {
        let dossier = [
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "devices": getDevices(),
            "variables": getVariables(),
            "functions": getFunctions(),
            "processes": getProcesses(),
            "layers": getLayers(),
            "windows": getWindows()
        ]

        let jsonData = try! JSONSerialization.data(withJSONObject: dossier)
        try! jsonData.write(to: URL(fileURLWithPath: "python/dossier.json"))
    }
}
```

---

## C++ Process Loading System

### Overview

Haeccstable allows users to load custom C++ filter implementations via the `load_process(filename)` command. This enables fine-tuning of filter parameters and extension of the filter library without modifying core code.

**Important:** All processes (both built-in and loaded from C++) must use the `$` prefix when called in DSL code. For example, a C++ function `advanced_sobel()` becomes `$advanced_sobel()` in the DSL. This distinguishes processes from regular functions and makes filter operations immediately recognizable.

### C++ Process File Format

**Example Filter File: `filters/advanced_sobel.cpp`**

```cpp
#include <CoreVideo/CoreVideo.h>
#include <Accelerate/Accelerate.h>

// Function signature: CVPixelBuffer* function_name(CVPixelBuffer* input, ...)
// @param annotations define parameter metadata for dossier.json

// @function advanced_sobel
// @description Enhanced Sobel edge detection with adaptive thresholding
extern "C" CVPixelBuffer* advanced_sobel(
    CVPixelBuffer* input,
    // @param threshold [0.0, 1.0] Edge sensitivity (default: 0.15)
    float threshold,
    // @param kernel_size [3, 7] Convolution kernel size (default: 3)
    int kernel_size,
    // @param normalize [true, false] Normalize gradient magnitude (default: true)
    bool normalize
) {
    // Lock input buffer
    CVPixelBufferLockBaseAddress(input, kCVPixelBufferLock_ReadOnly);
    void* baseAddress = CVPixelBufferGetBaseAddress(input);
    size_t width = CVPixelBufferGetWidth(input);
    size_t height = CVPixelBufferGetHeight(input);

    // Create output buffer
    CVPixelBuffer* output;
    CVPixelBufferCreate(NULL, width, height, kCVPixelFormatType_32BGRA,
                        NULL, &output);
    CVPixelBufferLockBaseAddress(output, 0);
    void* outAddress = CVPixelBufferGetBaseAddress(output);

    // Sobel convolution using vImage (Accelerate framework)
    vImage_Buffer src = {baseAddress, height, width, width * 4};
    vImage_Buffer dest = {outAddress, height, width, width * 4};

    // Apply Sobel with custom kernel size
    int16_t* kernel = generate_sobel_kernel(kernel_size);
    vImageConvolve_ARGB8888(&src, &dest, NULL, 0, 0, kernel, kernel_size,
                            kernel_size, 1, NULL, kvImageEdgeExtend);

    // Apply threshold and normalization
    if (normalize) {
        normalize_gradients(dest, threshold);
    }

    // Unlock buffers
    CVPixelBufferUnlockBaseAddress(input, kCVPixelBufferLock_ReadOnly);
    CVPixelBufferUnlockBaseAddress(output, 0);

    return output;
}

// Helper functions
int16_t* generate_sobel_kernel(int size) {
    // Generate dynamic Sobel kernel
    // ...
}

void normalize_gradients(vImage_Buffer buffer, float threshold) {
    // Normalize and threshold
    // ...
}
```

### Parameter Annotation Format

Parameters are documented using special comments that the parser extracts:

```cpp
// @param parameter_name [min, max] Description (default: value)
```

**Supported Types:**
- `float` - Floating point with range `[min, max]`
- `int` - Integer with range `[min, max]`
- `bool` - Boolean with options `[true, false]`
- `(float, float, float)` - RGB tuple with range per component

**Example:**
```cpp
// @param warm_color [0.0, 1.0] Warm tone RGB (default: (1.0, 0.8, 0.4))
(float, float, float) warm_color
```

### Load Process Workflow

**1. User Command:**
```haeccstable
load_process("filters/advanced_sobel.cpp")
```

**2. Python DSL Parser:**
```python
def handle_load_process(filename):
    # Parse C++ file
    functions = parse_cpp_file(filename)

    # Extract metadata
    for func in functions:
        metadata = extract_function_metadata(func)
        # Send to Swift via IPC
        ipc_client.send({
            'type': 'load_process',
            'filename': filename,
            'functions': metadata
        })
```

**3. Swift Command Handler:**
```swift
func handleLoadProcess(filename: String, functions: [FunctionMetadata]) {
    // Compile C++ file to dylib
    let dylibPath = compileCppFilter(filename)

    // Load dylib
    guard let handle = dlopen(dylibPath, RTLD_NOW) else {
        return sendError("Failed to load process: \(filename)")
    }

    // Register functions
    for funcMeta in functions {
        let symbol = dlsym(handle, funcMeta.name)
        guard let funcPointer = symbol else { continue }

        // Store function pointer and metadata
        FilterRegistry.shared.register(
            name: funcMeta.name,
            pointer: funcPointer,
            parameters: funcMeta.parameters
        )

        // Update dossier.json
        updateDossierWithProcess(funcMeta)
    }
}
```

**4. Dossier Update:**
```json
{
  "processes": {
    "$advanced_sobel": {
      "source": "filters/advanced_sobel.cpp",
      "type": "loaded",
      "loaded_at": "2025-10-26T14:30:00Z",
      "parameters": {
        "threshold": {
          "type": "float",
          "range": [0.0, 1.0],
          "default": 0.15,
          "current": 0.15
        },
        "kernel_size": {
          "type": "int",
          "range": [3, 7],
          "default": 3,
          "current": 3
        },
        "normalize": {
          "type": "bool",
          "default": true,
          "current": true
        }
      }
    }
  }
}
```

**5. Usage in DSL:**
```haeccstable
// Now function is available with $ prefix
video_outvar edges = $advanced_sobel(webcam, threshold=0.2, kernel_size=5, normalize=true)

// Parameters can be modified at runtime
// User can edit dossier.json or use set() command
```

### Function Registry (Swift)

```swift
class FilterRegistry {
    static let shared = FilterRegistry()

    struct FilterFunction {
        let name: String
        let pointer: UnsafeMutableRawPointer
        let parameters: [ParameterMetadata]
        let returnType: String
    }

    private var filters: [String: FilterFunction] = [:]

    func register(name: String, pointer: UnsafeMutableRawPointer,
                  parameters: [ParameterMetadata]) {
        filters[name] = FilterFunction(
            name: name,
            pointer: pointer,
            parameters: parameters,
            returnType: "CVPixelBuffer*"
        )
    }

    func call(name: String, input: CVPixelBuffer, args: [String: Any]) -> CVPixelBuffer? {
        guard let filter = filters[name] else { return nil }

        // Prepare arguments from args dictionary
        let preparedArgs = prepareArguments(filter.parameters, args)

        // Call function pointer with prepared arguments
        typealias FilterFunc = @convention(c) (CVPixelBuffer, UnsafeRawPointer) -> CVPixelBuffer
        let function = unsafeBitCast(filter.pointer, to: FilterFunc.self)

        return function(input, preparedArgs)
    }
}
```

### C++ Compilation

**Build Script (Swift calls during load_process):**

```bash
#!/bin/bash
# compile_filter.sh

INPUT_FILE="$1"
OUTPUT_DYLIB="$2"

clang++ -std=c++17 \
    -dynamiclib \
    -framework CoreVideo \
    -framework Accelerate \
    -framework Metal \
    -O3 \
    -march=native \
    -ffast-math \
    "$INPUT_FILE" \
    -o "$OUTPUT_DYLIB"
```

**Called from Swift:**
```swift
func compileCppFilter(_ sourcePath: String) -> String {
    let dylibPath = "/tmp/haeccstable_filters/\(UUID().uuidString).dylib"

    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/bash")
    process.arguments = ["compile_filter.sh", sourcePath, dylibPath]

    try? process.run()
    process.waitUntilExit()

    return dylibPath
}
```

### Built-in Processes

All filter functions documented in DSL_SPECIFICATION.md are built-in. All process names use the `$` prefix:
- `$sobel`, `$sobel_with_angles`
- `$dog`, `$gaussian_blur`
- `$luminance_extract`, `$downscale`
- `$depth_to_normals`, `$edge_detect_depth`
- `$combine_edges`, `$depth_falloff`
- `$threshold`, `$multiply`, `$add`, `$blend`
- `$ascii`, `$gooch`

These are implemented in `swift/HaeccstableApp/Filters/` as pre-compiled C++ with Objective-C++ bridges.

### Parameter Hot-Reload

Parameters can be modified in real-time:

**1. Edit dossier.json:**
```json
"$advanced_sobel": {
  "parameters": {
    "threshold": {
      "current": 0.25  // Changed from 0.15
    }
  }
}
```

**2. Dossier watcher detects change:**
```swift
class DossierWatcher {
    func fileDidChange() {
        let newDossier = loadDossier()

        // Update filter parameters
        for (processName, processData) in newDossier.processes {
            updateProcessParameters(processName, processData.parameters)
        }
    }
}
```

**3. Filter automatically uses new parameters on next frame**

### Example: Complete Custom Filter

**File:** `filters/acerola_ascii.cpp`

```cpp
#include <CoreVideo/CoreVideo.h>
#include <Metal/Metal.h>

// @function acerola_ascii_complete
// @description Complete Acerola ASCII pipeline in a single C++ process
extern "C" CVPixelBuffer* acerola_ascii_complete(
    CVPixelBuffer* input,
    // @param exposure [0.0, 5.0] Luminance exposure (default: 1.0)
    float exposure,
    // @param sigma [0.0, 5.0] Gaussian blur strength (default: 1.0)
    float sigma,
    // @param tau [0.0, 1.1] DoG threshold (default: 0.98)
    float tau,
    // @param depth_threshold [0.0, 5.0] Depth edge sensitivity (default: 1.0)
    float depth_threshold,
    // @param edge_threshold [0, 64] Edge pixels per tile (default: 32)
    int edge_threshold,
    // @param falloff [0.0, 1.0] Depth fade rate (default: 0.5)
    float falloff
) {
    // Implement complete pipeline:
    // 1. Luminance extraction with exposure
    // 2. Downscale (8x)
    // 3. Gaussian blur
    // 4. Difference of Gaussians with tau
    // 5. Depth-based normal calculation
    // 6. Edge detection (depth + normal)
    // 7. Sobel with angles
    // 8. Combine edges
    // 9. ASCII rendering (calls Metal shader)
    // 10. Depth falloff
    // 11. Gooch shading (calls Metal shader)

    // ... implementation ...

    return output;
}
```

**Usage:**
```haeccstable
load_process("filters/acerola_ascii.cpp")

video_outvar result = $acerola_ascii_complete(
    webcam,
    exposure=1.0,
    sigma=1.0,
    tau=0.98,
    depth_threshold=1.0,
    edge_threshold=32,
    falloff=0.5
)
```

This provides complete control over the Acerola pipeline with all parameters exposed and tunable in real-time via dossier.json. Note that loaded C++ functions automatically get the `$` prefix when registered in the DSL.

---

## Performance Considerations

### Target Metrics

**Video:**
- 60fps rendering (16.67ms per frame)
- 1080p resolution
- <5ms layer composition overhead
- Zero-copy texture transfers

**Audio:**
- <10ms playback latency
- 48kHz sample rate
- Real-time synthesis (no dropouts)

**IPC:**
- <1ms command roundtrip
- Non-blocking UI during execution

### Optimization Strategies

**Metal:**
- Reuse texture caches
- Minimize state changes
- Use compute shaders for filters
- Triple buffering for smooth rendering

**C++ Filters:**
- SIMD vectorization (Accelerate framework)
- Multi-threading for large frames
- In-place operations where possible
- vDSP for convolutions

**Audio:**
- Low buffer sizes (512 samples)
- Lockfree audio graph
- Separate render thread

**IPC:**
- Batch commands when possible
- Async socket I/O
- Connection pooling

---

## Technology Stack

**Python:**
- curses (UI)
- socket (IPC)
- json (serialization)

**Swift:**
- AppKit (windows)
- AudioKit (synthesis)
- AVFoundation (capture)
- Metal (rendering)
- CoreAudio (output)

**C++:**
- Accelerate framework (SIMD)
- vDSP (convolutions)
- vImage (filters)

**Metal Shading Language:**
- Compute shaders (ascii, gooch)
- Fragment shaders (passthrough, blend)

---

This architecture provides a robust, performant foundation for real-time audiovisual live coding with compositional flexibility through the layer-based design.
