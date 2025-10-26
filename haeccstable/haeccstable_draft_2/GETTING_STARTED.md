# Getting Started with Haeccstable

**A hands-on tutorial for Haeccstable Draft 2**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [First Launch](#first-launch)
4. [Terminal UI Guide](#terminal-ui-guide)
5. [Your First Video Output](#your-first-video-output)
6. [Audio Synthesis](#audio-synthesis)
7. [Filter Pipelines](#filter-pipelines)
8. [Interactive Session](#interactive-session)
9. [Troubleshooting](#troubleshooting)
10. [Tips & Tricks](#tips--tricks)

---

## Prerequisites

### Required Software

**macOS 11.0 or later** (for Metal 3 support)

**Development Tools:**
- Xcode 15+ with Command Line Tools
- Python 3.11 or later
- Swift 5.9+ (included with Xcode)

**Verification:**
```bash
# Check Python version
python3 --version
# Should show: Python 3.11.x or later

# Check Xcode
xcodebuild -version
# Should show: Xcode 15.x

# Check Swift
swift --version
# Should show: Swift version 5.9.x or later
```

### Hardware Requirements

**Minimum:**
- MacBook Pro/Air (2018 or later)
- 8GB RAM
- Webcam (FaceTime HD or external)
- Audio output (built-in or external)

**Recommended:**
- MacBook Pro (M1/M2/M3 or Intel with dedicated GPU)
- 16GB+ RAM
- 1080p webcam
- Headphones (for audio synthesis)

---

## Installation

### Step 1: Clone or Navigate to Draft 2

```bash
cd /path/to/haeccstable/haeccstable_draft_2
```

### Step 2: Build Swift App

```bash
cd swift/HaeccstableApp
xcodebuild -scheme HaeccstableApp -configuration Debug build
```

**Expected output:**
```
** BUILD SUCCEEDED **
```

The compiled app will be at:
```
swift/HaeccstableApp/build/Debug/HaeccstableApp.app
```

### Step 3: Verify Python Dependencies

Haeccstable uses **only Python standard library** (no external packages needed).

```bash
python3 -c "import curses, socket, json; print('Dependencies OK')"
```

### Step 4: Create Session Directory

```bash
mkdir -p python
cd python
```

---

## First Launch

### Step 1: Start the Swift App (Background)

Open a **separate terminal window**:

```bash
cd swift/HaeccstableApp/build/Debug
./HaeccstableApp.app/Contents/MacOS/HaeccstableApp
```

**Expected output:**
```
[Haeccstable] Command server listening on /tmp/haeccstable.sock
[Haeccstable] Enumerating devices...
[Haeccstable] Found 1 video device: FaceTime HD Camera (Built-in)
[Haeccstable] Found 1 audio output device: Built-in Output
[Haeccstable] Ready.
```

**Keep this terminal open** (the Swift app runs in the background).

### Step 2: Start the Python Terminal UI

In your **original terminal**:

```bash
cd python
python3 haeccstable.py
```

**Expected result:**
A full-screen terminal UI appears:

```
┌─────────────────────────────────┬─────────────────────────────────┐
│ dossier.json [1]               │ log.txt [2]                    │
│                                │                                │
│ {                              │ No commands executed yet...    │
│   "devices": {                 │                                │
│     "video": [                 │                                │
│       {                        │                                │
│         "index": 0,            │                                │
│         "name": "FaceTime HD"  │                                │
│       }                        │                                │
│     ],                         │                                │
│     "audio": [...]             │                                │
│   },                           │                                │
│   "variables": {},             │                                │
│   "processes": {}              │                                │
│ }                              │                                │
└────────────────────────────────┴────────────────────────────────┘
│ haeccstable> _                                            [3]   │
│ -- NORMAL -- [Focus: DOSSIER]                                  │
└─────────────────────────────────────────────────────────────────┘
```

**You're in!** 🎉

---

## Terminal UI Guide

### Understanding the Layout

**Three Panes:**
1. **Dossier (top-left)** - Live session state (JSON)
2. **Log (top-right)** - Command history
3. **Command (bottom)** - Input line

**Two Modes:**
- **NORMAL mode** - Navigate and read (default)
- **INSERT mode** - Type commands

### Basic Navigation

**Switching Focus (NORMAL mode):**
```
Press 1  →  Focus dossier
Press 2  →  Focus log
Press 3  →  Focus command line
```

**Scrolling Dossier (when focused on dossier):**
```
j       →  Scroll down
k       →  Scroll up
h       →  Scroll left
l       →  Scroll right
gg      →  Jump to top
G       →  Jump to bottom
```

**Entering Commands:**
```
1. Press 3 to focus command line
2. Press i to enter INSERT mode
3. Type your command
4. Press Enter to execute
   (You automatically return to NORMAL mode)
```

**Quick Exit:**
```
Press Ctrl-C  →  Quit Haeccstable
```

---

## Your First Video Output

### Example 1: Videocat (Dual Windows)

Let's display your webcam on two windows simultaneously.

**Commands to enter:**

```haeccstable
video_var webcam = capture(0)
window_var win1 = window("Output 1", 1920, 1080)
window_var win2 = window("Output 2", 1920, 1080)
show(webcam, win1)
show(webcam, win2)
```

**Step-by-step:**

1. **Enter NORMAL mode** (press ESC if you're in INSERT)
2. **Focus command line** (press `3`)
3. **Enter INSERT mode** (press `i`)
4. **Type:** `video_var webcam = capture(0)`
5. **Execute:** Press `Enter`
6. **Repeat steps 3-5** for each remaining command

**What happens:**
- After `window_var win1 = ...` → A blank window appears
- After `window_var win2 = ...` → A second blank window appears
- After `show(webcam, win1)` → First window shows webcam!
- After `show(webcam, win2)` → Second window shows webcam!

**Check the dossier (press `1`):**
```json
{
  "variables": {
    "webcam": {
      "type": "video_var",
      "source": "capture",
      "device": 0
    },
    "win1": {
      "type": "window_var",
      "title": "Output 1",
      "size": [1920, 1080]
    },
    "win2": { ... }
  }
}
```

**Success!** ✅ You've completed prototype goal #1.

---

## Audio Synthesis

### Example 2: Lissajous (Stereo Audio + Visualization)

Let's create a stereo audio tone with a visual Lissajous curve.

**Import the example file:**

Instead of typing each command, we can import a pre-written file:

1. Press `3` to focus command line
2. Press `i` to enter INSERT mode
3. Type: `import examples/lissajous.haec`
4. Press `Enter`

**What happens:**
- 🔊 Audio starts playing (440Hz left, 660Hz right)
- 🌀 A window opens with an animated Lissajous curve
- The curve shows the 3:2 frequency ratio pattern

**Interactive modifications:**

Try changing the waveform:
```haeccstable
set(L, "waveform", "triangle")
set(R, "waveform", "square")
```

Try changing frequencies:
```haeccstable
set(L, "frequency", 220)
set(R, "frequency", 330)
```

**Stop the audio:**
```haeccstable
stop(L)
stop(R)
```

**Success!** ✅ You've completed prototype goal #2.

---

## Filter Pipelines

### Example 3: ASCII Filter (Edge-Enhanced ASCII Art)

Let's apply Acerola's ASCII filter to live webcam footage.

**Import the example:**
```haeccstable
import examples/ascii_filter.haec
```

**What happens:**
- Two windows open
- **Window 1 (Original):** Raw webcam feed
- **Window 2 (ASCII Filter):** Edge-detected ASCII art with Gooch shading

**How it works:**

The `ascii_filter` process applies 6 steps:
1. **Sobel** - Detects edges
2. **DoG** - Enhances edges
3. **Threshold** - Creates binary mask
4. **Multiply** - Applies mask to original
5. **ASCII** - Renders as ASCII characters
6. **Gooch** - Adds technical illustration shading

**All in real-time at 60fps!**

**Success!** ✅ You've completed prototype goal #3.

---

## Interactive Session

### Building a Custom Pipeline

Let's create a custom filter step-by-step.

**Start fresh:**
```haeccstable
// Capture webcam
video_var webcam = capture(0)

// Create window
window_var win = window("Custom Filter", 1920, 1080)

// Apply just Sobel edges
video_var edges = sobel(webcam, threshold=0.2)
show(edges, win)
```

**You should see:** Black and white edge detection.

**Add DoG enhancement:**
```haeccstable
video_var enhanced = dog(edges, sigma1=1.0, sigma2=2.0)
show(enhanced, win)
```

**You should see:** Sharper, more defined edges.

**Create a process for reuse:**
```haeccstable
process my_filter(input) {
    edges = sobel(input, threshold=0.2)
    enhanced = dog(edges, sigma1=1.0, sigma2=2.0)
    return enhanced
}

show(my_filter(webcam), win)
```

**Now you have a reusable filter!**

---

## Troubleshooting

### "Socket connection refused"

**Problem:** Python can't connect to Swift app.

**Solution:**
```bash
# Check if Swift app is running
ps aux | grep HaeccstableApp

# If not running, start it:
cd swift/HaeccstableApp/build/Debug
./HaeccstableApp.app/Contents/MacOS/HaeccstableApp
```

---

### "Camera permission denied"

**Problem:** macOS hasn't granted camera access.

**Solution:**
1. Open **System Settings** → **Privacy & Security** → **Camera**
2. Enable access for **Terminal** or your terminal app
3. Restart Haeccstable

---

### "No video devices found"

**Problem:** Swift app can't detect webcam.

**Solution:**
```bash
# Check if camera is in use by another app
lsof | grep -i camera

# Close other apps using camera (Zoom, Photo Booth, etc.)

# Restart Swift app
```

---

### Windows don't appear

**Problem:** Windows created but not visible.

**Solution:**
- Check **Mission Control** (swipe up with 4 fingers)
- Windows may be in another desktop space
- Try clicking on **Haeccstable** in the Dock
- Check dossier for window state (press `1`)

---

### "Audio latency too high"

**Problem:** Lissajous visualization lags behind audio.

**Solution:**
```bash
# Check audio buffer size in Swift app logs
# Target: <10ms latency

# Reduce buffer size (edit AudioEngine.swift):
# buffer = AVAudioFrameCount(512)  // Lower = less latency
```

---

### Terminal size too small

**Problem:** UI doesn't render correctly.

**Solution:**
- Resize terminal to at least **120x30** characters
- Or run in fullscreen mode (Cmd+Ctrl+F)
- Check status line for errors

---

### Dossier not updating

**Problem:** dossier.json shows stale data.

**Solution:**
```bash
# Check if dossier.json file exists
ls -la python/dossier.json

# Check Swift app logs for write errors
# Look for "[Haeccstable] Updated dossier.json"

# Manually refresh (press 1 to focus dossier, then Ctrl-L)
```

---

### "Type error: Cannot display audio_var"

**Problem:** Trying to use wrong type in command.

**Solution:**
```haeccstable
// WRONG:
show(tone, win)  // tone is audio_var, can't display

// CORRECT:
play(tone, left)  // Play audio to left channel
```

Check [DSL_SPECIFICATION.md](DSL_SPECIFICATION.md) for type rules.

---

## Tips & Tricks

### Vim Power User Tips

**Fast navigation:**
```
gg    →  Jump to top of dossier
G     →  Jump to bottom
/     →  (Future) Search in dossier
```

**Quick command entry:**
```
3     →  Focus command (from anywhere in NORMAL mode)
i     →  Enter INSERT
Enter →  Execute & return to NORMAL (no need to press ESC!)
```

**Review history:**
```
2     →  Focus log pane
k/j   →  Scroll through past commands
G     →  Jump to latest command
```

---

### Performance Optimization

**Target 60fps video:**
- Keep window sizes at 1920x1080 or below
- Avoid stacking too many filters (>4 in a pipeline)
- Use Metal shaders when possible (ascii, gooch are GPU-accelerated)

**Reduce audio latency:**
- Use lower sample rates if needed
- Close other audio apps
- Use wired headphones (Bluetooth adds latency)

---

### Workflow Tips

**Save your session:**

Haeccstable tracks everything in `log.txt`. To replay a session:

```bash
# Copy your commands to a new file
cp log.txt my_session.haec

# Later, reload:
import my_session.haec
```

**Build incrementally:**
- Test each command before adding more
- Check dossier after each step (press `1`)
- Use small test windows (e.g., 640x480) during development

**Reuse processes:**
```haeccstable
// Define once
process edge_detect(input) {
    return sobel(input, threshold=0.15)
}

// Use many times
show(edge_detect(webcam), win1)
show(edge_detect(file_input), win2)
```

---

### Keyboard Shortcuts Reference

**Mode & Focus:**
```
1/2/3       Focus pane (NORMAL mode)
i/a/o       Enter INSERT mode
ESC         Return to NORMAL mode
Enter       Execute command (auto-return to NORMAL)
```

**Navigation (NORMAL mode):**
```
j/k         Down/up
h/l         Left/right (dossier only)
gg/G        Top/bottom
{/}         Paragraph
0/$         Line start/end
Ctrl-d/u    Page down/up
```

**Global:**
```
Ctrl-C      Quit Haeccstable
Ctrl-L      Clear log pane
```

---

## Next Steps

### Learn More

- [DSL_SPECIFICATION.md](DSL_SPECIFICATION.md) - Complete language reference
- [ARCHITECTURE.md](ARCHITECTURE.md) - System internals
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Development roadmap
- [TMUX_UI_DESIGN.md](TMUX_UI_DESIGN.md) - Terminal UI details

### Experiment!

Try these exercises:

**Exercise 1: Multi-window video**
- Open 4 windows showing the same webcam
- Apply a different filter to each window

**Exercise 2: Frequency ladder**
- Create 4 sine tones at 220Hz, 440Hz, 880Hz, 1760Hz
- Play them all at once (mono channel)

**Exercise 3: Custom ASCII set**
- Modify the ASCII character set
- Try: `chars=" ░▒▓█"` for block shading
- Try: `chars=" .oO@"` for circular patterns

**Exercise 4: Multi-step filter**
- Combine gaussian blur + sobel + ascii
- Adjust parameters for artistic effects

---

## Community & Support

### Reporting Issues

Found a bug? Open an issue at:
```
[GitHub repository URL]
```

Include:
- OS version (macOS x.x.x)
- Terminal app (Terminal.app, iTerm2, etc.)
- Error messages from Swift app and Python UI
- Steps to reproduce

### Feature Requests

Want a new filter or feature? See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for roadmap and future features.

---

## Conclusion

**You've learned:**
- ✅ How to launch Haeccstable
- ✅ How to navigate the terminal UI
- ✅ How to capture and display video
- ✅ How to synthesize audio
- ✅ How to build filter pipelines
- ✅ How to troubleshoot common issues

**Now go create something amazing!** 🎨🎵

---

**Happy live coding!** 🚀
