#include "layout_manager.h"
#include <algorithm>

LayoutManager::LayoutManager() {
}

void LayoutManager::update(int windowWidth, int windowHeight) {
    // Based on ASCII art, divide window into left and right sections
    // Left section: ~2/3 of width, Right section: ~1/3 of width
    int rightSectionWidth = windowWidth / 3;
    int leftSectionWidth = windowWidth - rightSectionWidth;

    // LEFT SECTION
    // monitor1 at top: 1/3 of window height
    int monitor1Height = windowHeight / 3;
    videoDisplay = {0, windowHeight - monitor1Height, leftSectionWidth, monitor1Height};

    // Below monitor1: dossier.json and REPL.txt side-by-side, taking remaining 2/3 height
    int bottomLeftHeight = windowHeight - monitor1Height;
    int halfLeftWidth = leftSectionWidth / 2;

    // dossier.json: left half
    dossierEditor = {0, 0, halfLeftWidth, bottomLeftHeight};

    // REPL.txt: right half
    replEditor = {halfLeftWidth, 0, halfLeftWidth, bottomLeftHeight};

    // RIGHT SECTION
    // monitor2 at top: 1/2 of window height
    int monitor2Height = windowHeight / 2;
    mobileDisplay = {leftSectionWidth, windowHeight - monitor2Height, rightSectionWidth, monitor2Height};

    // Below monitor2: console (top) and shell (bottom), taking remaining 1/2 height
    int bottomRightHeight = windowHeight - monitor2Height;
    int halfBottomRightHeight = bottomRightHeight / 2;

    // console: top half of bottom-right
    consoleWindow = {leftSectionWidth, halfBottomRightHeight, rightSectionWidth, halfBottomRightHeight};

    // shell: bottom half of bottom-right
    shellWindow = {leftSectionWidth, 0, rightSectionWidth, halfBottomRightHeight};
}

void LayoutManager::updateTab2(int windowWidth, int windowHeight) {
    // Tab 2 layout:
    // Top half: REPL.txt (full width)
    // Bottom half: split into console (top) and shell (bottom), both full width

    int halfHeight = windowHeight / 2;
    int quarterHeight = windowHeight / 4;

    // REPL.txt: top half
    tab2Repl = {0, halfHeight, windowWidth, halfHeight};

    // Console: 3rd quarter
    tab2Console = {0, quarterHeight, windowWidth, quarterHeight};

    // Shell: bottom quarter
    tab2Shell = {0, 0, windowWidth, quarterHeight};
}
