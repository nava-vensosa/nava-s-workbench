//
// DossierManager.swift
// HaeccstableApp
//
// Manages reading and writing the dossier.json file.
// The dossier is the persistent state file that stores all variables, functions, processes, etc.
//

import Foundation

/// Manages dossier.json persistence
class DossierManager {
    private let dossierPath: String
    private let logger: Logger

    private var dossierData: [String: Any] = [:]

    init(dossierPath: String, logger: Logger) {
        self.dossierPath = dossierPath
        self.logger = logger
        loadDossier()
    }

    // MARK: - Load/Save

    /// Load dossier from disk
    private func loadDossier() {
        do {
            let data = try Data(contentsOf: URL(fileURLWithPath: dossierPath))
            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                dossierData = json
                logger.info("Dossier loaded from \(dossierPath)")
            }
        } catch {
            // If file doesn't exist or is invalid, create template
            logger.warning("Could not load dossier, creating template: \(error)")
            createTemplate()
        }
    }

    /// Save dossier to disk
    private func saveDossier() {
        do {
            let data = try JSONSerialization.data(withJSONObject: dossierData, options: [.prettyPrinted, .sortedKeys])
            try data.write(to: URL(fileURLWithPath: dossierPath))
            logger.debug("Dossier saved")
        } catch {
            logger.error("Failed to save dossier: \(error)")
        }
    }

    /// Create template dossier
    private func createTemplate() {
        dossierData = [
            "session": [
                "start_time": ISO8601DateFormatter().string(from: Date()),
                "description": "Haeccstable Session"
            ],
            "devices": [:],
            "variables": [:],
            "functions": [:],
            "processes": [:],
            "layers": [:],
            "windows": [:]
        ]
        saveDossier()
    }

    // MARK: - Variable Operations

    func updateVariable(_ variable: Variable) {
        if dossierData["variables"] == nil {
            dossierData["variables"] = [:]
        }

        var variables = dossierData["variables"] as? [String: Any] ?? [:]
        variables[variable.name] = variable.toDictionary()
        dossierData["variables"] = variables

        saveDossier()
    }

    func removeVariable(_ name: String) {
        if var variables = dossierData["variables"] as? [String: Any] {
            variables.removeValue(forKey: name)
            dossierData["variables"] = variables
            saveDossier()
        }
    }

    // MARK: - Function Operations

    func updateFunction(_ function: Function) {
        if dossierData["functions"] == nil {
            dossierData["functions"] = [:]
        }

        var functions = dossierData["functions"] as? [String: Any] ?? [:]
        functions[function.name] = function.toDictionary()
        dossierData["functions"] = functions

        saveDossier()
    }

    func removeFunction(_ name: String) {
        if var functions = dossierData["functions"] as? [String: Any] {
            functions.removeValue(forKey: name)
            dossierData["functions"] = functions
            saveDossier()
        }
    }

    // MARK: - Process Operations

    func updateProcess(_ process: Process) {
        if dossierData["processes"] == nil {
            dossierData["processes"] = [:]
        }

        var processes = dossierData["processes"] as? [String: Any] ?? [:]
        processes[process.name] = process.toDictionary()
        dossierData["processes"] = processes

        saveDossier()
    }

    func removeProcess(_ name: String) {
        if var processes = dossierData["processes"] as? [String: Any] {
            processes.removeValue(forKey: name)
            dossierData["processes"] = processes
            saveDossier()
        }
    }

    // MARK: - Layer Operations

    func updateLayer(_ layer: Layer) {
        if dossierData["layers"] == nil {
            dossierData["layers"] = [:]
        }

        var layers = dossierData["layers"] as? [String: Any] ?? [:]
        layers[layer.name] = layer.toDictionary()
        dossierData["layers"] = layers

        saveDossier()
    }

    func removeLayer(_ name: String) {
        if var layers = dossierData["layers"] as? [String: Any] {
            layers.removeValue(forKey: name)
            dossierData["layers"] = layers
            saveDossier()
        }
    }

    // MARK: - Window Operations

    func updateWindow(_ window: Window) {
        if dossierData["windows"] == nil {
            dossierData["windows"] = [:]
        }

        var windows = dossierData["windows"] as? [String: Any] ?? [:]
        windows[window.name] = window.toDictionary()
        dossierData["windows"] = windows

        saveDossier()
    }

    func removeWindow(_ name: String) {
        if var windows = dossierData["windows"] as? [String: Any] {
            windows.removeValue(forKey: name)
            dossierData["windows"] = windows
            saveDossier()
        }
    }

    // MARK: - Utilities

    /// Get current dossier as dictionary
    func getDossierData() -> [String: Any] {
        return dossierData
    }

    /// Clear all state (for testing/reset)
    func clearAll() {
        createTemplate()
        logger.info("Dossier cleared")
    }
}
