//
// ProcessRegistry.swift
// HaeccstableApp
//
// Registry of all available processes (filters/effects).
// Validates process names with $ prefix and manages built-in processes.
//

import Foundation

/// Registry of available processes
class ProcessRegistry {
    private let logger: Logger

    /// Built-in process definitions
    private let builtInProcesses: [String: [String]] = [
        "sobel": ["video", "threshold"],
        "dog": ["video", "sigma1", "sigma2"],
        "kuwahara": ["video", "radius"],
        "gaussian": ["video", "radius"],
        "ascii": ["video", "charset"]
    ]

    init(logger: Logger) {
        self.logger = logger
    }

    // MARK: - Process Validation

    /// Validate a process name (must start with $)
    func validateProcessName(_ name: String) -> Bool {
        return name.hasPrefix("$")
    }

    /// Get process name without $ prefix
    func stripProcessPrefix(_ name: String) -> String {
        if name.hasPrefix("$") {
            return String(name.dropFirst())
        }
        return name
    }

    /// Check if a process is built-in
    func isBuiltIn(_ processName: String) -> Bool {
        let name = stripProcessPrefix(processName)
        return builtInProcesses[name] != nil
    }

    /// Get parameters for a built-in process
    func getBuiltInParameters(_ processName: String) -> [String]? {
        let name = stripProcessPrefix(processName)
        return builtInProcesses[name]
    }

    /// Get all built-in process names
    func getAllBuiltInProcessNames() -> [String] {
        return Array(builtInProcesses.keys).sorted()
    }

    // MARK: - Process Execution

    /// Execute a process (stub for now, Phase 5 will implement actual filters)
    func executeProcess(_ processName: String, arguments: [String: Any]) -> Bool {
        let name = stripProcessPrefix(processName)

        if isBuiltIn(name) {
            logger.info("Executing built-in process '\(name)' (stub)")
            // TODO: Phase 5 - Implement actual filter execution
            return true
        } else {
            logger.warning("Unknown process '\(name)'")
            return false
        }
    }

    /// Stop a running process instance
    func stopProcess(_ instanceId: String) {
        logger.info("Stopping process instance '\(instanceId)' (stub)")
        // TODO: Phase 5 - Implement process stopping
    }
}
