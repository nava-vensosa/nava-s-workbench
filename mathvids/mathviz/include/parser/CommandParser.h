#pragma once

#include <string>
#include <memory>

// Forward declarations
class Scene;

// Placeholder for now - will be fully implemented in Phase 3
class CommandParser {
public:
    CommandParser(Scene* scene);
    ~CommandParser();

    void parseLine(const std::string& line);

private:
    Scene* scene_;
};
