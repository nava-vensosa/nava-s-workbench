#include "repl_interpreter.h"
#include "video_variable.h"
#include "video_source.h"
#include "layer.h"
#include "output_variable.h"
#include "dossier_manager.h"
#include <sstream>
#include <algorithm>
#include <iostream>

ReplInterpreter::ReplInterpreter() : lastWasPrintln(true), dossierManager(nullptr) {
    // Initialize virtual monitors at startup
    // They will display black screens until layers are projected onto them

    // Virtual monitor1 (1920x1080 desktop display)
    auto monitor1 = std::make_shared<OutputVariable>("monitor1", "monitor1");
    outputVariables["monitor1"] = monitor1;
    std::cout << "Initialized virtual monitor1 (1920x1080)\n";

    // Virtual monitor2 (1080x1920 mobile display)
    auto monitor2 = std::make_shared<OutputVariable>("monitor2", "monitor2");
    outputVariables["monitor2"] = monitor2;
    std::cout << "Initialized virtual monitor2 (1080x1920 mobile)\n";
}

std::string ReplInterpreter::trim(const std::string& str) {
    size_t start = str.find_first_not_of(" \t\n\r");
    if (start == std::string::npos) return "";
    size_t end = str.find_last_not_of(" \t\n\r");
    return str.substr(start, end - start + 1);
}

void ReplInterpreter::clear() {
    variables.clear();
    videoVariables.clear();
    layers.clear();
    outputVariables.clear();
    inputSources.clear();
    lastWasPrintln = true;
}

void ReplInterpreter::setDossierManager(std::shared_ptr<DossierManager> dossier) {
    dossierManager = dossier;
}

std::shared_ptr<VideoVariable> ReplInterpreter::getVideoVariable(const std::string& name) {
    auto it = videoVariables.find(name);
    if (it != videoVariables.end()) {
        return it->second;
    }
    return nullptr;
}

std::shared_ptr<Layer> ReplInterpreter::getLayer(const std::string& name) {
    auto it = layers.find(name);
    if (it != layers.end()) {
        return it->second;
    }
    return nullptr;
}

std::shared_ptr<OutputVariable> ReplInterpreter::getOutputVariable(const std::string& name) {
    auto it = outputVariables.find(name);
    if (it != outputVariables.end()) {
        return it->second;
    }
    return nullptr;
}

void ReplInterpreter::executeVideoPipeline() {
    // Execute all video variables (lazy: only fetches new frames) - legacy
    for (auto& [name, var] : videoVariables) {
        if (var->getType() == VideoVarType::INPUT) {
            var->execute();  // Fetch frame and update texture
        }
    }

    // Execute all layers (fetch frames and update textures)
    for (auto& [name, layer] : layers) {
        if (layer) {
            layer->execute();
        }
    }

    // Composite all output variables
    for (auto& [name, output] : outputVariables) {
        if (output) {
            // TODO: Get actual output dimensions from target display
            // For now, use default 1920x1080
            output->composite(1920, 1080);
        }
    }
}

void ReplInterpreter::setOutputCallback(std::function<void(const std::string&)> callback) {
    outputCallback = callback;
}

std::vector<std::string> ReplInterpreter::execute(const std::string& code) {
    outputLines.clear();
    lastWasPrintln = true;  // Start fresh

    // Split code into lines
    std::istringstream stream(code);
    std::string line;

    while (std::getline(stream, line)) {
        line = trim(line);
        if (!line.empty() && line[0] != '/' && line[0] != '#') {  // Skip comments
            executeLine(line);
        }
    }

    return outputLines;
}

