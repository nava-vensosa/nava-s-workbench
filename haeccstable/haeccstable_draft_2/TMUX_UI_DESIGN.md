# Haeccstable Terminal UI Design

**Tmux-Style Interface with Vim Modal Navigation**

---

## Overview

This document specifies the complete terminal UI for Haeccstable Draft 2. The interface is a **3-pane tmux-style layout** with **full vim modal support** for navigation and editing.

**Key Features:**
- 3 focusable panes (Dossier | Log | Command)
- 2 modes (NORMAL | INSERT)
- Complete vim motion set
- Real-time JSON/text viewing
- Zero latency command execution

---

## Layout Specification

### Pane Arrangement

```
┌─────────────────────────────────┬─────────────────────────────────┐
│                                 │                                 │
│        DOSSIER PANE [1]         │          LOG PANE [2]           │
│       (dossier.json)            │         (log.txt)               │
│                                 │                                 │
│       Top-Left Quadrant         │       Top-Right Quadrant        │
│       Scrollable JSON           │       Scrollable Text           │
│       Read-only                 │       Read-only                 │
│                                 │                                 │
│                                 │                                 │
│                                 │                                 │
│                                 │                                 │
│                                 │                                 │
│                                 │                                 │
│                                 │                                 │
├─────────────────────────────────┴─────────────────────────────────┤
│                                                                   │
│                      COMMAND PANE [3]                             │
│                      haeccstable> _                               │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│  -- NORMAL -- [Focus: DOSSIER]    1:dossier 2:log 3:cmd | ESC   │
└───────────────────────────────────────────────────────────────────┘
```

### Exact Dimensions

**Terminal Height = H, Terminal Width = W**

| Pane | Height | Width | Position |
|------|--------|-------|----------|
| Dossier | `H - 5` | `W // 2 - 1` | `(0, 0)` |
| Log | `H - 5` | `W // 2 - 1` | `(0, W // 2 + 1)` |
| Command | `3` | `W` | `(H - 4, 0)` |
| Status | `1` | `W` | `(H - 1, 0)` |

**Border Sizes:**
- Vertical separator: 1 column
- Horizontal separator: 1 row
- Focused pane border: 2-char thick (using box drawing characters)

**Minimum Terminal Size:**
- Width: 120 columns (60 per pane + borders)
- Height: 30 rows (20 for top panes + 3 command + 1 status + borders)

---

## Vim Modal System

### Mode States

**NORMAL Mode** (Default)
- Navigate panes with vim motions
- Switch focus with 1/2/3
- Read-only viewing
- Status: `-- NORMAL -- [Focus: DOSSIER]`

**INSERT Mode**
- Only active in command pane
- Type and execute commands
- Status: `-- INSERT --`
- ESC returns to NORMAL

### Mode Transitions

```
                    ┌─────────────┐
                    │   NORMAL    │ ◄─── Initial state
                    │   Mode      │
                    └──────┬──────┘
                           │
        i/I/a/A/o/O/s/S    │    ESC
                           │
                    ┌──────▼──────┐
                    │   INSERT    │
                    │   Mode      │
                    └──────┬──────┘
                           │
                      ENTER│      Execute & auto-return
                           │
                    ┌──────▼──────┐
                    │   NORMAL    │
                    │   Mode      │
                    └─────────────┘
```

---

## Focus System

### Focus States

Three focusable panes:

1. **DOSSIER** (default)
   - Full 2D scrolling (h/j/k/l)
   - JSON content viewing
   - Paragraph jumps ({/})
   - Line/column navigation

2. **LOG**
   - Vertical scrolling only (j/k)
   - Command history viewing
   - Auto-scroll to bottom on new entries

3. **COMMAND**
   - Single-line text input
   - Cursor visible in INSERT mode
   - Command execution

### Focus Switching (NORMAL mode only)

| Key | Focus Target | Effect |
|-----|--------------|--------|
| `1` | DOSSIER | Focus dossier pane, yellow border |
| `2` | LOG | Focus log pane, yellow border |
| `3` | COMMAND | Focus command pane, enable INSERT entry |

