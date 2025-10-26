"""
Haeccstable Terminal UI - 3-Pane Tmux-Style Interface

Implements the terminal interface with:
- Dossier pane (top-left): displays dossier.json
- Log pane (top-right): displays log.txt
- Command pane (bottom): command input
- Status bar: shows mode and focus
"""

import curses
import json
import os
from typing import List
from vim_motions import VimMotions, Mode, Focus
from dsl_parser import DSLParser

class HaeccstableUI:
    """Main UI controller for Haeccstable terminal interface"""

    def __init__(self):
        self.vim = VimMotions()
        self.parser = DSLParser()
        self.command_buffer = ""

        # Files live in ../composition_files/
        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.composition_dir = os.path.join(base_dir, "composition_files")
        self.dossier_path = os.path.join(self.composition_dir, "dossier.json")
        self.log_path = os.path.join(self.composition_dir, "log.txt")

        # Ensure composition_files directory exists
        os.makedirs(self.composition_dir, exist_ok=True)

        # Content
        self.dossier_lines = []
        self.log_lines = []

        # Scroll offsets
        self.dossier_scroll = 0
        self.log_scroll = 0

        # Pending key for multi-key commands (gg, etc.)
        self.pending_key = None

        self.running = True

    def run(self, stdscr):
        """Main entry point called by curses.wrapper()"""
        self.stdscr = stdscr

        # Configure curses
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

        # Load initial content
        self._load_content()

        # Main event loop
        while self.running:
            height, width = stdscr.getmaxyx()

            # Calculate layout dimensions
            dossier_width = width // 2
            log_width = width - dossier_width
            pane_height = height - 5  # Leave room for command and status
            input_y = height - 3

            stdscr.clear()

            # Draw dossier pane (top-left)
            self._draw_dossier_pane(0, 0, pane_height, dossier_width)

            # Draw vertical divider between dossier and log
            self._draw_vertical_divider(0, dossier_width, pane_height)

            # Draw log pane (top-right)
            self._draw_log_pane(0, dossier_width + 1, pane_height, log_width - 1)

            # Draw separator
            sep_y = pane_height
            border_attr = curses.color_pair(5) if self.vim.focus == Focus.COMMAND else curses.color_pair(1)
            stdscr.addstr(sep_y, 0, "─" * width, border_attr)

            # Draw command pane
            self._draw_command_pane(input_y, width)

            # Draw status bar
            self._draw_status_bar(input_y + 2, width)

            stdscr.refresh()

            # Handle input
            try:
                key = stdscr.getch()

                if key == -1:  # Timeout
                    continue

                if self.vim.mode == Mode.NORMAL:
                    self._handle_normal_mode(key, pane_height, width)
                else:  # INSERT mode
                    self._handle_insert_mode(key)

            except KeyboardInterrupt:
                self.running = False
                break

    def _load_content(self):
        """Load dossier and log content"""
        # Load dossier.json
        try:
            with open(self.dossier_path, 'r') as f:
                dossier_content = f.read()
                try:
                    # Try to pretty-print JSON
                    dossier_obj = json.loads(dossier_content)
                    pretty_json = json.dumps(dossier_obj, indent=2)
                    self.dossier_lines = pretty_json.split('\n')
                except:
                    self.dossier_lines = dossier_content.split('\n')
        except FileNotFoundError:
            self.dossier_lines = ["# dossier.json not found"]

        # Load log.txt
        try:
            with open(self.log_path, 'r') as f:
                log_content = f.read()
                self.log_lines = log_content.split('\n')
        except FileNotFoundError:
            self.log_lines = ["# log.txt not found"]

    def _draw_dossier_pane(self, y, x, height, width):
        """Draw dossier pane"""
        # Draw border
        border_attr = curses.color_pair(5) if self.vim.focus == Focus.DOSSIER else curses.color_pair(1)

        # Top border
        self.stdscr.addstr(y, x, "═" * width, border_attr)
        title = " DOSSIER.JSON "
        if self.vim.focus == Focus.DOSSIER:
            title += "[FOCUSED] "
        self.stdscr.addstr(y, x + 2, title, border_attr)

        # Draw visible lines
        visible_height = height - 2
        start_idx = self.dossier_scroll
        end_idx = start_idx + visible_height

        for i, line in enumerate(self.dossier_lines[start_idx:end_idx]):
            line_y = y + i + 1
            if line_y < y + height - 1:
                display_line = line[:width-1]
                try:
                    self.stdscr.addstr(line_y, x, display_line, curses.color_pair(2))
                except curses.error:
                    pass

        # Bottom border
        if y + height - 1 < self.stdscr.getmaxyx()[0]:
            self.stdscr.addstr(y + height - 1, x, "─" * width, border_attr)

    def _draw_vertical_divider(self, y, x, height):
        """Draw thin vertical divider line between panes"""
        try:
            # Draw vertical line
            for i in range(height):
                self.stdscr.addstr(y + i, x, "│", curses.color_pair(1))
        except curses.error:
            pass

    def _draw_log_pane(self, y, x, height, width):
        """Draw log pane"""
        # Draw border
        border_attr = curses.color_pair(5) if self.vim.focus == Focus.LOG else curses.color_pair(1)

        # Top border
        try:
            self.stdscr.addstr(y, x, "═" * width, border_attr)
            title = " LOG "
            if self.vim.focus == Focus.LOG:
                title += "[FOCUSED] "
            self.stdscr.addstr(y, x + 2, title, border_attr)
        except curses.error:
            pass

        # Draw visible lines
        visible_height = height - 2
        start_idx = self.log_scroll
        end_idx = start_idx + visible_height

        for i, line in enumerate(self.log_lines[start_idx:end_idx]):
            line_y = y + i + 1
            if line_y < y + height - 1:
                display_line = line[:width-1]
                try:
                    self.stdscr.addstr(line_y, x, display_line)
                except curses.error:
                    pass

        # Bottom border
        if y + height - 1 < self.stdscr.getmaxyx()[0]:
            try:
                self.stdscr.addstr(y + height - 1, x, "─" * width, border_attr)
            except curses.error:
                pass

    def _draw_command_pane(self, y, width):
        """Draw command input pane"""
        # Draw mode indicator and input
        if self.vim.mode == Mode.INSERT:
            mode_str = "-- INSERT --"
            mode_attr = curses.color_pair(6)
            curses.curs_set(1)  # Show cursor in insert mode
        else:
            mode_str = f"-- NORMAL -- [Focus: {self.vim.focus.name}]"
            mode_attr = curses.color_pair(4)
            curses.curs_set(0)  # Hide cursor in normal mode

        # Draw command line
        prompt = "haeccstable> "
        try:
            if self.vim.mode == Mode.INSERT and self.vim.focus == Focus.COMMAND:
                self.stdscr.addstr(y, 0, prompt, curses.color_pair(3))
                display_input = self.command_buffer[:width-len(prompt)-1]
                self.stdscr.addstr(y, len(prompt), display_input)
                # Position cursor
                cursor_x = min(len(prompt) + self.vim.cursor_col, width - 1)
                self.stdscr.move(y, cursor_x)
            else:
                self.stdscr.addstr(y, 0, prompt, curses.A_DIM)
                self.stdscr.addstr(y, len(prompt), self.command_buffer[:width-len(prompt)-1], curses.A_DIM)
        except curses.error:
            pass

    def _draw_status_bar(self, y, width):
        """Draw status line at bottom"""
        try:
            if self.vim.mode == Mode.INSERT:
                mode_str = "-- INSERT --"
                mode_attr = curses.color_pair(6)
            else:
                mode_str = f"-- NORMAL -- [Focus: {self.vim.focus.name}]"
                mode_attr = curses.color_pair(4)

            status_left = mode_str
            status_right = "1:dossier 2:log 3:command | 'exit' to quit"

            self.stdscr.addstr(y, 0, status_left, mode_attr)
            right_x = max(len(status_left) + 2, width - len(status_right) - 1)
            if right_x + len(status_right) < width:
                self.stdscr.addstr(y, right_x, status_right, curses.A_DIM)
        except curses.error:
            pass

    def _handle_normal_mode(self, key, pane_height, width):
        """Handle keys in normal mode"""
        # Global commands
        if key == ord('1'):
            self.vim.focus = Focus.DOSSIER
            return
        elif key == ord('2'):
            self.vim.focus = Focus.LOG
            return
        elif key == ord('3'):
            self.vim.focus = Focus.COMMAND
            return

        # Insert mode triggers (only for command pane)
        elif key in [ord('i'), ord('a'), ord('o'), ord('I'), ord('A'), ord('O'), ord('s'), ord('S')]:
            if self.vim.focus == Focus.COMMAND:
                self.vim.mode = Mode.INSERT
                self.vim.cursor_col = len(self.command_buffer) if key in [ord('a'), ord('A')] else 0
                return

        # Navigation based on focus
        if self.vim.focus == Focus.DOSSIER:
            self._handle_dossier_navigation(key, pane_height - 2)
        elif self.vim.focus == Focus.LOG:
            self._handle_log_navigation(key, pane_height - 2)

    def _handle_dossier_navigation(self, key, max_visible):
        """Handle vim navigation in dossier pane"""
        # Check for pending multi-key commands
        if self.pending_key == ord('g'):
            if key == ord('g'):
                self.dossier_scroll = 0
            self.pending_key = None
            return

        if key == ord('j'):
            max_scroll = max(0, len(self.dossier_lines) - max_visible)
            self.dossier_scroll = min(max_scroll, self.dossier_scroll + 1)
        elif key == ord('k'):
            self.dossier_scroll = max(0, self.dossier_scroll - 1)
        elif key == ord('g'):
            self.pending_key = ord('g')
        elif key == ord('G'):
            self.dossier_scroll = max(0, len(self.dossier_lines) - max_visible)
        elif key == 4:  # Ctrl-D
            max_scroll = max(0, len(self.dossier_lines) - max_visible)
            self.dossier_scroll = min(max_scroll, self.dossier_scroll + max_visible // 2)
        elif key == 21:  # Ctrl-U
            self.dossier_scroll = max(0, self.dossier_scroll - max_visible // 2)

    def _handle_log_navigation(self, key, max_visible):
        """Handle vim navigation in log pane"""
        # Check for pending multi-key commands
        if self.pending_key == ord('g'):
            if key == ord('g'):
                self.log_scroll = 0
            self.pending_key = None
            return

        if key == ord('j'):
            max_scroll = max(0, len(self.log_lines) - max_visible)
            self.log_scroll = min(max_scroll, self.log_scroll + 1)
        elif key == ord('k'):
            self.log_scroll = max(0, self.log_scroll - 1)
        elif key == ord('g'):
            self.pending_key = ord('g')
        elif key == ord('G'):
            self.log_scroll = max(0, len(self.log_lines) - max_visible)
        elif key == 4:  # Ctrl-D
            max_scroll = max(0, len(self.log_lines) - max_visible)
            self.log_scroll = min(max_scroll, self.log_scroll + max_visible // 2)
        elif key == 21:  # Ctrl-U
            self.log_scroll = max(0, self.log_scroll - max_visible // 2)

    def _handle_insert_mode(self, key):
        """Handle keys in insert mode"""
        if key == 27:  # ESC
            self.vim.mode = Mode.NORMAL
            return
        elif key in [curses.KEY_ENTER, 10, 13]:  # Enter
            if self.command_buffer.strip():
                self._execute_command(self.command_buffer.strip())
                self.command_buffer = ""
                self.vim.cursor_col = 0
                # Stay in INSERT mode after command execution
        elif key in [curses.KEY_BACKSPACE, 127, 8]:  # Backspace
            if self.vim.cursor_col > 0:
                self.command_buffer = (self.command_buffer[:self.vim.cursor_col-1] +
                                     self.command_buffer[self.vim.cursor_col:])
                self.vim.cursor_col -= 1
            elif len(self.command_buffer) > 0 and self.vim.cursor_col == 0:
                # Delete at position 0
                self.command_buffer = self.command_buffer[1:]
        elif key == curses.KEY_LEFT:
            self.vim.cursor_col = max(0, self.vim.cursor_col - 1)
        elif key == curses.KEY_RIGHT:
            self.vim.cursor_col = min(len(self.command_buffer), self.vim.cursor_col + 1)
        elif 32 <= key <= 126:  # Printable characters
            self.command_buffer = (self.command_buffer[:self.vim.cursor_col] +
                                 chr(key) +
                                 self.command_buffer[self.vim.cursor_col:])
            self.vim.cursor_col += 1

    def _execute_command(self, command: str):
        """Execute a DSL command or special command"""
        # Log command
        self._log_message(f"> {command}")

        # Check for special commands
        if command == "exit":
            self.running = False
            return

        elif command == "clear log.txt":
            self._clear_log()
            return

        elif command.startswith("save dossier.json "):
            filename = command.split(None, 2)[2] if len(command.split(None, 2)) > 2 else None
            if filename:
                self._save_dossier(filename)
            else:
                self._log_message("✗ Usage: save dossier.json <filename.json>")
            return

        elif command.startswith("save log.txt "):
            filename = command.split(None, 2)[2] if len(command.split(None, 2)) > 2 else None
            if filename:
                self._save_log(filename)
            else:
                self._log_message("✗ Usage: save log.txt <filename.txt>")
            return

        # Parse and execute DSL command
        try:
            result = self.parser.parse(command)

            if result.get("status") == "success":
                self._log_message(f"✓ {result.get('message', 'OK')}")
            else:
                self._log_message(f"✗ {result.get('error', 'Parse error')}")

        except Exception as e:
            self._log_message(f"✗ Error: {str(e)}")

        # Reload content
        self._load_content()

        # Auto-scroll log to bottom
        self.log_scroll = max(0, len(self.log_lines) - 10)

    def _log_message(self, message: str):
        """Log a message to log.txt"""
        try:
            with open(self.log_path, 'a') as f:
                f.write(f"{message}\n")

            # Reload log
            with open(self.log_path, 'r') as f:
                self.log_lines = f.read().split('\n')
        except Exception:
            pass

    def _clear_log(self):
        """Clear the log.txt file"""
        try:
            with open(self.log_path, 'w') as f:
                f.write("# Haeccstable Session Log\n")
                f.write("# Cleared\n")

            self._log_message("✓ Log cleared")
            self._load_content()

        except Exception as e:
            self._log_message(f"✗ Error clearing log: {str(e)}")

    def _save_dossier(self, filename: str):
        """Save current dossier.json to a new file"""
        import shutil

        try:
            # Ensure filename ends with .json
            if not filename.endswith('.json'):
                filename += '.json'

            # Save to composition_files directory
            dest_path = os.path.join(self.composition_dir, filename)

            # Copy current dossier
            shutil.copy2(self.dossier_path, dest_path)

            self._log_message(f"✓ Saved dossier to {filename}")

        except Exception as e:
            self._log_message(f"✗ Error saving dossier: {str(e)}")

    def _save_log(self, filename: str):
        """Save current log.txt to a new file"""
        import shutil

        try:
            # Ensure filename ends with .txt
            if not filename.endswith('.txt'):
                filename += '.txt'

            # Save to composition_files directory
            dest_path = os.path.join(self.composition_dir, filename)

            # Copy current log
            shutil.copy2(self.log_path, dest_path)

            self._log_message(f"✓ Saved log to {filename}")

        except Exception as e:
            self._log_message(f"✗ Error saving log: {str(e)}")
