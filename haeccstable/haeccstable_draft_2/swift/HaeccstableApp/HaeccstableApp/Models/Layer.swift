//
// Layer.swift
// HaeccstableApp
//
// Represents a layer in the Haeccstable system.
// Layers are intermediate rendering surfaces that can contain video/graphics.
// Multiple layers can be projected onto windows with different properties per window.
//

import Foundation

/// A layer object with dimensions and default properties
struct Layer: Codable {
    let name: String
    let width: Int
    let height: Int

    /// Global default properties (used when window doesn't override)
    var defaultOpacity: Double
    var defaultPosition: [Double]  // [x, y]
    var defaultScale: [Double]     // [x_scale, y_scale]

    /// Source video/content cast to this layer (optional)
    var source: String?  // Name of video_invar

    /// When the layer was created
    let createdAt: Date

    init(name: String, width: Int, height: Int) {
        self.name = name
        self.width = width
        self.height = height
        self.defaultOpacity = 1.0
        self.defaultPosition = [0.0, 0.0]
        self.defaultScale = [1.0, 1.0]
        self.source = nil
        self.createdAt = Date()
    }
}

extension Layer {
    /// Convert to dictionary for dossier.json
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "name": name,
            "width": width,
            "height": height,
            "default_opacity": defaultOpacity,
            "default_position": defaultPosition,
            "default_scale": defaultScale,
            "created_at": ISO8601DateFormatter().string(from: createdAt)
        ]

        if let src = source {
            dict["source"] = src
        }

        return dict
    }
}
