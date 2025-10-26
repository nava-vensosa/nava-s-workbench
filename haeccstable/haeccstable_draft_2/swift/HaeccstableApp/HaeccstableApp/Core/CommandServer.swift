import Foundation

/// CommandServer manages the Unix socket IPC connection
/// Accepts commands from Python terminal and routes them for execution
class CommandServer {

    // MARK: - Properties

    private let socketPath = "/tmp/haeccstable.sock"
    private var serverSocket: Int32 = -1
    private var isRunning = false
    private var acceptQueue: DispatchQueue
    private var messageRouter: MessageRouter?

    // MARK: - Initialization

    init() {
        self.acceptQueue = DispatchQueue(label: "com.haeccstable.server.accept", qos: .userInitiated)
    }

    // MARK: - Public Methods

    /// Start the command server
    func start(messageRouter: MessageRouter) throws {
        guard !isRunning else {
            Logger.warning("CommandServer is already running")
            return
        }

        self.messageRouter = messageRouter

        // Remove existing socket file if it exists
        if FileManager.default.fileExists(atPath: socketPath) {
            try FileManager.default.removeItem(atPath: socketPath)
        }

        // Create socket
        serverSocket = socket(AF_UNIX, SOCK_STREAM, 0)
        guard serverSocket >= 0 else {
            throw IPCError.socketCreationFailed
        }

        // Configure socket address
        var addr = sockaddr_un()
        addr.sun_family = sa_family_t(AF_UNIX)

        // Copy socket path into sun_path
        let pathLength = min(socketPath.count, MemoryLayout.size(ofValue: addr.sun_path) - 1)
        _ = withUnsafeMutablePointer(to: &addr.sun_path.0) { ptr in
            socketPath.withCString { cString in
                memcpy(ptr, cString, pathLength)
            }
        }

        // Bind socket
        let bindResult = withUnsafePointer(to: &addr) { ptr in
            ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sockaddrPtr in
                bind(serverSocket, sockaddrPtr, socklen_t(MemoryLayout<sockaddr_un>.size))
            }
        }

        guard bindResult >= 0 else {
            close(serverSocket)
            throw IPCError.socketBindFailed
        }

        // Listen for connections
        guard listen(serverSocket, 5) >= 0 else {
            close(serverSocket)
            throw IPCError.socketListenFailed
        }

        isRunning = true
        Logger.log("CommandServer started on \(socketPath)")

        // Start accepting connections on background queue
        acceptQueue.async { [weak self] in
            self?.acceptConnections()
        }
    }

    /// Stop the command server
    func stop() {
        guard isRunning else { return }

        isRunning = false

        if serverSocket >= 0 {
            close(serverSocket)
            serverSocket = -1
        }

        // Remove socket file
        try? FileManager.default.removeItem(atPath: socketPath)

        Logger.log("CommandServer stopped")
    }

    // MARK: - Private Methods

    private func acceptConnections() {
        while isRunning {
            var clientAddr = sockaddr_un()
            var clientAddrLen = socklen_t(MemoryLayout<sockaddr_un>.size)

            let clientSocket = withUnsafeMutablePointer(to: &clientAddr) { ptr in
                ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sockaddrPtr in
                    accept(serverSocket, sockaddrPtr, &clientAddrLen)
                }
            }

            guard clientSocket >= 0 else {
                if isRunning {
                    Logger.error("Failed to accept client connection")
                }
                continue
            }

            Logger.log("Client connected")

            // Handle client on separate queue
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.handleClient(socket: clientSocket)
            }
        }
    }

    private func handleClient(socket: Int32) {
        defer {
            close(socket)
            Logger.log("Client disconnected")
        }

        var buffer = [UInt8](repeating: 0, count: 4096)

        while isRunning {
            let bytesRead = recv(socket, &buffer, buffer.count, 0)

            guard bytesRead > 0 else {
                break
            }

            // Convert received data to string
            let data = Data(buffer[0..<bytesRead])
            guard let message = String(data: data, encoding: .utf8) else {
                Logger.error("Failed to decode message")
                sendResponse(socket: socket, response: ["status": "error", "error": "Invalid message encoding"])
                continue
            }

            // Split by newlines in case multiple messages were sent
            let messages = message.components(separatedBy: "\n").filter { !$0.isEmpty }

            for msg in messages {
                processMessage(socket: socket, message: msg)
            }
        }
    }

    private func processMessage(socket: Int32, message: String) {
        Logger.debug("Received: \(message)")

        // Parse JSON message
        guard let data = message.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            Logger.error("Failed to parse JSON message")
            sendResponse(socket: socket, response: ["status": "error", "error": "Invalid JSON"])
            return
        }

        // Route message to MessageRouter
        guard let router = messageRouter else {
            Logger.error("MessageRouter not initialized")
            sendResponse(socket: socket, response: ["status": "error", "error": "Server not ready"])
            return
        }

        let response = router.route(message: json)
        sendResponse(socket: socket, response: response)
    }

    private func sendResponse(socket: Int32, response: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: response),
              let jsonString = String(data: data, encoding: .utf8) else {
            Logger.error("Failed to serialize response")
            return
        }

        let message = jsonString + "\n"
        message.withCString { cString in
            send(socket, cString, strlen(cString), 0)
        }

        Logger.debug("Sent: \(jsonString)")
    }
}

// MARK: - Error Types

enum IPCError: Error {
    case socketCreationFailed
    case socketBindFailed
    case socketListenFailed
    case serverNotRunning

    var localizedDescription: String {
        switch self {
        case .socketCreationFailed:
            return "Failed to create socket"
        case .socketBindFailed:
            return "Failed to bind socket to path"
        case .socketListenFailed:
            return "Failed to listen on socket"
        case .serverNotRunning:
            return "Server is not running"
        }
    }
}