**Visual Indicators:**
- Focused pane: **Yellow double-line border**
- Unfocused panes: **Gray single-line border**
- Status line: Shows current focus name

---

## Vim Motions

### Dossier Pane Motions (Focus: DOSSIER)

**Basic Movement:**
```
h       - Scroll left (horizontal)
j       - Scroll down (1 line)
k       - Scroll up (1 line)
l       - Scroll right (horizontal)
```

**Large Jumps:**
```
gg      - Jump to top of file
G       - Jump to bottom of file
0       - Jump to line start (column 0)
$       - Jump to line end (rightmost content)
```

**Word Movement:**
```
w       - Next word (JSON key/value)
e       - End of word
b       - Previous word
```

**Paragraph Jumps:**
```
{       - Previous paragraph (blank line or JSON block)
}       - Next paragraph
```

**Page Movement:**
```
Ctrl-d  - Page down (half screen)
Ctrl-u  - Page up (half screen)
Ctrl-f  - Full page down
Ctrl-b  - Full page up
```

### Log Pane Motions (Focus: LOG)

**Vertical Navigation:**
```
j       - Scroll down (1 line)
k       - Scroll up (1 line)
gg      - Jump to top
G       - Jump to bottom (latest command)
Ctrl-d  - Page down
Ctrl-u  - Page up
```

**No horizontal scrolling** (log entries are single-line or wrapped)

### Command Pane Motions (Focus: COMMAND)

**NORMAL Mode:**
```
i       - Enter INSERT mode at cursor
I       - Enter INSERT mode at line start
a       - Enter INSERT mode after cursor
A       - Enter INSERT mode at line end
o/O     - Enter INSERT mode (same as i)
s/S     - Substitute: clear line and enter INSERT
```

**INSERT Mode:**
```
Left/Right Arrow    - Move cursor
Home/End            - Jump to line start/end
Backspace           - Delete character
Ctrl-W              - Delete word
Ctrl-U              - Clear line
ESC                 - Return to NORMAL mode
Enter               - Execute command, auto-return to NORMAL
```

---

## Color Scheme

### Curses Color Pairs

```python
# Color pair definitions
COLOR_PAIR_BORDER_NORMAL = 1    # Gray border (unfocused)
COLOR_PAIR_BORDER_FOCUS = 2     # Yellow border (focused)
COLOR_PAIR_DOSSIER = 3          # Green text (JSON content)
COLOR_PAIR_LOG = 4              # Cyan text (log entries)
COLOR_PAIR_COMMAND = 5          # White text (command input)
COLOR_PAIR_STATUS_NORMAL = 6    # Blue background (NORMAL mode)
COLOR_PAIR_STATUS_INSERT = 7    # Red text (INSERT mode)
COLOR_PAIR_PROMPT = 8           # Yellow text (haeccstable>)
COLOR_PAIR_ERROR = 9            # Red text (error messages)
COLOR_PAIR_SUCCESS = 10         # Green text (success messages)
```

### Color Assignments

| Element | Foreground | Background | Bold |
|---------|------------|------------|------|
| Dossier text | Green | Black | No |
| Log text | Cyan | Black | No |
| Command text | White | Black | No |
| Prompt `>` | Yellow | Black | Yes |
| Focused border | Yellow | Black | Yes |
| Unfocused border | Gray | Black | No |
| NORMAL mode status | White | Blue | Yes |
| INSERT mode status | Red | Black | Yes |
| Error messages | Red | Black | Yes |
| Success messages | Green | Black | No |

---

## Border Drawing

### Box Drawing Characters

**Focused Pane (Double Line):**
```
╔═══════════════╗
║   CONTENT     ║
║               ║
╚═══════════════╝
```

**Unfocused Pane (Single Line):**
```
┌───────────────┐
│   CONTENT     │
│               │
└───────────────┘
```

**Vertical Separator:**
```
│  (between dossier and log)
```

