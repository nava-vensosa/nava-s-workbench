#include "parser/CommandParser.h"
#include "core/Scene.h"
#include "core/Frame.h"
#include "core/Body.h"

#include <glm/glm.hpp>
#include <iostream>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <cctype>

CommandParser::CommandParser(Scene* scene)
    : scene_(scene)
{}

CommandParser::~CommandParser() {}

void CommandParser::parseLine(const std::string& line) {
    std::string trimmed = trim(line);

    // Skip empty lines and comments
    if (trimmed.empty() || isComment(trimmed)) {
        return;
    }

    // Determine command type
    if (trimmed.find("init scene") == 0) {
        handleInit(trimmed);
    } else if (trimmed.find("set scene") == 0 || trimmed.find("set frame") == 0 || trimmed.find("set body") == 0) {
        handleSet(trimmed);
    } else if (trimmed.find("create frame") == 0 || trimmed.find("create body") == 0) {
        handleCreate(trimmed);
    } else if (trimmed.find("animate") == 0) {
        handleAnimate(trimmed);
    } else if (trimmed.find("export") == 0) {
        handleExport(trimmed);
    } else {
        std::cout << "[Parser] Unknown command: " << trimmed << std::endl;
    }
}

void CommandParser::parseFile(const std::string& filepath) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        std::cerr << "[Parser] Failed to open file: " << filepath << std::endl;
        return;
    }

    std::string line;
    int line_num = 0;
    while (std::getline(file, line)) {
        line_num++;
        try {
            parseLine(line);
        } catch (const std::exception& e) {
            std::cerr << "[Parser] Error on line " << line_num << ": " << e.what() << std::endl;
        }
    }

    std::cout << "[Parser] Loaded " << line_num << " lines from " << filepath << std::endl;
}

void CommandParser::handleInit(const std::string& line) {
    // init scene <name>
    std::regex pattern(R"(init scene\s+(\w+))");
    std::smatch match;

    if (std::regex_search(line, match, pattern)) {
        std::string scene_name = match[1];
        scene_->clear();
        std::cout << "[Parser] Initialized scene: " << scene_name << std::endl;
    }
}

