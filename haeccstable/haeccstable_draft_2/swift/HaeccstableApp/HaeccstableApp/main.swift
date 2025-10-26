import Foundation

/// Main entry point for Haeccstable Swift application
/// Phase 2 Day 1: Basic server startup for testing IPC

func main() {
    Logger.log("=== Haeccstable Swift App Starting ===")
    Logger.log("Phase 2 Day 1: Testing IPC communication")

    // Initialize components
    let messageRouter = MessageRouter()
    let commandServer = CommandServer()

    // Start command server
    do {
        try commandServer.start(messageRouter: messageRouter)
        Logger.log("Server ready. Waiting for connections...")

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
