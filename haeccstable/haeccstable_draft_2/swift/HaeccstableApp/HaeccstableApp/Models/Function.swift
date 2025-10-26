//
// Function.swift
// HaeccstableApp
//
// Represents a user-defined function in the Haeccstable DSL.
// Example: func ratio(x, y) = x / y
//

import Foundation

/// A user-defined function
struct Function: Codable {
    let name: String
    let parameters: [String]
    let body: String  // Expression body (e.g., "x / y")

    /// When the function was defined
    let createdAt: Date

    init(name: String, parameters: [String], body: String) {
        self.name = name
        self.parameters = parameters
        self.body = body
        self.createdAt = Date()
    }
}

extension Function {
    /// Convert to dictionary for dossier.json
    func toDictionary() -> [String: Any] {
        return [
            "name": name,
            "parameters": parameters,
            "body": body,
            "created_at": ISO8601DateFormatter().string(from: createdAt)
        ]
    }
}
