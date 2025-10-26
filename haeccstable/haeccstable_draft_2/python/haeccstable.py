#!/usr/bin/env python3
"""
Haeccstable Draft 2 - Main Entry Point

A live coding environment for realtime graphics, video, and audio processing.
Terminal interface with vim modal navigation and tmux-style layout.
"""

import sys
import os
import curses
from curses_ui import HaeccstableUI

def main():
    """
    Main entry point for Haeccstable.
    Initializes the terminal UI and starts the event loop.
    """
    try:
        # Initialize curses and start UI
        ui = HaeccstableUI()
        curses.wrapper(ui.run)
    except KeyboardInterrupt:
        print("\nHaeccstable terminated by user")
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    # Check minimum Python version
    if sys.version_info < (3, 11):
        print("Error: Haeccstable requires Python 3.11 or higher")
        sys.exit(1)

    main()
