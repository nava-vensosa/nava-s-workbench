//
// Variable.swift
// HaeccstableApp
//
// Represents a variable in the Haeccstable system.
// Variables can be video sources, audio sources, windows, layers, numbers, or generic values.
//

import Foundation

/// Variable types supported by Haeccstable DSL
enum VariableType: String, Codable {
    case videoInvar = "video_invar"
    case videoOutvar = "video_outvar"
    case audioInvar = "audio_invar"
    case audioOutvar = "audio_outvar"
    case windowVar = "window_var"
    case layerObj = "layer_obj"
    case numberVar = "number_var"
    case genericVar = "var"
}

/// A variable instance with name, type, and value
struct Variable: Codable {
    let name: String
    let type: VariableType
    var value: VariableValue

    /// When the variable was created
    let createdAt: Date

    /// Optional metadata
    var metadata: [String: String]?

    init(name: String, type: VariableType, value: VariableValue) {
        self.name = name
        self.type = type
        self.value = value
        self.createdAt = Date()
        self.metadata = nil
    }
}

/// Variable value types - can be different data types
enum VariableValue: Codable {
    case string(String)
    case number(Double)
    case boolean(Bool)
    case tuple([Double])
    case deviceReference(Int)  // For capture(0), capture(1), etc.
    case null

    enum CodingKeys: String, CodingKey {
        case type, value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)

        switch type {
        case "string":
            let val = try container.decode(String.self, forKey: .value)
            self = .string(val)
        case "number":
            let val = try container.decode(Double.self, forKey: .value)
            self = .number(val)
        case "boolean":
            let val = try container.decode(Bool.self, forKey: .value)
            self = .boolean(val)
        case "tuple":
            let val = try container.decode([Double].self, forKey: .value)
            self = .tuple(val)
        case "deviceReference":
            let val = try container.decode(Int.self, forKey: .value)
            self = .deviceReference(val)
        case "null":
            self = .null
        default:
            self = .null
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)

        switch self {
        case .string(let val):
            try container.encode("string", forKey: .type)
            try container.encode(val, forKey: .value)
        case .number(let val):
            try container.encode("number", forKey: .type)
            try container.encode(val, forKey: .value)
        case .boolean(let val):
            try container.encode("boolean", forKey: .type)
            try container.encode(val, forKey: .value)
        case .tuple(let val):
            try container.encode("tuple", forKey: .type)
            try container.encode(val, forKey: .value)
        case .deviceReference(let val):
            try container.encode("deviceReference", forKey: .type)
            try container.encode(val, forKey: .value)
        case .null:
            try container.encode("null", forKey: .type)
        }
    }
}

extension Variable {
    /// Convert to dictionary for dossier.json
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "type": type.rawValue,
            "created_at": ISO8601DateFormatter().string(from: createdAt)
        ]

        // Add value based on type
        switch value {
        case .string(let val):
            dict["value"] = val
        case .number(let val):
            dict["value"] = val
        case .boolean(let val):
            dict["value"] = val
        case .tuple(let val):
            dict["value"] = val
        case .deviceReference(let val):
            dict["device_id"] = val
        case .null:
            dict["value"] = NSNull()
        }

        if let meta = metadata {
            dict["metadata"] = meta
        }

        return dict
    }
}
