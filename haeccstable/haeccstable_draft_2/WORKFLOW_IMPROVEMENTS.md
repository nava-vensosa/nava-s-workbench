# Workflow Improvements - Complete

## Overview

Implemented improved workflow features for the Haeccstable terminal interface, focusing on continuous editing, file management, and better organization.

## Changes Implemented

### 1. ✅ Stay in INSERT Mode After Commands

**Previous Behavior**: After executing a command with Enter, the terminal returned to NORMAL mode.

**New Behavior**: Terminal stays in INSERT mode after executing commands, allowing continuous command entry without repeatedly pressing `i`.

**Implementation**:
```python
# curses_ui.py:350
elif key in [curses.KEY_ENTER, 10, 13]:  # Enter
    if self.command_buffer.strip():
        self._execute_command(self.command_buffer.strip())
        self.command_buffer = ""
        self.vim.cursor_col = 0
        # Stay in INSERT mode after command execution
```

**User Flow**:
```
1. Press 'i' to enter INSERT mode
2. Type: video_invar webcam = capture(0)
3. Press Enter → command executes, stays in INSERT mode
4. Type: window_var win = window("Output", 1920, 1080)
5. Press Enter → command executes, stays in INSERT mode
6. Continue entering commands...
7. Press ESC to return to NORMAL mode when done
```

### 2. ✅ Changed Quit from 'q' to 'exit' Command

**Previous Behavior**: Pressing `q` in NORMAL mode would quit the application.

**New Behavior**: Must type `exit` as a command to quit. This prevents accidental quits and makes quitting more intentional.

**Implementation**:
```python
# curses_ui.py:375
if command == "exit":
    self.running = False
    return
```

**Usage**:
```
haeccstable> exit
```

**Status Bar Updated**:
```
-- INSERT --    1:dossier 2:log 3:command | 'exit' to quit
```

### 3. ✅ Added 'clear log.txt' Command

**Purpose**: Clear the command history log while preserving the log file.

**Implementation**:
```python
# curses_ui.py:429
def _clear_log(self):
    """Clear the log.txt file"""
    try:
        with open(self.log_path, 'w') as f:
            f.write("# Haeccstable Session Log\n")
            f.write("# Cleared\n")

        self._log_message("✓ Log cleared")
        self._load_content()
```

**Usage**:
```
haeccstable> clear log.txt
> clear log.txt
✓ Log cleared
```

**Result**: The log pane refreshes with just the header comments.

### 4. ✅ Added 'save' Commands for Dossier and Log

**Purpose**: Save snapshots of the current dossier state or command log for later reference.

#### Save Dossier

**Syntax**: `save dossier.json <filename>`

**Implementation**:
```python
# curses_ui.py:442
def _save_dossier(self, filename: str):
    """Save current dossier.json to a new file"""
    import shutil

    try:
        # Ensure filename ends with .json
        if not filename.endswith('.json'):
            filename += '.json'

        # Save to composition_files directory
        dest_path = os.path.join(self.composition_dir, filename)

        # Copy current dossier
        shutil.copy2(self.dossier_path, dest_path)

        self._log_message(f"✓ Saved dossier to {filename}")
```

**Usage Examples**:
```
haeccstable> save dossier.json experiment1.json
> save dossier.json experiment1.json
✓ Saved dossier to experiment1.json

haeccstable> save dossier.json snapshot_working
> save dossier.json snapshot_working
✓ Saved dossier to snapshot_working.json
```

**Note**: `.json` extension is added automatically if not provided.

#### Save Log

**Syntax**: `save log.txt <filename>`

**Implementation**:
```python
# curses_ui.py:462
def _save_log(self, filename: str):
    """Save current log.txt to a new file"""
    import shutil

    try:
        # Ensure filename ends with .txt
        if not filename.endswith('.txt'):
            filename += '.txt'

        # Save to composition_files directory
        dest_path = os.path.join(self.composition_dir, filename)

        # Copy current log
        shutil.copy2(self.log_path, dest_path)

        self._log_message(f"✓ Saved log to {filename}")
```

**Usage Examples**:
```
haeccstable> save log.txt session1.txt
> save log.txt session1.txt
✓ Saved log to session1.txt

haeccstable> save log.txt demo_commands
> save log.txt demo_commands
✓ Saved log to demo_commands.txt
```

**Note**: `.txt` extension is added automatically if not provided.

### 5. ✅ Reorganized File Structure - composition_files/

**Previous Structure**:
```
haeccstable_draft_2/
├── python/
│   ├── haeccstable.py
│   ├── curses_ui.py
│   ├── dossier.json        ← Files were here
│   └── log.txt             ← Files were here
```

**New Structure**:
```
haeccstable_draft_2/
├── python/
│   ├── haeccstable.py
│   ├── curses_ui.py
│   └── ...
├── composition_files/      ← New directory
│   ├── dossier.json        ← Session state
│   ├── log.txt             ← Command log
│   ├── experiment1.json    ← Saved snapshots
│   ├── session1.txt        ← Saved logs
│   └── ...
```

**Rationale**:
1. **Separation of Concerns**: Code in `python/`, data in `composition_files/`
2. **Clean Python Directory**: No data files mixed with source code
3. **Organized Snapshots**: All composition work lives together
4. **Easy Backup**: Can backup/version control `composition_files/` separately
5. **Sibling Directory**: Allows Swift app to also access `composition_files/`

