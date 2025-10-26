import Foundation

/// MessageRouter routes incoming IPC messages to appropriate command handlers
/// Parses message type and delegates to corresponding handler
class MessageRouter {

    // MARK: - Properties

    // Command handlers will be added in Phase 2 Day 3
    // For now, we'll use a simple routing system

    // MARK: - Initialization

    init() {
        Logger.log("MessageRouter initialized")
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

        Logger.debug("Routing message type: \(type)")

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

        Logger.log("Declare variable: \(varType) \(name)")

        // TODO: Implement in Phase 2 Day 3
        return [
            "status": "success",
            "type": "declare_variable",
            "message": "Variable '\(name)' declared (stub response)"
        ]
    }

    private func handleCallFunction(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let name = data["name"] as? String else {
            return createErrorResponse("Invalid call_function data")
        }

        Logger.log("Call function: \(name)")

        // TODO: Implement in Phase 2 Day 3
        return [
            "status": "success",
            "type": "call_function",
            "message": "Function '\(name)' called (stub response)"
        ]
    }

    private func handleCallProcess(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let name = data["name"] as? String else {
            return createErrorResponse("Invalid call_process data")
        }

        // Validate process name has $ prefix
        guard name.hasPrefix("$") else {
            return createErrorResponse("Process names must start with '$'. Did you mean '$\(name)'?")
        }

        Logger.log("Call process: \(name)")

        // TODO: Implement in Phase 2 Day 3
        return [
            "status": "success",
            "type": "call_process",
            "message": "Process '\(name)' called (stub response)"
        ]
    }

    private func handleMethodCall(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let object = data["object"] as? String,
              let method = data["method"] as? String else {
            return createErrorResponse("Invalid method_call data")
        }

        Logger.log("Method call: \(object).\(method)")

        // TODO: Implement in Phase 2 Day 3
        return [
            "status": "success",
            "type": "method_call",
            "message": "Method '\(object).\(method)' called (stub response)"
        ]
    }

    private func handlePropertyAssignment(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let object = data["object"] as? String,
              let property = data["property"] as? String else {
            return createErrorResponse("Invalid property_assignment data")
        }

        Logger.log("Property assignment: \(object).\(property)")

        // TODO: Implement in Phase 2 Day 3
        return [
            "status": "success",
            "type": "property_assignment",
            "message": "Property '\(object).\(property)' assigned (stub response)"
        ]
    }

    private func handleDefineFunction(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let name = data["name"] as? String else {
            return createErrorResponse("Invalid define_function data")
        }

        Logger.log("Define function: \(name)")

        // TODO: Implement in Phase 2 Day 3
        return [
            "status": "success",
            "type": "define_function",
            "message": "Function '\(name)' defined (stub response)"
        ]
    }

    private func handleDefineProcess(data: [String: Any]?) -> [String: Any] {
        guard let data = data,
              let name = data["name"] as? String else {
            return createErrorResponse("Invalid define_process data")
        }

        // Validate process name has $ prefix
        guard name.hasPrefix("$") else {
            return createErrorResponse("Process names must start with '$'. Did you mean '$\(name)'?")
        }

        Logger.log("Define process: \(name)")

        // TODO: Implement in Phase 2 Day 3
        return [
            "status": "success",
            "type": "define_process",
            "message": "Process '\(name)' defined (stub response)"
        ]
    }

    private func handleGetState(data: [String: Any]?) -> [String: Any] {
        Logger.log("Get state")

        // TODO: Implement in Phase 2 Day 2 with StateManager
        return [
            "status": "success",
            "type": "get_state",
            "state": [
                "variables": [:],
                "functions": [:],
                "processes": [:],
                "windows": [:],
                "layers": [:]
            ]
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
