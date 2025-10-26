#!/usr/bin/env python3
"""
Haeccstable - Terminal-native live coding environment
Full vim modal interface with focus switching
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
        self.col_offset = 0  # Horizontal scroll
        self.dossier_lines = []
        self.lock = threading.Lock()

    def update_dossier(self, dossier_data):
        """Update dossier content"""
        with self.lock:
            json_str = json.dumps(dossier_data, indent=2)
            self.dossier_lines = json_str.split('\n')

    def scroll_up(self, count=1):
        """Scroll up (vim: k)"""
        with self.lock:
            self.scroll_offset = max(0, self.scroll_offset - count)

    def scroll_down(self, max_visible, count=1):
        """Scroll down (vim: j)"""
        with self.lock:
            max_offset = max(0, len(self.dossier_lines) - max_visible)
            self.scroll_offset = min(max_offset, self.scroll_offset + count)

    def scroll_left(self, count=1):
        """Scroll left (vim: h)"""
        with self.lock:
            self.col_offset = max(0, self.col_offset - count)

    def scroll_right(self, count=1):
        """Scroll right (vim: l)"""
        with self.lock:
            self.col_offset = min(200, self.col_offset + count)  # Max 200 cols

    def page_up(self, page_size):
        """Page up (vim: Ctrl-u)"""
        self.scroll_up(page_size)

    def page_down(self, page_size, max_visible):
        """Page down (vim: Ctrl-d)"""
        self.scroll_down(max_visible, page_size)

    def goto_top(self):
        """Go to top (vim: gg)"""
        with self.lock:
            self.scroll_offset = 0

    def goto_bottom(self, max_visible):
        """Go to bottom (vim: G)"""
        with self.lock:
            self.scroll_offset = max(0, len(self.dossier_lines) - max_visible)

    def goto_line_start(self):
        """Go to line start (vim: 0)"""
        with self.lock:
            self.col_offset = 0

    def goto_line_end(self, width):
        """Go to line end (vim: $)"""
        with self.lock:
            if self.scroll_offset < len(self.dossier_lines):
                line_len = len(self.dossier_lines[self.scroll_offset])
                self.col_offset = max(0, line_len - width + 1)

    def paragraph_up(self):
        """Move to previous paragraph (vim: {)"""
        with self.lock:
            # Find previous empty line
            for i in range(self.scroll_offset - 1, -1, -1):
                if i < len(self.dossier_lines) and not self.dossier_lines[i].strip():
                    self.scroll_offset = i
                    return
            self.scroll_offset = 0

    def paragraph_down(self, max_visible):
        """Move to next paragraph (vim: })"""
        with self.lock:
            # Find next empty line
            for i in range(self.scroll_offset + 1, len(self.dossier_lines)):
                if not self.dossier_lines[i].strip():
                    max_offset = max(0, len(self.dossier_lines) - max_visible)
                    self.scroll_offset = min(i, max_offset)
                    return
            self.goto_bottom(max_visible)

    def get_visible_lines(self, start, count, col_offset, width):
        """Get visible lines for rendering"""
        with self.lock:
            end = min(start + count, len(self.dossier_lines))
            lines = []
            for i in range(start, end):
                line = self.dossier_lines[i]
                # Apply horizontal scroll
                visible_line = line[col_offset:col_offset + width]
                lines.append(visible_line)
            return lines

class OutputViewer:
    """Output viewer with vim navigation"""

    def __init__(self):
        self.scroll_offset = 0
        self.lock = threading.Lock()

    def scroll_up(self, count=1):
        with self.lock:
            self.scroll_offset = max(0, self.scroll_offset - count)

    def scroll_down(self, max_offset, count=1):
        with self.lock:
            self.scroll_offset = min(max_offset, self.scroll_offset + count)

    def goto_top(self):
        with self.lock:
            self.scroll_offset = 0

    def goto_bottom(self, max_offset):
        with self.lock:
            self.scroll_offset = max_offset

class HaeccstableVim:
    def __init__(self):
        self.monitors = {}
        self.dsl_parser = DSLParser()
        self.dossier_viewer = DossierViewer()
        self.output_viewer = OutputViewer()
        self.command_history = deque(maxlen=100)
        self.history_index = -1
        self.output_lines = deque(maxlen=1000)
        self.running = True

        # Vim modal state
        self.mode = 'normal'  # 'normal' or 'insert'
        self.focus = 'dossier'  # 'dossier', 'output', or 'command'
        self.current_input = ""
        self.cursor_pos = 0

        # Pending key for multi-key commands (gg, etc.)
        self.pending_key = None

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
        curses.curs_set(0)  # Hide cursor initially
        stdscr.nodelay(False)
        stdscr.timeout(100)

        # Initialize colors
        curses.init_pair(1, curses.COLOR_CYAN, curses.COLOR_BLACK)    # Borders
        curses.init_pair(2, curses.COLOR_GREEN, curses.COLOR_BLACK)   # Dossier
        curses.init_pair(3, curses.COLOR_YELLOW, curses.COLOR_BLACK)  # Prompt
        curses.init_pair(4, curses.COLOR_WHITE, curses.COLOR_BLUE)    # Mode indicator
        curses.init_pair(5, curses.COLOR_BLACK, curses.COLOR_YELLOW)  # Focus highlight
        curses.init_pair(6, curses.COLOR_RED, curses.COLOR_BLACK)     # Insert mode

        # Initial dossier update
        self.update_dossier()

        while self.running:
            height, width = stdscr.getmaxyx()

            # Calculate layout
            dossier_height = height - 10
            output_height = 5
            input_y = height - 3

            stdscr.clear()

            # Draw dossier section
            dossier_border_attr = curses.color_pair(5) if self.focus == 'dossier' else curses.color_pair(1)
            stdscr.addstr(0, 0, "═" * width, dossier_border_attr)
            title = " DOSSIER.JSON "
            if self.focus == 'dossier':
                title += "[FOCUSED] "
            stdscr.addstr(0, 2, title, dossier_border_attr)

            visible_lines = self.dossier_viewer.get_visible_lines(
                self.dossier_viewer.scroll_offset,
                dossier_height - 2,
                self.dossier_viewer.col_offset,
                width - 1
            )

            for i, line in enumerate(visible_lines):
                y = i + 1
                if y < dossier_height - 1:
                    stdscr.addstr(y, 0, line[:width-1], curses.color_pair(2))

            # Draw separator
            sep_y = dossier_height
            output_border_attr = curses.color_pair(5) if self.focus == 'output' else curses.color_pair(1)
            stdscr.addstr(sep_y, 0, "─" * width, output_border_attr)
            output_title = " OUTPUT "
            if self.focus == 'output':
                output_title += "[FOCUSED] "
            stdscr.addstr(sep_y, 2, output_title, output_border_attr)

            # Draw output section
            output_start = sep_y + 1
            total_output_lines = len(self.output_lines)
            max_output_offset = max(0, total_output_lines - output_height)

            # Calculate which lines to show based on scroll offset
            start_idx = max(0, total_output_lines - output_height - self.output_viewer.scroll_offset)
            end_idx = start_idx + output_height
            output_to_show = list(self.output_lines)[start_idx:end_idx]

            for i, line in enumerate(output_to_show):
                y = output_start + i
                if y < input_y - 1:
                    stdscr.addstr(y, 0, line[:width-1])

            # Draw input separator
            command_border_attr = curses.color_pair(5) if self.focus == 'command' else curses.color_pair(1)
            stdscr.addstr(input_y - 1, 0, "─" * width, command_border_attr)

            # Draw mode indicator and input
            if self.mode == 'insert':
                mode_str = "-- INSERT --"
                mode_attr = curses.color_pair(6)
                curses.curs_set(1)  # Show cursor in insert mode
            else:
                mode_str = f"-- NORMAL -- [Focus: {self.focus.upper()}]"
                mode_attr = curses.color_pair(4)
                curses.curs_set(0)  # Hide cursor in normal mode

            # Draw command line
            prompt = "haeccstable> "
            if self.mode == 'insert':
                stdscr.addstr(input_y, 0, prompt, curses.color_pair(3))
                display_input = self.current_input[:width-len(prompt)-1]
                stdscr.addstr(input_y, len(prompt), display_input)
                # Position cursor
                cursor_x = min(len(prompt) + self.cursor_pos, width - 1)
                stdscr.move(input_y, cursor_x)
            else:
                stdscr.addstr(input_y, 0, prompt, curses.A_DIM)
                stdscr.addstr(input_y, len(prompt), self.current_input[:width-len(prompt)-1], curses.A_DIM)

            # Draw status line
            if input_y + 1 < height:
                status_left = mode_str
                status_right = "1:dossier 2:output 3:command | Ctrl-C:exit"
                stdscr.addstr(input_y + 1, 0, status_left, mode_attr)
                right_x = max(len(status_left) + 2, width - len(status_right) - 1)
                if right_x + len(status_right) < width:
                    stdscr.addstr(input_y + 1, right_x, status_right, curses.A_DIM)

            stdscr.refresh()

            # Handle input
            try:
                key = stdscr.getch()

                if key == -1:  # Timeout
                    continue

                if self.mode == 'normal':
                    self.handle_normal_mode(key, stdscr, dossier_height - 2, output_height, max_output_offset, width)
                else:  # insert mode
                    self.handle_insert_mode(key, stdscr)

            except KeyboardInterrupt:
                self.running = False
                break

        self.shutdown()

    def handle_normal_mode(self, key, stdscr, dossier_max_visible, output_max_visible, max_output_offset, width):
        """Handle keys in normal mode"""

        # Global commands (work regardless of focus)
        if key == 3:  # Ctrl-C
            self.running = False
            return
        elif key == 12:  # Ctrl-L
            self.output_lines.clear()
            return
        elif key == ord('1'):
            self.focus = 'dossier'
            return
        elif key == ord('2'):
            self.focus = 'output'
            return
        elif key == ord('3'):
            self.focus = 'command'
            return

        # Insert mode triggers
        elif key == ord('i'):
            self.mode = 'insert'
            self.cursor_pos = 0
            return
        elif key == ord('I'):
            self.mode = 'insert'
            self.cursor_pos = 0
            self.current_input = ""
            return
        elif key == ord('a'):
            self.mode = 'insert'
            self.cursor_pos = len(self.current_input)
            return
        elif key == ord('A'):
            self.mode = 'insert'
            self.cursor_pos = len(self.current_input)
            return
        elif key == ord('o'):
            self.mode = 'insert'
            self.current_input = ""
            self.cursor_pos = 0
            return
        elif key == ord('O'):
            self.mode = 'insert'
            self.current_input = ""
            self.cursor_pos = 0
            return
        elif key == ord('s'):
            self.mode = 'insert'
            self.current_input = ""
            self.cursor_pos = 0
            return
        elif key == ord('S'):
            self.mode = 'insert'
            self.current_input = ""
            self.cursor_pos = 0
            return

        # Navigation based on focus
        if self.focus == 'dossier':
            self.handle_dossier_navigation(key, stdscr, dossier_max_visible, width)
        elif self.focus == 'output':
            self.handle_output_navigation(key, stdscr, output_max_visible, max_output_offset)
        elif self.focus == 'command':
            # Command line focus in normal mode - limited actions
            pass

    def handle_dossier_navigation(self, key, stdscr, max_visible, width):
        """Handle vim navigation in dossier pane"""

        # Check for pending multi-key commands
        if self.pending_key == ord('g'):
            if key == ord('g'):
                self.dossier_viewer.goto_top()
            self.pending_key = None
            return

        if key == ord('j'):
            self.dossier_viewer.scroll_down(max_visible, 1)
        elif key == ord('k'):
            self.dossier_viewer.scroll_up(1)
        elif key == ord('h'):
            self.dossier_viewer.scroll_left(1)
        elif key == ord('l'):
            self.dossier_viewer.scroll_right(1)
        elif key == ord('g'):
            self.pending_key = ord('g')
        elif key == ord('G'):
            self.dossier_viewer.goto_bottom(max_visible)
        elif key == 4:  # Ctrl-D
            self.dossier_viewer.page_down(max_visible // 2, max_visible)
        elif key == 21:  # Ctrl-U
            self.dossier_viewer.page_up(max_visible // 2)
        elif key == ord('0'):
            self.dossier_viewer.goto_line_start()
        elif key == ord('$'):
            self.dossier_viewer.goto_line_end(width)
        elif key == ord('{'):
            self.dossier_viewer.paragraph_up()
        elif key == ord('}'):
            self.dossier_viewer.paragraph_down(max_visible)

    def handle_output_navigation(self, key, stdscr, max_visible, max_offset):
        """Handle vim navigation in output pane"""

        if key == ord('j'):
            self.output_viewer.scroll_down(max_offset, 1)
        elif key == ord('k'):
            self.output_viewer.scroll_up(1)
        elif key == ord('g'):
            if self.pending_key == ord('g'):
                self.output_viewer.goto_top()
                self.pending_key = None
            else:
                self.pending_key = ord('g')
        elif key == ord('G'):
            self.output_viewer.goto_bottom(max_offset)
        elif key == 4:  # Ctrl-D
            self.output_viewer.scroll_down(max_offset, max_visible // 2)
        elif key == 21:  # Ctrl-U
            self.output_viewer.scroll_up(max_visible // 2)

    def handle_insert_mode(self, key, stdscr):
        """Handle keys in insert mode"""

        if key == 27:  # ESC
            self.mode = 'normal'
            return
        elif key in (curses.KEY_ENTER, 10, 13):  # Enter
            if self.current_input.strip():
                self.command_history.append(self.current_input)
                self.execute_command(self.current_input.strip())
                self.current_input = ""
                self.cursor_pos = 0
                self.mode = 'normal'  # Return to normal mode after command
        elif key in (curses.KEY_BACKSPACE, 127, 8):  # Backspace
            if self.cursor_pos > 0:
                self.current_input = (self.current_input[:self.cursor_pos-1] +
                                     self.current_input[self.cursor_pos:])
                self.cursor_pos -= 1
        elif key == curses.KEY_LEFT:
            self.cursor_pos = max(0, self.cursor_pos - 1)
        elif key == curses.KEY_RIGHT:
            self.cursor_pos = min(len(self.current_input), self.cursor_pos + 1)
        elif key == curses.KEY_HOME or key == 1:  # Ctrl-A
            self.cursor_pos = 0
        elif key == curses.KEY_END or key == 5:  # Ctrl-E
            self.cursor_pos = len(self.current_input)
        elif 32 <= key <= 126:  # Printable characters
            self.current_input = (self.current_input[:self.cursor_pos] +
                                 chr(key) +
                                 self.current_input[self.cursor_pos:])
            self.cursor_pos += 1

    def execute_command(self, line):
        """Execute a command or DSL statement"""
        self.add_output(f"> {line}")

        try:
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
                self.execute_dsl(line)

            self.update_dossier()

        except Exception as e:
            self.add_output(f"Error: {e}")

    def execute_import(self, import_path):
        """Import and execute a file"""
        full_path = Path("haeccstable_projects") / import_path

        if not full_path.exists():
            self.add_output(f"File not found: {full_path}")
            return

        self.add_output(f"Importing {import_path}...")

        try:
            with open(full_path, 'r') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()

                    if not line or line.startswith('#') or line.startswith('//'):
                        continue

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

            for cmd in commands:
                if cmd.get('type') == 'import':
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
    repl = HaeccstableVim()
    curses.wrapper(repl.run_curses)

if __name__ == "__main__":
    main()
