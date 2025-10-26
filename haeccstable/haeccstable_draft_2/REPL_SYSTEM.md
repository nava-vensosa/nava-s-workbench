# Haeccstable REPL System

## Overview

The Haeccstable log file (`log.txt`) functions as a **programmable REPL (Read-Eval-Print Loop)** where you can:
- **Edit** the log as a program using vim motions
- **Delete** lines with `dd` to remove commands and re-execute
- **Print** console messages with `print()` and `println()`
- **Import** and run external script files with `run()`

This turns the log into a **living program file** that combines command history, console output, and executable code.

## Log File Format

The log uses special prefixes to organize different types of content:

| Prefix | Type | Description | Example |
|--------|------|-------------|---------|
| `>` | **Command** | Executable DSL command | `> video_invar webcam = capture(0)` |
| `#` | **Output** | Console output/comments | `# Starting video capture...` |
| `✓` | **Success** | Command executed successfully | `✓ OK` |
| `✗` | **Error** | Command failed | `✗ Parse error` |
| `//` | **Comment** | Code comments (ignored) | `// This is a setup phase` |
| (blank) | **Separator** | Visual spacing | |

### Example Log File

```haeccstable
# Haeccstable Session Log

// Setup phase
> video_invar webcam = capture(0)
✓ OK
> window_var win = window("Output", 1920, 1080)
✓ OK

> print("Video setup complete")
# Video setup complete

// Apply filter
> $sobel(webcam, threshold=0.15)
✓ OK
```

## Editing the Log as a Program

### Using `dd` to Delete Lines

In **NORMAL mode**, focus the log pane (press `2`) and use `dd` to delete a line:

```
1. Press ESC to enter NORMAL mode
2. Press 2 to focus the log pane
3. Navigate to the line you want to delete (j/k)
4. Press dd to delete the line
```

**What happens:**
1. The line is deleted from `log.txt`
2. The **dossier is cleared** (reset to empty state)
3. **All remaining `>` commands** in the log are re-executed in order
4. The dossier rebuilds to reflect the edited program
5. Output lines (`#`, `✓`, `✗`) are regenerated

### Example: Removing a Command

**Before** (log.txt):
```
> video_invar webcam = capture(0)
✓ OK
> video_invar screen = capture(1)  ← Want to delete this
✓ OK
> window_var win = window("Output", 1920, 1080)
✓ OK
```

**Action**: Navigate to line 3, press `dd`

**After** (log re-executed):
```
> video_invar webcam = capture(0)
✓ OK
> window_var win = window("Output", 1920, 1080)
✓ OK
```

The `screen` variable no longer exists in the dossier!

### Use Cases for Editing

1. **Remove mistakes** - Delete a command that created the wrong variable
2. **Reorder commands** - Delete and re-type in different order
3. **Debug** - Remove problematic commands to find which one causes errors
4. **Refactor** - Clean up the log to create a clean script
5. **Experiment** - Try different configurations by editing history

## Console Output Functions

### `print(message)`

Outputs a message to the log with `#` prefix (no trailing newline).

**Syntax:**
```haeccstable
print("message")
print('message')
```

**Example:**
```haeccstable
haeccstable> print("Starting capture")
```

**Log Output:**
```
> print("Starting capture")
# Starting capture
```

### `println(message)`

Outputs a message followed by a blank line (like print with newline).

**Syntax:**
```haeccstable
println("message")
println('message')
```

**Example:**
```haeccstable
haeccstable> println("Phase 1 complete")
```

**Log Output:**
```
> println("Phase 1 complete")
# Phase 1 complete

```

### Use Cases

1. **Documentation** - Add comments explaining what each phase does
2. **Debugging** - Print status messages during execution
3. **Section markers** - Use `println()` to separate sections
4. **Progress tracking** - Print milestones as program runs

**Example Session:**
```haeccstable
println("=== SETUP PHASE ===")
video_invar webcam = capture(0)
window_var win = window("Output", 1920, 1080)
println("Setup complete")

---

println("=== FILTER PHASE ===")
$sobel(webcam, threshold=0.15)
println("Filter applied")
```

## File Import System: `run(filename)`

Execute an external text file as a series of commands.

**Syntax:**
```haeccstable
run("filename.txt")
run('filename.txt')
```

**File Location**: Files are loaded from `composition_files/` directory.

### Script File Format

