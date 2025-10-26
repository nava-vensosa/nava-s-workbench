#include "dossier_manager.h"
#include <glad/glad.h>  // Must include GLAD before GLFW
#define GLFW_INCLUDE_NONE  // Prevent GLFW from including system OpenGL headers
#include <GLFW/glfw3.h>
#include <fstream>
#include <sstream>
#include <iostream>
#include <iomanip>

DossierManager::DossierManager() {
}

void DossierManager::updateVideoDevices() {
    videoDevices = VideoSource::enumerateDevices();
    std::cout << "Enumerated " << videoDevices.size() << " video devices\n";
}

void DossierManager::updateMonitors() {
    monitors.clear();

    int count;
    GLFWmonitor** glfwMonitors = glfwGetMonitors(&count);
    GLFWmonitor* primaryMonitor = glfwGetPrimaryMonitor();

    // Enumerate physical monitors
    for (int i = 0; i < count; i++) {
        MonitorInfo info;
        info.index = i;
        info.name = glfwGetMonitorName(glfwMonitors[i]);
        info.isPrimary = (glfwMonitors[i] == primaryMonitor);

        const GLFWvidmode* mode = glfwGetVideoMode(glfwMonitors[i]);
        if (mode) {
            info.width = mode->width;
            info.height = mode->height;
            info.refreshRate = mode->refreshRate;
        } else {
            info.width = 0;
            info.height = 0;
            info.refreshRate = 0;
        }

        monitors.push_back(info);
    }

    // Add virtual monitors
    // Virtual monitor1 (1920x1080 desktop display)
    MonitorInfo virtualMonitor1;
    virtualMonitor1.index = count;
    virtualMonitor1.name = "Virtual monitor1 (1920x1080)";
    virtualMonitor1.width = 1920;
    virtualMonitor1.height = 1080;
    virtualMonitor1.refreshRate = 60;
    virtualMonitor1.isPrimary = false;
    monitors.push_back(virtualMonitor1);

    // Virtual monitor2 (1080x1920 mobile display - 9:16 portrait)
    MonitorInfo virtualMonitor2;
    virtualMonitor2.index = count + 1;
    virtualMonitor2.name = "Virtual monitor2 (1080x1920 mobile)";
    virtualMonitor2.width = 1080;
    virtualMonitor2.height = 1920;
    virtualMonitor2.refreshRate = 60;
    virtualMonitor2.isPrimary = false;
    monitors.push_back(virtualMonitor2);

    std::cout << "Enumerated " << monitors.size() << " monitors ("
              << count << " physical, " << (monitors.size() - count) << " virtual)\n";
}

void DossierManager::registerInputVariable(const std::string& name, int deviceIndex,
                                            std::shared_ptr<VideoSource> source) {
    InputVariableInfo info;
    info.name = name;
    info.deviceIndex = deviceIndex;

    // Find device name from enumerated devices
    for (const auto& dev : videoDevices) {
        if (dev.index == deviceIndex) {
            info.deviceName = dev.name;
            break;
        }
    }

    if (source && source->isOpen()) {
        info.width = source->getWidth();
        info.height = source->getHeight();
    } else {
        info.width = 0;
        info.height = 0;
    }

    inputVariables[name] = info;
    inputSources[name] = source;

    std::cout << "Registered input variable '" << name << "' (device " << deviceIndex << ")\n";
}

void DossierManager::registerOutputVariable(const std::string& name, const std::string& target,
                                             std::shared_ptr<OutputVariable> output) {
    OutputVariableInfo info;
    info.name = name;
    info.target = target;

    if (output) {
        const auto& stack = output->getLayerStack();
        info.layerCount = stack.size();
        for (const auto& entry : stack) {
            if (entry.layer) {
                info.layerNames.push_back(entry.layer->getName());
            }
        }
    } else {
        info.layerCount = 0;
    }

    outputVariables[name] = info;
    outputObjects[name] = output;

    std::cout << "Registered output variable '" << name << "' -> " << target << "\n";
}

void DossierManager::registerLayer(const std::string& name, std::shared_ptr<Layer> layer) {
    LayerInfo info;
    info.name = name;

    if (layer) {
        info.canvasWidth = layer->getCanvasWidth();
        info.canvasHeight = layer->getCanvasHeight();
        info.posX = layer->getPosX();
        info.posY = layer->getPosY();
        info.scaleX = layer->getScaleX();
        info.scaleY = layer->getScaleY();
        info.rotXY = layer->getRotXY();
        info.rotY = layer->getRotY();
        info.opacity = layer->getOpacity();

        // Find source name if layer has a source
        auto source = layer->getSource();
        if (source) {
            for (const auto& [varName, varSource] : inputSources) {
                if (varSource == source) {
                    info.sourceName = varName;
                    break;
                }
            }
        }
    } else {
        info.canvasWidth = -1;
        info.canvasHeight = -1;
        info.posX = 0.0f;
        info.posY = 0.0f;
        info.scaleX = 1.0f;
        info.scaleY = 1.0f;
        info.rotXY = 0.0f;
        info.rotY = 0.0f;
        info.opacity = 100.0f;
    }

    layers[name] = info;
    layerObjects[name] = layer;

    std::cout << "Registered layer '" << name << "'\n";
}

