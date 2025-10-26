import Foundation

/// MessageRouter routes incoming IPC messages to appropriate command handlers
/// Parses message type and delegates to corresponding handler
class MessageRouter {

    // MARK: - Properties

    private let stateManager: StateManager
    private let processRegistry: ProcessRegistry
    private let logger: Logger

    // MARK: - Initialization

    init(stateManager: StateManager, processRegistry: ProcessRegistry, logger: Logger) {
        self.stateManager = stateManager
        self.processRegistry = processRegistry
        self.logger = logger
        logger.log("MessageRouter initialized")
    }

    // MARK: - Public Methods

    /// Route incoming message to appropriate handler
    /// - Parameter message: Parsed JSON message from client
    /// - Returns: Response dictionary to send back to client
    func route(message: [String: Any]) -> [String: Any] {
        // Extract message type
        guard let type = message["type"] as? String else {
            return createErrorResponse("Missing 'type' field in message")
        }

        logger.debug("Routing message type: \(type)")

        // Route based on message type
        switch type {
        case "declare_variable":
            return handleDeclareVariable(data: message["data"] as? [String: Any])

        case "call_function":
            return handleCallFunction(data: message["data"] as? [String: Any])

        case "call_process":
            return handleCallProcess(data: message["data"] as? [String: Any])

        case "method_call":
            return handleMethodCall(data: message["data"] as? [String: Any])

        case "property_assignment":
            return handlePropertyAssignment(data: message["data"] as? [String: Any])

        case "define_function":
            return handleDefineFunction(data: message["data"] as? [String: Any])

        case "define_process":
            return handleDefineProcess(data: message["data"] as? [String: Any])

        case "get_state":
            return handleGetState(data: message["data"] as? [String: Any])

        case "reset_state":
            return handleResetState()

        case "ping":
            return handlePing()

        default:
            return createErrorResponse("Unknown message type: \(type)")
        }
    }

    // MARK: - Command Handlers (Stubs for Phase 2 Day 1)

    private func handleDeclareVariable(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let varType = data["var_type"] as? String,
              let name = data["name"] as? String else {
            return createErrorResponse("Invalid declare_variable data")
        }

        // Parse variable type
        guard let type = VariableType(rawValue: varType) else {
            return createErrorResponse("Invalid variable type: \(varType)")
        }

        // Parse value
        let value: VariableValue
        if let valueData = data["value"] {
            // Parse based on type and value data
            if let stringValue = valueData as? String {
                value = .string(stringValue)
            } else if let numberValue = valueData as? Double {
                value = .number(numberValue)
            } else if let boolValue = valueData as? Bool {
                value = .boolean(boolValue)
            } else if let tupleValue = valueData as? [Double] {
                value = .tuple(tupleValue)
            } else if let deviceId = valueData as? Int {
                value = .deviceReference(deviceId)
            } else {
                value = .null
            }
        } else {
            value = .null
        }

        // Store variable in state
        stateManager.setVariable(name: name, type: type, value: value)

        logger.log("Variable '\(name)' declared: \(varType)")

        return [
            "status": "success",
            "type": "declare_variable",
            "message": "Variable '\(name)' declared"
        ]
    }

    private func handleCallFunction(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let name = data["name"] as? String,
              let arguments = data["arguments"] as? [Any] else {
            return createErrorResponse("Invalid call_function data")
        }

        // Check if function exists
        if let function = stateManager.getFunction(name) {
            logger.log("Function '\(name)' called with \(arguments.count) arguments")
            // TODO: Phase 4 - Execute function body
            return [
                "status": "success",
                "type": "call_function",
                "message": "Function '\(name)' called (stub)"
            ]
        } else {
            return createErrorResponse("Unknown function '\(name)'. Function not defined.")
        }
    }

    private func handleCallProcess(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let name = data["name"] as? String,
              let arguments = data["arguments"] as? [String: Any] else {
            return createErrorResponse("Invalid call_process data")
        }

        // Validate process name has $ prefix
        guard processRegistry.validateProcessName(name) else {
            return createErrorResponse("Process names must start with '$'. Did you mean '$\(name)'?")
        }

        // Check if process is built-in or user-defined
        let processName = processRegistry.stripProcessPrefix(name)

        if processRegistry.isBuiltIn(processName) {
            // Execute built-in process (stub for Phase 5)
            let success = processRegistry.executeProcess(name, arguments: arguments)
            if success {
                logger.log("Built-in process '\(name)' executed")
                return [
                    "status": "success",
                    "type": "call_process",
                    "message": "Process '\(name)' executed (stub)"
                ]
            } else {
                return createErrorResponse("Failed to execute process '\(name)'")
            }
        } else {
            // Check if user-defined process exists
            if let process = stateManager.getProcess(name) {
                logger.log("User-defined process '\(name)' called")
                // TODO: Phase 4 - Execute user-defined process body
                return [
                    "status": "success",
                    "type": "call_process",
                    "message": "User-defined process '\(name)' called (stub)"
                ]
            } else {
                return createErrorResponse("Unknown process '\(name)'. Process not defined.")
            }
        }
    }

