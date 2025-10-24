#include "repl_interpreter.h"
#include "video_variable.h"
#include "video_source.h"
#include <sstream>
#include <algorithm>
#include <iostream>

ReplInterpreter::ReplInterpreter() : lastWasPrintln(true) {
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
    lastWasPrintln = true;
}

std::shared_ptr<VideoVariable> ReplInterpreter::getVideoVariable(const std::string& name) {
    auto it = videoVariables.find(name);
    if (it != videoVariables.end()) {
        return it->second;
    }
    return nullptr;
}

void ReplInterpreter::executeVideoPipeline() {
    // Execute all video variables (lazy: only fetches new frames)
    for (auto& [name, var] : videoVariables) {
        if (var->getType() == VideoVarType::INPUT) {
            var->execute();  // Fetch frame and update texture
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

            // Create video variable
            auto videoVar = std::make_shared<VideoVariable>(varName, VideoVarType::INPUT);

            // Open video source
            auto source = std::make_shared<VideoSource>();
            int deviceIndex = std::stoi(deviceStr);  // Simple: assume device index for now
            if (source->open(deviceIndex)) {
                videoVar->setSource(source);
                videoVariables[varName] = videoVar;
                std::cout << "Created in_var " << varName << " (device " << deviceIndex << ")\n";
            } else {
                std::cout << "Failed to open video device " << deviceIndex << "\n";
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

            // Create output variable
            auto videoVar = std::make_shared<VideoVariable>(varName, VideoVarType::OUTPUT);
            videoVar->setTarget(target);
            videoVariables[varName] = videoVar;

            std::cout << "Created out_var " << varName << " -> " << target << "\n";
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
