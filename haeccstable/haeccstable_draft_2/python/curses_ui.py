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
import re
from typing import List, Dict, Any
from vim_motions import VimMotions, Mode, Focus
from dsl_parser import DSLParser
from ipc_client import ipc_client

class HaeccstableUI:
    """Main UI controller for Haeccstable terminal interface"""

    def __init__(self):
        self.vim = VimMotions()
        self.parser = DSLParser()
        self.command_buffer = ""
        self.ipc_client = ipc_client

        # Files live in ../composition_files/
        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.composition_dir = os.path.join(base_dir, "composition_files")
        self.dossier_path = os.path.join(self.composition_dir, "dossier.json")
        self.log_path = os.path.join(self.composition_dir, "log.txt")

        # Ensure composition_files directory exists
        os.makedirs(self.composition_dir, exist_ok=True)

        # Connect to Swift app via IPC
        self._connect_to_swift()

        # Content (raw lines before wrapping)
        self.dossier_lines = []
        self.log_lines = []

        # Wrapped content (physical lines after wrapping)
        self.dossier_wrapped = []
        self.log_wrapped = []

        # Scroll offsets
        self.dossier_scroll = 0
        self.log_scroll = 0

        # Cursor position for each pane (row, col in wrapped lines)
        self.dossier_cursor = (0, 0)
        self.log_cursor = (0, 0)
        self.command_cursor = (0, 0)

        # Pending key for multi-key commands (gg, etc.)
        self.pending_key = None

        # Cursor blink state
        self.cursor_visible = True
        self.cursor_blink_counter = 0

        self.running = True

    def _connect_to_swift(self):
        """Connect to Swift app via IPC"""
        connected = self.ipc_client.connect()
        if not connected:
            # Swift app not running yet, that's okay
            # Commands will just not be sent to Swift
            pass

    def _wrap_text(self, lines: List[str], max_width: int) -> List[str]:
        """Wrap text to fit within max_width, returning list of physical lines"""
        wrapped = []
        for line in lines:
            if len(line) <= max_width:
                wrapped.append(line)
            else:
                # Wrap long lines
                while len(line) > max_width:
                    wrapped.append(line[:max_width])
                    line = line[max_width:]
                if line:
                    wrapped.append(line)
        return wrapped if wrapped else [""]

    def run(self, stdscr):
        """Main entry point called by curses.wrapper()"""
        self.stdscr = stdscr

        # Configure curses
        curses.curs_set(1)  # Show cursor
        stdscr.nodelay(False)
        stdscr.timeout(200)  # 200ms timeout for cursor blinking

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

            # Wrap content for each pane
            self.dossier_wrapped = self._wrap_text(self.dossier_lines, dossier_width - 2)
            self.log_wrapped = self._wrap_text(self.log_lines, log_width - 3)

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

            # Position cursor based on focus
            self._position_cursor(pane_height, dossier_width, log_width, input_y)

            stdscr.refresh()

            # Handle cursor blinking
            self.cursor_blink_counter += 1
            if self.cursor_blink_counter >= 2:  # Blink every ~400ms (2 * 200ms timeout)
                self.cursor_visible = not self.cursor_visible
                self.cursor_blink_counter = 0

            # Handle input
            try:
                key = stdscr.getch()

                if key == -1:  # Timeout - just blink cursor
                    continue

                # Reset cursor visibility on keypress
                self.cursor_visible = True
                self.cursor_blink_counter = 0

                if self.vim.mode == Mode.NORMAL:
                    self._handle_normal_mode(key, pane_height, width, dossier_width, log_width)
                else:  # INSERT mode
                    self._handle_insert_mode(key)

            except KeyboardInterrupt:
                self.running = False
                break

    def _position_cursor(self, pane_height, dossier_width, log_width, input_y):
        """Position cursor based on current focus and mode"""
        if not self.cursor_visible:
            curses.curs_set(0)
            return

        curses.curs_set(1)  # Block cursor

        if self.vim.focus == Focus.DOSSIER:
            row, col = self.dossier_cursor
            # Adjust for scroll and border
            visible_row = row - self.dossier_scroll
            if 0 <= visible_row < pane_height - 2:
                screen_y = visible_row + 1  # +1 for top border
                screen_x = min(col, dossier_width - 2)
                try:
                    self.stdscr.move(screen_y, screen_x)
                except curses.error:
                    pass

        elif self.vim.focus == Focus.LOG:
            row, col = self.log_cursor
            # Adjust for scroll and border
            visible_row = row - self.log_scroll
            if 0 <= visible_row < pane_height - 2:
                screen_y = visible_row + 1  # +1 for top border
                screen_x = dossier_width + 1 + min(col, log_width - 3)
                try:
                    self.stdscr.move(screen_y, screen_x)
                except curses.error:
                    pass

        elif self.vim.focus == Focus.COMMAND:
            if self.vim.mode == Mode.INSERT:
                prompt_len = len("haeccstable> ")
                cursor_x = min(prompt_len + self.vim.cursor_col, self.stdscr.getmaxyx()[1] - 1)
                try:
                    self.stdscr.move(input_y, cursor_x)
                except curses.error:
                    pass

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
        """Draw dossier pane with wrapped text"""
        # Draw border
        border_attr = curses.color_pair(5) if self.vim.focus == Focus.DOSSIER else curses.color_pair(1)

        # Top border
        self.stdscr.addstr(y, x, "═" * width, border_attr)
        title = " DOSSIER.JSON "
        if self.vim.focus == Focus.DOSSIER:
            title += "[FOCUSED] "
        self.stdscr.addstr(y, x + 2, title, border_attr)

        # Draw visible wrapped lines
        visible_height = height - 2
        start_idx = self.dossier_scroll
        end_idx = start_idx + visible_height

        for i, line in enumerate(self.dossier_wrapped[start_idx:end_idx]):
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
        """Draw log pane with wrapped text"""
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

        # Draw visible wrapped lines
        visible_height = height - 2
        start_idx = self.log_scroll
        end_idx = start_idx + visible_height

        for i, line in enumerate(self.log_wrapped[start_idx:end_idx]):
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

    def _handle_normal_mode(self, key, pane_height, width, dossier_width, log_width):
        """Handle keys in normal mode"""
        # Global commands
        if key == ord('1'):
            self.vim.focus = Focus.DOSSIER
            self.dossier_cursor = (0, 0)
            return
        elif key == ord('2'):
            self.vim.focus = Focus.LOG
            self.log_cursor = (0, 0)
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
            self._handle_pane_navigation(key, pane_height - 2, self.dossier_wrapped,
                                         self.dossier_cursor, 'dossier', dossier_width - 2)
        elif self.vim.focus == Focus.LOG:
            self._handle_pane_navigation(key, pane_height - 2, self.log_wrapped,
                                         self.log_cursor, 'log', log_width - 3)

    def _handle_pane_navigation(self, key, max_visible, lines, cursor_tuple, pane_name, max_width):
        """Handle vim navigation in any pane (dossier or log)"""
        row, col = cursor_tuple

        # Check for pending multi-key commands
        if self.pending_key == ord('g'):
            if key == ord('g'):
                # gg - go to top
                row, col = 0, 0
                if pane_name == 'dossier':
                    self.dossier_scroll = 0
                    self.dossier_cursor = (row, col)
                else:
                    self.log_scroll = 0
                    self.log_cursor = (row, col)
            self.pending_key = None
            return

        # Check for dd (delete line) - only in log pane
        elif self.pending_key == ord('d'):
            if key == ord('d') and pane_name == 'log':
                # Delete current line from log (cleanup history)
                self._delete_log_line(row)
                self.pending_key = None
                return
            self.pending_key = None
            return

        max_lines = len(lines)
        current_line = lines[row] if row < max_lines else ""

        # Basic movement
        if key == ord('h'):
            col = max(0, col - 1)
        elif key == ord('l'):
            col = min(len(current_line), col + 1)
        elif key == ord('j'):
            if row < max_lines - 1:
                row += 1
                # Adjust column to fit new line
                new_line = lines[row] if row < max_lines else ""
                col = min(col, len(new_line))
        elif key == ord('k'):
            if row > 0:
                row -= 1
                # Adjust column to fit new line
                new_line = lines[row] if row < max_lines else ""
                col = min(col, len(new_line))

        # Word movement
        elif key == ord('w'):
            row, col = self._move_word_forward(lines, row, col)
        elif key == ord('b'):
            row, col = self._move_word_backward(lines, row, col)
        elif key == ord('e'):
            row, col = self._move_word_end(lines, row, col)
        elif key == ord('E'):
            row, col = self._move_WORD_end(lines, row, col)
        elif key == ord('B'):
            row, col = self._move_WORD_backward(lines, row, col)

        # Line movement
        elif key == ord('0'):
            col = 0
        elif key == ord('$'):
            col = max(0, len(current_line) - 1) if current_line else 0

        # Delete/edit (only in log pane)
        elif key == ord('d') and pane_name == 'log':
            self.pending_key = ord('d')

        # File movement
        elif key == ord('g'):
            self.pending_key = ord('g')
        elif key == ord('G'):
            row = max(0, max_lines - 1)
            col = 0

        # Paragraph movement
        elif key == ord('{'):
            row, col = self._move_paragraph_backward(lines, row)
        elif key == ord('}'):
            row, col = self._move_paragraph_forward(lines, row)

        # Page movement
        elif key == 4:  # Ctrl-D
            row = min(max_lines - 1, row + max_visible // 2)
            col = min(col, len(lines[row]) if row < max_lines else 0)
        elif key == 21:  # Ctrl-U
            row = max(0, row - max_visible // 2)
            col = min(col, len(lines[row]) if row < max_lines else 0)

        # Update cursor and scroll
        if pane_name == 'dossier':
            self.dossier_cursor = (row, col)
            # Auto-scroll to keep cursor visible
            if row < self.dossier_scroll:
                self.dossier_scroll = row
            elif row >= self.dossier_scroll + max_visible:
                self.dossier_scroll = row - max_visible + 1
        else:
            self.log_cursor = (row, col)
            # Auto-scroll to keep cursor visible
            if row < self.log_scroll:
                self.log_scroll = row
            elif row >= self.log_scroll + max_visible:
                self.log_scroll = row - max_visible + 1

    def _move_word_forward(self, lines, row, col):
        """Move to start of next word (w motion)"""
        if row >= len(lines):
            return row, col

        line = lines[row]
        pos = col

        # Skip current word
        while pos < len(line) and line[pos].isalnum():
            pos += 1
        # Skip whitespace
        while pos < len(line) and not line[pos].isalnum():
            pos += 1

        if pos < len(line):
            return row, pos
        elif row < len(lines) - 1:
            return row + 1, 0
        return row, col

    def _move_word_backward(self, lines, row, col):
        """Move to start of previous word (b motion)"""
        if row >= len(lines):
            return row, 0

        line = lines[row]
        pos = col

        # Move back one position first
        if pos > 0:
            pos -= 1
        elif row > 0:
            row -= 1
            line = lines[row]
            pos = len(line)
        else:
            return row, col

        # Skip whitespace
        while pos > 0 and not line[pos].isalnum():
            pos -= 1
        # Skip word
        while pos > 0 and line[pos - 1].isalnum():
            pos -= 1

        return row, pos

    def _move_word_end(self, lines, row, col):
        """Move to end of current/next word (e motion)"""
        if row >= len(lines):
            return row, col

        line = lines[row]
        pos = col

        # Move forward one if at end of word
        if pos < len(line) and line[pos].isalnum():
            pos += 1

        # Skip non-word characters
        while pos < len(line) and not line[pos].isalnum():
            pos += 1

        # Move to end of word
        while pos < len(line) and line[pos].isalnum():
            pos += 1

        if pos > 0:
            return row, pos - 1
        elif row < len(lines) - 1:
            return self._move_word_end(lines, row + 1, 0)
        return row, col

    def _move_WORD_end(self, lines, row, col):
        """Move to end of current/next WORD (E motion) - whitespace delimited"""
        if row >= len(lines):
            return row, col

        line = lines[row]
        pos = col

        # Move forward one if not at whitespace
        if pos < len(line) and not line[pos].isspace():
            pos += 1

        # Skip whitespace
        while pos < len(line) and line[pos].isspace():
            pos += 1

        # Move to end of WORD (non-whitespace)
        while pos < len(line) and not line[pos].isspace():
            pos += 1

        if pos > 0:
            return row, pos - 1
        elif row < len(lines) - 1:
            return self._move_WORD_end(lines, row + 1, 0)
        return row, col

    def _move_WORD_backward(self, lines, row, col):
        """Move to start of previous WORD (B motion) - whitespace delimited"""
        if row >= len(lines):
            return row, 0

        line = lines[row]
        pos = col

        # Move back one position first
        if pos > 0:
            pos -= 1
        elif row > 0:
            row -= 1
            line = lines[row]
            pos = len(line)
        else:
            return row, col

        # Skip whitespace
        while pos > 0 and line[pos].isspace():
            pos -= 1
        # Skip WORD
        while pos > 0 and not line[pos - 1].isspace():
            pos -= 1

        return row, pos

    def _move_paragraph_forward(self, lines, row):
        """Move to next blank line that borders text (} motion)"""
        row += 1
        if row >= len(lines):
            return len(lines) - 1, 0

        # Look for next blank line that has text adjacent to it
        while row < len(lines):
            current_is_blank = not lines[row].strip()

            # Check if this blank line has text before or after it
            if current_is_blank:
                has_text_before = row > 0 and lines[row - 1].strip()
                has_text_after = row < len(lines) - 1 and lines[row + 1].strip()

                if has_text_before or has_text_after:
                    return row, 0

            row += 1

        return len(lines) - 1, 0

    def _move_paragraph_backward(self, lines, row):
        """Move to previous blank line that borders text ({ motion)"""
        row -= 1
        if row < 0:
            return 0, 0

        # Look for previous blank line that has text adjacent to it
        while row >= 0:
            current_is_blank = not lines[row].strip()

            # Check if this blank line has text before or after it
            if current_is_blank:
                has_text_before = row > 0 and lines[row - 1].strip()
                has_text_after = row < len(lines) - 1 and lines[row + 1].strip()

                if has_text_before or has_text_after:
                    return row, 0

            row -= 1

        return 0, 0

    def _delete_log_line(self, line_number: int):
        """Delete a line from the log file AND clean up dossier/processes"""
        # Get the line to analyze what needs to be cleaned up
        if 0 <= line_number < len(self.log_lines):
            line_to_delete = self.log_lines[line_number]

            # Parse the line to determine what to clean up
            self._cleanup_dossier_from_line(line_to_delete)

            # Delete from log
            del self.log_lines[line_number]

            # Write updated log back to file
            try:
                with open(self.log_path, 'w') as f:
                    f.write('\n'.join(self.log_lines))
                # Reload to update display
                self._load_content()
            except Exception:
                pass

    def _cleanup_dossier_from_line(self, line: str):
        """
        Parse a log line and remove corresponding objects from dossier.
        Also sends cleanup messages to Swift to stop processes.
        """
        stripped = line.strip()

        # Only process command lines (starting with >)
        if not stripped.startswith('>'):
            return

        # Extract the actual command
        command = stripped[1:].strip()

        try:
            # Load current dossier
            with open(self.dossier_path, 'r') as f:
                dossier = json.load(f)

            modified = False

            # Parse variable declarations: type name = ...
            var_decl_pattern = r'^(video_invar|video_outvar|audio_invar|audio_outvar|window_var|layer_obj|number_var|var)\s+(\w+)\s*='
            match = re.match(var_decl_pattern, command)
            if match:
                var_type = match.group(1)
                var_name = match.group(2)

                # Remove from dossier variables
                if 'variables' in dossier and var_name in dossier['variables']:
                    del dossier['variables'][var_name]
                    modified = True

                    # Send cleanup message to Swift (stop capture, close window, etc.)
                    self._send_cleanup_message(var_name, var_type)

            # Parse function definitions: func name(...) = ...
            func_pattern = r'^func\s+(\w+)\s*\('
            match = re.match(func_pattern, command)
            if match:
                func_name = match.group(1)
                if 'functions' in dossier and func_name in dossier['functions']:
                    del dossier['functions'][func_name]
                    modified = True

            # Parse process definitions: process $name(...) { ... }
            proc_pattern = r'^process\s+\$(\w+)\s*\('
            match = re.match(proc_pattern, command)
            if match:
                proc_name = match.group(1)
                if 'processes' in dossier and proc_name in dossier['processes']:
                    del dossier['processes'][proc_name]
                    modified = True

            # Parse method calls: object.method(...)
            # This undoes operations like layer.cast(webcam), win.project(layer)
            method_pattern = r'^(\w+)\.(\w+)\s*\('
            match = re.match(method_pattern, command)
            if match:
                obj_name = match.group(1)
                method_name = match.group(2)

                # Send undo message to Swift
                self._send_undo_method_message(obj_name, method_name, command)
                modified = True

            # Parse property assignments: object.property = value
            prop_pattern = r'^(\w+)\.(\w+)\s*='
            match = re.match(prop_pattern, command)
            if match:
                obj_name = match.group(1)
                prop_name = match.group(2)

                # Send undo message to Swift (reset property)
                self._send_undo_property_message(obj_name, prop_name)
                modified = True

            # Parse process calls: $process_name(...)
            proc_call_pattern = r'^\$(\w+)\s*\('
            match = re.match(proc_call_pattern, command)
            if match:
                proc_name = match.group(1)

                # Send message to Swift to stop/undo process
                self._send_stop_process_message(proc_name, command)
                modified = True

            # Write updated dossier if modified
            if modified:
                with open(self.dossier_path, 'w') as f:
                    json.dump(dossier, f, indent=2)

        except Exception as e:
            # Log error but don't crash
            self._log_message(f"# Error cleaning up from line: {str(e)}")

    def _send_cleanup_message(self, var_name: str, var_type: str):
        """Send IPC message to Swift to clean up a variable (stop capture, close window, etc.)"""
        try:
            message = {
                "type": "cleanup_variable",
                "variable_name": var_name,
                "variable_type": var_type
            }
            # IPC client will handle sending to Swift
            # For now, just log the intent
            self._log_message(f"# Cleaning up {var_type} '{var_name}'")

            # TODO: When IPC is fully implemented in Phase 2:
            # self.ipc_client.send(message)

        except Exception:
            pass

    def _send_undo_method_message(self, obj_name: str, method_name: str, full_command: str):
        """Send IPC message to Swift to undo a method call"""
        try:
            message = {
                "type": "undo_method",
                "object": obj_name,
                "method": method_name,
                "original_command": full_command
            }
            self._log_message(f"# Undoing {obj_name}.{method_name}(...)")

            # TODO: When IPC is fully implemented:
            # self.ipc_client.send(message)

        except Exception:
            pass

    def _send_undo_property_message(self, obj_name: str, prop_name: str):
        """Send IPC message to Swift to reset a property"""
        try:
            message = {
                "type": "undo_property",
                "object": obj_name,
                "property": prop_name
            }
            self._log_message(f"# Resetting {obj_name}.{prop_name}")

            # TODO: When IPC is fully implemented:
            # self.ipc_client.send(message)

        except Exception:
            pass

    def _send_stop_process_message(self, proc_name: str, full_command: str):
        """Send IPC message to Swift to stop/undo a process"""
        try:
            message = {
                "type": "stop_process",
                "process_name": proc_name,
                "original_command": full_command
            }
            self._log_message(f"# Stopping process ${proc_name}")

            # TODO: When IPC is fully implemented:
            # self.ipc_client.send(message)

        except Exception:
            pass

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

    def _send_to_swift(self, parse_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert parse result to IPC message and send to Swift.

        Args:
            parse_result: The result from DSL parser

        Returns:
            Response from Swift app
        """
        command_type = parse_result.get("type")

        if command_type == "variable_declaration":
            # Convert variable declaration to IPC format
            message = {
                "type": "declare_variable",
                "data": {
                    "var_type": parse_result.get("var_type"),
                    "name": parse_result.get("name"),
                    "value": self._extract_value(parse_result.get("expression"))
                }
            }

        elif command_type == "function_definition":
            # Convert function definition to IPC format
            message = {
                "type": "define_function",
                "data": {
                    "name": parse_result.get("name"),
                    "parameters": parse_result.get("parameters", []),
                    "body": str(parse_result.get("expression"))
                }
            }

        elif command_type == "process_definition":
            # Convert process definition to IPC format
            message = {
                "type": "define_process",
                "data": {
                    "name": parse_result.get("name"),
                    "parameters": parse_result.get("parameters", []),
                    "body": parse_result.get("body")
                }
            }

        elif command_type == "process_call":
            # Convert process call to IPC format
            message = {
                "type": "call_process",
                "data": {
                    "name": parse_result.get("name"),
                    "arguments": parse_result.get("arguments", {})
                }
            }

        elif command_type == "function_call":
            # Convert function call to IPC format
            message = {
                "type": "call_function",
                "data": {
                    "name": parse_result.get("name"),
                    "arguments": parse_result.get("arguments", [])
                }
            }

        elif command_type == "method_call":
            # Convert method call to IPC format
            message = {
                "type": "method_call",
                "data": {
                    "object": parse_result.get("object"),
                    "method": parse_result.get("method"),
                    "arguments": parse_result.get("arguments", [])
                }
            }

        elif command_type == "property_assignment":
            # Convert property assignment to IPC format
            message = {
                "type": "property_assignment",
                "data": {
                    "object": parse_result.get("object"),
                    "property": parse_result.get("property"),
                    "value": self._extract_value(parse_result.get("value"))
                }
            }

        else:
            # Unknown command type, return local success
            return {"status": "success", "message": parse_result.get("message", "OK")}

        # Send message to Swift via IPC
        return self.ipc_client.send_command(message)

    def _extract_value(self, expression: Any) -> Any:
        """Extract value from expression dict returned by parser"""
        if expression is None:
            return None
        if isinstance(expression, dict):
            expr_type = expression.get("type")
            # Handle all literal types (string, number, boolean, literal)
            if expr_type in ["literal", "string", "number", "boolean"]:
                return expression.get("value")
            elif expr_type == "identifier":
                return expression.get("name")
            elif expr_type == "tuple":
                return expression.get("elements", [])
            else:
                # Return the whole expression for complex cases
                return expression
        else:
            return expression

    def _execute_command(self, command: str):
        """Execute a DSL command or special command"""
        # Check for special commands
        if command == "exit":
            self.running = False
            return

        elif command == "---":
            # Add two newlines to log (visual separator)
            self._log_message("")
            self._log_message("")
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

        # Check for print() and println() functions
        elif command.startswith("print(") or command.startswith("println("):
            self._handle_print_command(command)
            return

        # Check for import command
        elif command.startswith("import "):
            self._handle_import_command(command)
            return

        # Log command for regular DSL commands
        self._log_message(f"> {command}")

        # Parse and execute DSL command
        try:
            result = self.parser.parse(command)

            if result.get("status") == "success":
                # Check if it's a print statement (handled locally)
                if result.get("type") == "print_statement":
                    self._handle_print_statement(result)
                else:
                    # Send command to Swift via IPC
                    ipc_response = self._send_to_swift(result)

                    if ipc_response.get("status") == "success":
                        self._log_message(f"✓ {ipc_response.get('message', 'OK')}")
                    else:
                        self._log_message(f"✗ {ipc_response.get('error', 'Execution error')}")
            else:
                self._log_message(f"✗ {result.get('error', 'Parse error')}")

        except Exception as e:
            self._log_message(f"✗ Error: {str(e)}")

        # Reload content
        self._load_content()

        # Auto-scroll log to bottom
        self.log_scroll = max(0, len(self.log_lines) - 10)

    def _handle_print_statement(self, parse_result: Dict[str, Any]):
        """Handle parsed print/println statement with printf-style formatting"""
        try:
            func_name = parse_result.get("function", "print")
            arguments = parse_result.get("arguments", [])

            if not arguments:
                # Empty print
                output = ""
            elif len(arguments) == 1:
                # Single argument - just print its value
                output = self._format_value(arguments[0])
            else:
                # Multiple arguments - treat first as format string
                format_str = self._format_value(arguments[0])
                values = [self._format_value(arg) for arg in arguments[1:]]

                # Try Python-style formatting
                try:
                    # Support both % formatting and .format() style
                    if '%' in format_str:
                        output = format_str % tuple(values)
                    elif '{' in format_str:
                        output = format_str.format(*values)
                    else:
                        # No format specifiers, just concatenate with spaces
                        output = format_str + ' ' + ' '.join(str(v) for v in values)
                except (TypeError, ValueError) as e:
                    # If formatting fails, just concatenate with spaces
                    output = ' '.join([format_str] + [str(v) for v in values])

            # Output with # prefix (console output marker)
            self._log_message(f"# {output}")

            # Extra newline for println
            if func_name == "println":
                self._log_message("")

        except Exception as e:
            self._log_message(f"# Error in {func_name}: {str(e)}")

        # Reload content
        self._load_content()

    def _format_value(self, expr: Any) -> Any:
        """Format an expression value for printing"""
        if expr is None:
            return "null"
        if isinstance(expr, dict):
            expr_type = expr.get("type")
            if expr_type in ["literal", "string", "number", "boolean"]:
                value = expr.get("value")
                # Return the raw value (not as string unless it's already a string)
                return value
            elif expr_type == "identifier":
                # Would need to look up variable value - for now return the name
                return f"<{expr.get('name')}>"
            elif expr_type == "tuple":
                elements = expr.get("elements", [])
                return tuple(self._format_value(e) for e in elements)
            else:
                return str(expr)
        else:
            return expr

    def _handle_print_command(self, command: str):
        """Handle print() and println() console output functions (legacy)"""
        # Log the command itself
        self._log_message(f"> {command}")

        # Extract content from parentheses
        try:
            # Find content between parentheses
            start = command.index('(')
            end = command.rindex(')')
            content = command[start+1:end].strip()

            # Remove quotes if it's a string literal
            if (content.startswith('"') and content.endswith('"')) or \
               (content.startswith("'") and content.endswith("'")):
                content = content[1:-1]

            # Output with # prefix (console output marker)
            if command.startswith("println"):
                self._log_message(f"# {content}")
                self._log_message("")  # Extra newline for println
            else:
                self._log_message(f"# {content}")

        except Exception as e:
            self._log_message(f"# Error in print: {str(e)}")

        # Reload content
        self._load_content()

    def _handle_import_command(self, command: str):
        """Handle import filename.txt - executes lines from file"""
        # Log the command
        self._log_message(f"> {command}")

        try:
            # Extract filename from "import filename.txt"
            filename = command[7:].strip()  # Remove "import "

            # Build full path (look in composition_files/)
            filepath = os.path.join(self.composition_dir, filename)

            # Read file
            with open(filepath, 'r') as f:
                lines = f.readlines()

            # Execute only lines starting with >
            # Ignore # output lines and // comments
            commands_executed = 0
            for line in lines:
                stripped = line.strip()
                if stripped.startswith('>'):
                    # Extract command after '> '
                    cmd = stripped[1:].strip()
                    if cmd:
                        self._execute_command(cmd)
                        commands_executed += 1
                # Ignore lines starting with # (output) or // (comments)

            self._log_message(f"# Imported {commands_executed} commands from {filename}")

        except FileNotFoundError:
            self._log_message(f"# Error: File not found: {filename}")
        except Exception as e:
            self._log_message(f"# Error importing file: {str(e)}")

        # Reload content
        self._load_content()

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
        """Clear the log.txt file and reset dossier"""
        try:
            with open(self.log_path, 'w') as f:
                f.write("# Haeccstable Session Log\n")
                f.write("# Cleared\n")

            # Also clear the dossier by sending a reset message to Swift
            if self.ipc_client.is_connected():
                reset_message = {
                    "type": "reset_state",
                    "data": {}
                }
                response = self.ipc_client.send_command(reset_message)
                if response.get("status") == "success":
                    self._log_message("✓ Log and dossier cleared")
                else:
                    self._log_message("✓ Log cleared (dossier reset failed)")
            else:
                self._log_message("✓ Log cleared (Swift app not connected)")

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