    private func handleMethodCall(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let object = data["object"] as? String,
              let method = data["method"] as? String,
              let arguments = data["arguments"] as? [Any] else {
            return createErrorResponse("Invalid method_call data")
        }

        logger.log("Method call: \(object).\(method)")

        // Check if object is a variable
        guard let variable = stateManager.getVariable(object) else {
            return createErrorResponse("Unknown variable '\(object)'")
        }

        // Handle based on variable type and method
        switch variable.type {
        case .windowVar:
            return handleWindowMethod(windowName: object, method: method, arguments: arguments)
        case .layerObj:
            return handleLayerMethod(layerName: object, method: method, arguments: arguments)
        default:
            return createErrorResponse("Variable '\(object)' of type '\(variable.type.rawValue)' does not support method '\(method)'")
        }
    }

    // MARK: - Window Method Handlers

    private func handleWindowMethod(windowName: String, method: String, arguments: [Any]) -> [String: Any] {
        switch method {
        case "project":
            // window.project(layer, priority)
            guard arguments.count == 2,
                  let layerName = arguments[0] as? String,
                  let priority = arguments[1] as? Int else {
                return createErrorResponse("Invalid arguments for window.project(layer, priority)")
            }
            stateManager.windowProjectLayer(windowName, layerName: layerName, priority: priority)
            return [
                "status": "success",
                "type": "method_call",
                "message": "Layer '\(layerName)' projected to window '\(windowName)' with priority \(priority)"
            ]

        case "layerpriority":
            // window.layerpriority(layer, priority)
            guard arguments.count == 2,
                  let layerName = arguments[0] as? String,
                  let priority = arguments[1] as? Int else {
                return createErrorResponse("Invalid arguments for window.layerpriority(layer, priority)")
            }
            stateManager.windowSetLayerPriority(windowName, layerName: layerName, priority: priority)
            return [
                "status": "success",
                "type": "method_call",
                "message": "Layer '\(layerName)' priority set to \(priority) on window '\(windowName)'"
            ]

        case "layeropacity":
            // window.layeropacity(layer, opacity)
            guard arguments.count == 2,
                  let layerName = arguments[0] as? String,
                  let opacity = arguments[1] as? Double else {
                return createErrorResponse("Invalid arguments for window.layeropacity(layer, opacity)")
            }
            stateManager.windowSetLayerOpacity(windowName, layerName: layerName, opacity: opacity)
            return [
                "status": "success",
                "type": "method_call",
                "message": "Layer '\(layerName)' opacity set to \(opacity) on window '\(windowName)'"
            ]

        case "layerposition":
            // window.layerposition(layer, [x, y])
            guard arguments.count == 2,
                  let layerName = arguments[0] as? String,
                  let position = arguments[1] as? [Double] else {
                return createErrorResponse("Invalid arguments for window.layerposition(layer, [x, y])")
            }
            stateManager.windowSetLayerPosition(windowName, layerName: layerName, position: position)
            return [
                "status": "success",
                "type": "method_call",
                "message": "Layer '\(layerName)' position set to \(position) on window '\(windowName)'"
            ]

        case "layerscale":
            // window.layerscale(layer, [sx, sy])
            guard arguments.count == 2,
                  let layerName = arguments[0] as? String,
                  let scale = arguments[1] as? [Double] else {
                return createErrorResponse("Invalid arguments for window.layerscale(layer, [sx, sy])")
            }
            stateManager.windowSetLayerScale(windowName, layerName: layerName, scale: scale)
            return [
                "status": "success",
                "type": "method_call",
                "message": "Layer '\(layerName)' scale set to \(scale) on window '\(windowName)'"
            ]

        case "layerremove":
            // window.layerremove(layer)
            guard arguments.count == 1,
                  let layerName = arguments[0] as? String else {
                return createErrorResponse("Invalid arguments for window.layerremove(layer)")
            }
            stateManager.windowRemoveLayer(windowName, layerName: layerName)
            return [
                "status": "success",
                "type": "method_call",
                "message": "Layer '\(layerName)' removed from window '\(windowName)'"
            ]

        default:
            return createErrorResponse("Unknown window method: '\(method)'")
        }
    }

