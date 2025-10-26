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
class Layer;
class OutputVariable;
class DossierManager;

class ReplInterpreter {
public:
    ReplInterpreter();

    // Execute REPL code and return output lines
    std::vector<std::string> execute(const std::string& code);

    // Clear all variables
    void clear();

    // Set output callback (for println, print)
    void setOutputCallback(std::function<void(const std::string&)> callback);

    // Set dossier manager for state tracking
    void setDossierManager(std::shared_ptr<DossierManager> dossier);

    // Video variable management (legacy - will be replaced by layer system)
    std::shared_ptr<VideoVariable> getVideoVariable(const std::string& name);
    const std::map<std::string, std::shared_ptr<VideoVariable>>& getVideoVariables() const { return videoVariables; }

    // Layer variable management
    std::shared_ptr<Layer> getLayer(const std::string& name);
    const std::map<std::string, std::shared_ptr<Layer>>& getLayers() const { return layers; }

    // Output variable management
    std::shared_ptr<OutputVariable> getOutputVariable(const std::string& name);
    const std::map<std::string, std::shared_ptr<OutputVariable>>& getOutputVariables() const { return outputVariables; }

    // Execute all active video pipelines (fetch frames, update textures)
    void executeVideoPipeline();

private:
    std::map<std::string, std::string> variables;  // String variable storage
    std::map<std::string, std::shared_ptr<VideoVariable>> videoVariables;  // Video variable storage (legacy)
    std::map<std::string, std::shared_ptr<Layer>> layers;  // Layer objects
    std::map<std::string, std::shared_ptr<OutputVariable>> outputVariables;  // Output variables
    std::map<std::string, std::shared_ptr<VideoSource>> inputSources;  // Input sources (for layer casting)

    std::shared_ptr<DossierManager> dossierManager;  // State tracking

    std::vector<std::string> outputLines;
    std::function<void(const std::string&)> outputCallback;
    bool lastWasPrintln;  // Track if last output was println (completed line)

    // Parse and execute a single line
    void executeLine(const std::string& line);

    // Evaluate an expression
    std::string evaluateExpression(const std::string& expr);

    // Helper to trim whitespace
    std::string trim(const std::string& str);

    // Parse tuple syntax: (x, y) -> vector of values
    std::vector<std::string> parseTuple(const std::string& tupleStr);

    // Parse method call: object.method(args) -> {object, method, args}
    struct MethodCall {
        std::string object;
        std::string method;
        std::vector<std::string> args;
    };
    bool parseMethodCall(const std::string& stmt, MethodCall& result);

    // Execute a method call
    void executeMethodCall(const MethodCall& call);
};

#endif // REPL_INTERPRETER_H
