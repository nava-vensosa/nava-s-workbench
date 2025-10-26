# Haeccstable Draft 2 - README.md
---

Haeccstable is a live coding environment for realtime graphics, video, and audio processing & performance. the user can use haeccstable's custom domain specific language (DSL) to:
- Write functions which can be used to manipulate or generate animations, video footage (either from a live source or from a video file), or audio (from scratch, from a live input, or from an audio file)
- Open & control Cocoa windows displaying animations or filtered footage
- Read a text file populated with sequential commands & render an audio/video exported mp4 in 1080p

Haeccstable runs out of terminal. Haeccstable is implemented using Metal for GPU rendering, C++ modules for performance-critical math/physics/audio DSP, Python for user handling from terminal, & Swift for the app layer (windows, events, camera feed, file I/O, AudioKit integration).

A key feature that separates Haeccstable from other live coding software like SonicPi or TideCycles is the lack of a working program file. Haeccstable is a single line command terminal. As commands are run, certain files are updated: dossier.json and log.txt.

Dossier.json is a live database describing all devices, variables, functions, and processes in play during a Haeccstable session. When initially run, the dossier details connected audio & video devices -- each of these has a name, an index, and any other relevant information. The user can reference these objects by either name or index when calling upon them with the DSL. As the user instantiates objects (variables, functions, processes -- variables hold values, functions are lambda functions that can perform basic operations upon variables when called, processes are time-dependent sequences of function calls which result in video filters like Kuwahara or Sobel filtering, or audio synthesis & the animatic visualization of the exact sound being produced, like a 4:3 ratio of sine waves, one played back in the Left channel and the other in the Right channel, while drawing a lissajous animation of the sound temporally scaled back to look slower than the sound's actual motion as controlled by a user-defined adjustable constant parameter) the dossier keeps track of objects' names and what they point to.

log.txt just keeps track of every command the user has input.

When Haeccstable is run in terminal, a visual environment opens in the terminal inspired by tmux. The majority of the window is two cells side by side -- one for dossier.json, the other for log.txt--, and below them is a horizontal section for the command line. One of the 3 can be focused on at a time (dossier.json upon initialization). The user can navigate the text in the focused subwindow with vim motions. There should always be a cursor displayed where the focus is. While in Normal Mode (rather than Insert or Visual Mode), the user can select a different subwindow to focus on by keying in its index (1 for dossier.json, 2 for log.txt, 3 for command line). If the user is in Insert mode on the command line, the focus should not change when 1/2/3 or any vim motions are pressed; pressing Enter inputs whatever the user has inserted to the command line, and the window should remain in Insert mode until the user presses Esc. The user should be able to move the cursor around the text in the focused subwindow using h/j/k/l/e/E/b/B/$/0/gg/G/{/} and scrolling should be enabled within the subwindow -- just like if editing text files using Vim in tmux.

---

The goal of this prototype's implementation is a fully functional environment capable of using the DSL to perform 3 renders:
1. videocat -- take live webcam input and display it on two cocoa windows at the same time
2. Lissajous Rendering -- Generating a ratio of two sine tones bound to two variables; the sine tones playback in stereo (one tone in the L channel, the other in the R channel), and the same objects should be referenced in the process which draws a realtime Lissajous animation of those sine waves; the user can adjust the sine waves' ratio, and can pass in a number to determine the lower note's pitch (resulting in the derivaiton of the higher note's pitch mathematically), and the user can also change the wave from sine to triangle or square or saw.
3. Acerola ASCII Filter -- mimic Acerola's ASCII filter by applying a Sobel Filter and Difference of Gaussians to perform edge-detection, then reskinning that mask to be rendered with ASCII characters in 8x8px size, finally recoloring with a Gooch filter gradient; this can be put in series with the videocat to ASCII filter webcam footage in real time -- that's why it's on two Cocoa windows, so that one can be the original webcam footage and the other can be the ASCII Filtered footage

---

## DSL Syntax Overview

Haeccstable uses a **hybrid DSL** combining declarative variable definitions with imperative commands.

### Variable Types

```haeccstable
// Video variables - capture or generated video
video_var webcam = capture(0)           // Webcam at index 0
video_var file_input = load("video.mp4") // Load video file

// Audio variables - synthesis or input
audio_var tone = sine(440)              // 440Hz sine wave
audio_var mic = capture_audio(0)        // Microphone input

// Number variables - parameters and values
number_var ratio = 3/2                  // Frequency ratio
number_var base_freq = 440              // Base frequency

// Window variables - Cocoa windows for output
window_var win1 = window("Output", 1920, 1080)
window_var win2 = window("ASCII", 1920, 1080)
```

### Imperative Commands

```haeccstable
// Display video in a window
show(webcam, win1)

// Play audio to stereo channels
play(tone_L, left)
play(tone_R, right)

// Draw graphics to a window
draw(lissajous(tone_L, tone_R), win1)

// Modify variables
set(tone, "waveform", "triangle")  // Change from sine to triangle
set(tone, "frequency", 660)        // Change frequency
```

### Process Blocks (Imperative Sequences)

```haeccstable
// Define a filter process
process ascii_filter(input) {
    edges = sobel(input, threshold=0.15)
    enhanced = dog(edges, sigma1=1.0, sigma2=2.0)
    binary = threshold(enhanced, level=0.4)
    masked = multiply(input, binary)
    ascii_img = ascii(masked, chars=" .:-=+*#%@", size=8)
    result = gooch(ascii_img, warm=(1.0,0.8,0.4), cool=(0.2,0.4,0.8))
    return result
}

// Use the process
show(ascii_filter(webcam), win2)
```

### Example: Videocat (Goal 1)

```haeccstable
// Videocat: Webcam to two windows

video_invar webcam = capture(0)

window_var win1 = window("Output 1", 1920, 1080)
window_var win2 = window("Output 2", 1920, 1080)

layer_obj widescreenLayer = layer("Widescreen", 1920, 1080)
layer_obj fullscreenLayer = layer("Fullscreen", 1440, 1080)

widescreenLayer.cast(webcam) // casts video datastream from webcam onto a layer, where manipulations can occur
fullscreenLayer.cast(webcam)

win1.project(widescreenLayer) // projects the layer onto the win1 Cocoa window
win2.project(fullscreenLayer)

```

### Example: Lissajous (Goal 2)

```haeccstable
// Lissajous: Stereo Sine tones with visual animation
var x
var y
func ratio(x, y) = x / y
var base_freq - 440
x = 3
y = 2

audio_outvar freq1 = sine(base_freq)
audio_outvar freq2 = sine(base_freq * ratio(x, y))

freq1.mix = (100, 0) // mix to 100% left channel, 0% right channel
freq2.mix = (0, 100)

window_var lissajousAnimationWindow = window("Lissajous", 1920, 1080)

freq1.play; freq2.play // triggers freq1 and freq2 to play at the same time; the semicolon separates different commands which must be initiated at the same time

draw(lissajous(freq1, freq2, scale=0.5), lissajousAnimationWindow)

// still haven't defined the lissajous() function! It should be something like:
// func lissajous(x, y, z) = ...?
// How do we programatically drwa the lissajous between the x and y, and slow the rate by half? would the scale be multiplied with the x & y variables so as to halve their frequency and subsequently the animation's motion? How can we write out the mathematical instructions that result in the lissajous animation being drawn in one line? would we need helper lambda functions? I'd most prefer it to work the same as if the user wanted to draw a diagonal line going from the bottom left corner increasing by a slope of 1 writing a func y(x, a) = a(x) where process "a" works with the draw function when draw(y(1, a)) is called to result in what the user want

// Try: set(freq1, "waveform", "triangle")
// Try: x = 4; y = 3

```

---

## System Architecture

Haeccstable is composed of four integrated layers:

### 1. Python Terminal Layer
- **curses-based UI** with 3-pane tmux-style layout
- **Vim modal interface** (Normal/Insert/Visual modes)
- **Command parsing** and validation
- **IPC client** sending commands to Swift app via Unix socket
- **dossier.json & log.txt viewers** with live updates

### 2. Swift App Layer
- **Command server** receiving JSON over Unix socket
- **Cocoa window management** (NSWindow creation, display)
- **AudioKit integration** for audio synthesis
- **AVFoundation** for camera/microphone capture
- **State management** (updates dossier.json)
- **Metal render coordination**

### 3. Metal Rendering Layer
- **GPU pipeline** for video composition
- **Shader programs** for effects (Gooch, ASCII rendering)
- **Zero-copy texture transfer** (IOSurface)
- **Real-time rendering** at 60fps

### 4. C++ DSP/Filter Layer
- **Performance-critical filters**: Sobel, DoG, Kuwahara
- **Math operations**: Convolutions, gradients, thresholding
- **Bridge to Metal** via texture sharing
- **Optimized** with SIMD/Accelerate framework

### Data Flow

```
Terminal (Python curses)
    ↓ Commands entered
DSL Parser
    ↓ JSON commands
IPC (Unix Socket)
    ↓ Validated commands
Swift Command Handler
    ├→ Video: AVFoundation → Metal → Cocoa Windows
    ├→ Audio: AudioKit → CoreAudio
    └→ State: Update dossier.json
```

### Inter-Process Communication

**Python → Swift:**
```json
{
  "type": "video_var",
  "name": "webcam",
  "source": "capture",
  "index": 0
}
```

**Swift → Python:**
```json
{
  "type": "dossier_update",
  "variables": {...},
  "devices": {...}
}
```

---

## Terminal UI Layout

```
┌────────────────────────────────┬────────────────────────────────┐
│ dossier.json [1]               │ log.txt [2]                    │
│                                │                                │
│ {                              │ > video_var webcam = capture(0)│
│   "devices": {                 │ > window_var win1 = window...  │
│     "video": [                 │ > show(webcam, win1)           │
│       {                        │ > audio_var L = sine(440)      │
│         "index": 0,            │ > play(L, left)                │
│         "name": "FaceTime HD"  │                                │
│       }                        │                                │
│     ],                         │                                │
│     "audio": [...]             │                                │
│   },                           │                                │
│   "variables": {               │                                │
│     "webcam": {...},           │                                │
│     "L": {...}                 │                                │
│   }                            │                                │
│ }                              │                                │
└────────────────────────────────┴────────────────────────────────┘
│ haeccstable> _                                            [3]   │
│ -- NORMAL -- [Focus: DOSSIER]                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Vim Motions:** h/j/k/l, w/e/b, gg/G, {/}, 0/$
**Focus Switching:** 1 (dossier) | 2 (log) | 3 (command)
**Modes:** Normal (navigate) | Insert (type commands) | Visual (select text)

---

**Next Step:** Implement the DSL parser, terminal UI, and Swift command server with basic video passthrough
