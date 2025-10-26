# Haeccstable Curses Version

**Enhanced version with live dossier viewer and import-based workflow**

## What's New

### 1. **Import-Based Workflow** 🎯
No more `select_composition` or `run` commands!

**Old way:**
```
haeccstable> select_composition simple_passthrough/
haeccstable> run main.txt
```

**New way:**
```
haeccstable> import simple_passthrough/main.txt
```

Files are imported directly and executed line-by-line. You can import from anywhere in `haeccstable_projects/`.

### 2. **Live Dossier Viewer** 📋
A split-screen terminal UI that shows your session state in real-time:

```
╔═══════════════════════════════════════════════════════════╗
║ DOSSIER.JSON (vim: j/k/gg/G/Ctrl-d/Ctrl-u)               ║
║ {                                                         ║
║   "monitors": {                                           ║
║     "monitor1": {                                         ║
║       "port": 5001,                                       ║
║       "running": true                                     ║
║     }                                                     ║
║   },                                                      ║
║   "layers": {                                             ║
║     "video": {                                            ║
║       "name": "video",                                    ║
║       "canvas": [1920, 1080],                             ║
║       "source": "webcam"                                  ║
║     }                                                     ║
║   },                                                      ║
║   "timestamp": "2025-10-25 03:06:42"                      ║
║ }                                                         ║
╠═══════════════════════════════════════════════════════════╣
║ OUTPUT                                                    ║
║ > open_monitor monitor1                                   ║
║ ✓ Created window 'monitor1' (1920x1080)                   ║
║ > import simple_passthrough/main.txt                      ║
║ ✓ Imported simple_passthrough/main.txt                    ║
╠═══════════════════════════════════════════════════════════╣
║ haeccstable> _                                            ║
║ Ctrl-C: exit | Ctrl-L: clear | vim motions scroll        ║
╚═══════════════════════════════════════════════════════════╝
```

**Features:**
- **Real-time updates**: Dossier updates automatically after every command
- **Vim motions**: Navigate the dossier with j/k/gg/G/Ctrl-d/Ctrl-u
- **Read-only**: View-only, can't edit (prevents accidental changes)
- **Always visible**: No need to manually check state

## Running the New Version

### Quick Start

```bash
# Build monitor (if not already done)
cd monitor && make && cd ..

# Run the curses version
./haeccstable_curses.py
```

### Example Session

```
haeccstable> open_monitor monitor1
✓ Created window 'monitor1' (1920x1080)

haeccstable> import simple_passthrough/main.txt
Importing simple_passthrough/main.txt...
Created input variable 'camera' -> webcam
Created output variable 'display' -> monitor1
Created layer 'video'
Set layer 'video' canvas to 1920x1080
Bound webcam to layer 'video'
Projected layer 'video' to monitor1 at z=0
✓ Imported simple_passthrough/main.txt
```

**What you'll see:**
1. **Top pane**: Live dossier showing monitors, layers, variables
2. **Middle pane**: Command output
3. **Bottom line**: Your input prompt
4. **Window**: "monitor1" pops up with webcam feed

## Vim Motions (Dossier Navigation)

| Key | Action |
|-----|--------|
| `j` | Scroll down one line |
| `k` | Scroll up one line |
| `gg` | Go to top |
| `G` | Go to bottom |
| `Ctrl-d` | Page down (half screen) |
| `Ctrl-u` | Page up (half screen) |

**Note**: These only affect the dossier pane. Input is always at the bottom.

## Import System

### Basic Import

```
haeccstable> import simple_passthrough/main.txt
```

Files are loaded from `haeccstable_projects/`. Each line is executed sequentially.

### Nested Imports

Files can import other files:

**setup.txt:**
```
in_var camera = webcam;
out_var display = monitor1;
```

**main.txt:**
```
import setup.txt

layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);
display.project(video, 0);
```

Then:
```
haeccstable> import my_project/main.txt
```

This will import `setup.txt` first, then execute the rest of `main.txt`.

### Direct DSL Entry

