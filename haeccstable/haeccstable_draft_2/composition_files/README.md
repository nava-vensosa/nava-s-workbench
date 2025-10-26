# Composition Files Directory

This directory contains all Haeccstable session state and command history files.

## Contents

### Active Session Files

- **dossier.json** - Current session state (auto-updated by Haeccstable)
  - Contains variables, functions, processes, layers, windows
  - Updated in real-time as you work

- **log.txt** - Current session command log (auto-updated)
  - Records all commands entered
  - Includes success/error messages
  - Can be cleared with `clear log.txt`

### Saved Snapshots

All files saved with the `save` command are stored here:

- **\*.json** - Saved dossier snapshots
  - Created with: `save dossier.json <filename>`
  - Captures complete session state at a specific point
  - Useful for checkpoints, experiments, versioning

- **\*.txt** - Saved log files
  - Created with: `save log.txt <filename>`
  - Captures command history
  - Useful for documentation, tutorials, sharing workflows

## Commands

From the Haeccstable terminal:

```haeccstable
# Save current state
save dossier.json my_experiment.json

# Save command history
save log.txt my_session.txt

# Clear log (keeps file, resets content)
clear log.txt
```

## File Organization

```
composition_files/
├── dossier.json              # Active session state
├── log.txt                   # Active command log
├── experiment1.json          # Saved snapshot
├── experiment2.json          # Another snapshot
├── baseline.json             # Baseline configuration
├── session_2024_10_26.txt    # Saved log
└── demo_commands.txt         # Demo session log
```

## Best Practices

1. **Save Often**: Create snapshots before major changes
   ```
   save dossier.json before_filters.json
   ```

2. **Use Descriptive Names**: Make filenames meaningful
   ```
   save dossier.json ascii_demo_final.json
   save log.txt lissajous_tutorial.txt
   ```

3. **Clear Logs Periodically**: Start fresh explorations with clean logs
   ```
   clear log.txt
   ```

4. **Document Sessions**: Save logs for sharing or documentation
   ```
   save log.txt workshop_demo.txt
   ```

## Version Control

This directory is **not** version controlled by default (see `.gitignore`).

Your composition work is personal and experimental - it shouldn't clutter the repository.

If you want to version control specific snapshots:
1. Create a separate project repository
2. Copy relevant `.json` and `.txt` files there
3. Version control that repository separately

## Backup

To backup your composition work:

```bash
# From haeccstable_draft_2/ directory
tar -czf compositions_backup.tar.gz composition_files/

# Or copy entire directory
cp -r composition_files/ ~/backups/haeccstable_compositions_$(date +%Y%m%d)/
```

## Sharing

To share a composition:

```bash
# Share a specific snapshot
cp composition_files/my_demo.json ~/Desktop/

# Share with log
cp composition_files/my_demo.json ~/Desktop/
cp composition_files/my_demo_commands.txt ~/Desktop/
```

## Auto-Creation

This directory and the template files (`dossier.json`, `log.txt`) are created automatically when you start Haeccstable if they don't exist.

You can safely delete this entire directory - it will be recreated on next launch.