**Horizontal Separator:**
```
─  (between top panes and command pane)
```

### Border Characters

```python
# Single-line borders (unfocused)
BORDER_SINGLE = {
    'tl': '┌',  # Top-left
    'tr': '┐',  # Top-right
    'bl': '└',  # Bottom-left
    'br': '┘',  # Bottom-right
    'h': '─',   # Horizontal
    'v': '│',   # Vertical
    't': '┬',   # T-junction top
    'b': '┴',   # T-junction bottom
    'l': '├',   # T-junction left
    'r': '┤',   # T-junction right
    'c': '┼'    # Cross
}

# Double-line borders (focused)
BORDER_DOUBLE = {
    'tl': '╔',  # Top-left
    'tr': '╗',  # Top-right
    'bl': '╚',  # Bottom-left
    'br': '╝',  # Bottom-right
    'h': '═',   # Horizontal
    'v': '║',   # Vertical
}
```

---

## Scrolling Behavior

### Dossier Pane Scrolling

**Vertical Scrolling:**
- Viewport: `(H - 5)` lines visible
- Content: Full dossier.json (may be 100+ lines)
- Scroll offset: `dossier_scroll_y` (0 to max)
- Max scroll: `max(0, total_lines - viewport_height)`

**Horizontal Scrolling:**
- Viewport: `(W // 2 - 3)` columns visible (minus borders)
- Content: JSON lines may exceed 200+ characters
- Scroll offset: `dossier_scroll_x` (0 to max)
- Max scroll: `max(0, longest_line_length - viewport_width)`

**Smooth Scrolling:**
```python
def scroll_down(lines=1):
    self.scroll_y = min(self.scroll_y + lines, self.max_scroll_y)

def scroll_up(lines=1):
    self.scroll_y = max(0, self.scroll_y - lines)

def scroll_right(cols=1):
    self.scroll_x = min(self.scroll_x + cols, self.max_scroll_x)

def scroll_left(cols=1):
    self.scroll_x = max(0, self.scroll_x - cols)
```

### Log Pane Scrolling

**Vertical Only:**
- New entries append to bottom
- Auto-scroll to bottom when new command logged
- User can scroll up to review history
- Scroll back to bottom with `G`

**Auto-scroll Logic:**
```python
def log_command(command):
    self.log_entries.append(command)
    if self.auto_scroll:  # User at bottom
        self.scroll_y = max(0, len(self.log_entries) - viewport_height)
```

### Page Movement

**Page Down (Ctrl-d):**
- Scroll by `viewport_height // 2` lines
- Cursor stays at same relative position

**Page Up (Ctrl-u):**
- Scroll by `viewport_height // 2` lines upward

**Full Page (Ctrl-f / Ctrl-b):**
- Scroll by `viewport_height - 2` lines (with overlap)

---

## Cursor Management

### Cursor Visibility

**NORMAL Mode:**
- Cursor **hidden** in dossier/log panes (read-only)
- Cursor **hidden** in command pane (not editing)

**INSERT Mode (Command Pane Only):**
- Cursor **visible** at input position
- Cursor blinks (terminal default behavior)
- Position: `len(prompt) + cursor_offset`

### Cursor Position

```python
class CommandLine:
    def __init__(self):
        self.input_buffer = ""
        self.cursor_pos = 0  # 0 to len(input_buffer)

    def render_cursor(self, win, y, x):
        prompt = "haeccstable> "
        cursor_x = x + len(prompt) + self.cursor_pos
        curses.curs_set(1)  # Show cursor
        win.move(y, cursor_x)
```

**INSERT Mode Cursor Movement:**
```
Left Arrow    → cursor_pos = max(0, cursor_pos - 1)
Right Arrow   → cursor_pos = min(len(buffer), cursor_pos + 1)
Home          → cursor_pos = 0
End           → cursor_pos = len(buffer)
```

---

## Status Line

### Status Line Format

