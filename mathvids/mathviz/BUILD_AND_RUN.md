# MathViz - Build and Run Instructions

## Quick Start (macOS)

### 1. Install Dependencies

```bash
# Using Homebrew
brew install cmake glfw glew glm
```

### 2. Setup Dear ImGui

```bash
cd /Users/kabirdaniel/Desktop/yusei/nava-s-workbench/mathvids/mathviz
./setup_imgui.sh
```

### 3. Build the Project

```bash
mkdir build
cd build
cmake ..
make -j4
```

### 4. Run MathViz

```bash
./mathviz
```

## What You Should See

When you run `./mathviz`, you'll see:

1. **Window** opens (1920x1080) with three panels
2. **View Panel (top)**: Shows a test scene with:
   - Gray X and Y axes
   - Blue sine wave
   - Red circle
3. **Script Panel (bottom-left)**: Shows placeholder text
4. **Console Panel (bottom-right)**: Shows welcome message and command prompt

## Testing Features (Phase 2)

### Panel Navigation (Ctrl+B + h/k/l)
1. Press `Ctrl+B` then `h` → Script Panel gets blue border (focused)
2. Press `Ctrl+B` then `k` → View Panel gets blue border (focused)
3. Press `Ctrl+B` then `l` → Console Panel gets blue border (focused)

### Command History (Up/Down arrows)
1. Focus Console Panel (`Ctrl+B` then `l`)
2. Type some commands and press Enter:
   - `test command 1`
   - `test command 2`
   - `test command 3`
3. Press Up Arrow → See previous command
4. Press Up Arrow again → See command before that
5. Press Down Arrow → Navigate forward through history

### Console Commands
- `clear` → Clears console output
- `run` → Executes script (currently no-op)
- `run -gg 5` → Executes from line 5 (currently no-op)
- Any other text → Logs to console and script panel

## Troubleshooting

### "Failed to initialize GLFW"
- Make sure GLFW is installed: `brew install glfw`

### "Failed to initialize GLEW"
- Make sure GLEW is installed: `brew install glew`

### "Dear ImGui not found"
- Run `./setup_imgui.sh` to clone ImGui

### Shader compilation errors
- Make sure you have OpenGL 4.1+ support
- Check console output for specific shader errors

### Black screen in View Panel
- This is expected if the test scene isn't rendering
- Check console for "Test scene created" message
- If you see OpenGL errors, your GPU may not support required features

## Current Status: Phase 2 Complete ✅

### What Works
- ✅ Three-panel GUI layout
- ✅ Panel focus indication (blue borders)
- ✅ Panel navigation (Ctrl+B + h/k/l)
- ✅ Console command input
- ✅ Command history (up/down arrows)
- ✅ Test scene rendering (sine wave, circle, axes)
- ✅ Basic rendering system

### What's Coming in Phase 3
- Command parser (init, create, set)
- Scene construction from console commands
- Real-time scene manipulation
- Property editing

## Performance

Expected: 30 FPS with smooth rendering

If you experience lag:
1. Check Activity Monitor for CPU usage
2. Make sure vsync is enabled (should be by default)
3. Check console for OpenGL errors

## Next Steps

Phase 3 will add:
- Command parsing system
- Dynamic scene creation from console
- Property manipulation
- Frame and body creation via commands

You'll be able to type:
```
> init scene my_scene
> create frame main position=[0,0] width=1600 height=900
> create body line test parent=main
> set body test color=#ff0000 thickness=5
```

And see the results in real-time!
