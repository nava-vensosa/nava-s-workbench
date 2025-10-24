#ifndef LAYOUT_MANAGER_H
#define LAYOUT_MANAGER_H

struct Rect {
    int x, y, width, height;
};

enum WindowRegion {
    VIDEO_DISPLAY,      // Top left - 1/3 height, 16:9 ratio
    MOBILE_DISPLAY,     // Top right - 1/2 height, mobile ratio (9:16)
    DOSSIER_EDITOR,     // Bottom left - dossier.json
    REPL_EDITOR,        // Bottom left - REPL.txt
    SHELL_WINDOW,       // Bottom right - command shell
    CONSOLE_WINDOW      // Bottom right - console log
};

class LayoutManager {
public:
    LayoutManager();
    void update(int windowWidth, int windowHeight);

    Rect getVideoDisplayRect() const { return videoDisplay; }
    Rect getMobileDisplayRect() const { return mobileDisplay; }
    Rect getDossierEditorRect() const { return dossierEditor; }
    Rect getReplEditorRect() const { return replEditor; }
    Rect getShellWindowRect() const { return shellWindow; }
    Rect getConsoleWindowRect() const { return consoleWindow; }

private:
    Rect videoDisplay;
    Rect mobileDisplay;
    Rect dossierEditor;
    Rect replEditor;
    Rect shellWindow;
    Rect consoleWindow;
};

#endif // LAYOUT_MANAGER_H