**Implementation**:
```python
# curses_ui.py:27-34
import os
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
self.composition_dir = os.path.join(base_dir, "composition_files")
self.dossier_path = os.path.join(self.composition_dir, "dossier.json")
self.log_path = os.path.join(self.composition_dir, "log.txt")

# Ensure composition_files directory exists
os.makedirs(self.composition_dir, exist_ok=True)
```

**Auto-Creation**: The `composition_files/` directory is created automatically when the terminal starts if it doesn't exist.

## Complete Command Reference

### DSL Commands
All standard DSL syntax (see DSL_SPECIFICATION.md):
```haeccstable
video_invar webcam = capture(0)
window_var win = window("Output", 1920, 1080)
layer_obj layer = layer("Main", 1920, 1080)
layer.cast(webcam)
win.project(layer)
```

### Special Terminal Commands

| Command | Description | Example |
|---------|-------------|---------|
| `exit` | Exit Haeccstable | `exit` |
| `clear log.txt` | Clear command log | `clear log.txt` |
| `save dossier.json <file>` | Save dossier snapshot | `save dossier.json exp1.json` |
| `save log.txt <file>` | Save log snapshot | `save log.txt session1.txt` |

## Workflow Examples

### Example 1: Iterative Development

```
# Start Haeccstable
./haeccstable.py

# Press 'i' to enter INSERT mode
haeccstable> video_invar webcam = capture(0)
> video_invar webcam = capture(0)
✓ OK

# Still in INSERT mode - continue typing
haeccstable> window_var win = window("Main", 1920, 1080)
> window_var win = window("Main", 1920, 1080)
✓ OK

# Save snapshot before experimenting
haeccstable> save dossier.json before_filters.json
> save dossier.json before_filters.json
✓ Saved dossier to before_filters.json

# Try some filters
haeccstable> $sobel(webcam, threshold=0.15)
> $sobel(webcam, threshold=0.15)
✓ OK

# Press ESC to navigate dossier/log panes
# Press '1' to focus dossier, review state
# Press '3' to return to command, press 'i' to continue

# Exit when done
haeccstable> exit
```

### Example 2: Session Management

```
# Start working session
haeccstable> video_invar screen = screencapture(0)
haeccstable> $ascii_filter(screen)
haeccstable> layer_obj layer = layer("Main", 1920, 1080)
haeccstable> layer.cast(screen)

# Save complete session state
haeccstable> save dossier.json ascii_demo.json
✓ Saved dossier to ascii_demo.json

# Save command history for documentation
haeccstable> save log.txt ascii_demo_commands.txt
✓ Saved log to ascii_demo_commands.txt

# Clear log to start fresh exploration
haeccstable> clear log.txt
✓ Log cleared

# Continue experimenting...
```

### Example 3: Multiple Snapshots

```
# Create baseline
haeccstable> video_invar webcam = capture(0)
haeccstable> save dossier.json baseline.json

# Experiment with filters
haeccstable> $sobel(webcam)
haeccstable> save dossier.json sobel_version.json

# Try different filter
haeccstable> $dog(webcam, sigma1=1.0, sigma2=2.0)
haeccstable> save dossier.json dog_version.json

# Now composition_files/ contains:
# - dossier.json (current state)
# - baseline.json
# - sobel_version.json
# - dog_version.json
```

## Files Modified

1. **curses_ui.py** (Lines changed: ~100)
   - Updated file paths to use `composition_files/`
   - Removed 'q' quit handler
   - Modified INSERT mode to stay active after commands
   - Added `_execute_command()` special command parsing
   - Added `_clear_log()` method
   - Added `_save_dossier()` method
   - Added `_save_log()` method
   - Updated status bar text

2. **README.md**
   - Added Components section showing file organization
   - Added Special Commands section
   - Updated Vim Modal System description
   - Updated Keyboard Shortcuts (quit method)

3. **Directory Structure**
   - Created `composition_files/` directory
   - Moved `dossier.json` and `log.txt` to new location
   - Created initial file templates

## Benefits

1. **Faster Workflow**: Stay in INSERT mode for rapid command entry
2. **Intentional Quitting**: Typing `exit` prevents accidental quits
3. **Clean Logs**: `clear log.txt` for fresh starts
4. **Version Control**: Save snapshots at any point with meaningful names
5. **Organized Files**: All composition work in dedicated directory
6. **Easy Sharing**: Copy `composition_files/` to share entire session
7. **Documentation**: Save logs with commands for tutorials/documentation

## Compatibility

- **Phase 2 Swift Integration**: Swift app should also use `../composition_files/` for dossier updates
- **Backward Compatible**: Old workflow still works (ESC to NORMAL, then type commands in INSERT)
- **File Auto-Creation**: Missing files/directories are created automatically

## Testing

All features tested and verified:
- ✅ INSERT mode persistence after commands
- ✅ 'exit' command quits application
- ✅ 'clear log.txt' clears log
- ✅ 'save dossier.json' creates snapshots
- ✅ 'save log.txt' creates snapshots
- ✅ Files saved to correct directory
- ✅ Auto-creation of composition_files/
- ✅ Extension auto-appending works

## Future Enhancements

Possible additions for later phases:
- `load dossier.json <filename>` - Restore a saved snapshot
- `list` - Show all saved files in composition_files/
- `diff <file1> <file2>` - Compare two dossier snapshots
- Tab completion for filenames
- Command history with up/down arrows
