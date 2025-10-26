import Foundation

/// Simple logging utility for Haeccstable
class Logger {

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
        return formatter
    }()

    enum Level: String {
        case info = "INFO"
        case warning = "WARN"
        case error = "ERROR"
        case debug = "DEBUG"
    }

    // MARK: - Static Methods (for compatibility)

    static func log(_ message: String, level: Level = .info) {
        let timestamp = dateFormatter.string(from: Date())
        let logMessage = "[\(timestamp)] [\(level.rawValue)] \(message)"
        print(logMessage)
    }

    static func error(_ message: String) {
        log(message, level: .error)
    }

    static func warning(_ message: String) {
        log(message, level: .warning)
    }

    static func debug(_ message: String) {
        log(message, level: .debug)
    }

    // MARK: - Instance Methods

    func log(_ message: String, level: Level = .info) {
        Logger.log(message, level: level)
    }

    func info(_ message: String) {
        log(message, level: .info)
    }

    func error(_ message: String) {
        log(message, level: .error)
    }

    func warning(_ message: String) {
        log(message, level: .warning)
    }

    func debug(_ message: String) {
        log(message, level: .debug)
    }
}
