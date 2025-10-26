#!/usr/bin/env python3
"""
Test auto-start/stop of Swift app
"""

import sys
import time
import subprocess

# Run haeccstable.py in the background
print("Starting haeccstable.py...")
proc = subprocess.Popen(
    [sys.executable, "haeccstable.py"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

# Wait for startup
time.sleep(3)

# Check if socket exists
import os
socket_exists = os.path.exists("/tmp/haeccstable.sock")
print(f"Socket exists: {socket_exists}")

# Check if process is running
running = proc.poll() is None
print(f"Process running: {running}")

# Send SIGINT to terminate
print("\nSending SIGINT to terminate...")
proc.send_signal(2)  # SIGINT

# Wait for shutdown
time.sleep(2)

# Check if socket was cleaned up
socket_exists_after = os.path.exists("/tmp/haeccstable.sock")
print(f"Socket cleaned up: {not socket_exists_after}")

# Check process exit code
exit_code = proc.poll()
print(f"Exit code: {exit_code}")

stdout, stderr = proc.communicate()
print("\n=== STDOUT ===")
print(stdout.decode('utf-8'))
print("\n=== STDERR ===")
print(stderr.decode('utf-8'))

if socket_exists and not socket_exists_after and running:
    print("\n✓ Auto-start/stop works!")
else:
    print("\n✗ Auto-start/stop failed")
    sys.exit(1)