Script files use the same format as log files:
- Lines starting with `>` are executed as commands
- Lines starting with `#` are ignored (treated as output/comments)
- Lines starting with `//` are ignored (comments)
- Blank lines are ignored

**Example Script** (`composition_files/setup.txt`):
```haeccstable
// Basic video setup script
> video_invar webcam = capture(0)
> window_var win = window("Output", 1920, 1080)
> layer_obj main_layer = layer("Main", 1920, 1080)
# This is a comment - ignored during execution

// Configure window
> win.project(main_layer)
```

**Run it:**
```haeccstable
haeccstable> run("setup.txt")
```

**Log Output:**
```
> run("setup.txt")
> video_invar webcam = capture(0)
✓ OK
> window_var win = window("Output", 1920, 1080)
✓ OK
> layer_obj main_layer = layer("Main", 1920, 1080)
✓ OK
> win.project(main_layer)
✓ OK
# Executed 4 commands from setup.txt
```

### Use Cases

1. **Reusable setups** - Create standard configurations
2. **Batch processing** - Run multiple commands at once
3. **Testing** - Load test scenarios
4. **Templates** - Share configurations between sessions
5. **Macros** - Record and replay command sequences

### Creating Script Files

**Method 1: Save current log**
```haeccstable
save log.txt my_setup.txt
```

Then edit `composition_files/my_setup.txt` to keep only the `>` commands you want.

**Method 2: Manually create**
Create a text file in `composition_files/` with `>` prefixed commands.

**Method 3: Export cleaned log**
1. Edit log with `dd` to remove unwanted commands
2. Save with `save log.txt clean_script.txt`

## Workflow Examples

### Example 1: Iterative Development

```haeccstable
# Try a filter
> $sobel(webcam, threshold=0.15)
✓ OK

# Hmm, not quite right - delete and try again
# Press 2, navigate to sobel line, press dd

# Try different threshold
> $sobel(webcam, threshold=0.25)
✓ OK
```

### Example 2: Building a Library

**Create** `filters/edge_detect.txt`:
```haeccstable
> $sobel(webcam, threshold=0.15)
> $dog(webcam, sigma1=1.0, sigma2=2.0)
```

**Create** `filters/artistic.txt`:
```haeccstable
> $kuwahara(webcam, radius=5)
> layer.cast(webcam)
```

**Use them:**
```haeccstable
haeccstable> run("filters/edge_detect.txt")
haeccstable> ---
haeccstable> run("filters/artistic.txt")
```

### Example 3: Debugging with Print

```haeccstable
println("Creating video source...")
video_invar webcam = capture(0)
println("✓ Video source created")

println("Creating window...")
window_var win = window("Output", 1920, 1080)
println("✓ Window created")

println("Applying filter...")
$sobel(webcam, threshold=0.15)
println("✓ Filter applied")
```

### Example 4: Clean Workflow

```haeccstable
# Start fresh
clear log.txt

# Document your work
println("=== Webcam Edge Detection Demo ===")
println("Author: Your Name")
println("Date: 2025-10-26")
println("")

# Setup
println("[1/3] Setting up video source...")
video_invar webcam = capture(0)

println("[2/3] Creating window...")
window_var win = window("Output", 1920, 1080)
layer_obj main = layer("Main", 1920, 1080)

println("[3/3] Applying Sobel edge detection...")
$sobel(webcam, threshold=0.15)
main.cast(webcam)
win.project(main)

println("")
println("✓ Demo complete!")

# Save this as a demo
save log.txt demos/edge_detection.txt
```

## Log Re-execution Details

When you use `dd` to delete a line, the system:

1. **Removes the line** from the log file
2. **Clears the dossier** to empty state:
   ```json
   {
     "session": {},
     "devices": {},
     "variables": {},
     "functions": {},
     "processes": {},
     "windows": {},
     "layers": {}
   }
   ```
3. **Parses the log** to extract all lines starting with `>`
4. **Re-executes each command** in order:
   - Each command updates the dossier
   - Success/error messages are regenerated
   - Output is written back to the log
5. **Reloads** dossier and log displays

### What Gets Re-executed

✅ **Executed:**
- Lines starting with `>` (commands)

❌ **Ignored:**
- Lines starting with `#` (output/comments)
- Lines starting with `✓` or `✗` (results - these are regenerated)
- Lines starting with `//` (comments)
- Blank lines

### Smart Parsing

