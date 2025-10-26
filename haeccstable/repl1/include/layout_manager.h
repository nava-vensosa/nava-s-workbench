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
    void updateTab2(int windowWidth, int windowHeight);
    void updateTab3(int windowWidth, int windowHeight);
    void updateTab4(int windowWidth, int windowHeight);

    // Tab 1 layouts (main display)
    Rect getVideoDisplayRect() const { return videoDisplay; }
    Rect getMobileDisplayRect() const { return mobileDisplay; }
    Rect getDossierEditorRect() const { return dossierEditor; }
    Rect getReplEditorRect() const { return replEditor; }
    Rect getShellWindowRect() const { return shellWindow; }
    Rect getConsoleWindowRect() const { return consoleWindow; }

    // Tab 2 layouts (REPL focus)
    Rect getTab2ReplRect() const { return tab2Repl; }
    Rect getTab2ShellRect() const { return tab2Shell; }
    Rect getTab2ConsoleRect() const { return tab2Console; }

    // Tab 3 layout (fullscreen monitor1 - 1920x1080)
    Rect getTab3Monitor1Rect() const { return tab3Monitor1; }

    // Tab 4 layout (centered monitor2 - mobile aspect ratio)
    Rect getTab4Monitor2Rect() const { return tab4Monitor2; }

private:
    // Tab 1
    Rect videoDisplay;
    Rect mobileDisplay;
    Rect dossierEditor;
    Rect replEditor;
    Rect shellWindow;
    Rect consoleWindow;

    // Tab 2
    Rect tab2Repl;
    Rect tab2Shell;
    Rect tab2Console;

    // Tab 3
    Rect tab3Monitor1;

    // Tab 4
    Rect tab4Monitor2;
};

#endif // LAYOUT_MANAGER_H
