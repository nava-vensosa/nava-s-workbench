#ifndef TEXT_BUFFER_H
#define TEXT_BUFFER_H

#include <string>
#include <vector>

enum class VimMode {
    NORMAL,
    INSERT,
    COPY  // For scrolling through history/output
};

class TextBuffer {
public:
    TextBuffer(int maxLines = 100);

    // Cursor operations
    int getCursorRow() const { return cursorRow; }
    int getCursorCol() const { return cursorCol; }
    void setCursor(int row, int col);
    void moveCursorLeft();
    void moveCursorRight();
    void moveCursorUp();
    void moveCursorDown();
    void moveCursorWordForward();      // w - word forward
    void moveCursorWordBackward();     // b - word backward
    void moveCursorWordEnd();          // e - end of word
    void moveCursorWORDEnd();          // E - end of WORD (space-delimited)
    void moveCursorWORDBackward();     // B - WORD backward (space-delimited)
    void moveCursorLineStart();        // 0
    void moveCursorLineEnd();          // $
    void moveCursorFirstLine();        // gg
    void moveCursorLastLine();         // G
    void moveCursorPrevParagraph();    // {
    void moveCursorNextParagraph();    // }

    // Text operations
    void insertChar(char c);
    void insertNewline();
    void deleteChar();        // Delete character under cursor (x)
    void deleteCharBefore();  // Backspace
    void deleteLine();        // Delete entire line (dd)

    // Buffer access
    const std::vector<std::string>& getLines() const { return lines; }
    std::string getCurrentLine() const;
    int getLineCount() const { return lines.size(); }

    // Mode
    VimMode getMode() const { return mode; }
    void setMode(VimMode m) { mode = m; }

    // Scroll offset for copy mode
    int getScrollOffset() const { return scrollOffset; }
    void setScrollOffset(int offset);
    void scrollUp();
    void scrollDown();

    // Auto-scroll for vim motions in NORMAL mode
    void setVisibleLines(int visibleLines) { this->visibleLines = visibleLines; }
    void ensureCursorVisible();  // Auto-scroll to keep cursor in view

    // History (for console/shell)
    void addOutputLine(const std::string& line);

private:
    std::vector<std::string> lines;
    int cursorRow;
    int cursorCol;
    VimMode mode;
    int maxLines;  // Maximum number of lines to keep
    int scrollOffset;  // For scrolling
    int visibleLines;  // Number of visible lines in the viewport

    void ensureCursorValid();
};

#endif // TEXT_BUFFER_H
