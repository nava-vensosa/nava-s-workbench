# Vim Navigation in Haeccstable Terminal

## Overview

Haeccstable's terminal interface now features **complete vim-style navigation** with a **blinking cursor** that tracks your position in all three panes, just like in real Vim.

## Key Features

### 1. Text Wrapping
All three panes (dossier, log, and command) now automatically wrap long lines to fit the pane width. This ensures all content is visible without horizontal scrolling.

### 2. Blinking Cursor
A visible, blinking cursor shows exactly where you are in the focused pane:
- Blinks every ~400ms (configurable)
- Automatically positioned based on your current location
- Follows all vim motions
- Visible in both NORMAL and INSERT modes

### 3. Full Vim Motions
Navigate using all standard vim motions in **NORMAL mode** for any focused pane:

#### Basic Movement
| Key | Motion | Description |
|-----|--------|-------------|
| `h` | Left | Move cursor one character left |
| `j` | Down | Move cursor one line down |
| `k` | Up | Move cursor one line up |
| `l` | Right | Move cursor one character right |

#### Word Movement
| Key | Motion | Description |
|-----|--------|-------------|
| `w` | word forward | Jump to start of next word |
| `b` | word backward | Jump to start of previous word |
| `e` | word end | Jump to end of current/next word |
| `E` | WORD end | Jump to end of WORD (whitespace-delimited) |
| `B` | WORD backward | Jump to start of previous WORD |

#### Line Movement
| Key | Motion | Description |
|-----|--------|-------------|
| `0` | line start | Jump to beginning of line |
| `$` | line end | Jump to end of line |

#### File Movement
| Key | Motion | Description |
|-----|--------|-------------|
| `gg` | file start | Jump to first line of file |
| `G` | file end | Jump to last line of file |
| `Ctrl-D` | page down | Scroll down half a page |
| `Ctrl-U` | page up | Scroll up half a page |

#### Paragraph Movement
| Key | Motion | Description |
|-----|--------|-------------|
| `{` | paragraph back | Jump to previous empty line |
| `}` | paragraph forward | Jump to next empty line |

## Usage Examples

### Navigating the Dossier Pane

```
1. Press ESC to enter NORMAL mode
2. Press 1 to focus the dossier pane
3. Use vim motions to navigate:
   - gg        → Jump to top of dossier
   - }         → Jump to next section
   - w w w     → Jump forward 3 words
   - $         → Jump to end of current line
   - G         → Jump to bottom of dossier
```

The cursor will blink at your current position, and the pane will auto-scroll to keep the cursor visible.

### Navigating the Log Pane

```
1. Press ESC to enter NORMAL mode
2. Press 2 to focus the log pane
3. Navigate through command history:
   - G         → Jump to most recent command
   - k k k     → Move up 3 lines
   - 0         → Jump to start of line
   - w         → Jump to next word
   - {         → Jump to previous blank line
```

### Word-by-Word Navigation

The word motions make it easy to navigate JSON in the dossier:

```json
{
  "session": {
    "start_time": "2025-10-26T..."
  }
}
```

Starting at the `{`:
- `w` → jumps to "session"
- `w` → jumps to "start"
- `w` → jumps to "time"
- `w` → jumps to "2025"
- `e` → jumps to end of "2025"
- `b` → jumps back to start of "2025"
- `$` → jumps to end of line
- `0` → jumps back to start

## Mode Transitions

| From | Key | To | Notes |
|------|-----|-----|-------|
| NORMAL | `i` | INSERT | Enter insert mode (command pane only) |
| NORMAL | `a` | INSERT | Enter insert after cursor (command pane only) |
| INSERT | `ESC` | NORMAL | Return to normal mode |

## Pane Switching

In NORMAL mode, switch focus between panes:

| Key | Pane | Effect |
|-----|------|--------|
| `1` | Dossier | Focus dossier pane, cursor jumps to (0,0) |
| `2` | Log | Focus log pane, cursor jumps to (0,0) |
| `3` | Command | Focus command pane |

## Cursor Behavior

### Blinking
- Cursor blinks every ~400ms in the focused pane
- Blinking pauses on keypress for better visibility
- Cursor is hidden when not visible in blink cycle

### Auto-Scroll
The pane automatically scrolls to keep the cursor visible:
- Moving up past top of visible area scrolls up
- Moving down past bottom of visible area scrolls down
- Cursor is always kept within visible bounds

