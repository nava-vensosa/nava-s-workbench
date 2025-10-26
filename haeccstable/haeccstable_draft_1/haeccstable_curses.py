#!/usr/bin/env python3
"""
Haeccstable - Terminal-native live coding environment
Version with curses-based dossier viewer
"""

import sys
import os
import socket
import subprocess
import json
import curses
import threading
import time
from pathlib import Path
from collections import deque
from dsl_parser import DSLParser, DSLError

class DossierViewer:
    """Live dossier.json viewer with vim motions"""

    def __init__(self):
        self.scroll_offset = 0
        self.dossier_lines = []
        self.lock = threading.Lock()

    def update_dossier(self, dossier_data):
        """Update dossier content"""
        with self.lock:
            # Format JSON with nice indentation
            json_str = json.dumps(dossier_data, indent=2)
            self.dossier_lines = json_str.split('\n')

    def scroll_up(self):
        """Scroll up (vim: k)"""
        with self.lock:
            self.scroll_offset = max(0, self.scroll_offset - 1)

    def scroll_down(self, max_visible):
        """Scroll down (vim: j)"""
        with self.lock:
            max_offset = max(0, len(self.dossier_lines) - max_visible)
            self.scroll_offset = min(max_offset, self.scroll_offset + 1)

    def page_up(self, page_size):
        """Page up (vim: Ctrl-u)"""
        with self.lock:
            self.scroll_offset = max(0, self.scroll_offset - page_size)

    def page_down(self, page_size, max_visible):
        """Page down (vim: Ctrl-d)"""
        with self.lock:
            max_offset = max(0, len(self.dossier_lines) - max_visible)
            self.scroll_offset = min(max_offset, self.scroll_offset + page_size)

    def goto_top(self):
        """Go to top (vim: gg)"""
        with self.lock:
            self.scroll_offset = 0

    def goto_bottom(self, max_visible):
        """Go to bottom (vim: G)"""
        with self.lock:
            self.scroll_offset = max(0, len(self.dossier_lines) - max_visible)

    def get_visible_lines(self, start, count):
        """Get visible lines for rendering"""
        with self.lock:
            end = min(start + count, len(self.dossier_lines))
            return self.dossier_lines[start:end]

