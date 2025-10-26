# Haeccstable Vim Mode

**Full vim modal interface with focus switching**

## Overview

This version implements a complete vim-style modal interface:

- 🔵 **Normal mode**: Navigate panes with vim motions
- 🟢 **Insert mode**: Type and execute commands
- 🎯 **Focus switching**: Press 1/2/3 to focus different panes
- ⌨️ **Full vim motions**: h/j/k/l/{/}/gg/G/0/$/Ctrl-d/Ctrl-u

## Quick Start

```bash
./haeccstable_vim.py
```

You start in **NORMAL mode** with focus on the **dossier**.

## Interface Layout

```
╔═══════════════════════════════════════════════════════════╗
║ DOSSIER.JSON [FOCUSED]                                    ║
║ {                                                         ║
║   "monitors": { ... },                                    ║
║   "layers": { ... }                                       ║
║ }                                                         ║
╠═══════════════════════════════════════════════════════════╣
║ OUTPUT                                                    ║
║ > open_monitor monitor1                                   ║
║ ✓ Created window 'monitor1'                               ║
╠═══════════════════════════════════════════════════════════╣
║ haeccstable> _                                            ║
║ -- NORMAL -- [Focus: DOSSIER]    1:dossier 2:output 3:cmd║
╚═══════════════════════════════════════════════════════════╝
```

**Three panes:**
1. **Dossier** (top) - Live session state
2. **Output** (middle) - Command output
3. **Command** (bottom) - Input line

## Modal System

### Normal Mode (Default)

**Status**: `-- NORMAL -- [Focus: DOSSIER]`

**What you can do:**
- Navigate the focused pane with vim motions
- Switch focus between panes (1/2/3)
- Enter insert mode (i/I/a/A/o/O/s/S)

**Cursor**: Hidden

### Insert Mode

**Status**: `-- INSERT --`

**What you can do:**
- Type commands
- Edit with cursor keys
- Press Enter to execute
- Press ESC to return to normal mode

**Cursor**: Visible at input position

## Focus Switching (Normal Mode)

| Key | Focus | What You Navigate |
|-----|-------|-------------------|
| `1` | Dossier | JSON session state |
| `2` | Output | Command output history |
| `3` | Command | Command line (limited in normal mode) |

**The focused pane is highlighted in the border**

## Vim Motions

### Dossier Pane (Press `1` to focus)

#### Basic Movement
| Key | Action |
|-----|--------|
| `j` | Scroll down one line |
| `k` | Scroll up one line |
| `h` | Scroll left (horizontal) |
| `l` | Scroll right (horizontal) |

#### Jumps
| Key | Action |
|-----|--------|
| `gg` | Go to top of dossier |
| `G` | Go to bottom of dossier |
| `0` | Go to start of line |
| `$` | Go to end of line |

#### Paragraph Navigation
| Key | Action |
|-----|--------|
| `{` | Previous paragraph (empty line) |
| `}` | Next paragraph (empty line) |

#### Page Scrolling
| Key | Action |
|-----|--------|
| `Ctrl-d` | Page down (half screen) |
| `Ctrl-u` | Page up (half screen) |

### Output Pane (Press `2` to focus)

| Key | Action |
|-----|--------|
| `j` | Scroll down |
| `k` | Scroll up |
| `gg` | Go to top |
| `G` | Go to bottom |
| `Ctrl-d` | Page down |
| `Ctrl-u` | Page up |

### Command Pane (Press `3` to focus)

Limited actions in normal mode. Use insert mode to edit commands.

## Entering Insert Mode

From **normal mode**, press any of these keys:

| Key | Action | Cursor Position |
|-----|--------|----------------|
| `i` | Insert | At current position (start) |
| `I` | Insert at start | Beginning of line, clears input |
| `a` | Append | At end of current input |
| `A` | Append at end | At end of line |
| `o` | Open line below | New empty line |
| `O` | Open line above | New empty line |
| `s` | Substitute | Clear line and insert |
| `S` | Substitute line | Clear line and insert |

**Note**: Most of these have similar effect in the command line context (clearing or positioning cursor).

## Insert Mode Editing

| Key | Action |
|-----|--------|
| `ESC` | Return to normal mode |
| `Enter` | Execute command and return to normal mode |
| `Backspace` | Delete character before cursor |
| `←/→` | Move cursor left/right |
| `Home` / `Ctrl-A` | Go to start of line |
| `End` / `Ctrl-E` | Go to end of line |
| `A-Z`, `0-9`, etc. | Type character |

## Global Commands

**Available in both normal and insert mode:**

| Key | Action |
|-----|--------|
| `Ctrl-C` | Exit Haeccstable |
| `Ctrl-L` | Clear output pane |

## Example Workflow

### 1. Start (Normal Mode)

```
-- NORMAL -- [Focus: DOSSIER]
```

You're viewing the dossier. Use `j/k` to scroll.

### 2. Enter Command (Insert Mode)

