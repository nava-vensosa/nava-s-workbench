# Haeccstable Prototype - Quick Start

## Three Versions Available

### **🏆 Recommended: Vim Mode** (full modal interface)

```bash
# Build (one-time)
cd monitor && make && cd ..

# Run vim mode version
./haeccstable_vim.py
```

**You'll see:**
1. **Split-screen terminal UI** with vim modal interface
   - Top: Live dossier.json
   - Middle: Command output
   - Bottom: Input prompt + mode indicator
2. **You start in NORMAL mode** (focused on dossier)
3. **Press `i` to enter INSERT mode**, then type:
   ```
   open_monitor monitor1
   ```
4. **Press Enter** (auto-returns to NORMAL mode)
5. **Press `i` again**, type:
   ```
   import simple_passthrough/main.txt
   ```
6. A window titled **"monitor1"** pops up with your **webcam feed**

**Features:**
- ✅ Full vim modal interface (NORMAL/INSERT modes)
- ✅ Complete vim motions (h/j/k/l/{/}/gg/G/0/$)
- ✅ Focus switching (1:dossier, 2:output, 3:command)
- ✅ Live dossier with real-time updates
- ✅ Import-based workflow
- ✅ ESC to return to normal mode

**Quick Tutorial:**
- Start in **NORMAL** mode
- Press **1/2/3** to switch focus
- Press **i** to enter INSERT mode
- Type command, press **Enter**
- Use **j/k** in normal mode to navigate
- Press **ESC** to exit insert mode

See **VIM_MODE_README.md** for complete vim motion reference.

---

### Curses Version (basic modal interface)

```bash
./haeccstable_curses.py
```

**Features:**
- ✅ Live dossier always visible
- ✅ Basic vim motions (j/k/gg/G/Ctrl-d/Ctrl-u)
- ✅ Import-based workflow
- ⚠️ No modal editing (always in "insert" mode)

See **CURSES_VERSION_README.md** for details.

---

### Original Version (simple REPL)

```bash
# Run original version
./test_prototype.py

# Or manually:
./haeccstable.py
```

Then type:
```
open_monitor monitor1
select_composition simple_passthrough/
run main.txt
```

**Simpler but:**
- ❌ No live dossier viewer
- ❌ Must use select_composition/run workflow
- ✅ Still works great for basic testing

---

## What Happens?

Both versions:
1. Start a **Python REPL**
2. Spawn a **monitor subprocess** (C++ with Metal)
3. Open an **NSWindow** titled "monitor1"
4. Start your **webcam** (AVFoundation)
5. Render video to the window via **Metal** at 60fps

## What's Implemented

✅ **Windows pop up** when you run `open_monitor`
✅ **Window titles** match the monitor name
✅ **Video layers** render to the window canvas
✅ **Live webcam** at 1920x1080 @ 60fps
✅ **Metal GPU** rendering (zero-copy)
✅ **Socket IPC** between Python and C++

## Files to Explore

- **haeccstable.py** - Python REPL
- **dsl_parser.py** - DSL parser
- **monitor/monitor_window.mm** - Window + Metal rendering
- **monitor/video_capture.mm** - Webcam capture
- **monitor/shaders.metal** - GPU shaders

## More Info

- **PROTOTYPE_README.md** - Full usage guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **ARCHITECTURE.md** - Full system design
- **API_REFERENCE.md** - Complete DSL spec

---

**The core architecture works! Ready to expand to full feature set.** 🎉
