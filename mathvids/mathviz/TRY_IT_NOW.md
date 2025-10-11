# 🚀 Try MathViz Now - Phase 2 Prototype

## One Command to Build and Run

```bash
cd /Users/kabirdaniel/Desktop/yusei/nava-s-workbench/mathvids/mathviz
./quick_build.sh run
```

That's it! The script will:
1. Check dependencies
2. Setup Dear ImGui
3. Build the project
4. Launch the application

## What You'll See

### View Panel (Top)
A test scene with:
- **Gray axes** crossing in the center
- **Blue sine wave** flowing horizontally
- **Red circle** in the center

### Script Panel (Bottom-Left)
- Placeholder text
- Will show commands as you execute them

### Console Panel (Bottom-Right)
- Welcome message
- Command prompt: `>`
- Ready for input

## Things to Try

### 1. Panel Navigation
```
Press: Ctrl+B then h  →  Script Panel (blue border)
Press: Ctrl+B then k  →  View Panel (blue border)
Press: Ctrl+B then l  →  Console Panel (blue border)
```

The active panel will have a **thick blue border**.

### 2. Command History
```
1. Focus Console (Ctrl+B + l)
2. Type: hello
3. Press Enter
4. Type: world
5. Press Enter
6. Type: test
7. Press Enter
8. Press Up Arrow  →  Shows "test"
9. Press Up Arrow  →  Shows "world"
10. Press Up Arrow →  Shows "hello"
11. Press Down     →  Navigate forward
```

### 3. Console Commands
```
> clear          # Clears console output
> run            # Runs script (logs message)
> run -gg 5      # Runs from line 5
> anything else  # Logs to console
```

## Manual Build (If Script Fails)

```bash
# 1. Install dependencies
brew install cmake glfw glew glm

# 2. Setup ImGui
cd /Users/kabirdaniel/Desktop/yusei/nava-s-workbench/mathvids/mathviz
./setup_imgui.sh

# 3. Build
mkdir build
cd build
cmake ..
make -j4

# 4. Run
./mathviz
```

## Troubleshooting

### "Permission denied: ./quick_build.sh"
```bash
chmod +x quick_build.sh
./quick_build.sh run
```

### "Dear ImGui not found"
```bash
./setup_imgui.sh
```

### Build errors
```bash
# Clean build
./quick_build.sh clean
./quick_build.sh run
```

### Black screen in View Panel
- Check console output for "Test scene created" message
- Make sure OpenGL 4.1+ is supported
- Try resizing the window

## Expected Performance

- **Frame rate**: 30 FPS solid
- **Input latency**: < 16ms
- **Memory**: < 100 MB
- **CPU**: < 5% on modern Mac

## What's Working (Phase 2 ✅)

- ✅ Three-panel GUI
- ✅ Panel navigation (Ctrl+B + h/k/l)
- ✅ Visual focus indication (blue borders)
- ✅ Command history (up/down arrows)
- ✅ Test scene rendering
- ✅ Console input/output
- ✅ Command logging to script panel

## What's NOT Working Yet

- ❌ Command parsing (Phase 3)
- ❌ Dynamic scene creation (Phase 3)
- ❌ Vim editor in script panel (Phase 4)
- ❌ Mathematical functions (Phase 5)
- ❌ Animations (Phase 6)

## Screenshots Should Look Like

```
┌─────────────────────────────────────────────┐
│                 VIEW PANEL                  │
│  [Shows sine wave (blue), circle (red),    │
│   and gray axes on black background]       │
│                                             │
│              🔵 Blue border if active       │
├──────────────────────┬──────────────────────┤
│ SCRIPT PANEL         │ CONSOLE PANEL        │
│ # Script commands    │ [INFO] MathViz...    │
│ will appear here     │ [INFO] Type commands │
│                      │ [INFO] Press Ctrl+B  │
│                      │ > _                  │
│ 🔵 Blue border       │ 🔵 Blue border       │
│    if active         │    if active         │
└──────────────────────┴──────────────────────┘
```

## Next Steps After Testing

If everything works:
1. ✅ Phase 2 is verified working
2. 🚀 Ready to start Phase 3: Command Parser
3. 📝 Report any issues or bugs you find

## Quick Reference

| Action | Keys |
|--------|------|
| Focus Script | Ctrl+B, h |
| Focus View | Ctrl+B, k |
| Focus Console | Ctrl+B, l |
| Previous command | Up Arrow |
| Next command | Down Arrow |
| Clear console | Type: clear |

## Have Fun! 🎉

This is the foundation for the full MathViz application. Phase 3 will add real command parsing so you can create scenes interactively!
