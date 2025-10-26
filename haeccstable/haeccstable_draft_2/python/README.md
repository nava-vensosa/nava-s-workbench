# Haeccstable Python Terminal

## Status: Phase 1 Complete ✓ | Phase 2 Day 1 Complete ✓

## Overview

This directory contains the Python terminal interface for Haeccstable Draft 2.

## Components

### Python Terminal (python/)
- **haeccstable.py** - Main entry point, starts the terminal UI
- **curses_ui.py** - 3-pane tmux-style interface with real-time dossier/log display
- **vim_motions.py** - Vim modal system (NORMAL/INSERT) and navigation
- **dsl_parser.py** - Complete DSL lexer/parser with `$` prefix support for processes
- **ipc_client.py** - IPC client stub (expanded in Phase 2)

### Composition Files (../composition_files/)
- **dossier.json** - Session state (auto-updated)
- **log.txt** - Command history log
- **\*.json** - Saved dossier snapshots
- **\*.txt** - Saved log snapshots

## Features Implemented (Phase 1)

### ✅ Terminal UI
- 3-pane layout: Dossier (top-left) | Log (top-right) | Command (bottom)
- Thin vertical divider between dossier and log panes
- Focus switching with 1/2/3 keys
- Yellow border for focused pane
- Status bar showing mode and focus
- Real-time dossier.json and log.txt updates
- Adapts to any terminal size

### ✅ Vim Modal System
- **NORMAL mode**: Full vim navigation in all 3 panes
  - Basic: `h/j/k/l` (left/down/up/right)
  - Word: `w/b/e/E/B` (word forward/back/end, WORD end/back)
  - Line: `0/$` (line start/end)
  - File: `gg/G` (file start/end), `Ctrl-D/Ctrl-U` (page down/up)
  - Paragraph: `{/}` (previous/next empty line)
- **INSERT mode**: Text input in command pane
- **Blinking cursor**: Visible cursor tracks position in focused pane (just like Vim!)
- **Text wrapping**: All 3 panes wrap long lines automatically
- Mode transitions: i/a/o/s → INSERT, ESC → NORMAL
- Stays in INSERT mode after executing commands
- Auto-scroll keeps cursor visible

### ✅ DSL Parser
Supports all Draft 2 syntax:

**Variable Types:**
- `video_invar`, `video_outvar`, `audio_invar`, `audio_outvar`
- `window_var`, `layer_obj`, `number_var`, `var`

**Process System:**
- Process definitions: `process $name(params) { ... }`
- Process calls: `$sobel(video, threshold=0.15)`
- Validation: Rejects processes without `$` prefix with helpful error

**Object-Oriented Syntax:**
- Method calls: `layer.cast(webcam)`
- Property assignment: `freq.mix = (100, 0)`

**Functions:**
- Function definitions: `func ratio(x, y) = x / y`
- Function calls: `ratio(3, 2)`

**Advanced:**
- Named arguments: `$dog(video, sigma1=1.0, sigma2=2.0)`
- Tuples: `(1920, 1080)`, `(1.0, 0.8, 0.4)`
- Comments: `//` and `#`

### ✅ REPL System - Log as Programmable File
The log.txt file functions as an **editable program**:
- **`dd` motion** in log pane - Delete line and re-execute entire log as program
- **`print("message")`** - Console output with `#` prefix
- **`println("message")`** - Console output with `#` prefix + blank line
- **`run("filename.txt")`** - Import and execute script files
- **Log format**: `>` commands, `#` output, `//` comments, `✓/✗` results

This enables iterative development where you edit history, and the dossier rebuilds automatically!

**See [REPL_SYSTEM.md](../REPL_SYSTEM.md) for complete guide.**

