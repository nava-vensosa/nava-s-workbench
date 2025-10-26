//
// StateManager.swift
// HaeccstableApp
//
// Manages the runtime state of the Haeccstable system.
// Stores variables, functions, processes, layers, and windows in memory.
// Coordinates with DossierManager to persist state to disk.
//

import Foundation

/// Manages all runtime state for Haeccstable
class StateManager {
    // MARK: - State Storage

    private var variables: [String: Variable] = [:]
    private var functions: [String: Function] = [:]
    private var processes: [String: Process] = [:]
    private var layers: [String: Layer] = [:]
    private var windows: [String: Window] = [:]

    private let dossierManager: DossierManager
    private let logger: Logger

    // MARK: - Initialization

    init(dossierManager: DossierManager, logger: Logger) {
        self.dossierManager = dossierManager
        self.logger = logger
    }

    // MARK: - Variable Management

    /// Create or update a variable
    func setVariable(name: String, type: VariableType, value: VariableValue) {
        let variable = Variable(name: name, type: type, value: value)
        variables[name] = variable
        dossierManager.updateVariable(variable)
        logger.info("Variable '\(name)' set (type: \(type.rawValue))")
    }

    /// Get a variable by name
    func getVariable(_ name: String) -> Variable? {
        return variables[name]
    }

    /// Remove a variable (for dd cleanup)
    func removeVariable(_ name: String) {
        if let variable = variables.removeValue(forKey: name) {
            dossierManager.removeVariable(name)
            logger.info("Variable '\(name)' removed")
        }
    }

    /// Check if variable exists
    func hasVariable(_ name: String) -> Bool {
        return variables[name] != nil
    }

    // MARK: - Function Management

    /// Define a function
    func defineFunction(name: String, parameters: [String], body: String) {
        let function = Function(name: name, parameters: parameters, body: body)
        functions[name] = function
        dossierManager.updateFunction(function)
        logger.info("Function '\(name)' defined")
    }

    /// Get a function by name
    func getFunction(_ name: String) -> Function? {
        return functions[name]
    }

    /// Remove a function
    func removeFunction(_ name: String) {
        if let _ = functions.removeValue(forKey: name) {
            dossierManager.removeFunction(name)
            logger.info("Function '\(name)' removed")
        }
    }

    // MARK: - Process Management

    /// Define a process
    func defineProcess(name: String, parameters: [String], body: String?) {
        let process = Process(name: name, parameters: parameters, body: body)
        processes[name] = process
        dossierManager.updateProcess(process)
        logger.info("Process '\(name)' defined")
    }

    /// Get a process by name
    func getProcess(_ name: String) -> Process? {
        return processes[name]
    }

    /// Remove a process
    func removeProcess(_ name: String) {
        if let _ = processes.removeValue(forKey: name) {
            dossierManager.removeProcess(name)
            logger.info("Process '\(name)' removed")
        }
    }

    /// Update process status
    func updateProcessStatus(_ name: String, status: ProcessStatus) {
        if var process = processes[name] {
            process.status = status
            processes[name] = process
            dossierManager.updateProcess(process)
        }
    }

    // MARK: - Layer Management

    /// Create a layer
    func createLayer(name: String, width: Int, height: Int) {
        let layer = Layer(name: name, width: width, height: height)
        layers[name] = layer
        dossierManager.updateLayer(layer)
        logger.info("Layer '\(name)' created (\(width)x\(height))")
    }

    /// Get a layer by name
    func getLayer(_ name: String) -> Layer? {
        return layers[name]
    }

    /// Remove a layer
    func removeLayer(_ name: String) {
        if let _ = layers.removeValue(forKey: name) {
            dossierManager.removeLayer(name)
            logger.info("Layer '\(name)' removed")
        }
    }

    /// Set layer source (cast operation)
    func setLayerSource(_ layerName: String, sourceName: String?) {
        if var layer = layers[layerName] {
            layer.source = sourceName
            layers[layerName] = layer
            dossierManager.updateLayer(layer)
            if let src = sourceName {
                logger.info("Layer '\(layerName)' source set to '\(src)'")
            } else {
                logger.info("Layer '\(layerName)' source cleared")
            }
        }
    }

