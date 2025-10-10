# Safari Vim Navigator - Project Overview

## What is This?

Safari Vim Navigator is a browser extension that brings powerful vim-style keyboard navigation to **any webpage** in Safari. Navigate, click, and interact with websites using only your keyboard - no mouse required!

## Key Innovation: Free-Mode Cursor

Unlike traditional vim browser extensions, Safari Vim Navigator includes a unique **Free-Mode** that lets you move a cursor anywhere on the page with pixel-perfect precision:

- **Adaptive sizing**: Cursor automatically resizes to match the text it's over
- **Adaptive movement**: Grid size changes based on font-size of element beneath cursor
- **Click anything**: Use Enter to click buttons, videos, or any element at cursor position

## Project Structure

```
safarivim/
├── manifest.json              # Extension configuration (Safari Web Extension v3)
├── popup.html                # Quick reference popup UI
├── INSTALLATION.md           # Step-by-step installation guide
├── README.md                 # Full documentation and features
├── OVERVIEW.md              # This file
│
├── scripts/
│   ├── vim-navigator.js     # Main content script (universal vim navigation)
│   └── background.js        # Background service worker
│
├── styles/
│   └── vim-cursor.css       # Cursor styling and animations
│
├── icons/                   # Extension icons (need to be created)
│   └── ICONS_README.md      # Guide for creating icons
│
└── resources/               # Additional resources (currently empty)
```

## Technical Highlights

### Universal Content Indexing
Unlike the original blog-specific version, this extension works on **any website**:
- Detects all navigable elements (headings, paragraphs, links, buttons, etc.)
- Filters out hidden elements
- Handles dynamic content loading

### Two Navigation Modes

#### 1. Normal Mode (Text Navigation)
- Character-level precision using Range API
- Text-wrapping aware (j/k maintain column like vim)
- Word detection with punctuation handling
- Paragraph-level jumping

#### 2. Free Mode (Pixel Navigation)
- Caps Lock toggles mode
- Cursor adapts to element beneath it
- Two-speed movement (hjkl for small steps, uiop for large)
- Auto-scrolling near viewport edges

### Advanced Features
- **Adaptive grid sizing**: Movement speed based on font-size
- **Adaptive cursor sizing**: Height matches line-height, width matches character width
- **Virtual line system**: Non-text elements (images, videos) treated as multi-line blocks
- **Smart clicking**: Enter key clicks links, buttons, or any element
- **Vim-accurate word detection**: Punctuation treated as separate words

## Browser Compatibility

### Supported
- ✅ Safari 14+ (macOS 11+)
- ✅ Safari on iOS/iPadOS (with some limitations)

### Planned
- 🔄 Chrome/Edge (requires Manifest V3 adjustments)
- 🔄 Firefox (requires WebExtensions API adjustments)

## Development Notes

### Why Safari Web Extension?

Safari Web Extensions use the same technology as Chrome extensions (Manifest V3) but with Safari-specific requirements:
- Uses `browser` API instead of `chrome` API
- Requires code signing for distribution
- Supports native iOS/macOS integration

### Code Architecture

**Content Script** (`vim-navigator.js`):
- Runs on every webpage
- Completely self-contained
- No dependencies
- ~1000 lines of pure JavaScript

**Background Script** (`background.js`):
- Minimal - just handles extension lifecycle
- No persistent state needed

**CSS** (`vim-cursor.css`):
- Minimal styling
- High z-index to ensure visibility
- Blinking animation for cursor
- Mix-blend-mode for visibility on any background

### Performance Considerations

- Content indexing is throttled (100ms, 500ms, 200ms delays)
- Virtual line calculation caches results
- Range API used for pixel-perfect positioning
- Event listeners cleaned up properly
- No jQuery or framework dependencies

## Future Enhancements

### High Priority
- [ ] Add extension icons (currently placeholders needed)
- [ ] Visual hint mode (show letter overlays on links)
- [ ] Customizable key bindings
- [ ] Dark/light cursor themes

### Medium Priority
- [ ] Search mode (/ to search like vim)
- [ ] Marks/bookmarks (vim-style)
- [ ] Tab navigation integration
- [ ] Options page for customization

### Low Priority
- [ ] Chrome/Firefox ports
- [ ] Visual mode (select text)
- [ ] Macro recording
- [ ] Command palette

## Testing Checklist

Before release, test on:
- [ ] News websites (lots of text)
- [ ] Social media (dynamic content)
- [ ] Google Docs (complex editors)
- [ ] YouTube (video controls)
- [ ] GitHub (code blocks)
- [ ] Wikipedia (tables, images)
- [ ] Amazon (product pages)

## Distribution Options

### Option 1: Safari App Store
- Requires Apple Developer account ($99/year)
- Needs Xcode for building
- Code signing required
- Review process ~1-2 weeks

### Option 2: Direct Distribution
- Can be loaded as unsigned (development mode)
- Users need to enable "Allow Unsigned Extensions"
- No code signing needed
- No App Store presence

### Option 3: GitHub Release
- Share the folder
- Users load it manually
- Great for open source community
- No signing required

## Related Projects

### Inspiration
- **Vimium** - Chrome vim extension
- **Surfingkeys** - Advanced vim navigation
- **Tridactyl** - Firefox vim extension
- **Amfora** - Gemini browser with vim keys

### Differentiators
Our project is unique because:
1. **Free-mode cursor** - No other extension has this
2. **Adaptive sizing** - Cursor matches content beneath it
3. **Adaptive movement** - Grid size based on font-size
4. **Simplified** - Focus on core vim motions, not 100+ commands
5. **Safari-first** - Optimized for macOS/iOS

## File Size Summary

- `vim-navigator.js`: ~30KB (minified: ~15KB)
- `vim-cursor.css`: <1KB
- `background.js`: <1KB
- `popup.html`: ~2KB
- Total extension size: ~35KB (extremely lightweight!)

## Contributing

This is an open-source project. Contributions welcome:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - Use freely, modify as needed, give credit if you'd like!

## Credits

Created as a universal adaptation of the vim navigation system built for Nava's blog.

**Original Features**:
- Vim navigation with text-wrapping awareness
- Free-mode with Caps Lock
- Adaptive cursor sizing
- Punctuation-aware word detection

**Enhanced For Extension**:
- Universal webpage compatibility
- Simplified link indexing
- Removed blog-specific features
- Added Safari-specific APIs

---

**Built with ❤️ for the keyboard-driven web**
