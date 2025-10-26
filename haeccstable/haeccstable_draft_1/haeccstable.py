#!/usr/bin/env python3
"""
Haeccstable - Terminal-native live coding environment
Minimal proof-of-concept implementation
"""

import sys
import os
import socket
import subprocess
import json
from pathlib import Path
from dsl_parser import DSLParser, DSLError

class Haeccstable:
    def __init__(self):
        self.monitors = {}  # name -> subprocess
        self.current_project = None
        self.project_path = Path("haeccstable_projects")
        self.dsl_parser = DSLParser()

    def run(self):
        """Main REPL loop"""
        print("haeccstable v1.0 - Terminal Live Coding Environment")
        print("Type 'help' for commands, 'exit' to quit\n")

        while True:
            try:
                line = input("haeccstable> ").strip()
                if not line:
                    continue

                if line == "exit" or line == "quit":
                    self.shutdown()
                    break
                elif line == "help":
                    self.show_help()
                else:
                    self.execute_command(line)

            except KeyboardInterrupt:
                print("\nUse 'exit' to quit")
            except EOFError:
                self.shutdown()
                break
            except Exception as e:
                print(f"Error: {e}")

    def execute_command(self, line):
        """Execute a REPL command or DSL statement"""
        # REPL commands
        if line.startswith("open_monitor "):
            monitor_name = line.split()[1]
            self.open_monitor(monitor_name)
        elif line.startswith("close_monitor "):
            monitor_name = line.split()[1]
            self.close_monitor(monitor_name)
        elif line.startswith("select_composition "):
            comp_path = line.split()[1]
            self.select_composition(comp_path)
        elif line.startswith("run "):
            filename = line.split()[1]
            self.run_composition(filename)
        elif line.startswith("update dossier"):
            self.update_dossier()
        else:
            # Try to parse as DSL statement
            self.execute_dsl(line)

    def open_monitor(self, name):
        """Open a monitor window"""
        if name in self.monitors:
            print(f"Monitor '{name}' already open")
            return

        # Launch monitor subprocess
        # For MVP, we'll use a socket on port 5000 + monitor number
        monitor_num = int(name.replace("monitor", ""))
        port = 5000 + monitor_num

        # Build monitor binary path
        monitor_bin = Path("monitor") / "haeccstable_monitor"
        if not monitor_bin.exists():
            print(f"Error: Monitor binary not found at {monitor_bin}")
            print("Run 'make' in monitor/ directory to build")
            return

        # Launch monitor process
        try:
            proc = subprocess.Popen(
                [str(monitor_bin), name, str(port)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            self.monitors[name] = {
                'process': proc,
                'port': port,
                'socket': None
            }

            print(f"Created window '{name}' (1920x1080)")

            # Wait a moment for monitor to start
            import time
            time.sleep(0.5)

            # Connect to monitor
            self.connect_monitor(name)

        except Exception as e:
            print(f"Failed to launch monitor: {e}")

    def connect_monitor(self, name):
        """Connect to monitor via socket"""
        if name not in self.monitors:
            return

        port = self.monitors[name]['port']
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(('localhost', port))
            self.monitors[name]['socket'] = sock
        except Exception as e:
            print(f"Warning: Could not connect to monitor {name}: {e}")

    def close_monitor(self, name):
        """Close a monitor window"""
        if name not in self.monitors:
            print(f"Monitor '{name}' not open")
            return

        monitor = self.monitors[name]

        # Close socket
        if monitor['socket']:
            try:
                monitor['socket'].close()
            except:
                pass

        # Terminate process
        monitor['process'].terminate()
        monitor['process'].wait(timeout=2)

        del self.monitors[name]
        print(f"Closed monitor '{name}'")

    def select_composition(self, comp_path):
        """Select a project composition"""
        # Remove trailing slash
        comp_path = comp_path.rstrip('/')

        full_path = self.project_path / comp_path
        if not full_path.exists():
            print(f"Project not found: {full_path}")
            return

        self.current_project = full_path
        print(f"Loaded project: {comp_path}")

    def run_composition(self, filename):
        """Run a composition file"""
        if not self.current_project:
            print("No project selected. Use select_composition first")
            return

        file_path = self.current_project / filename
        if not file_path.exists():
            print(f"File not found: {file_path}")
            return

        print(f"Executing {filename}...")

        # Read and execute DSL file
        with open(file_path, 'r') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()

                # Skip comments and empty lines
                if not line or line.startswith('#') or line.startswith('//'):
                    continue

                try:
                    self.execute_dsl(line)
                except DSLError as e:
                    print(f"Line {line_num}: {e}")
                    return

        print("Composition loaded successfully!")

    def execute_dsl(self, statement):
        """Execute a DSL statement"""
        try:
            commands = self.dsl_parser.parse_statement(statement)

            # Send commands to appropriate monitors
            for cmd in commands:
                self.send_to_monitor(cmd)

        except DSLError as e:
            print(f"DSL error: {e}")

    def send_to_monitor(self, cmd):
        """Send command to monitor process"""
        monitor_name = cmd.get('monitor', 'monitor1')

        if monitor_name not in self.monitors:
            print(f"Warning: Monitor '{monitor_name}' not open")
            return

        sock = self.monitors[monitor_name].get('socket')
        if not sock:
            print(f"Warning: Not connected to monitor '{monitor_name}'")
            return

        try:
            # Send JSON command
            msg = json.dumps(cmd) + '\n'
            sock.sendall(msg.encode('utf-8'))
        except Exception as e:
            print(f"Error sending to monitor: {e}")

    def update_dossier(self):
        """Update dossier.json with current state"""
        if not self.current_project:
            print("No project selected")
            return

        dossier_path = self.current_project / "dossier.json"
        state = {
            'monitors': list(self.monitors.keys()),
            'timestamp': str(Path.ctime(dossier_path)) if dossier_path.exists() else None
        }

        with open(dossier_path, 'w') as f:
            json.dump(state, f, indent=2)

        print(f"Updated {dossier_path}")

    def shutdown(self):
        """Clean shutdown - close all monitors"""
        print("\nShutting down...")
        for name in list(self.monitors.keys()):
            self.close_monitor(name)

    def show_help(self):
        """Show help message"""
        print("""
Haeccstable Commands:

Project Management:
  select_composition [dir]/  - Load a project from haeccstable_projects/
  run [file].txt             - Execute a composition file
  update dossier.json        - Save current state

Monitor Control:
  open_monitor [name]        - Open a new monitor window
  close_monitor [name]       - Close a monitor window

Direct DSL:
  Any DSL statement can be entered directly

Other:
  help                       - Show this help
  exit, quit                 - Exit Haeccstable
""")

def main():
    repl = Haeccstable()
    repl.run()

if __name__ == "__main__":
    main()