Press `i` or `a`:
```
-- INSERT --
haeccstable> _
```

Type your command:
```
haeccstable> open_monitor monitor1
```

Press `Enter` - executes and returns to **normal mode**.

### 3. Check Output

Press `2` to focus output:
```
-- NORMAL -- [Focus: OUTPUT]
```

Use `j/k` to scroll through output history.

### 4. View Dossier

Press `1` to focus dossier:
```
-- NORMAL -- [Focus: DOSSIER]
```

Use `gg` to jump to top, `G` to jump to bottom.

### 5. Import a File

Press `i` to enter insert mode:
```
haeccstable> import simple_passthrough/main.txt
```

Press `Enter` - file imports and executes.

Dossier auto-updates with new state!

## Complete Example Session

```
# Start in normal mode, dossier focused
[Press i to enter insert mode]

haeccstable> open_monitor monitor1
[Press Enter - returns to normal mode]

[Press 2 to focus output]
[Use j/k to scroll output]

[Press 1 to focus dossier]
[Use j/k to view session state]

[Press i to enter insert mode]
haeccstable> import simple_passthrough/main.txt
[Press Enter]

# Window pops up with webcam feed!

[Press 1 to focus dossier]
[Use j/k to see updated state with layers and monitors]

[Press i to enter insert mode]
haeccstable> close_monitor monitor1
[Press Enter]

[Press Ctrl-C to exit]
```

## Tips & Tricks

### Quick Navigation

1. **Jump to dossier top**: Press `1` then `gg`
2. **Jump to dossier bottom**: Press `1` then `G`
3. **See latest output**: Press `2` then `G`
4. **Clear output**: `Ctrl-L` (works in any mode)

### Efficient Workflow

1. **Stay in normal mode** most of the time
2. **Press i**, type command, **press Enter** - auto-returns to normal
3. **Use focus switching** to inspect state without entering insert mode
4. **Use vim motions** to quickly navigate large dossiers

### Dossier Navigation

For large dossiers with nested JSON:
- `{` / `}` jump between sections (empty lines)
- `gg` / `G` jump to extremes
- `h` / `l` scroll horizontally for long lines
- `0` / `$` jump to line start/end

## Keyboard Reference Card

### Normal Mode

```
Focus Switching:
  1     → Focus dossier
  2     → Focus output
  3     → Focus command

Dossier Navigation:
  j/k   → Scroll down/up
  h/l   → Scroll left/right
  gg/G  → Top/bottom
  {/}   → Prev/next paragraph
  0/$   → Line start/end
  ^D/^U → Page down/up

Enter Insert Mode:
  i/I   → Insert
  a/A   → Append
  o/O   → Open line
  s/S   → Substitute

Global:
  ^C    → Quit
  ^L    → Clear output
```

### Insert Mode

```
Editing:
  ESC         → Normal mode
  Enter       → Execute (returns to normal)
  Backspace   → Delete char
  ←/→         → Move cursor
  Home/End    → Line start/end
  ^A/^E       → Line start/end

Global:
  ^C          → Quit
  ^L          → Clear output
```

## Differences from Other Versions

### vs `haeccstable.py` (Original)
- ❌ No modal interface
- ❌ No vim motions
- ❌ No focus switching
- ✅ Simpler for basic use

### vs `haeccstable_curses.py` (Curses)
- ✅ Has live dossier
- ⚠️ Partial vim support (only j/k/gg/G)
- ❌ No modal editing
- ❌ No focus switching

### vs `haeccstable_vim.py` (This Version)
- ✅ Full vim modal interface
- ✅ Complete vim motion set
- ✅ Focus switching (1/2/3)
- ✅ Insert mode with ESC
- ✅ Most powerful and efficient

## Why Use Vim Mode?

### Speed
- **Navigate** dossier without taking hands off home row
- **Execute** commands quickly (i → type → Enter)
- **Switch context** instantly (1/2/3)

### Efficiency
- **No mouse** needed
- **Muscle memory** from vim
- **Fast scrolling** with vim motions

### Power
- **Large dossiers**: Navigate easily with `{}/gg/G`
- **Long output**: Scroll through history
- **Focus management**: See exactly what you need

## Status Line Indicators

Bottom line always shows:

```
-- NORMAL -- [Focus: DOSSIER]    1:dossier 2:output 3:cmd | Ctrl-C:exit
```

Or in insert mode:

```
-- INSERT --                      1:dossier 2:output 3:cmd | Ctrl-C:exit
```

**Colors:**
- Normal mode: Blue background
- Insert mode: Red text
- Focused pane: Yellow border

## Recommended

**This is now the recommended version** of Haeccstable!

It combines:
- ✅ Live dossier viewer
- ✅ Import-based workflow
- ✅ Full vim modal interface
- ✅ Maximum efficiency

**Power users**: You'll feel at home with familiar vim motions.

**New users**: Start simple (press `i`, type, press Enter), learn vim motions over time.

---

**Happy live coding with vim motions!** 🎨⌨️