void ReplInterpreter::executeLine(const std::string& line) {
    // Remove trailing semicolon
    std::string stmt = line;
    if (!stmt.empty() && stmt.back() == ';') {
        stmt = stmt.substr(0, stmt.length() - 1);
    }
    stmt = trim(stmt);

    // Check for in_var (video input): in_var videoIn = 0;
    if (stmt.find("in_var ") == 0) {
        size_t equalPos = stmt.find('=');
        if (equalPos != std::string::npos) {
            std::string varPart = stmt.substr(7, equalPos - 7);
            std::string valuePart = stmt.substr(equalPos + 1);

            std::string varName = trim(varPart);
            std::string deviceStr = trim(valuePart);

            // Open video source
            auto source = std::make_shared<VideoSource>();
            int deviceIndex = std::stoi(deviceStr);  // Simple: assume device index for now
            if (source->open(deviceIndex)) {
                // Store source for layer casting
                inputSources[varName] = source;

                // Also create legacy video variable for backward compatibility
                auto videoVar = std::make_shared<VideoVariable>(varName, VideoVarType::INPUT);
                videoVar->setSource(source);
                videoVariables[varName] = videoVar;

                std::cout << "Created in_var " << varName << " (device " << deviceIndex << ")\n";

                // Register with dossier
                if (dossierManager) {
                    dossierManager->registerInputVariable(varName, deviceIndex, source);
                }
            } else {
                std::cerr << "Failed to open video device " << deviceIndex << "\n";
            }
        }
        return;
    }

    // Check for out_var (video output): out_var videoOut = monitor1;
    if (stmt.find("out_var ") == 0) {
        size_t equalPos = stmt.find('=');
        if (equalPos != std::string::npos) {
            std::string varPart = stmt.substr(8, equalPos - 8);
            std::string valuePart = stmt.substr(equalPos + 1);

            std::string varName = trim(varPart);
            std::string target = trim(valuePart);

            // Create output variable with layer stack
            auto output = std::make_shared<OutputVariable>(varName, target);
            outputVariables[varName] = output;

            // Also create legacy video variable for backward compatibility
            auto videoVar = std::make_shared<VideoVariable>(varName, VideoVarType::OUTPUT);
            videoVar->setTarget(target);
            videoVariables[varName] = videoVar;

            std::cout << "Created out_var " << varName << " -> " << target << "\n";

            // Register with dossier
            if (dossierManager) {
                dossierManager->registerOutputVariable(varName, target, output);
            }
        }
        return;
    }

    // Check for variable assignment: var x = "value";
    if (stmt.find("var ") == 0) {
        size_t equalPos = stmt.find('=');
        if (equalPos != std::string::npos) {
            std::string varPart = stmt.substr(4, equalPos - 4);
            std::string valuePart = stmt.substr(equalPos + 1);

            std::string varName = trim(varPart);
            std::string value = evaluateExpression(trim(valuePart));

            variables[varName] = value;
            std::cout << "Set variable " << varName << " = " << value << "\n";
        }
        return;
    }

    // Check for layer_obj declaration: layer_obj myLayer;
    if (stmt.find("layer_obj ") == 0) {
        std::string layerName = trim(stmt.substr(10));
        auto layer = std::make_shared<Layer>(layerName);
        layers[layerName] = layer;
        std::cout << "Created layer_obj '" << layerName << "'\n";

        // Register with dossier
        if (dossierManager) {
            dossierManager->registerLayer(layerName, layer);
        }
        return;
    }

    // Check for property assignment with dot notation: layer.canvas = (1920, 1080);
    size_t dotPos = stmt.find('.');
    size_t equalPos = stmt.find('=');
    if (dotPos != std::string::npos && equalPos != std::string::npos && dotPos < equalPos) {
        std::string objectName = trim(stmt.substr(0, dotPos));
        std::string propertyName = trim(stmt.substr(dotPos + 1, equalPos - dotPos - 1));
        std::string valuePart = trim(stmt.substr(equalPos + 1));

        auto layer = getLayer(objectName);
        if (layer) {
            if (propertyName == "canvas") {
                auto values = parseTuple(valuePart);
                if (values.size() == 2) {
                    int w = std::stoi(values[0]);
                    int h = std::stoi(values[1]);
                    layer->setCanvas(w, h);
                    std::cout << "Layer '" << objectName << "' canvas = (" << w << ", " << h << ")\n";

                    // Register with dossier
                    if (dossierManager) {
                        dossierManager->registerLayer(objectName, layer);
                    }
                }
            }
        }
        return;
    }

    // Check for method call: object.method(args);
    MethodCall call;
    if (parseMethodCall(stmt, call)) {
        executeMethodCall(call);
        return;
    }

    // Check for println(x)
    if (stmt.find("println(") == 0) {
        size_t endParen = stmt.find(')');
        if (endParen != std::string::npos) {
            std::string expr = stmt.substr(8, endParen - 8);
            std::string result = evaluateExpression(trim(expr));
            outputLines.push_back(result);
            lastWasPrintln = true;  // Mark that we completed a line
            if (outputCallback) {
                outputCallback(result);
            }
        }
        return;
    }

    // Check for print(x)
    if (stmt.find("print(") == 0) {
        size_t endParen = stmt.find(')');
        if (endParen != std::string::npos) {
            std::string expr = stmt.substr(6, endParen - 6);
            std::string result = evaluateExpression(trim(expr));

            // If last operation was println, start a new line
            // Otherwise append to current line
            if (lastWasPrintln || outputLines.empty()) {
                outputLines.push_back(result);
            } else {
                outputLines.back() += result;
            }
            lastWasPrintln = false;  // Mark that we're continuing a line

            if (outputCallback) {
                outputCallback(result);
            }
        }
        return;
    }
}

std::string ReplInterpreter::evaluateExpression(const std::string& expr) {
    std::string result;
    std::string current = trim(expr);

    // Handle string concatenation with +
    size_t pos = 0;
    while (pos < current.length()) {
        // Skip whitespace
        while (pos < current.length() && (current[pos] == ' ' || current[pos] == '\t')) {
            pos++;
        }

        if (pos >= current.length()) break;

        // Check for string literal
        if (current[pos] == '"' || current[pos] == '\'') {
            char quote = current[pos];
            pos++;
            std::string literal;
            while (pos < current.length() && current[pos] != quote) {
                literal += current[pos];
                pos++;
            }
            pos++; // Skip closing quote
            result += literal;
        }
        // Check for variable
        else if (isalpha(current[pos]) || current[pos] == '_') {
            std::string varName;
            while (pos < current.length() && (isalnum(current[pos]) || current[pos] == '_')) {
                varName += current[pos];
                pos++;
            }

            // Look up variable
            if (variables.find(varName) != variables.end()) {
                result += variables[varName];
            } else {
                result += "[undefined:" + varName + "]";
            }
        }
        // Check for + operator
        else if (current[pos] == '+') {
            pos++;
            // Continue to next term
        }
        // Skip other characters
        else {
            pos++;
        }
    }

    return result;
}

