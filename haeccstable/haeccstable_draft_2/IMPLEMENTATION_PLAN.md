# Haeccstable Implementation Plan

**Phased Development Roadmap for Draft 2**

---

## Overview

This plan outlines a 6-week implementation schedule to build a fully functional Haeccstable prototype capable of:
1. **Videocat** - Webcam to dual windows
2. **Lissajous** - Stereo synthesis with visualization
3. **ASCII Filter** - Edge-enhanced ASCII with Gooch shading

**Approach:** Build incrementally, test continuously, integrate early

---

## Phase 1: Terminal UI & DSL Parser
**Duration:** Week 1 (5 days)
**Goal:** Working terminal interface with DSL parsing

### Tasks

#### Day 1-2: Curses UI Foundation
- [ ] Create `haeccstable.py` entry point
- [ ] Implement 3-pane layout with curses
  - [ ] Dossier pane (top-left)
  - [ ] Log pane (top-right)
  - [ ] Command pane (bottom)
- [ ] Add vim modal system (Normal/Insert/Visual)
- [ ] Implement focus switching (1/2/3 keys)
- [ ] Add vim motions (h/j/k/l/w/e/b/gg/G/{/}/0/$)

**Deliverable:** Terminal UI with navigation

#### Day 3-4: DSL Parser
- [ ] Create `dsl_parser.py`
- [ ] Implement lexer (tokenization)
- [ ] Implement parser (AST generation)
- [ ] Add type checking
- [ ] Handle all variable types:
  - [ ] `video_var`
  - [ ] `audio_var`
  - [ ] `number_var`
  - [ ] `window_var`
- [ ] Parse imperative commands:
  - [ ] `show()`, `play()`, `draw()`, `set()`
- [ ] Parse process blocks
- [ ] Error handling and reporting

**Deliverable:** Parser that validates DSL commands

#### Day 5: Integration & Testing
- [ ] Connect parser to curses UI
- [ ] Display parse errors in command pane
- [ ] Log commands to log.txt
- [ ] Test all DSL syntax

**Milestone:** ✅ Terminal can parse and validate all DSL commands

---

## Phase 2: Swift App & IPC
**Duration:** Week 1-2 (5 days)
**Goal:** Python ↔ Swift communication working

### Tasks

#### Day 6-7: Swift App Foundation
- [ ] Create Xcode project `HaeccstableApp`
- [ ] Set up `HaeccstableApp.swift` entry point
- [ ] Create `CommandServer.swift` Unix socket server
  - [ ] Listen on `/tmp/haeccstable.sock`
  - [ ] Parse JSON commands
  - [ ] Log received commands
- [ ] Create `StateManager.swift`
  - [ ] Track variables
  - [ ] Track processes
  - [ ] Generate dossier.json
- [ ] Create `WindowManager.swift`
  - [ ] NSWindow creation
  - [ ] Window lifecycle management

**Deliverable:** Swift app that receives commands

#### Day 8-9: IPC Client
- [ ] Create `ipc_client.py`
- [ ] Unix socket client
- [ ] JSON serialization
- [ ] Command queueing
- [ ] Response handling
- [ ] Integrate with curses UI

**Deliverable:** Python can send commands to Swift

#### Day 10: Bidirectional Communication
- [ ] Swift sends dossier updates to Python
- [ ] Python updates dossier pane
- [ ] Test round-trip communication
- [ ] Error handling

**Milestone:** ✅ Terminal and Swift app communicate bidirectionally

---

## Phase 3: Video Pipeline
**Duration:** Week 2-3 (5 days)
**Goal:** Webcam → Window rendering

### Tasks

#### Day 11-12: AVFoundation Capture
- [ ] Create `VideoCapture.swift`
- [ ] AVCaptureSession setup
- [ ] Enumerate video devices
- [ ] Populate dossier with device info
- [ ] Camera permission handling
- [ ] CVPixelBuffer capture

**Deliverable:** Camera capture working

#### Day 13-14: Metal Rendering
- [ ] Create `MetalCoordinator.swift`
- [ ] MTKView setup in NSWindow
- [ ] Create `Shaders.metal` with passthrough shader
- [ ] CVPixelBuffer → IOSurface → MTLTexture
- [ ] Render loop at 60fps
- [ ] Zero-copy pipeline

**Deliverable:** Webcam displays in window

#### Day 15: Integration & Testing
- [ ] Implement `video_var` command handling
- [ ] Implement `window_var` command handling
- [ ] Implement `show()` command
- [ ] Test videocat example