**NORMAL Mode:**
```
-- NORMAL -- [Focus: DOSSIER]    1:dossier 2:log 3:cmd | ESC:exit
```

**INSERT Mode:**
```
-- INSERT --                     Enter:execute | ESC:normal
```

### Status Line Components

```python
def render_status_line(stdscr, mode, focus):
    height, width = stdscr.getmaxyx()
    status_y = height - 1

    # Clear line
    stdscr.addstr(status_y, 0, ' ' * (width - 1))

    if mode == 'normal':
        # Mode indicator (blue background)
        stdscr.addstr(status_y, 0, '-- NORMAL --',
                      curses.color_pair(COLOR_PAIR_STATUS_NORMAL) | curses.A_BOLD)

        # Focus indicator
        focus_text = f' [Focus: {focus.upper()}]'
        stdscr.addstr(status_y, 13, focus_text, curses.color_pair(COLOR_PAIR_STATUS_NORMAL))

        # Help text
        help_text = '    1:dossier 2:log 3:cmd | ESC:exit'
        stdscr.addstr(status_y, 13 + len(focus_text), help_text)

    else:  # insert mode
        # Mode indicator (red text)
        stdscr.addstr(status_y, 0, '-- INSERT --',
                      curses.color_pair(COLOR_PAIR_STATUS_INSERT) | curses.A_BOLD)

        # Help text
        help_text = '                     Enter:execute | ESC:normal'
        stdscr.addstr(status_y, 13, help_text)
```

---

## Event Handling

### Key Press Routing

```python
def handle_keypress(key):
    if key == 27:  # ESC
        if mode == 'insert':
            mode = 'normal'
        else:
            confirm_exit()

    elif mode == 'normal':
        handle_normal_mode(key)

    elif mode == 'insert':
        handle_insert_mode(key)
```

### Normal Mode Handler

```python
def handle_normal_mode(key):
    # Focus switching
    if key == ord('1'):
        focus = 'dossier'
    elif key == ord('2'):
        focus = 'log'
    elif key == ord('3'):
        focus = 'command'

    # Mode switching (only in command pane)
    elif key in [ord('i'), ord('I'), ord('a'), ord('A'),
                 ord('o'), ord('O'), ord('s'), ord('S')]:
        if focus == 'command':
            mode = 'insert'
            handle_insert_entry(key)

    # Navigation (route to focused pane)
    else:
        if focus == 'dossier':
            handle_dossier_navigation(key)
        elif focus == 'log':
            handle_log_navigation(key)
```

### Insert Mode Handler

```python
def handle_insert_mode(key):
    if key == 27:  # ESC
        mode = 'normal'
        curses.curs_set(0)  # Hide cursor

    elif key == 10:  # ENTER
        execute_command(input_buffer)
        input_buffer = ""
        cursor_pos = 0
        mode = 'normal'  # Auto-return to normal
        curses.curs_set(0)

    elif key == curses.KEY_BACKSPACE or key == 127:
        if cursor_pos > 0:
            input_buffer = input_buffer[:cursor_pos-1] + input_buffer[cursor_pos:]
            cursor_pos -= 1

    elif key == curses.KEY_LEFT:
        cursor_pos = max(0, cursor_pos - 1)

    elif key == curses.KEY_RIGHT:
        cursor_pos = min(len(input_buffer), cursor_pos + 1)

    elif 32 <= key <= 126:  # Printable characters
        input_buffer = input_buffer[:cursor_pos] + chr(key) + input_buffer[cursor_pos:]
        cursor_pos += 1
```

---

## Multi-Key Commands

### Implementation

Some vim motions require **two keypresses** (e.g., `gg`, `G` with count).

**Pending Key System:**
```python
class VimInterface:
    def __init__(self):
        self.pending_key = None  # Stores first key of multi-key command

    def handle_normal_mode(self, key):
        if self.pending_key is not None:
            # Complete multi-key command
            if self.pending_key == ord('g') and key == ord('g'):
                goto_top()
            self.pending_key = None

        elif key == ord('g'):
            # Start multi-key command
            self.pending_key = ord('g')

        elif key == ord('G'):
            goto_bottom()
```

