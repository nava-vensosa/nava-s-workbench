# Safari Vim Navigator - Installation Guide

## Quick Start (5 minutes)

### Step 1: Prepare Icons (Optional but Recommended)

The extension needs icon files. You have two options:

**Option A: Skip for now** (Extension will work but show a warning)
- Just proceed to Step 2

**Option B: Create quick placeholder icons**
```bash
cd safarivim/icons
# Create simple colored squares as placeholders
# (Use any image editor or the commands below if you have ImageMagick)
```

### Step 2: Enable Safari Extensions

1. Open **Safari**
2. Go to **Safari → Preferences** (⌘,)
3. Click **Advanced** tab
4. Check ☑️ **Show Develop menu in menu bar**
5. Close Preferences

### Step 3: Allow Unsigned Extensions (For Development)

1. In Safari menu bar: **Develop → Allow Unsigned Extensions**
2. This enables loading of local/development extensions

### Step 4: Load the Extension

1. In Safari menu bar: **Safari → Preferences** (⌘,)
2. Click **Extensions** tab
3. Look for **Safari Vim Navigator** in the list
4. If you don't see it yet, continue to Step 5

### Step 5: Load as Unsigned Extension

1. In Safari menu bar: **Develop → Web Extension Background Pages → Safari Vim Navigator**
   - OR -
2. **Develop → Load Unsigned Extension...**
3. Navigate to and select the `safarivim` folder
4. Click **Select**

### Step 6: Grant Permissions

1. A popup will appear asking for permissions
2. Click **Allow** to let the extension:
   - Read and alter webpages
   - Run on all websites

### Step 7: Test It!

1. Navigate to any website (try https://wikipedia.org)
2. Press `j` - you should see a purple cursor appear and move down
3. Press `k` - cursor moves up
4. Press `Caps Lock` - enter free mode (cursor becomes adaptive)
5. Press `Enter` - click the element at cursor position

## Troubleshooting

### "Cannot load extension" error
- Make sure you selected the `safarivim` folder, not a file inside it
- Check that `manifest.json` is directly in the folder you selected

### Extension doesn't appear in Extensions list
1. Quit and reopen Safari
2. Try **Develop → Reload All Extensions**
3. Make sure "Allow Unsigned Extensions" is checked

### Keys don't work
- Click on the webpage first to give it focus
- Make sure you're not in a text input field
- Try refreshing the page

### Cursor doesn't appear
- Refresh the webpage
- Check Safari Console: **Develop → Show JavaScript Console**
- Look for any error messages

### Free-mode (Caps Lock) not working
- Toggle Caps Lock off and on
- Some keyboards may not trigger the CapsLock event properly
- Try pressing Caps Lock while on the webpage

## Verifying Installation

### Check #1: Extension is Loaded
1. Safari → Preferences → Extensions
2. You should see "Safari Vim Navigator" with a green enabled checkbox

### Check #2: Content Script is Running
1. Visit any webpage
2. Open JavaScript Console: **Develop → Show JavaScript Console**
3. Type: `safariVimNavigator`
4. Press Enter
5. Should see: `SafariVimNavigator {enabled: true, ...}`

### Check #3: Cursor Appears
1. Visit any webpage
2. Press `j` key
3. Purple cursor should appear

## Uninstallation

1. Safari → Preferences → Extensions
2. Find "Safari Vim Navigator"
3. Click **Uninstall**

OR

1. Develop → Allow Unsigned Extensions (uncheck)
2. Restart Safari

## Building for Distribution

To create a signed extension for the App Store:

1. Open Xcode
2. Create a new Safari Web Extension project
3. Copy the files from `safarivim/` into the Xcode project
4. Configure signing with your Apple Developer account
5. Build and submit to App Store

## Development Mode

While developing:

1. Make changes to any file
2. Safari → **Develop → Reload All Extensions**
3. Refresh the webpage you're testing on
4. Changes should be live

## Next Steps

Once installed, check out:
- **README.md** - Full feature list and key bindings
- **popup.html** - Quick reference guide (click extension icon)
- Try it on different websites to see how it adapts!

## Support

Having issues? Check:
1. Safari version (should be Safari 14+)
2. macOS version (should be macOS 11+)
3. Console errors (Develop → Show JavaScript Console)

---

**Happy vim navigating!** 🚀
