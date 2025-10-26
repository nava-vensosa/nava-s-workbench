#ifndef DOSSIER_MANAGER_H
#define DOSSIER_MANAGER_H

#include <string>
#include <vector>
#include <map>
#include <memory>
#include "video_source.h"
#include "layer.h"
#include "output_variable.h"

// Forward declaration
struct GLFWmonitor;

// Monitor information
struct MonitorInfo {
    std::string name;
    int index;
    int width;
    int height;
    int refreshRate;
    bool isPrimary;
};

// Input variable info for dossier
struct InputVariableInfo {
    std::string name;
    int deviceIndex;
    std::string deviceName;
    int width;
    int height;
};

// Output variable info for dossier
struct OutputVariableInfo {
    std::string name;
    std::string target;
    int layerCount;
    std::vector<std::string> layerNames;  // Ordered by z-index
};

// Layer info for dossier
struct LayerInfo {
    std::string name;
    int canvasWidth;
    int canvasHeight;
    float posX;
    float posY;
    float scaleX;
    float scaleY;
    float rotXY;
    float rotY;
    float opacity;
    std::string sourceName;  // Name of in_var (if any)
};

// Dossier manager for tracking and serializing all state
class DossierManager {
public:
    DossierManager();

    // Device enumeration
    void updateVideoDevices();
    const std::vector<VideoSource::DeviceInfo>& getVideoDevices() const { return videoDevices; }

    // Monitor enumeration
    void updateMonitors();
    const std::vector<MonitorInfo>& getMonitors() const { return monitors; }

    // Variable tracking
    void registerInputVariable(const std::string& name, int deviceIndex, std::shared_ptr<VideoSource> source);
    void registerOutputVariable(const std::string& name, const std::string& target, std::shared_ptr<OutputVariable> output);
    void registerLayer(const std::string& name, std::shared_ptr<Layer> layer);

    void unregisterInputVariable(const std::string& name);
    void unregisterOutputVariable(const std::string& name);
    void unregisterLayer(const std::string& name);

    // Get tracked variables
    const std::map<std::string, InputVariableInfo>& getInputVariables() const { return inputVariables; }
    const std::map<std::string, OutputVariableInfo>& getOutputVariables() const { return outputVariables; }
    const std::map<std::string, LayerInfo>& getLayers() const { return layers; }

    // JSON serialization
    std::string toJSON() const;

    // Save to file
    bool saveToFile(const std::string& filename) const;

private:
    std::vector<VideoSource::DeviceInfo> videoDevices;
    std::vector<MonitorInfo> monitors;

    std::map<std::string, InputVariableInfo> inputVariables;
    std::map<std::string, OutputVariableInfo> outputVariables;
    std::map<std::string, LayerInfo> layers;

    // Store references to live objects for updating
    std::map<std::string, std::shared_ptr<VideoSource>> inputSources;
    std::map<std::string, std::shared_ptr<OutputVariable>> outputObjects;
    std::map<std::string, std::shared_ptr<Layer>> layerObjects;

    // Helper: escape JSON string
    std::string escapeJSON(const std::string& str) const;

    // Helper: format JSON number
    std::string formatNumber(float value) const;
};

#endif // DOSSIER_MANAGER_H
