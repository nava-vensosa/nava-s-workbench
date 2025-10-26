import Foundation

/// Main entry point for Haeccstable Swift application
/// Phase 2 Day 3: State management integrated with IPC

func main() {
    Logger.log("=== Haeccstable Swift App Starting ===")
    Logger.log("Phase 2 Day 3: State management integrated")

    // Initialize logger
    let logger = Logger()

    // Initialize state management components
    // Get dossier path from environment variable or use default
    let dossierPath: String
    if let envPath = ProcessInfo.processInfo.environment["HAECCSTABLE_DOSSIER_PATH"] {
        dossierPath = envPath
    } else {
        // Fallback: use current directory
        dossierPath = FileManager.default.currentDirectoryPath + "/dossier.json"
    }

    logger.info("Dossier path: \(dossierPath)")

    // Ensure parent directory exists
    let dossierURL = URL(fileURLWithPath: dossierPath)
    let parentDir = dossierURL.deletingLastPathComponent()
    try? FileManager.default.createDirectory(at: parentDir, withIntermediateDirectories: true)

    let dossierManager = DossierManager(dossierPath: dossierPath, logger: logger)
    let stateManager = StateManager(dossierManager: dossierManager, logger: logger)
    let processRegistry = ProcessRegistry(logger: logger)

    // Initialize message router with state management
    let messageRouter = MessageRouter(stateManager: stateManager, processRegistry: processRegistry, logger: logger)
    let commandServer = CommandServer()

    // Start command server
    do {
        try commandServer.start(messageRouter: messageRouter)
        Logger.log("Server ready. Waiting for connections...")
        Logger.log("Dossier path: \(dossierPath)")

        // Keep server running
        RunLoop.main.run()

    } catch {
        Logger.error("Failed to start server: \(error.localizedDescription)")
        exit(1)
    }
}

// Handle graceful shutdown on SIGINT (Ctrl+C)
signal(SIGINT) { _ in
    Logger.log("\nShutting down Haeccstable...")
    exit(0)
}

// Run main
main()