### ✅ Special Commands
Built-in terminal commands:
- `exit` - Exit Haeccstable
- `---` - Add two blank lines to log (visual separator for organizing sessions)
- `print("text")` - Output console message with `#` prefix
- `println("text")` - Output console message with `#` prefix + blank line
- `run("file.txt")` - Execute script file from composition_files/
- `clear log.txt` - Clear the command log
- `save dossier.json <filename>` - Save current dossier state (e.g., `save dossier.json snapshot1.json`)
- `save log.txt <filename>` - Save current log (e.g., `save log.txt session1.txt`)

All saved files are stored in `../composition_files/`

## Running the Terminal

```bash
cd python
./haeccstable.py
```

Or:
```bash
python3 haeccstable.py
```

**Requirements:**
- Python 3.11+
- Any terminal size (adapts automatically)

## Testing

Run parser tests:
```bash
python3 test_parser.py
```

Current test results: **12/12 tests passing** ✓

## Phase 2 Day 1 Progress

### ✅ Swift IPC Infrastructure
The Swift application infrastructure is now complete:

**Components:**
- `CommandServer.swift` - Unix socket server at `/tmp/haeccstable.sock`
- `MessageRouter.swift` - Routes messages to appropriate handlers
- `Logger.swift` - Logging utility
- `main.swift` - Application entry point

**Testing IPC Connection:**
```bash
# Terminal 1: Start Swift app
cd ../swift/HaeccstableApp
swift run

# Terminal 2: Run IPC test
cd python
python3 test_ipc.py
```

The test script validates:
- Socket connection
- Ping/pong health check
- Variable declarations
- Process calls with `$` prefix validation
- Method calls and property assignments
- State queries

See `../swift/README_PHASE2_DAY1.md` for detailed documentation.

## Documentation

- **[REPL_SYSTEM.md](../REPL_SYSTEM.md)** - 🆕 REPL system: Edit log as program, print(), run()
- **[VIM_NAVIGATION.md](../VIM_NAVIGATION.md)** - Complete guide to vim navigation features
- **[DSL_SPECIFICATION.md](../DSL_SPECIFICATION.md)** - Full DSL syntax reference
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture
- **[QUICKSTART.md](../QUICKSTART.md)** - Quick start guide
- **[WORKFLOW_IMPROVEMENTS.md](../WORKFLOW_IMPROVEMENTS.md)** - Workflow features

## Next Steps (Phase 2 Day 2+)

- ✅ Day 1: Swift IPC infrastructure
- ⏳ Day 2: StateManager, DossierManager, ProcessRegistry, Models
- ⏳ Day 3: Command handler implementations
- ⏳ Day 4: Expand Python IPC client, full integration testing
- ⏳ Day 5: Tests and documentation

## Usage Example

Start the terminal and type commands:

```haeccstable
video_invar webcam = capture(0)
window_var win = window("Output", 1920, 1080)
layer_obj layer = layer("Main", 1920, 1080)
layer.cast(webcam)
win.project(layer)
```

Commands are parsed, logged, and (in Phase 2+) sent to Swift app for execution.

## Keyboard Shortcuts

**Focus Switching (NORMAL mode):**
- `1` - Focus dossier pane
- `2` - Focus log pane
- `3` - Focus command pane

**Navigation (NORMAL mode):**
- `h/j/k/l` - Left/down/up/right
- `w/b/e` - Word forward/backward/end
- `gg/G` - Top/bottom of file
- `{/}` - Previous/next paragraph
- `0/$` - Start/end of line

**Mode Transitions:**
- `i/a/o/s` - Enter INSERT mode (in command pane)
- `ESC` - Return to NORMAL mode
- `Enter` - Execute command (INSERT mode, command pane)

**Quit:**
- Type `exit` in command line to quit
- `Ctrl+C` - Force quit

## Current Limitations

- Commands are parsed and sent to Swift app, but handlers return stub responses (Day 2-3 will implement)
- Process body parsing is simplified (sufficient for Phase 2)
- No command history with up/down arrows (future enhancement)
- No syntax highlighting (future enhancement)

Full command execution will be available after Phase 2 Day 3 (CommandHandlers implementation).
