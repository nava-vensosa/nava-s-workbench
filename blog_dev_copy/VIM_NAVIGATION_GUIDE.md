# Vim Navigation Guide

This site features **true vim-style navigation** with Amfora Gemini aesthetics. The cursor is fully text-aware and handles text wrapping exactly like vim.

## Features Implemented

### 1. Numbered Link Navigation
- All navigation links are prefixed with `[1]`, `[2]`, `[3]`, etc.
- Press the corresponding number key to follow that link
- Works for links 1-9 directly, and `0` for link 10
- Available on **all pages** throughout the site

### 2. Parent Page Navigation
- Press `z` to navigate to the parent page (the page that linked to the current page)
- Follows the site hierarchy automatically
- On the homepage (which has no parent), `z` does nothing

### 3. Text-Wrapping Aware Cursor
- Blinking cursor navigates through **main content text only** (paragraph elements)
- **Fully aware of text wrapping** - treats wrapped lines as separate lines, just like vim
- Uses browser's Range API for pixel-perfect cursor positioning
- Automatically resizes to match the font size and line height of current text
- Only navigates paragraph content (`<p>` tags), not titles, subtitles, or navigation elements

### 4. Complete Vim Motion Set

#### Character Movement
- `h` - Move cursor **left** one character
- `l` - Move cursor **right** one character
- `j` - Move cursor **down** one visual line (respects text wrapping)
- `k` - Move cursor **up** one visual line (respects text wrapping)

#### Word Movement
- `w` - Move to start of next **word**
- `b` - Move to start of previous **word**

#### Line Movement
- `0` - Move to **start of current visual line**
- `$` - Move to **end of current visual line**

#### Paragraph Movement
- `{` - Jump to **previous paragraph**
- `}` - Jump to **next paragraph**

#### Document Movement
- `gg` - Jump to **top of page** (press 'g' twice quickly)
- `G` - Jump to **bottom of page** (shift + g)

## How It Works

The navigation system uses the browser's **Range API** to:
1. Track cursor position as a character offset within paragraph elements
2. Calculate exact visual positions for any character
3. Detect line wrapping based on actual rendered positions
4. Move cursor intelligently based on visual layout, not just DOM structure

This means when you press `j` or `k`, the cursor moves to the character **directly above or below** on the next visual line, even if that line is wrapped text within the same paragraph.

## Navigation Examples

### Basic Text Navigation
```
Press 'j' repeatedly -> cursor moves down through wrapped lines
Press 'l' repeatedly -> cursor scans right through text
Press '0'           -> cursor jumps to start of current line
Press '$'           -> cursor jumps to end of current line
```

### Page Navigation
```
Homepage -> Press '1' -> ITP Gallery
            Press '1' -> Hypercinema Fall '25
            Press 'j' to navigate content
            Press 'w' to jump by word
            Press 'z' to go back to ITP Gallery
            Press 'z' to go back to homepage
```

### Efficient Scanning
```
Press 'w' -> Jump forward by words
Press 'b' -> Jump backward by words
Press '}' -> Skip to next paragraph
Press '{' -> Skip to previous paragraph
```

## Site Hierarchy

The site is organized hierarchically:

```
Homepage (index.html)
├── ITP Gallery
│   ├── Hypercinema Fall '25
│   │   ├── Hypercinema Projects
│   │   ├── Hypercinema Reflections
│   │   └── Hypercinema Classwork
│   ├── Applications Fall '25
│   ├── Visual Language Fall '25
│   └── Site Specific Fall '25
├── Nachsterb Inn
└── Critical Clockwerk Shop
    ├── Orrery: Milling Metronomy
    │   ├── Documentation, Thesis, Inspiration
    │   └── Components, Design, Tutorials, Development
    ├── FIBRIL
    └── Astrid
```

Pressing `z` on any page takes you up one level in this hierarchy.

## Vim Motion Cheat Sheet

| Key | Action |
|-----|--------|
| `1-9`, `0` | Follow numbered link |
| `z` | Back to parent page |
| `h` | ← Move left one character |
| `l` | → Move right one character |
| `j` | ↓ Move down one line (visual) |
| `k` | ↑ Move up one line (visual) |
| `w` | Next word |
| `b` | Previous word |
| `0` | Start of line |
| `$` | End of line |
| `{` | Previous paragraph |
| `}` | Next paragraph |
| `gg` | Top of page |
| `G` | Bottom of page |

## Technical Details

- Cursor position tracked as `(elementIndex, characterOffset)` tuple
- Visual line wrapping detected using `Range.getBoundingClientRect()`
- Vertical movement (`j`/`k`) preserves horizontal position across lines
- Horizontal movement (`h`/`l`) wraps to previous/next paragraph at boundaries
- All navigation links automatically indexed via JavaScript
- Cursor only appears when there is main content text to navigate
- No interference with form inputs or text areas
- Smooth scrolling when navigating between paragraphs

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- Range API with `getBoundingClientRect()`
- TreeWalker API
- CSS animations
- Keyboard event handling

## Differences from Standard Vim

- No insert mode (this is a read-only interface)
- `h`/`l` move by character, not column position
- `j`/`k` respect actual text wrapping (vim wraps differently)
- Only navigates paragraph text content, not all text on page
