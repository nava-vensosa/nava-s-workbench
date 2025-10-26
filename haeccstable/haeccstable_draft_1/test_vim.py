#!/usr/bin/env python3
"""
Quick test for Haeccstable Vim Mode
Demonstrates the full vim modal interface
"""

import subprocess
import sys

def main():
    print("=" * 70)
    print("Haeccstable Vim Mode - Full Modal Interface")
    print("=" * 70)
    print()
    print("This version features:")
    print("  🔵 NORMAL mode - Navigate with vim motions")
    print("  🟢 INSERT mode - Type commands")
    print("  🎯 Focus switching - Press 1/2/3 for dossier/output/command")
    print()
    print("=" * 70)
    print()
    print("QUICK TUTORIAL:")
    print()
    print("1. You start in NORMAL mode, focused on dossier")
    print("   • Use j/k to scroll the dossier")
    print("   • Press 1/2/3 to switch focus between panes")
    print()
    print("2. Press 'i' to enter INSERT mode")
    print("   • Type: open_monitor monitor1")
    print("   • Press Enter (auto-returns to NORMAL mode)")
    print()
    print("3. Press 'i' again")
    print("   • Type: import simple_passthrough/main.txt")
    print("   • Press Enter")
    print("   • Window pops up with webcam feed!")
    print()
    print("4. Explore the dossier:")
    print("   • Press 1 to focus dossier")
    print("   • Press gg to jump to top")
    print("   • Press G to jump to bottom")
    print("   • Use j/k to scroll")
    print()
    print("5. Check output:")
    print("   • Press 2 to focus output pane")
    print("   • Use j/k to scroll through history")
    print()
    print("6. Exit:")
    print("   • Press Ctrl-C to quit")
    print()
    print("=" * 70)
    print()
    print("VIM MOTIONS AVAILABLE:")
    print("  j/k     - Scroll down/up")
    print("  h/l     - Scroll left/right (dossier)")
    print("  gg/G    - Jump to top/bottom")
    print("  {/}     - Previous/next paragraph")
    print("  0/$     - Line start/end")
    print("  Ctrl-d/u - Page down/up")
    print()
    print("INSERT MODE KEYS:")
    print("  i/I/a/A/o/O/s/S - Enter insert mode")
    print("  ESC             - Return to normal mode")
    print("  Enter           - Execute command & return to normal")
    print()
    print("=" * 70)
    print()
    input("Press Enter to start Haeccstable Vim Mode...")
    print()

    # Launch vim UI
    try:
        subprocess.run(["./haeccstable_vim.py"])
    except KeyboardInterrupt:
        print("\nExited.")

if __name__ == "__main__":
    main()
