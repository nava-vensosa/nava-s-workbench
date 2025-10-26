"""
Vim Motions and Modal System for Haeccstable

Implements vim-style navigation and modal editing:
- NORMAL mode: Navigate with h/j/k/l, w/e/b, gg/G, etc.
- INSERT mode: Text input for command pane
"""

from enum import Enum
from typing import Tuple, Optional

class Mode(Enum):
    """Editor modes"""
    NORMAL = "NORMAL"
    INSERT = "INSERT"

class Focus(Enum):
    """Focusable panes"""
    DOSSIER = "DOSSIER"
    LOG = "LOG"
    COMMAND = "COMMAND"

class VimMotions:
    """
    Handles vim motions and cursor positioning within panes.
    """

    def __init__(self):
        self.mode = Mode.NORMAL
        self.focus = Focus.DOSSIER
        self.cursor_row = 0
        self.cursor_col = 0

    def handle_key(self, key: int, content_lines: list, max_rows: int, max_cols: int) -> Optional[str]:
        """
        Handle key press based on current mode and focus.

        Args:
            key: Curses key code
            content_lines: Lines of content in focused pane
            max_rows: Maximum visible rows
            max_cols: Maximum visible columns

        Returns:
            Command string if Enter pressed in INSERT mode, else None
        """
        if self.mode == Mode.NORMAL:
            return self._handle_normal_mode(key, content_lines, max_rows, max_cols)
        elif self.mode == Mode.INSERT:
            return self._handle_insert_mode(key, content_lines, max_cols)
        return None

    def _handle_normal_mode(self, key: int, content_lines: list, max_rows: int, max_cols: int) -> None:
        """Handle key in NORMAL mode"""
        key_char = chr(key) if 32 <= key <= 126 else None

        # Focus switching (1/2/3)
        if key_char == '1':
            self.focus = Focus.DOSSIER
            self.cursor_row = 0
            self.cursor_col = 0
            return None
        elif key_char == '2':
            self.focus = Focus.LOG
            self.cursor_row = 0
            self.cursor_col = 0
            return None
        elif key_char == '3':
            self.focus = Focus.COMMAND
            self.cursor_row = 0
            self.cursor_col = 0
            return None

        # Mode transitions (i/a/o/s/I/A/O/S)
        if key_char in ['i', 'a', 'o', 's', 'I', 'A', 'O', 'S']:
            if self.focus == Focus.COMMAND:
                self.mode = Mode.INSERT
                # Position cursor based on key
                if key_char == 'a':
                    self.cursor_col = min(self.cursor_col + 1, max_cols - 1)
                elif key_char == 'I':
                    self.cursor_col = 0
                elif key_char == 'A':
                    if content_lines and self.cursor_row < len(content_lines):
                        self.cursor_col = len(content_lines[self.cursor_row])
                return None

        # Movement commands
        max_content_rows = len(content_lines) if content_lines else 1
        current_line_len = len(content_lines[self.cursor_row]) if content_lines and self.cursor_row < len(content_lines) else 0

        # h/j/k/l - basic movement
        if key_char == 'h':
            self.cursor_col = max(0, self.cursor_col - 1)
        elif key_char == 'j':
            self.cursor_row = min(max_content_rows - 1, self.cursor_row + 1)
        elif key_char == 'k':
            self.cursor_row = max(0, self.cursor_row - 1)
        elif key_char == 'l':
            self.cursor_col = min(current_line_len, self.cursor_col + 1)

        # w - word forward
        elif key_char == 'w':
            self._move_word_forward(content_lines)

        # b - word backward
        elif key_char == 'b':
            self._move_word_backward(content_lines)

        # e - end of word
        elif key_char == 'e':
            self._move_to_end_of_word(content_lines)

        # 0 - beginning of line
        elif key_char == '0':
            self.cursor_col = 0

        # $ - end of line
        elif key_char == '$':
            if content_lines and self.cursor_row < len(content_lines):
                self.cursor_col = max(0, len(content_lines[self.cursor_row]) - 1)

        # gg - top of file
        elif key_char == 'g':
            # Note: In full implementation, would wait for second 'g'
            self.cursor_row = 0
            self.cursor_col = 0

        # G - bottom of file
        elif key_char == 'G':
            self.cursor_row = max(0, max_content_rows - 1)
            self.cursor_col = 0

        # { - previous paragraph
        elif key_char == '{':
            self._move_paragraph_backward(content_lines)

        # } - next paragraph
        elif key_char == '}':
            self._move_paragraph_forward(content_lines)

        return None

    def _handle_insert_mode(self, key: int, content_lines: list, max_cols: int) -> Optional[str]:
        """Handle key in INSERT mode"""
        # ESC - return to NORMAL mode
        if key == 27:  # ESC
            self.mode = Mode.NORMAL
            return None

        # ENTER - execute command (only in command pane)
        if key == 10 or key == 13:  # Enter
            if self.focus == Focus.COMMAND and content_lines:
                command = content_lines[0] if content_lines else ""
                # Stay in INSERT mode after executing
                return command
            return None

        # Backspace
        if key in [127, 8, 263]:  # Backspace/Delete
            if self.cursor_col > 0:
                self.cursor_col -= 1
            return None

        # Regular character input handled by curses_ui
        return None

    def _move_word_forward(self, content_lines: list):
        """Move cursor to start of next word"""
        if not content_lines or self.cursor_row >= len(content_lines):
            return

        line = content_lines[self.cursor_row]
        pos = self.cursor_col

        # Skip current word
        while pos < len(line) and line[pos].isalnum():
            pos += 1
        # Skip whitespace
        while pos < len(line) and line[pos].isspace():
            pos += 1

        if pos < len(line):
            self.cursor_col = pos
        elif self.cursor_row < len(content_lines) - 1:
            self.cursor_row += 1
            self.cursor_col = 0

    def _move_word_backward(self, content_lines: list):
        """Move cursor to start of previous word"""
        if not content_lines or self.cursor_row >= len(content_lines):
            return

        line = content_lines[self.cursor_row]
        pos = self.cursor_col

        # Skip whitespace
        while pos > 0 and line[pos - 1].isspace():
            pos -= 1
        # Skip word
        while pos > 0 and line[pos - 1].isalnum():
            pos -= 1

        self.cursor_col = max(0, pos)

    def _move_to_end_of_word(self, content_lines: list):
        """Move cursor to end of current/next word"""
        if not content_lines or self.cursor_row >= len(content_lines):
            return

        line = content_lines[self.cursor_row]
        pos = self.cursor_col

        # Move forward to next word character
        while pos < len(line) and not line[pos].isalnum():
            pos += 1
        # Move to end of word
        while pos < len(line) and line[pos].isalnum():
            pos += 1

        self.cursor_col = max(0, min(len(line) - 1, pos - 1))

    def _move_paragraph_forward(self, content_lines: list):
        """Move to next empty line (paragraph boundary)"""
        if not content_lines:
            return

        row = self.cursor_row + 1
        while row < len(content_lines):
            if not content_lines[row].strip():
                self.cursor_row = row
                self.cursor_col = 0
                return
            row += 1

        # If no empty line found, go to end
        self.cursor_row = len(content_lines) - 1
        self.cursor_col = 0

    def _move_paragraph_backward(self, content_lines: list):
        """Move to previous empty line (paragraph boundary)"""
        if not content_lines:
            return

        row = self.cursor_row - 1
        while row >= 0:
            if not content_lines[row].strip():
                self.cursor_row = row
                self.cursor_col = 0
                return
            row -= 1

        # If no empty line found, go to beginning
        self.cursor_row = 0
        self.cursor_col = 0

    def get_status_line(self) -> str:
        """Get status line text showing mode and focus"""
        return f"-- {self.mode.value} -- [Focus: {self.focus.value}]    1:dossier 2:log 3:cmd | ESC"

    def get_cursor_position(self) -> Tuple[int, int]:
        """Get current cursor position"""
        return (self.cursor_row, self.cursor_col)

    def switch_focus(self, new_focus: Focus):
        """Switch focus to a different pane"""
        self.focus = new_focus
        self.cursor_row = 0
        self.cursor_col = 0
