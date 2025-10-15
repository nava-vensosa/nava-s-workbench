#pragma once

#include <string>
#include <memory>
#include <vector>
#include <map>
#include <regex>
#include <glm/glm.hpp>

// Forward declarations
class Scene;

class CommandParser {
public:
    CommandParser(Scene* scene);
    ~CommandParser();

    void parseLine(const std::string& line);
    void parseFile(const std::string& filepath);

private:
    Scene* scene_;

    // Command handlers
    void handleInit(const std::string& line);
    void handleSet(const std::string& line);
    void handleCreate(const std::string& line);
    void handleAnimate(const std::string& line);
    void handleExport(const std::string& line);

    // Utility functions
    std::map<std::string, std::string> parseProperties(const std::string& props_str);
    std::vector<float> parseArray(const std::string& array_str);
    glm::vec3 parseColor(const std::string& color_str);
    glm::vec2 parseVec2(const std::string& vec_str);
    bool isComment(const std::string& line);
    std::string trim(const std::string& str);
};
