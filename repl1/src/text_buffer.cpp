#include "text_buffer.h"
#include <algorithm>

TextBuffer::TextBuffer(int maxLines)
    : cursorRow(0), cursorCol(0), mode(VimMode::NORMAL),
      maxLines(maxLines), scrollOffset(0) {
    // Start with one empty line
    lines.push_back("");
}

void TextBuffer::setCursor(int row, int col) {
    cursorRow = std::max(0, std::min(row, (int)lines.size() - 1));
    if (cursorRow < lines.size()) {
        cursorCol = std::max(0, std::min(col, (int)lines[cursorRow].length()));
    }
}

void TextBuffer::ensureCursorValid() {
    if (lines.empty()) {
        lines.push_back("");
    }
    cursorRow = std::max(0, std::min(cursorRow, (int)lines.size() - 1));
    if (cursorRow < lines.size()) {
        // In normal mode, cursor can't go past last character
        int maxCol = mode == VimMode::NORMAL ?
                     std::max(0, (int)lines[cursorRow].length() - 1) :
                     (int)lines[cursorRow].length();
        cursorCol = std::max(0, std::min(cursorCol, maxCol));
    }
}

void TextBuffer::moveCursorLeft() {
    if (cursorCol > 0) {
        cursorCol--;
    } else if (cursorRow > 0) {
        // Wrap to end of previous line
        cursorRow--;
        cursorCol = lines[cursorRow].length();
    }
    ensureCursorValid();
}

void TextBuffer::moveCursorRight() {
    if (cursorRow < lines.size() && cursorCol < lines[cursorRow].length()) {
        cursorCol++;
    } else if (cursorRow < lines.size() - 1) {
        // Wrap to start of next line
        cursorRow++;
        cursorCol = 0;
    }
    ensureCursorValid();
}

void TextBuffer::moveCursorUp() {
    if (cursorRow > 0) {
        cursorRow--;
    }
    ensureCursorValid();
}

void TextBuffer::moveCursorDown() {
    if (cursorRow < lines.size() - 1) {
        cursorRow++;
    }
    ensureCursorValid();
}

void TextBuffer::moveCursorWordForward() {
    if (cursorRow >= lines.size()) return;

    const std::string& line = lines[cursorRow];
    // Skip current word
    while (cursorCol < line.length() && isalnum(line[cursorCol])) {
        cursorCol++;
    }
    // Skip whitespace
    while (cursorCol < line.length() && isspace(line[cursorCol])) {
        cursorCol++;
    }

    if (cursorCol >= line.length() && cursorRow < lines.size() - 1) {
        cursorRow++;
        cursorCol = 0;
    }
    ensureCursorValid();
}

void TextBuffer::moveCursorWordBackward() {
    if (cursorRow >= lines.size()) return;

    if (cursorCol > 0) {
        cursorCol--;
    } else if (cursorRow > 0) {
        cursorRow--;
        cursorCol = lines[cursorRow].length();
    }

    const std::string& line = lines[cursorRow];
    // Skip whitespace
    while (cursorCol > 0 && isspace(line[cursorCol])) {
        cursorCol--;
    }
    // Skip word
    while (cursorCol > 0 && isalnum(line[cursorCol - 1])) {
        cursorCol--;
    }
    ensureCursorValid();
}

void TextBuffer::moveCursorLineStart() {
    cursorCol = 0;
}

void TextBuffer::moveCursorLineEnd() {
    if (cursorRow < lines.size()) {
        cursorCol = lines[cursorRow].length();
        if (mode == VimMode::NORMAL && cursorCol > 0) {
            cursorCol--;  // In normal mode, can't be on newline
        }
    }
}

void TextBuffer::insertChar(char c) {
    if (cursorRow >= lines.size()) return;

    lines[cursorRow].insert(cursorCol, 1, c);
    cursorCol++;
}

void TextBuffer::insertNewline() {
    if (cursorRow >= lines.size()) return;

    std::string currentLine = lines[cursorRow];
    std::string afterCursor = currentLine.substr(cursorCol);
    lines[cursorRow] = currentLine.substr(0, cursorCol);

    cursorRow++;
    cursorCol = 0;
    lines.insert(lines.begin() + cursorRow, afterCursor);

    // Trim if exceeding max lines
    while (lines.size() > maxLines) {
        lines.erase(lines.begin());
        cursorRow--;
    }
}

void TextBuffer::deleteChar() {
    if (cursorRow >= lines.size()) return;

    if (cursorCol < lines[cursorRow].length()) {
        lines[cursorRow].erase(cursorCol, 1);
    } else if (cursorRow < lines.size() - 1) {
        // Join with next line
        lines[cursorRow] += lines[cursorRow + 1];
        lines.erase(lines.begin() + cursorRow + 1);
    }
    ensureCursorValid();
}