You can still enter DSL directly:

```
haeccstable> in_var camera = webcam;
Created input variable 'camera' -> webcam

haeccstable> layer_obj video;
Created layer 'video'
```

Both import and direct entry work together seamlessly.

## Dossier Contents

The dossier shows:

```json
{
  "monitors": {
    "monitor1": {
      "port": 5001,
      "running": true
    }
  },
  "layers": {
    "video": {
      "name": "video",
      "canvas": [1920, 1080],
      "source": "webcam",
      "transform": [0, 0],
      "scale": [1.0, 1.0],
      "opacity": 100
    }
  },
  "variables": {
    "camera": {
      "type": "in_var",
      "device": "webcam"
    },
    "display": {
      "type": "out_var",
      "monitor": "monitor1"
    }
  },
  "buffers": {},
  "timestamp": "2025-10-25 03:06:42"
}
```

**Updates automatically** whenever you:
- Open/close a monitor
- Create a layer or variable
- Import a file
- Execute any DSL statement

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl-C` | Exit Haeccstable |
| `Ctrl-L` | Clear output pane |
| `Enter` | Execute command |
| `Backspace` | Delete character |
| `j/k/gg/G/Ctrl-d/Ctrl-u` | Navigate dossier |

## Comparison: Old vs New

### Old Workflow
```bash
./haeccstable.py

haeccstable> open_monitor monitor1
haeccstable> select_composition simple_passthrough/
haeccstable> run main.txt
```

**Limitations:**
- Can only load one composition at a time
- No visibility into session state
- Can't see dossier without manual command

### New Workflow
```bash
./haeccstable_curses.py

haeccstable> open_monitor monitor1
haeccstable> import simple_passthrough/main.txt
```

**Advantages:**
✅ Direct file import (no composition selection)
✅ Live dossier always visible
✅ Vim motions for navigation
✅ Nested imports supported
✅ Real-time state updates
✅ Cleaner, more functional workflow

## Example: Multi-File Project

**project/camera_setup.txt:**
```
in_var camera = webcam;
out_var display = monitor1;
```

**project/video_layer.txt:**
```
layer_obj video;
video.canvas = (1920, 1080);
camera.cast(video);
```

**project/main.txt:**
```
import project/camera_setup.txt
import project/video_layer.txt

display.project(video, 0);
```

**Usage:**
```
haeccstable> open_monitor monitor1
haeccstable> import project/main.txt
```

Everything loads in order, and you can see the state build up in the dossier!

## Technical Details

### Layout
- **Dossier pane**: Top section (resizes with terminal height)
- **Output pane**: 5 lines in the middle
- **Input line**: Bottom of screen
- **Help line**: Very bottom

### Rendering
- Updates at **10 Hz** (100ms interval)
- Dossier scrolling is immediate
- No flicker (uses curses double-buffering)

### Threading
- Main thread: curses UI loop
- No background threads (all synchronous for simplicity)
- Dossier updates are immediate (no async needed)

## Troubleshooting

### Terminal too small
Minimum recommended: **80x24** (columns x rows)

Resize your terminal if you see garbled output.

### Vim motions not working
Make sure you're just pressing the key (not in insert mode). The whole interface is always in "normal mode" for vim keys.

### Dossier not updating
This shouldn't happen, but if it does:
1. Press `Ctrl-L` to clear output
2. Execute any command
3. Dossier should refresh

### Can't see full dossier
Use `j/k` to scroll, or `Ctrl-d/Ctrl-u` to page through it.

## Files

- **haeccstable_curses.py** - New curses-based REPL
- **haeccstable.py** - Original version (still works)
- **dsl_parser.py** - Updated to handle import statements

## Next Steps

The curses version is now the **recommended way** to use Haeccstable!

Try it with the examples:
```bash
./haeccstable_curses.py

haeccstable> open_monitor monitor1
haeccstable> import simple_passthrough/main.txt
haeccstable> import parametric_surface/main.txt  # (when implemented)
```

Watch the dossier update in real-time as you build your composition! 🎨
