#ifndef REPL_INTERPRETER_H
#define REPL_INTERPRETER_H

#include <string>
#include <map>
#include <vector>
#include <functional>
#include <memory>

// Forward declarations
class VideoVariable;
class VideoSource;

class ReplInterpreter {
public:
    ReplInterpreter();

    // Execute REPL code and return output lines
    std::vector<std::string> execute(const std::string& code);

    // Clear all variables
    void clear();

    // Set output callback (for println, print)
    void setOutputCallback(std::function<void(const std::string&)> callback);

    // Video variable management
    std::shared_ptr<VideoVariable> getVideoVariable(const std::string& name);
    const std::map<std::string, std::shared_ptr<VideoVariable>>& getVideoVariables() const { return videoVariables; }

    // Execute all active video pipelines (fetch frames, update textures)
    void executeVideoPipeline();

private:
    std::map<std::string, std::string> variables;  // String variable storage
    std::map<std::string, std::shared_ptr<VideoVariable>> videoVariables;  // Video variable storage
    std::vector<std::string> outputLines;
    std::function<void(const std::string&)> outputCallback;
    bool lastWasPrintln;  // Track if last output was println (completed line)

    // Parse and execute a single line
    void executeLine(const std::string& line);

    // Evaluate an expression
    std::string evaluateExpression(const std::string& expr);

    // Helper to trim whitespace
    std::string trim(const std::string& str);
};

#endif // REPL_INTERPRETER_H