void DossierManager::unregisterInputVariable(const std::string& name) {
    inputVariables.erase(name);
    inputSources.erase(name);
}

void DossierManager::unregisterOutputVariable(const std::string& name) {
    outputVariables.erase(name);
    outputObjects.erase(name);
}

void DossierManager::unregisterLayer(const std::string& name) {
    layers.erase(name);
    layerObjects.erase(name);
}

std::string DossierManager::escapeJSON(const std::string& str) const {
    std::string escaped;
    for (char c : str) {
        switch (c) {
            case '"':  escaped += "\\\""; break;
            case '\\': escaped += "\\\\"; break;
            case '\n': escaped += "\\n"; break;
            case '\r': escaped += "\\r"; break;
            case '\t': escaped += "\\t"; break;
            default:   escaped += c; break;
        }
    }
    return escaped;
}

std::string DossierManager::formatNumber(float value) const {
    std::ostringstream oss;
    oss << std::fixed << std::setprecision(2) << value;
    return oss.str();
}

std::string DossierManager::toJSON() const {
    std::ostringstream json;
    json << "{\n";

    // Video devices
    json << "  \"videoDevices\": [\n";
    for (size_t i = 0; i < videoDevices.size(); i++) {
        const auto& dev = videoDevices[i];
        json << "    {\n";
        json << "      \"index\": " << dev.index << ",\n";
        json << "      \"id\": \"" << escapeJSON(dev.id) << "\",\n";
        json << "      \"name\": \"" << escapeJSON(dev.name) << "\"\n";
        json << "    }";
        if (i < videoDevices.size() - 1) json << ",";
        json << "\n";
    }
    json << "  ],\n";

    // Monitors
    json << "  \"monitors\": [\n";
    for (size_t i = 0; i < monitors.size(); i++) {
        const auto& mon = monitors[i];
        json << "    {\n";
        json << "      \"index\": " << mon.index << ",\n";
        json << "      \"name\": \"" << escapeJSON(mon.name) << "\",\n";
        json << "      \"width\": " << mon.width << ",\n";
        json << "      \"height\": " << mon.height << ",\n";
        json << "      \"refreshRate\": " << mon.refreshRate << ",\n";
        json << "      \"isPrimary\": " << (mon.isPrimary ? "true" : "false") << "\n";
        json << "    }";
        if (i < monitors.size() - 1) json << ",";
        json << "\n";
    }
    json << "  ],\n";

    // Input variables
    json << "  \"inputVariables\": {\n";
    size_t idx = 0;
    for (const auto& [name, info] : inputVariables) {
        json << "    \"" << escapeJSON(name) << "\": {\n";
        json << "      \"deviceIndex\": " << info.deviceIndex << ",\n";
        json << "      \"deviceName\": \"" << escapeJSON(info.deviceName) << "\",\n";
        json << "      \"width\": " << info.width << ",\n";
        json << "      \"height\": " << info.height << "\n";
        json << "    }";
        if (idx < inputVariables.size() - 1) json << ",";
        json << "\n";
        idx++;
    }
    json << "  },\n";

    // Output variables
    json << "  \"outputVariables\": {\n";
    idx = 0;
    for (const auto& [name, info] : outputVariables) {
        json << "    \"" << escapeJSON(name) << "\": {\n";
        json << "      \"target\": \"" << escapeJSON(info.target) << "\",\n";
        json << "      \"layerCount\": " << info.layerCount << ",\n";
        json << "      \"layers\": [";
        for (size_t i = 0; i < info.layerNames.size(); i++) {
            json << "\"" << escapeJSON(info.layerNames[i]) << "\"";
            if (i < info.layerNames.size() - 1) json << ", ";
        }
        json << "]\n";
        json << "    }";
        if (idx < outputVariables.size() - 1) json << ",";
        json << "\n";
        idx++;
    }
    json << "  },\n";

    // Layers
    json << "  \"layers\": {\n";
    idx = 0;
    for (const auto& [name, info] : layers) {
        json << "    \"" << escapeJSON(name) << "\": {\n";
        json << "      \"canvas\": [" << info.canvasWidth << ", " << info.canvasHeight << "],\n";
        json << "      \"position\": [" << formatNumber(info.posX) << ", " << formatNumber(info.posY) << "],\n";
        json << "      \"scale\": [" << formatNumber(info.scaleX) << ", " << formatNumber(info.scaleY) << "],\n";
        json << "      \"rotation\": [" << formatNumber(info.rotXY) << ", " << formatNumber(info.rotY) << "],\n";
        json << "      \"opacity\": " << formatNumber(info.opacity) << ",\n";
        json << "      \"source\": \"" << escapeJSON(info.sourceName) << "\"\n";
        json << "    }";
        if (idx < layers.size() - 1) json << ",";
        json << "\n";
        idx++;
    }
    json << "  }\n";

    json << "}\n";

    return json.str();
}

bool DossierManager::saveToFile(const std::string& filename) const {
    std::string jsonContent = toJSON();

    std::ofstream file(filename);
    if (!file.is_open()) {
        std::cerr << "ERROR: Failed to open " << filename << " for writing\n";
        return false;
    }

    file << jsonContent;
    file.close();

    std::cout << "Saved dossier to " << filename << "\n";
    return true;
}
