# Haeccstable Phase 2 Day 1 - IPC Complete

## Overview

Phase 2 Day 1 implementation establishes the core IPC (Inter-Process Communication) infrastructure between the Python terminal and Swift application using Unix domain sockets.

## Components Implemented

### 1. Logger.swift (`Utilities/Logger.swift`)
Simple logging utility with severity levels:
- `INFO`, `WARN`, `ERROR`, `DEBUG`
- Timestamp formatting
- Convenience methods for each level

### 2. CommandServer.swift (`Core/CommandServer.swift`)
Unix socket server that:
- Creates socket at `/tmp/haeccstable.sock`
- Listens for client connections on background thread
- Accepts multiple concurrent clients
- Reads JSON messages line-by-line
- Routes messages to MessageRouter
- Sends JSON responses back to clients
- Handles graceful shutdown

### 3. MessageRouter.swift (`Core/MessageRouter.swift`)
Message routing and handler dispatch:
- Parses message `type` field
- Routes to appropriate handler (stub implementations)
- Validates `$` prefix for process names
- Returns JSON response dictionaries

**Supported Message Types:**
- `ping` - Health check
- `declare_variable` - Variable declarations
- `call_function` - Function calls
- `call_process` - Process calls (validates `$` prefix)
- `method_call` - Object method calls
- `property_assignment` - Property assignments
- `define_function` - Function definitions
- `define_process` - Process definitions (validates `$` prefix)
- `get_state` - Query application state

### 4. main.swift
Entry point that:
- Initializes MessageRouter and CommandServer
- Starts server
- Handles SIGINT for graceful shutdown

## Testing

### Setup

1. **Build Swift App:**
   ```bash
   cd swift/HaeccstableApp
   swift build
   ```

2. **Run Swift App:**
   ```bash
   swift run
   ```

   Expected output:
   ```
   [timestamp] [INFO] === Haeccstable Swift App Starting ===
   [timestamp] [INFO] Phase 2 Day 1: Testing IPC communication
   [timestamp] [INFO] MessageRouter initialized
   [timestamp] [INFO] CommandServer started on /tmp/haeccstable.sock
   [timestamp] [INFO] Server ready. Waiting for connections...
   ```

3. **In Another Terminal, Run Python Test:**
   ```bash
   cd python
   python3 test_ipc.py
   ```

### Test Results

The test script validates:
- ✓ Socket connection establishment
- ✓ Ping/pong health check
- ✓ Variable declaration
- ✓ Process call with `$` prefix
- ✓ Process call without `$` prefix (should fail with validation error)
- ✓ Method call
- ✓ State query
- ✓ Unknown message type handling

## Key Features

### Process Name Validation

The `$` prefix requirement is enforced at the IPC level:

```swift
// In MessageRouter.swift
private func handleCallProcess(data: [String: Any]?) -> [String: Any] {
    guard let name = data["name"] as? String else {
        return createErrorResponse("Invalid call_process data")
    }

    guard name.hasPrefix("$") else {
        return createErrorResponse("Process names must start with '$'. Did you mean '$\(name)'?")
    }

    // Process the call...
}
```

This matches the validation in the Python DSL parser, ensuring consistency across the entire system.

## Architecture

```
Python Terminal (python/haeccstable.py)
    |
    | Unix Socket
    | /tmp/haeccstable.sock
    |
    v
CommandServer.swift
    |
    | JSON Messages
    v
MessageRouter.swift
    |
    | Route by type
    v
Command Handlers (stub implementations)
```

## Message Protocol

Messages are JSON objects sent over the Unix socket, terminated by newline:

```json
{
  "type": "call_process",
  "data": {
    "name": "$sobel",
    "args": ["webcam"],
    "kwargs": {"threshold": 0.15}
  }
}
```

Responses follow the same format:

```json
{
  "status": "success",
  "type": "call_process",
  "message": "Process '$sobel' called (stub response)"
}
```

Error responses:

```json
{
  "status": "error",
  "error": "Process names must start with '$'. Did you mean '$sobel'?"
}
```

## Next Steps (Phase 2 Day 2)

Day 1 focused on IPC infrastructure. Day 2 will implement:
- **StateManager** - Centralized application state
- **DossierManager** - Session state persistence to dossier.json
- **ProcessRegistry** - Process registration with `$` prefix enforcement
- **Model classes** - Variable, Function, Process, Window, Layer

These components will be integrated with the MessageRouter handlers to provide actual functionality beyond stub responses.

## File Structure

```
swift/HaeccstableApp/HaeccstableApp/
├── main.swift                          # Entry point
├── Core/
│   ├── CommandServer.swift             # Unix socket server
│   └── MessageRouter.swift             # Message routing
├── Utilities/
│   └── Logger.swift                    # Logging utility
├── State/                              # (Day 2)
│   ├── StateManager.swift
│   ├── DossierManager.swift
│   └── ProcessRegistry.swift
└── Models/                             # (Day 2)
    ├── Variable.swift
    ├── Function.swift
    ├── Process.swift
    ├── Window.swift
    └── Layer.swift
```

## Status

**Phase 2 Day 1: ✓ Complete**

All core IPC components implemented and ready for testing. The foundation is now in place for implementing actual command handlers and state management in Day 2.