The re-execution system only runs **command lines** (`>`), which means:
- Output lines (`#`) are treated as documentation
- You can add `#` comments manually for context
- `//` comments are also ignored
- This allows the log to serve as both history and documentation

## Tips and Best Practices

### Organization

1. **Use `---` for sections**: Visually separate different phases
   ```haeccstable
   video_invar webcam = capture(0)
   ---
   $sobel(webcam, threshold=0.15)
   ```

2. **Use `println()` for headers**:
   ```haeccstable
   println("=== SETUP ===")
   ```

3. **Add `#` comments** manually to document your log:
   ```haeccstable
   > video_invar webcam = capture(0)
   ✓ OK
   # This captures from the default webcam (device 0)
   ```

### Workflow

1. **Experiment freely** - Don't worry about mistakes
2. **Edit with `dd`** - Remove bad commands and re-execute
3. **Use `print()` liberally** - Document what you're doing
4. **Save snapshots** - `save log.txt checkpoints/v1.txt`
5. **Create libraries** - Build reusable script files
6. **Run imports** - Use `run()` to load standard setups

### Script Files

1. **Use `>` prefix** for all commands in script files
2. **Add `#` comments** for documentation
3. **Use `//` for code comments** that shouldn't appear in output
4. **Test scripts** by running them in a fresh session
5. **Version control** your script files

### Debugging

1. **Delete recent commands** with `dd` to undo mistakes
2. **Add `println()` statements** to track execution
3. **Use `---` separators** to mark test sections
4. **Save working states** before experimenting
5. **Re-run from saved log** with `run("backup.txt")`

## Keyboard Reference

When focused on **log pane** (press `2` in NORMAL mode):

| Key | Action |
|-----|--------|
| `dd` | Delete line and re-execute entire log |
| `j/k` | Navigate to line to delete |
| `gg` | Jump to first line |
| `G` | Jump to last line |
| `/` | (Future) Search for text |

## Command Reference

### Console Functions
```haeccstable
print("message")          # Output with # prefix
println("message")        # Output with # prefix + blank line
```

### File Operations
```haeccstable
run("filename.txt")       # Execute script file
save log.txt name.txt     # Save current log
clear log.txt             # Clear log
```

### Separators
```haeccstable
---                       # Add two blank lines (visual separator)
```

## Technical Details

### Log Format Specification

```
<line> ::= <command-line> | <output-line> | <result-line> | <comment-line> | <blank-line>

<command-line>  ::= "> " <dsl-command>
<output-line>   ::= "# " <text>
<result-line>   ::= ("✓ " | "✗ ") <text>
<comment-line>  ::= "// " <text>
<blank-line>    ::= ""
```

### Re-execution Algorithm

```python
1. Delete line at cursor position
2. Write modified log back to file
3. Clear dossier to empty template
4. Parse log for all lines matching "^>\s*(.+)"
5. For each match:
   a. Extract command after "> "
   b. Execute command
   c. Write result to log
6. Reload dossier and log displays
```

### File Import Algorithm

```python
1. Read script file from composition_files/
2. For each line in file:
   a. If line starts with ">":
      - Extract command after "> "
      - Execute command (writes to log)
   b. If line starts with "#", "//", or is blank:
      - Ignore (don't execute, don't log)
3. Log summary: "# Executed N commands from filename"
```

## Future Enhancements

Potential additions:

- `insert_above()`, `insert_below()` - Add lines to log programmatically
- `yy` + `p` - Yank and paste lines in log
- `cw` - Change word in log (edit in place)
- `i` in log pane - Enter INSERT mode to edit log directly
- `/pattern` - Search through log
- `:%s/old/new/g` - Find and replace in log
- Variables in print: `print($variable_name)`
- Conditional execution: `if exists("webcam") then ... `

## Conclusion

The Haeccstable REPL system transforms the log from passive history into an **active program file**. You can:

- ✅ Edit command history with vim motions (`dd`)
- ✅ Re-execute edited programs automatically
- ✅ Add console output with `print()` and `println()`
- ✅ Import and run script files with `run()`
- ✅ Organize with comments (`#`, `//`) and separators (`---`)
- ✅ Build reusable script libraries
- ✅ Document your work inline

This creates a powerful, iterative workflow where your log is simultaneously:
- **Command history**
- **Executable program**
- **Documentation**
- **REPL interface**

Experiment, edit, execute, repeat!