**Supported Multi-Key Commands:**
- `gg` → Jump to top
- Future: `3j` → Move down 3 lines (count + motion)

---

## Resize Handling

### Terminal Resize Event

**Behavior:**
- Detect `curses.KEY_RESIZE` event
- Recalculate all pane dimensions
- Preserve scroll offsets (as percentage)
- Redraw entire layout

**Resize Handler:**
```python
def handle_resize(stdscr):
    # Get new dimensions
    new_height, new_width = stdscr.getmaxyx()

    # Check minimum size
    if new_height < 30 or new_width < 120:
        show_error("Terminal too small! Min: 120x30")
        return

    # Recalculate pane dimensions
    dossier_height = new_height - 5
    dossier_width = new_width // 2 - 1
    log_width = new_width // 2 - 1

    # Preserve scroll position (as percentage)
    dossier_scroll_pct = dossier.scroll_y / max(1, dossier.max_scroll_y)
    dossier.recalculate_max_scroll(dossier_height)
    dossier.scroll_y = int(dossier_scroll_pct * dossier.max_scroll_y)

    # Redraw everything
    stdscr.clear()
    render_layout(stdscr)
```

---

## Rendering Loop

### Main Loop

```python
def main_loop(stdscr):
    setup_colors()

    mode = 'normal'
    focus = 'dossier'

    while True:
        # Render layout
        render_dossier_pane(stdscr, focus == 'dossier')
        render_log_pane(stdscr, focus == 'log')
        render_command_pane(stdscr, mode, focus == 'command')
        render_status_line(stdscr, mode, focus)

        stdscr.refresh()

        # Get input
        key = stdscr.getch()

        # Handle special keys
        if key == curses.KEY_RESIZE:
            handle_resize(stdscr)

        elif key == 3:  # Ctrl-C
            break

        # Route to appropriate handler
        else:
            handle_keypress(key, mode, focus)
```

### Update Frequency

**Rendering:**
- Manual render on keypress (blocking input)
- No fixed frame rate (terminal updates are fast)

**Dossier Updates:**
- Check for dossier.json changes every 100ms (separate thread)
- Reload and re-render if modified

**Log Updates:**
- Immediate append when command executed
- Auto-scroll to bottom if user at bottom

---

## Edge Cases

### Empty Dossier

**Behavior:**
- Show placeholder text: `"No session data yet..."`
- Allow navigation (no-op)
- Border still renders

### Empty Log

**Behavior:**
- Show placeholder: `"No commands executed yet..."`
- Append initial message on first run

### Extremely Long Lines

**Dossier:**
- Enable horizontal scrolling (`h`/`l`)
- Show `...` indicator if line truncated

**Log:**
- Wrap long commands at viewport width
- Or truncate with `...` (configurable)

### Rapid Key Repeat

**Prevention:**
- Use `curses.halfdelay(1)` for input timeout
- Debounce scroll commands (max 10 scroll/sec)

### Dossier File Lock

**Handling:**
- If Swift app writing to dossier.json when Python reads:
- Implement file locking (fcntl on Unix)
- Retry read after short delay
- Show stale data if lock held >100ms

---

## Performance Considerations

### Rendering Optimization

**Partial Redraws:**
- Only redraw changed panes (dirty flag)
- Use `curses.panel` for efficient layering

**Large Files:**
- Dossier: Only render visible lines (viewport windowing)
- Log: Keep last N entries in memory (e.g., 10,000)

**Scroll Performance:**
- Pre-split dossier.json into lines on load
- Cache line lengths for max_scroll_x calculation

### Memory Usage

**Target:**
- <20MB for UI process
- Dossier: Load entire JSON (~100KB typical)
- Log: Trim old entries beyond 10,000 lines

---

## Implementation Pseudocode

### Main Structure

