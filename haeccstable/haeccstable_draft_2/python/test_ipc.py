#!/usr/bin/env python3
"""
IPC Test Script for Haeccstable Phase 2 Day 1

Tests socket connection between Python and Swift app.
Sends various message types and validates responses.

Usage:
    1. Start Swift app first: cd swift/HaeccstableApp && swift run
    2. Run this script: python3 test_ipc.py
"""

import socket
import json
import sys
import time

SOCKET_PATH = "/tmp/haeccstable.sock"

def send_message(sock, message):
    """Send JSON message to Swift app"""
    json_str = json.dumps(message)
    print(f"\n→ Sending: {json_str}")
    sock.sendall((json_str + '\n').encode('utf-8'))

def receive_response(sock):
    """Receive JSON response from Swift app"""
    data = sock.recv(4096)
    response_str = data.decode('utf-8').strip()
    print(f"← Received: {response_str}")
    return json.loads(response_str)

def test_connection():
    """Test IPC connection with Swift app"""
    print("=" * 60)
    print("Haeccstable IPC Test - Phase 2 Day 1")
    print("=" * 60)

    # Check if socket exists
    import os
    if not os.path.exists(SOCKET_PATH):
        print(f"\n✗ ERROR: Socket file not found at {SOCKET_PATH}")
        print("  Make sure Swift app is running first:")
        print("  cd swift/HaeccstableApp && swift run")
        return False

    try:
        # Connect to socket
        print(f"\nConnecting to {SOCKET_PATH}...")
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.connect(SOCKET_PATH)
        print("✓ Connected successfully!")

        # Test 1: Ping
        print("\n--- Test 1: Ping ---")
        send_message(sock, {"type": "ping"})
        response = receive_response(sock)
        assert response["status"] == "success", "Ping failed"
        assert response["type"] == "pong", "Expected pong response"
        print("✓ Ping test passed")

        # Test 2: Declare variable
        print("\n--- Test 2: Declare Variable ---")
        send_message(sock, {
            "type": "declare_variable",
            "data": {
                "var_type": "video_invar",
                "name": "webcam",
                "value": "capture(0)"
            }
        })
        response = receive_response(sock)
        assert response["status"] == "success", "Variable declaration failed"
        print("✓ Variable declaration test passed")

        # Test 3: Call process with $ prefix
        print("\n--- Test 3: Call Process ---")
        send_message(sock, {
            "type": "call_process",
            "data": {
                "name": "$sobel",
                "args": ["webcam"],
                "kwargs": {"threshold": 0.15}
            }
        })
        response = receive_response(sock)
        assert response["status"] == "success", "Process call failed"
        print("✓ Process call test passed")

        # Test 4: Call process without $ prefix (should fail)
        print("\n--- Test 4: Process Without $ Prefix (Should Fail) ---")
        send_message(sock, {
            "type": "call_process",
            "data": {
                "name": "sobel",
                "args": ["webcam"]
            }
        })
        response = receive_response(sock)
        assert response["status"] == "error", "Expected error for process without $"
        assert "$" in response["error"], "Error should mention $ prefix"
        print("✓ Validation test passed - correctly rejected process without $")

        # Test 5: Method call
        print("\n--- Test 5: Method Call ---")
        send_message(sock, {
            "type": "method_call",
            "data": {
                "object": "layer",
                "method": "cast",
                "args": ["webcam"]
            }
        })
        response = receive_response(sock)
        assert response["status"] == "success", "Method call failed"
        print("✓ Method call test passed")

        # Test 6: Get state
        print("\n--- Test 6: Get State ---")
        send_message(sock, {"type": "get_state"})
        response = receive_response(sock)
        assert response["status"] == "success", "Get state failed"
        assert "state" in response, "Response should contain state"
        print("✓ Get state test passed")

        # Test 7: Unknown message type
        print("\n--- Test 7: Unknown Message Type (Should Fail) ---")
        send_message(sock, {"type": "unknown_command"})
        response = receive_response(sock)
        assert response["status"] == "error", "Expected error for unknown type"
        print("✓ Unknown type test passed - correctly rejected")

        sock.close()

        print("\n" + "=" * 60)
        print("✓ All IPC tests passed!")
        print("=" * 60)
        return True

    except ConnectionRefusedError:
        print(f"\n✗ ERROR: Connection refused")
        print("  Make sure Swift app is running first:")
        print("  cd swift/HaeccstableApp && swift run")
        return False

    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