std::vector<std::string> ReplInterpreter::parseTuple(const std::string& tupleStr) {
    std::vector<std::string> values;
    std::string cleaned = trim(tupleStr);

    // Remove parentheses if present
    if (!cleaned.empty() && cleaned.front() == '(') {
        cleaned = cleaned.substr(1);
    }
    if (!cleaned.empty() && cleaned.back() == ')') {
        cleaned = cleaned.substr(0, cleaned.length() - 1);
    }

    // Split by comma
    std::istringstream stream(cleaned);
    std::string token;
    while (std::getline(stream, token, ',')) {
        values.push_back(trim(token));
    }

    return values;
}

bool ReplInterpreter::parseMethodCall(const std::string& stmt, MethodCall& result) {
    // Find the dot
    size_t dotPos = stmt.find('.');
    if (dotPos == std::string::npos) {
        return false;
    }

    // Find the opening parenthesis
    size_t openParen = stmt.find('(', dotPos);
    if (openParen == std::string::npos) {
        return false;
    }

    // Find the closing parenthesis
    size_t closeParen = stmt.find(')', openParen);
    if (closeParen == std::string::npos) {
        return false;
    }

    // Extract parts
    result.object = trim(stmt.substr(0, dotPos));
    result.method = trim(stmt.substr(dotPos + 1, openParen - dotPos - 1));

    // Extract arguments
    std::string argsStr = stmt.substr(openParen + 1, closeParen - openParen - 1);
    if (!argsStr.empty()) {
        result.args = parseTuple(argsStr);
    }

    return true;
}

void ReplInterpreter::executeMethodCall(const MethodCall& call) {
    // Check if object is a layer
    auto layer = getLayer(call.object);
    if (layer) {
        // Layer methods
        if (call.method == "transform" && call.args.size() == 2) {
            float x = std::stof(call.args[0]);
            float y = std::stof(call.args[1]);
            layer->transform(x, y);
            std::cout << "Layer '" << call.object << "' transform(" << x << ", " << y << ")\n";

            // Update dossier
            if (dossierManager) {
                dossierManager->registerLayer(call.object, layer);
            }
        }
        else if (call.method == "scale" && call.args.size() == 2) {
            float w = std::stof(call.args[0]);
            float h = std::stof(call.args[1]);
            layer->scale(w, h);
            std::cout << "Layer '" << call.object << "' scale(" << w << ", " << h << ")\n";

            if (dossierManager) {
                dossierManager->registerLayer(call.object, layer);
            }
        }
        else if (call.method == "rot" && call.args.size() == 2) {
            float xy = std::stof(call.args[0]);
            float y = std::stof(call.args[1]);
            layer->rot(xy, y);
            std::cout << "Layer '" << call.object << "' rot(" << xy << ", " << y << ")\n";

            if (dossierManager) {
                dossierManager->registerLayer(call.object, layer);
            }
        }
        else if (call.method == "opacity" && call.args.size() == 1) {
            float opacity = std::stof(call.args[0]);
            layer->setOpacity(opacity);
            std::cout << "Layer '" << call.object << "' opacity(" << opacity << ")\n";

            if (dossierManager) {
                dossierManager->registerLayer(call.object, layer);
            }
        }
        return;
    }

    // Check if object is an input source (for cast method)
    auto inputSource = inputSources.find(call.object);
    if (inputSource != inputSources.end() && call.method == "cast" && call.args.size() == 1) {
        std::string layerName = call.args[0];
        auto targetLayer = getLayer(layerName);
        if (targetLayer) {
            targetLayer->setSource(inputSource->second);
            std::cout << "Cast " << call.object << " to layer '" << layerName << "'\n";

            if (dossierManager) {
                dossierManager->registerLayer(layerName, targetLayer);
            }
        } else {
            std::cerr << "ERROR: Layer '" << layerName << "' not found\n";
        }
        return;
    }

    // Check if object is an output variable (for project method)
    auto output = getOutputVariable(call.object);
    if (output && call.method == "project" && call.args.size() == 2) {
        std::string layerName = call.args[0];
        int zIndex = std::stoi(call.args[1]);
        auto targetLayer = getLayer(layerName);
        if (targetLayer) {
            output->project(targetLayer, zIndex);
            std::cout << "Project layer '" << layerName << "' to " << call.object
                      << " at z-index " << zIndex << "\n";

            if (dossierManager) {
                dossierManager->registerOutputVariable(call.object, output->getTarget(), output);
            }
        } else {
            std::cerr << "ERROR: Layer '" << layerName << "' not found\n";
        }
        return;
    }

    std::cerr << "ERROR: Unknown method call: " << call.object << "." << call.method << "()\n";
}
