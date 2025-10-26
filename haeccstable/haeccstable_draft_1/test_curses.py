#!/usr/bin/env python3
"""
Quick test for Haeccstable Curses version
Demonstrates the new import-based workflow
"""

import subprocess
import sys

def main():
    print("=" * 60)
    print("Haeccstable Curses Version - Quick Test")
    print("=" * 60)
    print()
    print("This will launch the curses UI with:")
    print("  • Live dossier viewer (top pane)")
    print("  • Command output (middle)")
    print("  • Input prompt (bottom)")
    print()
    print("Try these commands:")
    print("  1. open_monitor monitor1")
    print("  2. import simple_passthrough/main.txt")
    print()
    print("Use vim motions (j/k/gg/G) to scroll the dossier!")
    print("Press Ctrl-C to exit when done.")
    print()
    print("=" * 60)
    print()
    input("Press Enter to start...")
    print()

    # Launch curses UI
    try:
        subprocess.run(["./haeccstable_curses.py"])
    except KeyboardInterrupt:
        print("\nExited.")

if __name__ == "__main__":
    main()
