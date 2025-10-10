# Icons Guide

This extension requires icon files for Safari. You'll need to create PNG icons at the following sizes:

- `icon-16.png` - 16x16 pixels
- `icon-32.png` - 32x32 pixels
- `icon-48.png` - 48x48 pixels
- `icon-128.png` - 128x128 pixels

## Suggested Design

The icon should represent vim/keyboard navigation. Ideas:
- A cursor/caret symbol
- The letters "vim" or "h j k l"
- A keyboard key
- A purple/lavender color scheme (#8E71AC)

## Quick Creation Options

### Option 1: Use an Online Icon Generator
1. Visit https://realfavicongenerator.net/
2. Upload a simple logo or design
3. Download all sizes

### Option 2: Use Figma/Sketch/Photoshop
1. Create a 512x512 design
2. Export at different sizes
3. Save as PNG files with transparency

### Option 3: Use ImageMagick (Command Line)
```bash
# If you have a source SVG or large image:
convert source.png -resize 16x16 icon-16.png
convert source.png -resize 32x32 icon-32.png
convert source.png -resize 48x48 icon-48.png
convert source.png -resize 128x128 icon-128.png
```

## Placeholder Icons

For testing, you can use simple colored squares:
- Create 16x16, 32x32, 48x48, 128x128 solid purple squares
- This will allow the extension to load while you design proper icons

The extension will work without icons, but Safari may show a warning.
