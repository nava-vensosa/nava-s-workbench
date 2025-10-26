#!/usr/bin/env python3
"""
Quick test script for Haeccstable prototype
Automatically opens a window and starts video passthrough
"""

import sys
import time
from haeccstable import Haeccstable

def main():
    print("=" * 60)
    print("Haeccstable Prototype Test")
    print("=" * 60)
    print()
    print("This will:")
    print("  1. Open a monitor window named 'monitor1'")
    print("  2. Load the simple_passthrough example")
    print("  3. Start your webcam and display it in the window")
    print()
    print("You should see a window pop up with your webcam feed!")
    print()
    print("Press Ctrl+C to exit")
    print("=" * 60)
    print()

    # Create Haeccstable instance
    repl = Haeccstable()

    try:
        # Step 1: Open monitor window
        print("[1/3] Opening monitor window...")
        repl.execute_command("open_monitor monitor1")
        time.sleep(1)  # Give window time to appear

        # Step 2: Load project
        print("[2/3] Loading simple_passthrough project...")
        repl.execute_command("select_composition simple_passthrough/")
        time.sleep(0.5)

        # Step 3: Run the composition
        print("[3/3] Starting video passthrough...")
        repl.execute_command("run main.txt")
        time.sleep(0.5)

        print()
        print("✓ Setup complete!")
        print()
        print("You should now see your webcam in the monitor1 window.")
        print("The window title should say 'monitor1'")
        print()
        print("Press Ctrl+C to exit...")
        print()

        # Keep running
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n\nShutting down...")
        repl.shutdown()
        print("Goodbye!")

if __name__ == "__main__":
    main()