void TextBuffer::deleteCharBefore() {
    if (cursorCol > 0) {
        cursorCol--;
        deleteChar();
    } else if (cursorRow > 0) {
        // Join with previous line
        int prevLineLen = lines[cursorRow - 1].length();
        lines[cursorRow - 1] += lines[cursorRow];
        lines.erase(lines.begin() + cursorRow);
        cursorRow--;
        cursorCol = prevLineLen;
    }
}

void TextBuffer::deleteLine() {
    if (lines.size() <= 1) {
        // Don't delete the last line, just clear it
        lines[0] = "";
        cursorCol = 0;
    } else {
        lines.erase(lines.begin() + cursorRow);
        if (cursorRow >= lines.size()) {
            cursorRow = lines.size() - 1;
        }
        cursorCol = 0;
    }
    ensureCursorValid();
}

std::string TextBuffer::getCurrentLine() const {
    if (cursorRow < lines.size()) {
        return lines[cursorRow];
    }
    return "";
}

void TextBuffer::setScrollOffset(int offset) {
    scrollOffset = std::max(0, std::min(offset, std::max(0, (int)lines.size() - 1)));
}

void TextBuffer::scrollUp() {
    if (scrollOffset > 0) {
        scrollOffset--;
    }
}

void TextBuffer::scrollDown() {
    if (scrollOffset < (int)lines.size() - 1) {
        scrollOffset++;
    }
}

void TextBuffer::addOutputLine(const std::string& line) {
    lines.push_back(line);

    // Trim if exceeding max lines
    while (lines.size() > maxLines) {
        lines.erase(lines.begin());
        if (scrollOffset > 0) {
            scrollOffset--;
        }
    }
}

void TextBuffer::moveCursorWordEnd() {
    if (cursorRow >= lines.size()) return;

    const std::string& line = lines[cursorRow];

    // Move forward at least one character
    if (cursorCol < line.length()) {
        cursorCol++;
    }

    // Skip whitespace
    while (cursorCol < line.length() && isspace(line[cursorCol])) {
        cursorCol++;
    }

    // Move to end of word
    while (cursorCol < line.length() && isalnum(line[cursorCol])) {
        cursorCol++;
    }

    // Move back one to be ON the last character, not after it
    if (cursorCol > 0 && cursorCol < line.length()) {
        cursorCol--;
    }

    ensureCursorValid();
}

void TextBuffer::moveCursorWORDEnd() {
    if (cursorRow >= lines.size()) return;

    const std::string& line = lines[cursorRow];

    // Move forward at least one character
    if (cursorCol < line.length()) {
        cursorCol++;
    }

    // Skip whitespace
    while (cursorCol < line.length() && isspace(line[cursorCol])) {
        cursorCol++;
    }

    // Move to end of WORD (non-whitespace)
    while (cursorCol < line.length() && !isspace(line[cursorCol])) {
        cursorCol++;
    }

    // Move back one to be ON the last character, not after it
    if (cursorCol > 0) {
        cursorCol--;
    }

    ensureCursorValid();
}

void TextBuffer::moveCursorWORDBackward() {
    if (cursorRow >= lines.size()) return;

    if (cursorCol > 0) {
        cursorCol--;
    } else if (cursorRow > 0) {
        cursorRow--;
        cursorCol = lines[cursorRow].length();
        if (cursorCol > 0) cursorCol--;
    }

    const std::string& line = lines[cursorRow];

    // Skip whitespace
    while (cursorCol > 0 && isspace(line[cursorCol])) {
        cursorCol--;
    }

    // Skip WORD (non-whitespace)
    while (cursorCol > 0 && !isspace(line[cursorCol - 1])) {
        cursorCol--;
    }

    ensureCursorValid();
}

void TextBuffer::moveCursorFirstLine() {
    cursorRow = 0;
    cursorCol = 0;
    ensureCursorValid();
}

void TextBuffer::moveCursorLastLine() {
    if (!lines.empty()) {
        cursorRow = lines.size() - 1;
        cursorCol = 0;
    }
    ensureCursorValid();
}

void TextBuffer::moveCursorPrevParagraph() {
    if (cursorRow == 0) return;

    // Move up one line first
    cursorRow--;

    // Skip empty lines
    while (cursorRow > 0 && lines[cursorRow].empty()) {
        cursorRow--;
    }

    // Find previous empty line or start of buffer
    while (cursorRow > 0 && !lines[cursorRow].empty()) {
        cursorRow--;
    }

    cursorCol = 0;
    ensureCursorValid();
}

void TextBuffer::moveCursorNextParagraph() {
    if (cursorRow >= lines.size() - 1) return;

    // Move down one line first
    cursorRow++;

    // Skip empty lines
    while (cursorRow < lines.size() - 1 && lines[cursorRow].empty()) {
        cursorRow++;
    }

    // Find next empty line or end of buffer
    while (cursorRow < lines.size() - 1 && !lines[cursorRow].empty()) {
        cursorRow++;
    }

    cursorCol = 0;
    ensureCursorValid();
}
