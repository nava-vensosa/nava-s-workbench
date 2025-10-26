//
// Process.swift
// HaeccstableApp
//
// Represents a process (filter/effect) in the Haeccstable system.
// Processes transform video/audio streams (e.g., $sobel, $dog, $kuwahara).
//

import Foundation

/// Process status
enum ProcessStatus: String, Codable {
    case defined = "defined"      // Process definition exists
    case running = "running"      // Process is actively running
    case stopped = "stopped"      // Process was running but stopped
    case error = "error"          // Process encountered an error
}

/// A process definition or running instance
struct Process: Codable {
    let name: String              // Process name (without $ prefix)
    let parameters: [String]      // Parameter names
    var body: String?             // Process body (for user-defined processes)

    var status: ProcessStatus
    var runningInstances: [ProcessInstance]?

    /// When the process was defined
    let createdAt: Date

    init(name: String, parameters: [String], body: String? = nil) {
        self.name = name
        self.parameters = parameters
        self.body = body
        self.status = .defined
        self.runningInstances = []
        self.createdAt = Date()
    }
}

/// A running instance of a process with specific arguments
struct ProcessInstance: Codable {
    let id: String                // Unique instance ID
    let arguments: [String: Any]  // Actual argument values
    var status: ProcessStatus
    let startedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, arguments, status, startedAt
    }

    init(id: String, arguments: [String: Any]) {
        self.id = id
        self.arguments = arguments
        self.status = .running
        self.startedAt = Date()
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(status, forKey: .status)
        try container.encode(startedAt, forKey: .startedAt)

        // Encode arguments as JSON-compatible dictionary
        let jsonData = try JSONSerialization.data(withJSONObject: arguments)
        let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
        try container.encode(jsonString, forKey: .arguments)
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        status = try container.decode(ProcessStatus.self, forKey: .status)
        startedAt = try container.decode(Date.self, forKey: .startedAt)

        // Decode arguments from JSON string
        let jsonString = try container.decode(String.self, forKey: .arguments)
        if let jsonData = jsonString.data(using: .utf8),
           let dict = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
            arguments = dict
        } else {
            arguments = [:]
        }
    }
}

extension Process {
    /// Convert to dictionary for dossier.json
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "name": name,
            "parameters": parameters,
            "status": status.rawValue,
            "created_at": ISO8601DateFormatter().string(from: createdAt)
        ]

        if let processBody = body {
            dict["body"] = processBody
        }

        if let instances = runningInstances, !instances.isEmpty {
            dict["running_instances"] = instances.count
        }

        return dict
    }
}
