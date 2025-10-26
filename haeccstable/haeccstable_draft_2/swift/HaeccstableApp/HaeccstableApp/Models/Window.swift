//
// Window.swift
// HaeccstableApp
//
// Represents a window in the Haeccstable system.
// Windows display layers with customizable properties per layer.
// Multiple layers can be stacked with priority-based ordering.
//

import Foundation

/// Window-specific layer properties (overrides layer defaults)
struct WindowLayer: Codable {
    let layerName: String       // Reference to layer_obj
    var priority: Int           // Z-order (higher = front)
    var opacity: Double?        // Override (0.0-1.0), nil = use layer default
    var position: [Double]?     // Override [x, y], nil = use layer default
    var scale: [Double]?        // Override [x_scale, y_scale], nil = use layer default

    init(layerName: String, priority: Int) {
        self.layerName = layerName
        self.priority = priority
        self.opacity = nil
        self.position = nil
        self.scale = nil
    }
}

extension WindowLayer {
    /// Convert to dictionary for dossier.json
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "layer": layerName,
            "priority": priority
        ]

        if let op = opacity {
            dict["opacity"] = op
        }
        if let pos = position {
            dict["position"] = pos
        }
        if let sc = scale {
            dict["scale"] = sc
        }

        return dict
    }
}

/// A window with title, dimensions, and layer stack
struct Window: Codable {
    let name: String
    let title: String
    let width: Int
    let height: Int

    /// Layer stack (sorted by priority, higher = front)
    var layerStack: [WindowLayer]

    /// When the window was created
    let createdAt: Date

    init(name: String, title: String, width: Int, height: Int) {
        self.name = name
        self.title = title
        self.width = width
        self.height = height
        self.layerStack = []
        self.createdAt = Date()
    }
}

extension Window {
    /// Convert to dictionary for dossier.json
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "name": name,
            "title": title,
            "width": width,
            "height": height,
            "created_at": ISO8601DateFormatter().string(from: createdAt)
        ]

        if !layerStack.isEmpty {
            dict["layers"] = layerStack.map { $0.toDictionary() }
        }

        return dict
    }

    /// Add a layer to the stack with given priority
    mutating func addLayer(_ layerName: String, priority: Int) {
        let windowLayer = WindowLayer(layerName: layerName, priority: priority)
        layerStack.append(windowLayer)
        sortLayerStack()
    }

    /// Remove a layer from the stack
    mutating func removeLayer(_ layerName: String) {
        layerStack.removeAll { $0.layerName == layerName }
    }

    /// Update layer priority
    mutating func setLayerPriority(_ layerName: String, priority: Int) {
        if let index = layerStack.firstIndex(where: { $0.layerName == layerName }) {
            layerStack[index].priority = priority
            sortLayerStack()
        }
    }

    /// Update layer opacity (window-specific override)
    mutating func setLayerOpacity(_ layerName: String, opacity: Double) {
        if let index = layerStack.firstIndex(where: { $0.layerName == layerName }) {
            layerStack[index].opacity = opacity
        }
    }

    /// Update layer position (window-specific override)
    mutating func setLayerPosition(_ layerName: String, position: [Double]) {
        if let index = layerStack.firstIndex(where: { $0.layerName == layerName }) {
            layerStack[index].position = position
        }
    }

    /// Update layer scale (window-specific override)
    mutating func setLayerScale(_ layerName: String, scale: [Double]) {
        if let index = layerStack.firstIndex(where: { $0.layerName == layerName }) {
            layerStack[index].scale = scale
        }
    }

    /// Sort layer stack by priority (higher priority = rendered on top)
    private mutating func sortLayerStack() {
        layerStack.sort { $0.priority < $1.priority }
    }
}
