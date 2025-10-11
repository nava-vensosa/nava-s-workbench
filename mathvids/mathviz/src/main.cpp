#include "core/Application.h"
#include <iostream>

int main(int argc, char** argv) {
    try {
        Application app;
        app.init(argc, argv);
        app.run();
        app.shutdown();
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Fatal error: " << e.what() << std::endl;
        return 1;
    }
}
