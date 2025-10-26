# Haeccstable Draft 2 - Quick Start Guide

## Launch

```bash
cd haeccstable_draft_2/python
./haeccstable.py
```

## First Commands

The terminal starts in **NORMAL mode**. Press `3` to focus the command pane, then press `i` to enter **INSERT mode**.

```
haeccstable> video_invar webcam = capture(0)
```

Press **Enter** to execute. Notice you're still in INSERT mode - keep typing!

```
haeccstable> window_var win = window("Output", 1920, 1080)
haeccstable> layer_obj layer = layer("Main", 1920, 1080)
haeccstable> layer.cast(webcam)
haeccstable> win.project(layer)
```

## Save Your Work

```
haeccstable> save dossier.json my_first_composition.json
```

Your composition is saved to `../composition_files/my_first_composition.json`

## View State

Press **ESC** to enter NORMAL mode, then:
- Press `1` to focus **Dossier** (left pane) - shows current state
- Press `2` to focus **Log** (right pane) - shows command history
- Press `3` to focus **Command** - return to command input

Navigate with vim keys: `j/k` (down/up), `gg` (top), `G` (bottom)

## Return to Editing

Press `i` to re-enter INSERT mode and continue entering commands.

## Clear Log

```
haeccstable> clear log.txt
```

## Exit

```
haeccstable> exit
```

## Layout

```
┌─────────────────────────┬──────────────────────────┐
│ DOSSIER.JSON            │ LOG                      │
│ {                       │ > video_invar webcam...  │
│   "session": {...},     │ ✓ OK                     │
│   "devices": {...},     │ > window_var win...      │
│   "variables": {...}    │ ✓ OK                     │
│ }                       │                          │
├─────────────────────────┴──────────────────────────┤
│ haeccstable> _                                     │
├────────────────────────────────────────────────────┤
│ -- INSERT --    1:dossier 2:log 3:command | 'exit'│
└────────────────────────────────────────────────────┘
```

## Essential Commands

**DSL Commands** (all standard syntax):
```haeccstable
video_invar name = capture(0)
window_var name = window("Title", width, height)
layer_obj name = layer("Name", width, height)
$sobel(video, threshold=0.15)
```

**Terminal Commands**:
- `exit` - Quit
- `clear log.txt` - Clear log
- `save dossier.json <file>` - Save state
- `save log.txt <file>` - Save log

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Focus dossier (NORMAL) |
| `2` | Focus log (NORMAL) |
| `3` | Focus command (NORMAL) |
| `i` | Enter INSERT mode |
| `ESC` | Enter NORMAL mode |
| `Enter` | Execute command (INSERT) |
| `j/k` | Scroll down/up (NORMAL) |
| `gg/G` | Jump to top/bottom (NORMAL) |

## Tips

1. **Stay in INSERT mode** - Commands keep you in INSERT mode for rapid entry
2. **Save often** - Use `save dossier.json <name>` before experiments
3. **Clear logs** - Use `clear log.txt` to start fresh
4. **Navigate freely** - Press ESC, navigate panes, press 'i' to return

## File Locations

All your work is saved in:
```
haeccstable_draft_2/composition_files/
├── dossier.json           # Current session
├── log.txt                # Current log
└── *.json, *.txt          # Your snapshots
```

## Example Session

```bash
# 1. Launch
./haeccstable.py

# 2. Press 3, then i (enter INSERT mode)

# 3. Type commands
video_invar webcam = capture(0)
window_var win = window("Output", 1920, 1080)
layer_obj layer = layer("Main", 1920, 1080)

# 4. Save snapshot
save dossier.json baseline.json

# 5. Experiment
$sobel(webcam, threshold=0.15)
layer.cast(webcam)
win.project(layer)

# 6. Save experiment
save dossier.json with_sobel.json

# 7. Save commands for reference
save log.txt sobel_demo.txt

# 8. Exit
exit
```

## Need Help?

- **Full docs**: See `README.md` in python/
- **Workflow guide**: See `WORKFLOW_IMPROVEMENTS.md`
- **DSL syntax**: See `DSL_SPECIFICATION.md`
- **Architecture**: See `ARCHITECTURE.md`

## What's Next?

Phase 2 (Swift app) will enable actual video capture and processing. For now:
- Practice DSL syntax
- Create compositions
- Save different configurations
- Explore the state management

The terminal is fully functional - commands are parsed and logged, ready for Phase 2 execution!