    // MARK: - Layer Method Handlers

    private func handleLayerMethod(layerName: String, method: String, arguments: [Any]) -> [String: Any] {
        // Layer methods like layer.cast(variable) will be implemented here
        // TODO: Phase 3 - Implement layer methods
        return createErrorResponse("Layer methods not yet implemented")
    }

    private func handlePropertyAssignment(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let object = data["object"] as? String,
              let property = data["property"] as? String,
              let value = data["value"] else {
            return createErrorResponse("Invalid property_assignment data")
        }

        logger.log("Property assignment: \(object).\(property)")

        // Check if object is a variable
        guard let variable = stateManager.getVariable(object) else {
            return createErrorResponse("Unknown variable '\(object)'")
        }

        // Handle based on variable type and property
        switch variable.type {
        case .layerObj:
            return handleLayerPropertyAssignment(layerName: object, property: property, value: value)
        default:
            return createErrorResponse("Variable '\(object)' of type '\(variable.type.rawValue)' does not support property '\(property)'")
        }
    }

    // MARK: - Layer Property Assignment

    private func handleLayerPropertyAssignment(layerName: String, property: String, value: Any) -> [String: Any] {
        switch property {
        case "opacity":
            guard let opacity = value as? Double else {
                return createErrorResponse("Invalid value for layer.opacity (expected number)")
            }
            stateManager.updateLayerDefaults(layerName, opacity: opacity)
            return [
                "status": "success",
                "type": "property_assignment",
                "message": "Layer '\(layerName)' default opacity set to \(opacity)"
            ]

        case "position":
            guard let position = value as? [Double] else {
                return createErrorResponse("Invalid value for layer.position (expected [x, y])")
            }
            stateManager.updateLayerDefaults(layerName, position: position)
            return [
                "status": "success",
                "type": "property_assignment",
                "message": "Layer '\(layerName)' default position set to \(position)"
            ]

        case "scale":
            guard let scale = value as? [Double] else {
                return createErrorResponse("Invalid value for layer.scale (expected [sx, sy])")
            }
            stateManager.updateLayerDefaults(layerName, scale: scale)
            return [
                "status": "success",
                "type": "property_assignment",
                "message": "Layer '\(layerName)' default scale set to \(scale)"
            ]

        default:
            return createErrorResponse("Unknown layer property: '\(property)'")
        }
    }

    private func handleDefineFunction(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let name = data["name"] as? String,
              let parameters = data["parameters"] as? [String],
              let body = data["body"] as? String else {
            return createErrorResponse("Invalid define_function data")
        }

        // Store function in state
        stateManager.defineFunction(name: name, parameters: parameters, body: body)

        logger.log("Function '\(name)' defined with \(parameters.count) parameters")

        return [
            "status": "success",
            "type": "define_function",
            "message": "Function '\(name)' defined"
        ]
    }

    private func handleDefineProcess(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let name = data["name"] as? String,
              let parameters = data["parameters"] as? [String] else {
            return createErrorResponse("Invalid define_process data")
        }

        // Validate process name has $ prefix
        guard processRegistry.validateProcessName(name) else {
            return createErrorResponse("Process names must start with '$'. Did you mean '$\(name)'?")
        }

        // Get optional body (built-in processes won't have one)
        let body = data["body"] as? String

        // Store process in state
        stateManager.defineProcess(name: name, parameters: parameters, body: body)

        logger.log("Process '\(name)' defined with \(parameters.count) parameters")

        return [
            "status": "success",
            "type": "define_process",
            "message": "Process '\(name)' defined"
        ]
    }

    private func handleGetState(data: [String: Any]?) -> [String: Any] {
        logger.log("Get state")

        // Get state summary from StateManager
        let summary = stateManager.getStateSummary()

        return [
            "status": "success",
            "type": "get_state",
            "state": summary
        ]
    }

    private func handleResetState() -> [String: Any] {
        logger.info("Resetting all state")
        stateManager.resetAll()

        return [
            "status": "success",
            "type": "reset_state",
            "message": "All state cleared"
        ]
    }

    private func handlePing() -> [String: Any] {
        return [
            "status": "success",
            "type": "pong",
            "message": "Haeccstable Swift app is running"
        ]
    }

    // MARK: - Helper Methods

    private func createErrorResponse(_ message: String) -> [String: Any] {
        Logger.error(message)
        return [
            "status": "error",
            "error": message
        ]
    }
}
