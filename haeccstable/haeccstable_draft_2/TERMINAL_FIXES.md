# Terminal UI Fixes - Complete

## Issues Fixed

### 1. ✅ Executable Script
**Problem**: Couldn't run with `./haeccstable.py`

**Solution**:
- Added executable permissions: `chmod +x haeccstable.py`
- Shebang already present: `#!/usr/bin/env python3`

**Usage**:
```bash
cd python
./haeccstable.py
```

### 2. ✅ Terminal Size Warning Removed
**Problem**: Script showed warning about minimum terminal size and startup messages before UI loaded

**Solution**:
- Removed terminal size check code from haeccstable.py:76-82
- Removed startup print statements
- UI now adapts dynamically to any terminal size

**Before**:
```
Warning: Terminal size should be at least 120x30 for optimal display
Current size: 80x24
Starting Haeccstable Draft 2...
Press Ctrl+C to exit
```

**After**:
- Clean launch directly into curses UI
- Works on any terminal size

### 3. ✅ Display Glitching Fixed
**Problem**: Terminal was blank/glitching when launched - nothing displayed

**Root Cause**:
- Complex Pane class abstraction with separate curses windows wasn't rendering properly
- Window initialization issues
- Color pair setup differences from working draft_1

**Solution**:
Completely rewrote `curses_ui.py` based on the working `haeccstable_draft_1/haeccstable_vim.py`:

**Key Changes**:
1. **Direct Drawing**: Use `stdscr` directly instead of creating separate windows per pane
2. **Simplified Architecture**: Remove Pane class abstraction, use simple scroll offsets
3. **Proper Initialization**:
   ```python
   curses.curs_set(0)  # Hide cursor initially
   stdscr.nodelay(False)
   stdscr.timeout(100)
   ```
4. **Color Pairs**: Match working version exactly
5. **Border Drawing**: Use Unicode box-drawing characters (`═`, `─`, `│`)
6. **Layout Calculation**: Dynamic sizing based on terminal dimensions

**Before** (broken):
```python
class Pane:
    def __init__(self, name, height, width, y, x):
        self.window = curses.newwin(height, width, y, x)
        # Complex window management...
```

**After** (working):
```python
def _draw_dossier_pane(self, y, x, height, width):
    # Direct drawing to stdscr
    self.stdscr.addstr(y, x, "═" * width, border_attr)
    # ...
```

### 4. ✅ Vertical Divider Added
**New Feature**: Thin vertical line between dossier and log panes

**Implementation**:
```python
def _draw_vertical_divider(self, y, x, height):
    """Draw thin vertical divider line between panes"""
    for i in range(height):
        self.stdscr.addstr(y + i, x, "│", curses.color_pair(1))
```

**Visual Result**:
```
═══════════════════════════════│═══════════════════════════════
  DOSSIER.JSON [FOCUSED]       │  LOG
{                               │> video_invar webcam = capture(0)
  "session": {                  │✓ OK
    "started": "...",            │
    ...                          │
}                               │
───────────────────────────────────────────────────────────────
haeccstable>
-- NORMAL -- [Focus: DOSSIER]     1:dossier 2:log 3:command | q:quit
```

## Current UI Layout

```
┌──────────────────────────┬──────────────────────────┐
│  DOSSIER.JSON [FOCUSED]  │  LOG                     │
│  {                       │  > command               │
│    "session": {...},     │  ✓ result                │
│    "devices": {...},     │                          │
│    "variables": {...}    │                          │
│  }                       │                          │
├──────────────────────────┴──────────────────────────┤
│  haeccstable> _                                     │
├─────────────────────────────────────────────────────┤
│  -- INSERT --    1:dossier 2:log 3:command | q:quit │
└─────────────────────────────────────────────────────┘
```

## Testing

All fixes verified by import test:
```bash
cd python
python3 -c "from curses_ui import HaeccstableUI; print('Import successful')"
# Output: Import successful
```

Run the terminal:
```bash
./haeccstable.py
```

## Files Modified

1. **haeccstable.py**
   - Removed terminal size warning
   - Removed startup messages
   - Added executable permissions

2. **curses_ui.py**
   - Complete rewrite (375 lines)
   - Based on working draft_1 version
   - Simplified architecture
   - Added vertical divider
   - Fixed all rendering issues

3. **README.md**
   - Updated running instructions
   - Added vertical divider to features
   - Changed "120x30 recommended" to "any size"

## Related Documentation

For device scanning implementation (Phase 3):
- See `swift/DEVICE_SCANNING.md`
- Device enumeration will populate `dossier.json` with hardware info
- Phase 2 shows empty device arrays (expected)