**Milestone:** ✅ **Prototype Goal #1: Videocat working!**

---

## Phase 4: Audio Synthesis
**Duration:** Week 3-4 (5 days)
**Goal:** Audio synthesis and Lissajous visualization

### Tasks

#### Day 16-17: AudioKit Integration
- [ ] Add AudioKit dependency to Xcode project
- [ ] Create `AudioEngine.swift`
- [ ] AKOscillator setup (sine/square/triangle/saw)
- [ ] Stereo mixer (left/right channels)
- [ ] Start/stop audio engine
- [ ] Implement `audio_var` command handling
- [ ] Implement `play()` command
- [ ] Implement `set()` for frequency/waveform/amplitude

**Deliverable:** Audio synthesis working

#### Day 18-19: Lissajous Visualization
- [ ] Audio buffer tapping (installTap)
- [ ] Lissajous coordinate calculation
- [ ] Create `lissajous_shader.metal`
- [ ] Metal line rendering
- [ ] Implement `draw(lissajous())` command
- [ ] Real-time update at audio rate

**Deliverable:** Lissajous visualization working

#### Day 20: Integration & Testing
- [ ] Test stereo playback
- [ ] Test waveform switching
- [ ] Test frequency changes
- [ ] Test Lissajous example

**Milestone:** ✅ **Prototype Goal #2: Lissajous working!**

---

## Phase 5: Filter Processes
**Duration:** Week 4-5 (5 days)
**Goal:** Sobel, DoG, ASCII, Gooch filters

### Tasks

#### Day 21-22: C++ Filter Implementation
- [ ] Create `Filters.cpp/hpp`
- [ ] Implement Sobel filter
  - [ ] 3x3 convolution kernel
  - [ ] Gradient magnitude calculation
  - [ ] Threshold application
- [ ] Implement DoG (Difference of Gaussians)
  - [ ] Two Gaussian blurs
  - [ ] Subtraction
- [ ] Implement threshold filter
- [ ] Implement multiply filter
- [ ] Optimize with Accelerate framework (vDSP/vImage)
- [ ] Create `Bridge.mm` for Swift interop

**Deliverable:** C++ filters working

#### Day 23-24: GPU Shaders
- [ ] ASCII shader in Metal
  - [ ] Character map texture
  - [ ] 8x8px grid sampling
  - [ ] Character selection by brightness
- [ ] Gooch shader in Metal
  - [ ] Warm/cool color interpolation
  - [ ] Technical illustration style
- [ ] Integrate C++ filters with Metal pipeline

**Deliverable:** All filters working

#### Day 25: Process System
- [ ] Implement process definition handling
- [ ] Process invocation
- [ ] Parameter passing
- [ ] Multi-step pipeline execution
- [ ] Test ASCII filter example

**Milestone:** ✅ **Prototype Goal #3: ASCII Filter working!**

---

## Phase 6: Polish & Documentation
**Duration:** Week 5-6 (5 days)
**Goal:** Production-ready prototype

### Tasks

#### Day 26-27: Error Handling
- [ ] Comprehensive error messages
- [ ] Type checking enforcement
- [ ] Graceful degradation
- [ ] Recovery from errors
- [ ] User-friendly error display in terminal

**Deliverable:** Robust error handling

#### Day 28-29: Performance Optimization
- [ ] Profile video pipeline
- [ ] Optimize texture transfers
- [ ] Reduce audio latency
- [ ] Memory leak detection
- [ ] CPU/GPU usage monitoring
- [ ] Target: 60fps video, <10ms audio latency

**Deliverable:** Optimized performance

#### Day 30: Final Testing & Documentation
- [ ] Test all 3 prototype goals
- [ ] Update README with usage instructions
- [ ] Create demo video
- [ ] Write troubleshooting guide
- [ ] Performance benchmarks

**Milestone:** ✅ **Production-ready prototype!**

---

## File Structure

