# Safari Vim Navigator

A Safari Web Extension that brings vim-style keyboard navigation to any webpage, with an innovative free-mode cursor for clicking anywhere without a mouse.

## Features

### 🎯 **Normal Mode** - Text Navigation
Navigate through webpage content like you're in vim:
- **h/j/k/l** - Move left/down/up/right through text
- **w/b/e** - Jump between words (forward/backward/end)
- **{/}** - Jump between paragraphs
- **gg/G** - Jump to top/bottom of page
- **0/$** - Jump to start/end of line
- **Enter** - Click the element under cursor

### 🆓 **Free Mode** - Pixel-Perfect Cursor
Press **Caps Lock** to enter Free Mode:
- **h/j/k/l** - Move cursor in small steps (adapts to text size)
- **u/i/o/p** - Move cursor in large steps (4x faster)
  - **u** = left, **i** = down, **o** = up, **p** = right
- **Enter** - Click any element at cursor position
- Cursor automatically resizes to match text underneath
- Movement speed adapts to font size of element beneath cursor

## Installation

### For Safari (macOS)

1. **Enable Developer Mode in Safari**
   - Open Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"

2. **Load the Extension**
   - Open Safari → Develop → Allow Unsigned Extensions (for testing)
   - Safari → Preferences → Extensions
   - Enable "Safari Vim Navigator"

3. **Load Unpacked Extension**
   - Safari → Develop → "Load Unsigned Extension..."
   - Select the `safarivim` folder

4. **Grant Permissions**
   - Allow the extension to run on all websites
   - The extension needs access to page content for navigation

## Usage

### Getting Started

1. **Navigate to any webpage**
2. **Start using vim motions immediately**
   - Press `j` to move down
   - Press `k` to move up
   - Press `h` to move left
   - Press `l` to move right

3. **Enter Free Mode**
   - Press `Caps Lock` to enable
   - Notice the cursor becomes adaptive
   - Move freely across the page
   - Press `Caps Lock` again to return to normal mode

### Key Bindings Reference

#### Normal Mode

| Key | Action |
|-----|--------|
| `h` | Move cursor left |
| `j` | Move cursor down |
| `k` | Move cursor up |
| `l` | Move cursor right |
| `w` | Jump to next word |
| `b` | Jump to previous word |
| `e` | Jump to end of word |
| `{` | Jump to previous paragraph |
| `}` | Jump to next paragraph |
| `gg` | Jump to top of page |
| `G` | Jump to bottom of page |
| `0` | Jump to start of line |
| `$` | Jump to end of line |
| `Enter` | Click element at cursor |

#### Free Mode (Caps Lock ON)

| Key | Action |
|-----|--------|
| `h` | Move cursor left (small step) |
| `j` | Move cursor down (small step) |
| `k` | Move cursor up (small step) |
| `l` | Move cursor right (small step) |
| `u` | Move cursor left (large step) |
| `i` | Move cursor down (large step) |
| `o` | Move cursor up (large step) |
| `p` | Move cursor right (large step) |
| `gg` | Move cursor to top center |
| `G` | Move cursor to bottom center |
| `Enter` | Click element at cursor position |

## How It Works

### Adaptive Cursor
The free-mode cursor intelligently adapts to the content beneath it:
- **Size**: Matches the line-height and character width of the element underneath
- **Movement**: Grid size based on font-size of element beneath cursor
- **Speed**: Larger text = bigger steps, smaller text = finer control

### Text-Wrapping Awareness
In normal mode, the cursor is fully aware of text wrapping:
- `j/k` maintain column position when moving between wrapped lines
- `h/l` move through text character-by-character
- Works exactly like vim's text navigation

### Punctuation Handling
Word movement (`w/b/e`) treats punctuation as separate "words", just like vim:
- Example: `hello, world!`
  - `w` → `,` → `w` → `world` → `e` → `!`

## Troubleshooting

### Cursor not appearing
- Refresh the page
- Check if the extension is enabled in Safari preferences
- Make sure you're not in an input field (cursor doesn't work in text boxes)

### Keys not working
- Click on the page to ensure it has focus
- Check if another extension is intercepting keys
- Try refreshing the page

### Free-mode cursor stuck
- Press Caps Lock to toggle off and on again
- Refresh the page if needed

## Privacy

This extension:
- ✅ Runs entirely in your browser
- ✅ Does not collect any data
- ✅ Does not send any information to external servers
- ✅ Works completely offline
- ✅ Only accesses page content for navigation purposes

## Development

### Project Structure
```
safarivim/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── scripts/
│   ├── vim-navigator.js  # Main navigation logic
│   └── background.js     # Background service worker
├── styles/
│   └── vim-cursor.css    # Cursor styling
├── icons/                # Extension icons
└── README.md            # This file
```

### Building from Source

1. Clone the repository
2. Make your changes
3. Test in Safari:
   ```bash
   # No build step needed - it's pure JavaScript!
   ```
4. Safari → Develop → Load Unsigned Extension → Select `safarivim` folder

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Ideas for Future Features
- [ ] Customizable key bindings
- [ ] Visual hints mode (show all clickable elements with letters)
- [ ] Search mode (/ to search like vim)
- [ ] Custom cursor colors/styles
- [ ] Bookmarks integration (vim-style marks)
- [ ] Tab navigation

## License

MIT License - Feel free to use and modify!

## Credits

Inspired by:
- Vim text editor
- Vimium browser extension
- Amfora Gemini browser
- The joy of keyboard-driven browsing

---

**Made with ❤️ for keyboard enthusiasts**

*Never touch your mouse again!*
