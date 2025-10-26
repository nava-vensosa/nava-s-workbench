"""
IPC Client for Haeccstable

Handles communication between Python terminal and Swift app via Unix sockets.
Phase 1: Stub implementation
Phase 2: Full implementation with bidirectional communication
"""

import socket
import json
from typing import Dict, Any, Optional

class IPCClient:
    """Client for communicating with Swift app via Unix socket"""

    SOCKET_PATH = "/tmp/haeccstable.sock"

    def __init__(self):
        self.socket: Optional[socket.socket] = None
        self.connected = False

    def connect(self) -> bool:
        """Connect to Swift app socket"""
        try:
            self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            self.socket.connect(self.SOCKET_PATH)
            self.connected = True
            return True
        except (FileNotFoundError, ConnectionRefusedError) as e:
            self.connected = False
            return False

    def send_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send command to Swift app and wait for response.

        Args:
            command: Command dictionary to send

        Returns:
            Response dictionary from Swift app
        """
        if not self.connected:
            return {
                "status": "error",
                "error": "Not connected to Swift app"
            }

        try:
            # Serialize command to JSON
            message = json.dumps(command)
            self.socket.sendall((message + '\n').encode('utf-8'))

            # Wait for response
            response_data = self.socket.recv(4096)
            response = json.loads(response_data.decode('utf-8'))

            return response

        except Exception as e:
            return {
                "status": "error",
                "error": f"IPC error: {str(e)}"
            }

    def disconnect(self):
        """Disconnect from Swift app"""
        if self.socket:
            try:
                self.socket.close()
            except:
                pass
            self.socket = None
            self.connected = False

    def is_connected(self) -> bool:
        """Check if connected to Swift app"""
        return self.connected

# Singleton instance
ipc_client = IPCClient()