```
haeccstable_draft_2/
├── README.md
├── DSL_SPECIFICATION.md
├── ARCHITECTURE.md
├── IMPLEMENTATION_PLAN.md         ← This file
├── TMUX_UI_DESIGN.md
├── GETTING_STARTED.md
│
├── python/
│   ├── haeccstable.py             # Entry point
│   ├── curses_ui.py               # 3-pane interface
│   ├── dsl_parser.py              # DSL lexer/parser
│   ├── ipc_client.py              # Unix socket client
│   └── dossier.json               # Session state
│   └── log.txt                    # Command history
│
├── swift/
│   ├── HaeccstableApp/
│   │   ├── HaeccstableApp.swift   # App entry
│   │   ├── CommandServer.swift    # IPC server
│   │   ├── WindowManager.swift    # NSWindow management
│   │   ├── StateManager.swift     # dossier.json updates
│   │   ├── VideoCapture.swift     # AVFoundation capture
│   │   ├── AudioEngine.swift      # AudioKit synthesis
│   │   ├── MetalCoordinator.swift # Render coordination
│   │   ├── Shaders.metal          # All Metal shaders
│   │   └── Filters/
│   │       ├── Filters.cpp        # C++ DSP
│   │       ├── Filters.hpp
│   │       └── Bridge.mm          # Swift ↔ C++
│   └── HaeccstableApp.xcodeproj
│
└── examples/
    ├── videocat.haec              # Goal 1
    ├── lissajous.haec             # Goal 2
    └── ascii_filter.haec          # Goal 3
```

---

## Development Tools

### Required Software
- **Python 3.11+**
- **Xcode 15+** (Swift 5.9+)
- **macOS 11+** (Metal 3 support)

### Dependencies
- **Python:**
  - No external dependencies (uses stdlib: curses, socket, json)
- **Swift:**
  - AudioKit (via Swift Package Manager)
  - No other external dependencies

### Build Commands

**Python (no build needed):**
```bash
python3 haeccstable.py
```

**Swift App:**
```bash
cd swift/HaeccstableApp
xcodebuild -scheme HaeccstableApp -configuration Debug build
```

Or use Xcode IDE.

---

## Testing Strategy

### Unit Tests
- [ ] DSL parser tests (all syntax)
- [ ] IPC client/server tests
- [ ] Filter algorithm tests
- [ ] State manager tests

### Integration Tests
- [ ] End-to-end command execution
- [ ] Video pipeline (capture → display)
- [ ] Audio pipeline (synthesis → output)
- [ ] Process execution

### Performance Tests
- [ ] Frame rate benchmarks
- [ ] Latency measurements
- [ ] Memory profiling
- [ ] CPU/GPU usage

### User Acceptance Tests
- [ ] All 3 prototype goals working
- [ ] Vim motions work correctly
- [ ] No crashes during normal use
- [ ] Error messages are helpful

---

## Risk Mitigation

### Technical Risks

**Risk:** AudioKit integration complexity
- **Mitigation:** Use well-documented examples, test early
- **Fallback:** Use CoreAudio directly if needed

**Risk:** Zero-copy video pipeline issues
- **Mitigation:** Follow Apple's best practices, test on real hardware
- **Fallback:** Use texture copies if IOSurface fails

**Risk:** IPC latency
- **Mitigation:** Profile early, use Unix sockets (fastest IPC)
- **Fallback:** Optimize JSON serialization

**Risk:** C++ filter performance
- **Mitigation:** Use Accelerate framework, profile with Instruments
- **Fallback:** Move filters to Metal compute shaders

### Schedule Risks

**Risk:** Phase overrun
- **Mitigation:** Time-box each phase, cut scope if needed
- **Priority:** Get 3 prototypes working first, polish later

**Risk:** Integration issues
- **Mitigation:** Integrate early and often, don't wait until end

---

## Success Criteria

### Must Have (P0)
- ✅ Videocat working (2 windows, same webcam)
- ✅ Lissajous working (stereo audio + visualization)
- ✅ ASCII filter working (Sobel → DoG → ASCII → Gooch)
- ✅ Terminal UI with vim motions
- ✅ dossier.json updates in real-time
- ✅ No crashes during normal use

### Should Have (P1)
- ✅ 60fps video rendering
- ✅ <10ms audio latency
- ✅ Helpful error messages
- ✅ Good documentation

### Nice to Have (P2)
- Command history (up/down arrows)
- Undo/redo
- Save/load sessions
- More filter types

---

## Next Steps After Prototype

Once the 3 prototype goals are working:

1. **More Filters:** Kuwahara, Gaussian blur, etc.
2. **More Graphics:** Waveform, spectrogram visualizations
3. **File I/O:** Load video files, save output
4. **Video Export:** Render to mp4 (offline)
5. **Advanced Features:** Visual mode, macros, search

But for now: **Focus on the 3 core prototypes!**

---

**Ready to start implementation? Begin with Phase 1!**