class HaeccstableCurses:
    def __init__(self):
        self.monitors = {}
        self.dsl_parser = DSLParser()
        self.dossier_viewer = DossierViewer()
        self.command_history = deque(maxlen=100)
        self.history_index = -1
        self.output_lines = deque(maxlen=100)
        self.running = True
        self.mode = 'normal'  # 'normal' or 'insert'
        self.current_input = ""
        self.cursor_pos = 0  # Cursor position in input

    def get_dossier_state(self):
        """Get current session state for dossier"""
        return {
            "monitors": {
                name: {
                    "port": info["port"],
                    "running": info["process"].poll() is None
                }
                for name, info in self.monitors.items()
            },
            "layers": dict(self.dsl_parser.layers),
            "variables": dict(self.dsl_parser.variables),
            "buffers": dict(self.dsl_parser.buffers),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    def update_dossier(self):
        """Update dossier viewer with current state"""
        self.dossier_viewer.update_dossier(self.get_dossier_state())

    def add_output(self, line):
        """Add line to output display"""
        self.output_lines.append(line)

    def run_curses(self, stdscr):
        """Main curses interface"""
        curses.curs_set(1)  # Show cursor
        stdscr.nodelay(False)  # Blocking input
        stdscr.timeout(100)  # 100ms timeout for refresh

        # Initialize colors
        curses.init_pair(1, curses.COLOR_CYAN, curses.COLOR_BLACK)    # Borders
        curses.init_pair(2, curses.COLOR_GREEN, curses.COLOR_BLACK)   # Dossier
        curses.init_pair(3, curses.COLOR_YELLOW, curses.COLOR_BLACK)  # Prompt

        current_input = ""

        # Initial dossier update
        self.update_dossier()

        while self.running:
            height, width = stdscr.getmaxyx()

            # Calculate layout
            dossier_height = height - 10  # Top section for dossier
            output_height = 5              # Middle section for output
            input_y = height - 3           # Bottom for input

            stdscr.clear()

            # Draw dossier section
            stdscr.addstr(0, 0, "═" * width, curses.color_pair(1))
            stdscr.addstr(0, 2, " DOSSIER.JSON (vim: j/k/gg/G/Ctrl-d/Ctrl-u) ", curses.color_pair(1))

            visible_lines = self.dossier_viewer.get_visible_lines(
                self.dossier_viewer.scroll_offset,
                dossier_height - 2
            )

            for i, line in enumerate(visible_lines):
                y = i + 1
                if y < dossier_height - 1:
                    display_line = line[:width-1]
                    stdscr.addstr(y, 0, display_line, curses.color_pair(2))

            # Draw separator
            sep_y = dossier_height
            stdscr.addstr(sep_y, 0, "─" * width, curses.color_pair(1))
            stdscr.addstr(sep_y, 2, " OUTPUT ", curses.color_pair(1))

            # Draw output section
            output_start = sep_y + 1
            output_to_show = list(self.output_lines)[-output_height:]
            for i, line in enumerate(output_to_show):
                y = output_start + i
                if y < input_y - 1:
                    stdscr.addstr(y, 0, line[:width-1])

            # Draw input separator
            stdscr.addstr(input_y - 1, 0, "─" * width, curses.color_pair(1))

            # Draw input line
            prompt = "haeccstable> "
            stdscr.addstr(input_y, 0, prompt, curses.color_pair(3))
            stdscr.addstr(input_y, len(prompt), current_input[:width-len(prompt)-1])

            # Draw help line
            help_text = "Ctrl-C: exit | Ctrl-L: clear | vim motions scroll dossier"
            if input_y + 1 < height:
                stdscr.addstr(input_y + 1, 0, help_text[:width-1], curses.A_DIM)

            stdscr.refresh()

            # Handle input
            try:
                key = stdscr.getch()

                if key == -1:  # Timeout, just refresh
                    continue
                elif key == 27:  # ESC - check for vim motions
                    stdscr.nodelay(True)
                    next_key = stdscr.getch()
                    stdscr.nodelay(False)
                    if next_key == -1:  # Just ESC
                        continue
                    # Handle escaped sequences if needed
                elif key == 3:  # Ctrl-C
                    self.running = False
                    break
                elif key == 12:  # Ctrl-L
                    self.output_lines.clear()
                elif key == ord('j'):  # Scroll dossier down
                    self.dossier_viewer.scroll_down(dossier_height - 2)
                elif key == ord('k'):  # Scroll dossier up
                    self.dossier_viewer.scroll_up()
                elif key == ord('g'):  # Check for gg
                    stdscr.nodelay(True)
                    next_key = stdscr.getch()
                    stdscr.nodelay(False)
                    if next_key == ord('g'):
                        self.dossier_viewer.goto_top()
                elif key == ord('G'):  # Go to bottom
                    self.dossier_viewer.goto_bottom(dossier_height - 2)
                elif key == 4:  # Ctrl-D
                    self.dossier_viewer.page_down(dossier_height // 2, dossier_height - 2)
                elif key == 21:  # Ctrl-U
                    self.dossier_viewer.page_up(dossier_height // 2)
                elif key in (curses.KEY_ENTER, 10, 13):  # Enter
                    if current_input.strip():
                        self.command_history.append(current_input)
                        self.execute_command(current_input.strip())
                        current_input = ""
                elif key in (curses.KEY_BACKSPACE, 127, 8):  # Backspace
                    current_input = current_input[:-1]
                elif 32 <= key <= 126:  # Printable characters
                    current_input += chr(key)

            except KeyboardInterrupt:
                self.running = False
                break

        self.shutdown()

    def execute_command(self, line):
        """Execute a command or DSL statement"""
        self.add_output(f"> {line}")

        try:
            # REPL commands
            if line.startswith("open_monitor "):
                monitor_name = line.split()[1]
                self.open_monitor(monitor_name)
            elif line.startswith("close_monitor "):
                monitor_name = line.split()[1]
                self.close_monitor(monitor_name)
            elif line.startswith("import "):
                import_path = line.split(None, 1)[1]
                self.execute_import(import_path)
            elif line in ("exit", "quit"):
                self.running = False
            else:
                # Try to parse as DSL statement
                self.execute_dsl(line)

            # Update dossier after any command
            self.update_dossier()

        except Exception as e:
            self.add_output(f"Error: {e}")

    def execute_import(self, import_path):
        """Import and execute a file"""
        # Look in haeccstable_projects/
        full_path = Path("haeccstable_projects") / import_path

        if not full_path.exists():
            self.add_output(f"File not found: {full_path}")
            return

        self.add_output(f"Importing {import_path}...")

        try:
            with open(full_path, 'r') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()

                    # Skip comments and empty lines
                    if not line or line.startswith('#') or line.startswith('//'):
                        continue

                    # Execute line
                    try:
                        self.execute_dsl(line)
                    except DSLError as e:
                        self.add_output(f"  Line {line_num}: {e}")
                        return

            self.add_output(f"✓ Imported {import_path}")

        except Exception as e:
            self.add_output(f"Failed to import: {e}")

    def execute_dsl(self, statement):
        """Execute a DSL statement"""
        try:
            commands = self.dsl_parser.parse_statement(statement)

            # Capture parser output
            # (Parser prints to stdout, we already see it)

            # Send commands to monitors
            for cmd in commands:
                if cmd.get('type') == 'import':
                    # Nested import
                    self.execute_import(cmd['path'])
                else:
                    self.send_to_monitor(cmd)

        except DSLError as e:
            self.add_output(f"DSL error: {e}")
            raise

    def open_monitor(self, name):
        """Open a monitor window"""
        if name in self.monitors:
            self.add_output(f"Monitor '{name}' already open")
            return

        monitor_num = int(name.replace("monitor", ""))
        port = 5000 + monitor_num

        monitor_bin = Path("monitor") / "haeccstable_monitor"
        if not monitor_bin.exists():
            self.add_output(f"Error: Monitor binary not found")
            self.add_output("Run 'make' in monitor/ directory")
            return

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

            self.add_output(f"✓ Created window '{name}' (1920x1080)")

            time.sleep(0.5)
            self.connect_monitor(name)
            self.update_dossier()

        except Exception as e:
            self.add_output(f"Failed to launch monitor: {e}")

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
            self.add_output(f"Warning: Could not connect to {name}: {e}")

    def close_monitor(self, name):
        """Close a monitor window"""
        if name not in self.monitors:
            self.add_output(f"Monitor '{name}' not open")
            return

        monitor = self.monitors[name]

        if monitor['socket']:
            try:
                monitor['socket'].close()
            except:
                pass

        monitor['process'].terminate()
        monitor['process'].wait(timeout=2)

        del self.monitors[name]
        self.add_output(f"Closed monitor '{name}'")
        self.update_dossier()

    def send_to_monitor(self, cmd):
        """Send command to monitor process"""
        monitor_name = cmd.get('monitor', 'monitor1')

        if monitor_name not in self.monitors:
            return

        sock = self.monitors[monitor_name].get('socket')
        if not sock:
            return

        try:
            msg = json.dumps(cmd) + '\n'
            sock.sendall(msg.encode('utf-8'))
        except Exception as e:
            self.add_output(f"Error sending to monitor: {e}")

    def shutdown(self):
        """Clean shutdown"""
        for name in list(self.monitors.keys()):
            self.close_monitor(name)

def main():
    repl = HaeccstableCurses()
    curses.wrapper(repl.run_curses)

if __name__ == "__main__":
    main()
