#!/usr/bin/env python3
"""
Haeccstable Draft 2 - Main Entry Point

A live coding environment for realtime graphics, video, and audio processing.
Terminal interface with vim modal navigation and tmux-style layout.
"""

import sys
import os
import curses
import subprocess
import time
import signal
import atexit
from curses_ui import HaeccstableUI

# Global reference to Swift process
swift_process = None

def start_swift_app():
    """Start the Swift backend app"""
    global swift_process

    # Find the Swift executable
    script_dir = os.path.dirname(os.path.abspath(__file__))
    swift_executable = os.path.join(
        script_dir,
        "..",
        "swift",
        "HaeccstableApp",
        "HaeccstableApp",
        "HaeccstableApp"
    )

    if not os.path.exists(swift_executable):
        print(f"Error: Swift app not found at {swift_executable}")
        print("Please compile the Swift app first:")
        print("  cd ../swift/HaeccstableApp/HaeccstableApp")
        print("  swiftc -o HaeccstableApp main.swift Core/*.swift Models/*.swift State/*.swift Utilities/*.swift")
        sys.exit(1)

    # Clean up any existing socket file
    socket_path = "/tmp/haeccstable.sock"
    if os.path.exists(socket_path):
        try:
            os.remove(socket_path)
        except Exception as e:
            print(f"Warning: Could not remove existing socket: {e}")

    print("Starting Haeccstable Swift backend...")

    # Set up environment for Swift app
    composition_files_dir = os.path.join(script_dir, "..", "composition_files")
    dossier_path = os.path.join(composition_files_dir, "dossier.json")

    # Ensure composition_files exists
    os.makedirs(composition_files_dir, exist_ok=True)

    env = os.environ.copy()
    env["HAECCSTABLE_DOSSIER_PATH"] = dossier_path

    # Start Swift app as subprocess
    try:
        swift_process = subprocess.Popen(
            [swift_executable],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            preexec_fn=os.setsid  # Create new process group for clean shutdown
        )

        # Wait a moment for the Swift app to start
        time.sleep(1)

        # Check if it's still running
        if swift_process.poll() is not None:
            stdout, stderr = swift_process.communicate()
            print("Error: Swift app failed to start")
            print(f"stdout: {stdout.decode('utf-8')}")
            print(f"stderr: {stderr.decode('utf-8')}")
            sys.exit(1)

        print("✓ Swift backend started")
        return True

    except Exception as e:
        print(f"Error starting Swift app: {e}")
        sys.exit(1)

def stop_swift_app():
    """Stop the Swift backend app"""
    global swift_process

    if swift_process is None:
        return

    print("\nStopping Haeccstable Swift backend...")

    try:
        # Send SIGINT for graceful shutdown
        os.killpg(os.getpgid(swift_process.pid), signal.SIGINT)

        # Wait up to 3 seconds for graceful shutdown
        try:
            swift_process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            # Force kill if it doesn't stop gracefully
            os.killpg(os.getpgid(swift_process.pid), signal.SIGKILL)
            swift_process.wait()

        print("✓ Swift backend stopped")

    except Exception as e:
        print(f"Warning: Error stopping Swift app: {e}")

    # Clean up socket file
    socket_path = "/tmp/haeccstable.sock"
    if os.path.exists(socket_path):
        try:
            os.remove(socket_path)
        except Exception as e:
            pass  # Ignore cleanup errors

def main():
    """
    Main entry point for Haeccstable.
    Initializes the terminal UI and starts the event loop.
    """
    # Register cleanup function
    atexit.register(stop_swift_app)

    # Start Swift backend
    start_swift_app()

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
    finally:
        # Ensure Swift app is stopped
        stop_swift_app()

if __name__ == "__main__":
    # Check minimum Python version
    if sys.version_info < (3, 11):
        print("Error: Haeccstable requires Python 3.11 or higher")
        sys.exit(1)

    main()
