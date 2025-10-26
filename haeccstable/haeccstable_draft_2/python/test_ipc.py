#!/usr/bin/env python3
"""
Test IPC communication with Swift app
"""

import sys
import json
from ipc_client import ipc_client

def test_variable_declaration():
    """Test: var x = 'hello world'"""
    print("Testing: var x = 'hello world'")

    # Connect to Swift app
    if not ipc_client.connect():
        print("ERROR: Could not connect to Swift app")
        return False

    # Send variable declaration
    message = {
        "type": "declare_variable",
        "data": {
            "var_type": "var",
            "name": "x",
            "value": "hello world"
        }
    }

    print(f"Sending: {json.dumps(message, indent=2)}")
    response = ipc_client.send_command(message)
    print(f"Response: {json.dumps(response, indent=2)}")

    if response.get("status") == "success":
        print("✓ Variable declared successfully!")
        return True
    else:
        print(f"✗ Error: {response.get('error')}")
        return False

def test_get_state():
    """Test getting state from Swift"""
    print("\nTesting: get_state")

    message = {
        "type": "get_state",
        "data": {}
    }

    print(f"Sending: {json.dumps(message, indent=2)}")
    response = ipc_client.send_command(message)
    print(f"Response: {json.dumps(response, indent=2)}")

    if response.get("status") == "success":
        print("✓ State retrieved successfully!")
        return True
    else:
        print(f"✗ Error: {response.get('error')}")
        return False

if __name__ == "__main__":
    print("=== Haeccstable IPC Test ===\n")

    success = test_variable_declaration()
    if success:
        test_get_state()

    ipc_client.disconnect()
    print("\n=== Test Complete ===")