```python
class HaeccstableUI:
    def __init__(self):
        # State
        self.mode = 'normal'
        self.focus = 'dossier'
        self.pending_key = None

        # Panes
        self.dossier = DossierPane()
        self.log = LogPane()
        self.command = CommandPane()

    def run(self, stdscr):
        setup_colors(stdscr)

        while True:
            self.render(stdscr)
            key = stdscr.getch()
            self.handle_key(key)

class DossierPane:
    def __init__(self):
        self.content_lines = []
        self.scroll_y = 0
        self.scroll_x = 0
        self.max_scroll_y = 0
        self.max_scroll_x = 0

    def load_dossier(self, path):
        with open(path) as f:
            json_text = f.read()
        self.content_lines = json_text.split('\n')
        self.recalculate_max_scroll()

    def render(self, win, focused):
        height, width = win.getmaxyx()
        border = BORDER_DOUBLE if focused else BORDER_SINGLE

        # Draw border
        draw_border(win, border)

        # Draw visible content
        for i in range(height - 2):
            line_idx = self.scroll_y + i
            if line_idx < len(self.content_lines):
                line = self.content_lines[line_idx]
                visible_line = line[self.scroll_x:self.scroll_x + width - 2]
                win.addstr(i + 1, 1, visible_line,
                           curses.color_pair(COLOR_PAIR_DOSSIER))

    def scroll_down(self, n=1):
        self.scroll_y = min(self.scroll_y + n, self.max_scroll_y)
```

---

## Testing Checklist

### Visual Tests
- [ ] All borders render correctly
- [ ] Colors display properly (requires 256-color terminal)
- [ ] Focused pane highlighted with yellow border
- [ ] Status line updates on mode/focus change
- [ ] Cursor visible only in INSERT mode

### Navigation Tests
- [ ] j/k scroll up/down in dossier
- [ ] h/l scroll left/right in dossier
- [ ] gg/G jump to top/bottom
- [ ] {/} jump paragraphs in JSON
- [ ] 0/$ jump to line start/end
- [ ] Ctrl-d/Ctrl-u page movement
- [ ] 1/2/3 focus switching works
- [ ] Log pane scrolls independently

### Mode Tests
- [ ] i enters INSERT mode
- [ ] I/a/A/o/O/s/S enter INSERT mode
- [ ] ESC returns to NORMAL mode
- [ ] Enter executes command and returns to NORMAL
- [ ] Mode indicator updates correctly
- [ ] INSERT only active in command pane

### Edge Case Tests
- [ ] Resize terminal → layout recalculates
- [ ] Empty dossier → placeholder shown
- [ ] Empty log → placeholder shown
- [ ] Very long JSON lines → horizontal scroll works
- [ ] Scroll past end → clamped at max_scroll
- [ ] Multi-key command `gg` → completes correctly

### Performance Tests
- [ ] Large dossier (1000+ lines) → scrolls smoothly
- [ ] Large log (10,000+ entries) → no lag
- [ ] Rapid key repeat → no buffer overflow
- [ ] Dossier reload → <50ms latency

---

## Files to Create

**For Phase 1 implementation:**

```
python/
├── haeccstable.py              # Entry point
├── ui/
│   ├── __init__.py
│   ├── vim_interface.py        # Main VimInterface class
│   ├── dossier_pane.py         # DossierPane class
│   ├── log_pane.py             # LogPane class
│   ├── command_pane.py         # CommandPane class
│   ├── colors.py               # Color scheme definitions
│   └── borders.py              # Border drawing utilities
├── dsl_parser.py               # DSL parser
└── ipc_client.py               # IPC client
```

---

## Summary

This terminal UI design provides:

✅ **Professional vim-style interface** for power users
✅ **Real-time dossier viewing** with full navigation
✅ **Clean separation** of viewing (NORMAL) and editing (INSERT)
✅ **Efficient workflow** with zero mouse dependency
✅ **Graceful scaling** from small to large sessions
✅ **Familiar UX** for vim/tmux users

**Next Step:** Implement in Phase 1 of the roadmap (Day 1-2: Curses UI Foundation)