### Cursor Position
The cursor position is tracked independently for each pane:
- **Dossier pane**: `self.dossier_cursor = (row, col)`
- **Log pane**: `self.log_cursor = (row, col)`
- **Command pane**: Uses `self.vim.cursor_col`

## Wrapped Text Navigation

Long lines are automatically wrapped to fit the pane width. The cursor navigates through **physical lines** (after wrapping), not logical lines.

Example with width=40:
```
Original line (80 chars):
"This is a very long line that will be wrapped to fit within the pane width limit"

Wrapped (2 physical lines):
"This is a very long line that will be "
"wrapped to fit within the pane width li"
```

- `j` moves from line 1 → line 2 (wrapped portion)
- `k` moves from line 2 → line 1
- `$` on line 1 jumps to "be " (end of physical line 1)
- `$` on line 2 jumps to "li" (end of physical line 2)

## Visual Feedback

### Focus Indicator
The focused pane shows `[FOCUSED]` in its title bar:
```
═════════════════ DOSSIER.JSON [FOCUSED] ═════════════════
```

### Border Colors
- **Focused pane**: Yellow/highlighted border
- **Unfocused panes**: Cyan/normal border
- **Command pane**: Yellow when focused in NORMAL mode

### Status Bar
Shows current mode and focus:
```
-- NORMAL -- [Focus: DOSSIER]    1:dossier 2:log 3:command | 'exit' to quit
```

or in INSERT mode:
```
-- INSERT --    1:dossier 2:log 3:command | 'exit' to quit
```

## Implementation Details

### Text Wrapping Algorithm
```python
def _wrap_text(self, lines: List[str], max_width: int) -> List[str]:
    """Wrap text to fit within max_width"""
    wrapped = []
    for line in lines:
        if len(line) <= max_width:
            wrapped.append(line)
        else:
            # Wrap long lines
            while len(line) > max_width:
                wrapped.append(line[:max_width])
                line = line[max_width:]
            if line:
                wrapped.append(line)
    return wrapped if wrapped else [""]
```

### Cursor Positioning
The cursor position is calculated based on:
1. Current focus (which pane)
2. Cursor coordinates (row, col) in wrapped lines
3. Scroll offset for the pane
4. Border offsets

### Word vs WORD
- **word** (`w`, `e`, `b`): Alphanumeric sequences separated by non-alphanumeric chars
  - "hello-world" has 2 words: "hello" and "world"
- **WORD** (`W`, `E`, `B`): Non-whitespace sequences separated by whitespace
  - "hello-world" is 1 WORD: "hello-world"

Currently implemented: `w`, `e`, `b`, `E`, `B`

## Tips

1. **Fast Navigation**: Use `gg` to jump to top, `G` to bottom, `{}` for paragraphs
2. **Word Jumping**: Use `w` and `b` to quickly navigate through JSON keys
3. **Line Ends**: Use `0` and `$` to jump to line boundaries
4. **Page Scrolling**: Use `Ctrl-D` and `Ctrl-U` for large documents
5. **Return to Command**: Press `3` then `i` to quickly return to INSERT mode

## Keyboard Reference Card

```
┌─────────────────────────────────────────────────────────┐
│ NORMAL MODE - Vim Navigation (all panes)               │
├─────────────────────────────────────────────────────────┤
│ Focus:  1=dossier  2=log  3=command                     │
│ Basic:  h/j/k/l = ←/↓/↑/→                              │
│ Word:   w=forward  b=back  e=end  E=WORD-end  B=WORD-back│
│ Line:   0=start  $=end                                  │
│ File:   gg=top  G=bottom  ^D=pagedown  ^U=pageup       │
│ Para:   {=prev-empty  }=next-empty                      │
│ Mode:   i=INSERT (cmd only)  ESC=NORMAL                 │
└─────────────────────────────────────────────────────────┘
```

## Future Enhancements

Potential additions for even more vim-like behavior:

- `gj`/`gk` for visual line navigation (currently `j`/`k` move by physical lines)
- `/` for search
- `n`/`N` for next/previous search result
- `f`/`F`/`t`/`T` for character finding
- `%` for bracket matching
- Counts before motions (e.g., `3w`, `5j`)
- Marks (`m` + letter, `` ` `` + letter)

## Technical Notes

- Cursor blink interval: 200ms timeout × 2 = ~400ms blink cycle
- Wrapped lines are recalculated on every frame to adapt to window resizing
- Cursor position is clamped to valid line/column bounds automatically
- Auto-scroll ensures cursor is always visible within pane height