    /// Update layer default properties
    func updateLayerDefaults(_ layerName: String, opacity: Double? = nil, position: [Double]? = nil, scale: [Double]? = nil) {
        if var layer = layers[layerName] {
            if let op = opacity {
                layer.defaultOpacity = op
            }
            if let pos = position {
                layer.defaultPosition = pos
            }
            if let sc = scale {
                layer.defaultScale = sc
            }
            layers[layerName] = layer
            dossierManager.updateLayer(layer)
        }
    }

    // MARK: - Window Management

    /// Create a window
    func createWindow(name: String, title: String, width: Int, height: Int) {
        let window = Window(name: name, title: title, width: width, height: height)
        windows[name] = window
        dossierManager.updateWindow(window)
        logger.info("Window '\(name)' created (\(width)x\(height))")
    }

    /// Get a window by name
    func getWindow(_ name: String) -> Window? {
        return windows[name]
    }

    /// Remove a window
    func removeWindow(_ name: String) {
        if let _ = windows.removeValue(forKey: name) {
            dossierManager.removeWindow(name)
            logger.info("Window '\(name)' removed")
        }
    }

    // MARK: - Multi-Layer Window Operations

    /// Add layer to window with priority
    func windowProjectLayer(_ windowName: String, layerName: String, priority: Int) {
        if var window = windows[windowName] {
            window.addLayer(layerName, priority: priority)
            windows[windowName] = window
            dossierManager.updateWindow(window)
            logger.info("Layer '\(layerName)' projected to window '\(windowName)' (priority: \(priority))")
        }
    }

    /// Remove layer from window
    func windowRemoveLayer(_ windowName: String, layerName: String) {
        if var window = windows[windowName] {
            window.removeLayer(layerName)
            windows[windowName] = window
            dossierManager.updateWindow(window)
            logger.info("Layer '\(layerName)' removed from window '\(windowName)'")
        }
    }

    /// Set layer priority on a window
    func windowSetLayerPriority(_ windowName: String, layerName: String, priority: Int) {
        if var window = windows[windowName] {
            window.setLayerPriority(layerName, priority: priority)
            windows[windowName] = window
            dossierManager.updateWindow(window)
            logger.info("Layer '\(layerName)' priority set to \(priority) on window '\(windowName)'")
        }
    }

    /// Set layer opacity on a window (window-specific override)
    func windowSetLayerOpacity(_ windowName: String, layerName: String, opacity: Double) {
        if var window = windows[windowName] {
            window.setLayerOpacity(layerName, opacity: opacity)
            windows[windowName] = window
            dossierManager.updateWindow(window)
            logger.info("Layer '\(layerName)' opacity set to \(opacity) on window '\(windowName)'")
        }
    }

    /// Set layer position on a window (window-specific override)
    func windowSetLayerPosition(_ windowName: String, layerName: String, position: [Double]) {
        if var window = windows[windowName] {
            window.setLayerPosition(layerName, position: position)
            windows[windowName] = window
            dossierManager.updateWindow(window)
            logger.info("Layer '\(layerName)' position set to \(position) on window '\(windowName)'")
        }
    }

    /// Set layer scale on a window (window-specific override)
    func windowSetLayerScale(_ windowName: String, layerName: String, scale: [Double]) {
        if var window = windows[windowName] {
            window.setLayerScale(layerName, scale: scale)
            windows[windowName] = window
            dossierManager.updateWindow(window)
            logger.info("Layer '\(layerName)' scale set to \(scale) on window '\(windowName)'")
        }
    }

    // MARK: - State Queries

    /// Get all variable names
    func getAllVariableNames() -> [String] {
        return Array(variables.keys)
    }

    /// Get all function names
    func getAllFunctionNames() -> [String] {
        return Array(functions.keys)
    }

    /// Get all process names
    func getAllProcessNames() -> [String] {
        return Array(processes.keys)
    }

    /// Get all layer names
    func getAllLayerNames() -> [String] {
        return Array(layers.keys)
    }

    /// Get all window names
    func getAllWindowNames() -> [String] {
        return Array(windows.keys)
    }

    /// Get state summary
    func getStateSummary() -> [String: Any] {
        return [
            "variables": variables.count,
            "functions": functions.count,
            "processes": processes.count,
            "layers": layers.count,
            "windows": windows.count
        ]
    }

    // MARK: - Reset

    /// Clear all state (for log clear command)
    func resetAll() {
        variables.removeAll()
        functions.removeAll()
        processes.removeAll()
        layers.removeAll()
        windows.removeAll()

        // Also clear the dossier
        dossierManager.clearAll()

        logger.info("All state cleared")
    }
}