void CommandParser::handleSet(const std::string& line) {
    // set scene resolution=... background=...
    // set frame <name> ...
    // set body <name> ...

    if (line.find("set scene") == 0) {
        auto props = parseProperties(line.substr(10)); // Skip "set scene "

        for (const auto& [key, value] : props) {
            if (key == "resolution") {
                if (value == "desktop" || value == "desktop_1080p") {
                    scene_->resolution_mode = ResolutionMode::DESKTOP_1080P;
                } else if (value == "mobile_vertical") {
                    scene_->resolution_mode = ResolutionMode::MOBILE_VERTICAL;
                } else if (value == "poster_2_3") {
                    scene_->resolution_mode = ResolutionMode::POSTER_2_3;
                } else if (value == "custom") {
                    scene_->resolution_mode = ResolutionMode::CUSTOM;
                }
                std::cout << "[Parser] Set scene resolution: " << value << std::endl;
            } else if (key == "width") {
                scene_->custom_width = std::stoi(value);
            } else if (key == "height") {
                scene_->custom_height = std::stoi(value);
            } else if (key == "background") {
                scene_->background_color = parseColor(value);
                std::cout << "[Parser] Set scene background: " << value << std::endl;
            } else if (key == "fps") {
                scene_->fps = std::stoi(value);
            }
        }
    } else if (line.find("set frame") == 0) {
        std::regex pattern(R"(set frame\s+(\w+)\s+(.+))");
        std::smatch match;

        if (std::regex_search(line, match, pattern)) {
            std::string frame_name = match[1];
            auto props = parseProperties(match[2]);

            Frame* frame = scene_->getFrame(frame_name);
            if (frame) {
                for (const auto& [key, value] : props) {
                    if (key == "background") {
                        frame->background_color = parseColor(value);
                    } else if (key == "alpha") {
                        frame->alpha = std::stof(value);
                    } else if (key == "border_thickness") {
                        frame->border_thickness = std::stof(value);
                    }
                }
            }
        }
    } else if (line.find("set body") == 0) {
        std::regex pattern(R"(set body\s+(\w+)\s+(.+))");
        std::smatch match;

        if (std::regex_search(line, match, pattern)) {
            std::string body_name = match[1];
            auto props = parseProperties(match[2]);

            // Find body in all frames
            for (auto& frame_ptr : scene_->frames_) {
                Body* body = frame_ptr->getBody(body_name);
                if (body) {
                    for (const auto& [key, value] : props) {
                        if (key == "color") {
                            body->color = parseColor(value);
                        } else if (key == "alpha") {
                            body->alpha = std::stof(value);
                        } else if (key == "glow_intensity") {
                            body->glow_intensity = std::stof(value);
                        } else if (key == "position") {
                            body->position = parseVec2(value);
                        }

                        // LineBody specific
                        if (auto line_body = dynamic_cast<LineBody*>(body)) {
                            if (key == "thickness") {
                                line_body->thickness = std::stof(value);
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
}

void CommandParser::handleCreate(const std::string& line) {
    if (line.find("create frame") == 0) {
        // create frame <name> position=[x,y] width=... height=...
        std::regex pattern(R"(create frame\s+(\w+)\s+(.+))");
        std::smatch match;

        if (std::regex_search(line, match, pattern)) {
            std::string frame_name = match[1];
            auto props = parseProperties(match[2]);

            auto frame = std::make_unique<Frame>(frame_name);

            if (props.count("position")) {
                frame->position = parseVec2(props["position"]);
            }
            if (props.count("width") && props.count("height")) {
                frame->size = glm::vec2(std::stof(props["width"]), std::stof(props["height"]));
            }

            std::cout << "[Parser] Created frame: " << frame_name << std::endl;
            scene_->addFrame(std::move(frame));
        }
    } else if (line.find("create body") == 0) {
        // create body <name> parent=<frame> type=<type> ...
        std::regex pattern(R"(create body\s+(\w+)\s+(.+))");
        std::smatch match;

        if (std::regex_search(line, match, pattern)) {
            std::string body_name = match[1];
            auto props = parseProperties(match[2]);

            std::string parent_name = props.count("parent") ? props["parent"] : "main";
            std::string type = props.count("type") ? props["type"] : "line";

            Frame* parent_frame = scene_->getFrame(parent_name);
            if (!parent_frame) {
                std::cerr << "[Parser] Parent frame not found: " << parent_name << std::endl;
                return;
            }

            // Create body based on type
            if (type == "line" || type == "wireframe" || type == "grid") {
                auto body = std::make_unique<LineBody>(body_name);
                body->color = glm::vec3(1.0f, 1.0f, 1.0f);
                body->thickness = 2.0f;

                // Generate some default points for testing
                if (type == "grid") {
                    // Create a simple grid
                    for (float x = -400; x <= 400; x += 100) {
                        body->points.push_back(glm::vec2(x, -400));
                        body->points.push_back(glm::vec2(x, 400));
                    }
                }

                std::cout << "[Parser] Created body: " << body_name << " (type: " << type << ")" << std::endl;
                parent_frame->addBody(std::move(body));
            } else if (type == "text") {
                auto body = std::make_unique<TextBody>(body_name);
                body->color = glm::vec3(1.0f, 1.0f, 1.0f);
                body->font_size = 24.0f;
                body->font_family = "Arial";

                // Set text-specific properties
                if (props.count("content")) {
                    body->content = props["content"];
                }
                if (props.count("position")) {
                    body->position = parseVec2(props["position"]);
                }
                if (props.count("font_size")) {
                    body->font_size = std::stof(props["font_size"]);
                }
                if (props.count("color")) {
                    body->color = parseColor(props["color"]);
                }

                std::cout << "[Parser] Created text body: " << body_name << " content: \"" << body->content << "\"" << std::endl;
                parent_frame->addBody(std::move(body));
            }
        }
    }
}

void CommandParser::handleAnimate(const std::string& line) {
    // Placeholder - animations will be implemented in Phase 6
    // For now, just log that we saw an animate command
    std::cout << "[Parser] Animate command (not yet implemented): " << line << std::endl;
}

void CommandParser::handleExport(const std::string& line) {
    // export image <filename> resolution=WxH quality=...
    // export video <filename> duration=... resolution=WxH fps=...

    std::regex pattern(R"(export\s+(image|video)\s+([\w\-\.]+)\s+(.+))");
    std::smatch match;

    if (std::regex_search(line, match, pattern)) {
        std::string export_type = match[1];
        std::string filename = match[2];
        auto props = parseProperties(match[3]);

        std::cout << "[Parser] Export " << export_type << " to: " << filename << std::endl;

        // Store export request (will be handled by Application)
        scene_->output_path = filename;

        if (props.count("resolution")) {
            std::string res = props["resolution"];
            size_t x_pos = res.find('x');
            if (x_pos != std::string::npos) {
                int width = std::stoi(res.substr(0, x_pos));
                int height = std::stoi(res.substr(x_pos + 1));
                scene_->setCustomResolution(width, height);
                std::cout << "[Parser] Export resolution: " << width << "x" << height << std::endl;
            }
        }
    } else {
        std::cout << "[Parser] Export command format not recognized: " << line << std::endl;
    }
}

std::map<std::string, std::string> CommandParser::parseProperties(const std::string& props_str) {
    std::map<std::string, std::string> props;

    // Support both quoted strings and unquoted values
    std::regex prop_pattern(R"((\w+)=(?:\"([^\"]*)\"|([^\s]+)))");
    std::sregex_iterator iter(props_str.begin(), props_str.end(), prop_pattern);
    std::sregex_iterator end;

    while (iter != end) {
        std::string key = (*iter)[1];
        std::string value = (*iter)[2].matched ? (*iter)[2] : (*iter)[3];
        props[key] = value;
        ++iter;
    }

    return props;
}

std::vector<float> CommandParser::parseArray(const std::string& array_str) {
    std::vector<float> result;

    // Remove brackets
    std::string cleaned = array_str;
    cleaned.erase(std::remove(cleaned.begin(), cleaned.end(), '['), cleaned.end());
    cleaned.erase(std::remove(cleaned.begin(), cleaned.end(), ']'), cleaned.end());

    // Split by comma
    std::stringstream ss(cleaned);
    std::string token;
    while (std::getline(ss, token, ',')) {
        result.push_back(std::stof(trim(token)));
    }

    return result;
}

glm::vec3 CommandParser::parseColor(const std::string& color_str) {
    if (color_str[0] == '#') {
        // Hex color: #RRGGBB
        std::string hex = color_str.substr(1);
        unsigned int rgb;
        std::stringstream ss;
        ss << std::hex << hex;
        ss >> rgb;

        float r = ((rgb >> 16) & 0xFF) / 255.0f;
        float g = ((rgb >> 8) & 0xFF) / 255.0f;
        float b = (rgb & 0xFF) / 255.0f;

        return glm::vec3(r, g, b);
    }
    return glm::vec3(1.0f, 1.0f, 1.0f);
}

glm::vec2 CommandParser::parseVec2(const std::string& vec_str) {
    auto values = parseArray(vec_str);
    if (values.size() >= 2) {
        return glm::vec2(values[0], values[1]);
    }
    return glm::vec2(0.0f, 0.0f);
}

bool CommandParser::isComment(const std::string& line) {
    std::string trimmed = trim(line);
    return trimmed.empty() || trimmed[0] == '#';
}

std::string CommandParser::trim(const std::string& str) {
    size_t first = str.find_first_not_of(" \t\r\n");
    if (first == std::string::npos) return "";
    size_t last = str.find_last_not_of(" \t\r\n");
    return str.substr(first, last - first + 1);
}
