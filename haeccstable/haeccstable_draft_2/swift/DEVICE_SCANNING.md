# Device Scanning Implementation Plan

## Overview

Device scanning is a **Phase 3** feature that detects and enumerates hardware devices for video and audio input/output. The `devices` section in `dossier.json` will be populated with available hardware when the Swift app starts.

## Current Status (Phase 2)

**Phase 2 (Current)**: Stub data in dossier.json
```json
{
  "devices": {
    "video": [],
    "audio": []
  }
}
```

**Phase 3 (To Implement)**: Actual hardware detection
```json
{
  "devices": {
    "video": [
      {
        "index": 0,
        "name": "FaceTime HD Camera (Built-in)",
        "type": "camera",
        "resolution": [1920, 1080],
        "framerate": 30,
        "formats": ["BGRA", "YUV420"]
      },
      {
        "index": 1,
        "name": "Screen Capture (Display 1)",
        "type": "screencapture",
        "resolution": [2560, 1440],
        "framerate": 60,
        "formats": ["BGRA"]
      }
    ],
    "audio": [
      {
        "index": 0,
        "name": "Built-in Microphone",
        "type": "input",
        "channels": 2,
        "samplerate": 48000
      },
      {
        "index": 1,
        "name": "Built-in Output",
        "type": "output",
        "channels": 2,
        "samplerate": 48000
      }
    ]
  }
}
```

## Implementation Timeline

### Phase 2 (Current - State Management)
**Not implementing device scanning yet**, but creating the infrastructure:
- ✓ StateManager with `devices` dictionary
- ✓ DossierManager to persist state
- ✓ Dossier structure with `devices` section

### Phase 3 (Video Pipeline - Week 2-3)
**This is when device scanning will be implemented:**

#### Day 1-2: Video Device Enumeration
Create `DeviceManager.swift` that uses AVFoundation to scan devices:

```swift
import AVFoundation

class DeviceManager {

    // MARK: - Video Devices

    func scanVideoDevices() -> [[String: Any]] {
        var devices: [[String: Any]] = []

        // 1. Enumerate cameras
        let discoverySession = AVCaptureDevice.DiscoverySession(
            deviceTypes: [.builtInWideAngleCamera, .externalUnknown],
            mediaType: .video,
            position: .unspecified
        )

        for (index, device) in discoverySession.devices.enumerated() {
            if let format = device.activeFormat {
                let dimensions = CMVideoFormatDescriptionGetDimensions(format.formatDescription)

                devices.append([
                    "index": index,
                    "name": device.localizedName,
                    "type": "camera",
                    "resolution": [Int(dimensions.width), Int(dimensions.height)],
                    "framerate": getMaxFrameRate(format: format),
                    "formats": getPixelFormats(format: format),
                    "uniqueID": device.uniqueID
                ])
            }
        }

        // 2. Add screen capture options
        let screens = NSScreen.screens
        for (index, screen) in screens.enumerated() {
            let frame = screen.frame
            devices.append([
                "index": devices.count,
                "name": "Screen Capture (Display \(index + 1))",
                "type": "screencapture",
                "resolution": [Int(frame.width), Int(frame.height)],
                "framerate": 60,  // Screen capture typically 60fps
                "formats": ["BGRA"],
                "displayID": screen.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")]
            ])
        }

        return devices
    }

    private func getMaxFrameRate(format: AVCaptureDevice.Format) -> Int {
        let ranges = format.videoSupportedFrameRateRanges
        return Int(ranges.first?.maxFrameRate ?? 30)
    }

    private func getPixelFormats(format: AVCaptureDevice.Format) -> [String] {
        // Query supported pixel formats
        // Common: kCVPixelFormatType_32BGRA, kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange
        return ["BGRA", "YUV420"]  // Simplified
    }

    // MARK: - Audio Devices

    func scanAudioDevices() -> [[String: Any]] {
        var devices: [[String: Any]] = []

        // Use Core Audio to enumerate audio devices
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDevices,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )

        var dataSize: UInt32 = 0
        AudioObjectGetPropertyDataSize(
            AudioObjectID(kAudioObjectSystemObject),
            &propertyAddress,
            0,
            nil,
            &dataSize
        )

        let deviceCount = Int(dataSize) / MemoryLayout<AudioDeviceID>.size
        var audioDevices = [AudioDeviceID](repeating: 0, count: deviceCount)

        AudioObjectGetPropertyData(
            AudioObjectID(kAudioObjectSystemObject),
            &propertyAddress,
            0,
            nil,
            &dataSize,
            &audioDevices
        )

        for (index, deviceID) in audioDevices.enumerated() {
            let name = getAudioDeviceName(deviceID: deviceID)
            let channels = getAudioDeviceChannels(deviceID: deviceID)
            let sampleRate = getAudioDeviceSampleRate(deviceID: deviceID)
            let type = getAudioDeviceType(deviceID: deviceID)

            devices.append([
                "index": index,
                "name": name,
                "type": type,  // "input" or "output"
                "channels": channels,
                "samplerate": sampleRate,
                "deviceID": deviceID
            ])
        }

        return devices
    }

    private func getAudioDeviceName(deviceID: AudioDeviceID) -> String {
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyDeviceNameCFString,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )

        var deviceName: CFString = "" as CFString
        var dataSize = UInt32(MemoryLayout<CFString>.size)

        AudioObjectGetPropertyData(
            deviceID,
            &propertyAddress,
            0,
            nil,
            &dataSize,
            &deviceName
        )

        return deviceName as String
    }

    private func getAudioDeviceChannels(deviceID: AudioDeviceID) -> Int {
        // Query stream configuration
        // Return number of channels (typically 1 or 2)
        return 2  // Simplified
    }

    private func getAudioDeviceSampleRate(deviceID: AudioDeviceID) -> Int {
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyNominalSampleRate,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )

        var sampleRate: Float64 = 0
        var dataSize = UInt32(MemoryLayout<Float64>.size)

        AudioObjectGetPropertyData(
            deviceID,
            &propertyAddress,
            0,
            nil,
            &dataSize,
            &sampleRate
        )

        return Int(sampleRate)
    }

    private func getAudioDeviceType(deviceID: AudioDeviceID) -> String {
        // Check if device has input or output streams
        // Return "input", "output", or "both"
        return "input"  // Simplified
    }
}
```

#### Integration with StateManager

In `StateManager.swift` (Phase 2 Day 2):

```swift
class StateManager {
    private var deviceManager: DeviceManager?  // Will be added in Phase 3

    // Phase 2: Returns empty arrays
    func getDevices() -> [String: Any] {
        return [
            "video": [],
            "audio": []
        ]
    }

    // Phase 3: Will become:
    func getDevices() -> [String: Any] {
        guard let deviceManager = deviceManager else {
            return ["video": [], "audio": []]
        }

        return [
            "video": deviceManager.scanVideoDevices(),
            "audio": deviceManager.scanAudioDevices()
        ]
    }

    // Phase 3: Initialize device manager
    func initializeDeviceManager() {
        self.deviceManager = DeviceManager()

        // Scan devices on startup
        updateDossier()

        // Watch for device changes
        setupDeviceNotifications()
    }

    // Phase 3: React to device changes
    private func setupDeviceNotifications() {
        // Listen for AVCaptureDevice.wasConnected/wasDisconnected
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleDeviceChange),
            name: .AVCaptureDeviceWasConnected,
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleDeviceChange),
            name: .AVCaptureDeviceWasDisconnected,
            object: nil
        )
    }

    @objc private func handleDeviceChange(_ notification: Notification) {
        Logger.log("Device configuration changed - rescanning")
        updateDossier()  // Re-scan and update dossier
    }
}
```

## Using Devices in DSL

Once devices are enumerated, users can reference them:

```haeccstable
// Phase 3: Capture from first camera
video_invar webcam = capture(0)

// Phase 3: Capture from screen
video_invar screen = screencapture(1)

// Phase 3: Audio input from microphone
audio_invar mic = microphone(0)
```

The `capture()` function will:
1. Look up device index in `dossier.json` devices list
2. Create AVCaptureSession with that device
3. Start capturing frames
4. Return video stream as `video_invar`

## Why Phase 3?

Device scanning requires:
1. **AVFoundation** knowledge (camera/screen capture setup)
2. **Core Audio** knowledge (audio device enumeration)
3. **Video pipeline** architecture (how to actually use captured frames)
4. **Metal integration** (converting AVCaptureOutput → MTLTexture)

**Phase 2** focuses on:
- IPC infrastructure (Done ✓)
- State management
- Command handling
- Basic process registry

**Phase 3** builds on Phase 2 by adding:
- Device enumeration (described above)
- Video capture sessions
- Frame conversion to Metal textures
- Real video processing

## Summary

**Short answer**: Yes, device scanning needs Phase 3 implemented.

**Current Phase 2 behavior**:
- `dossier.json` shows empty device arrays
- This is expected and correct for Phase 2

**Phase 3 implementation**:
- Create `DeviceManager.swift`
- Scan video devices (cameras + screen capture)
- Scan audio devices (inputs + outputs)
- Integrate with StateManager
- Update dossier.json automatically
- Watch for device connect/disconnect events

The architecture is designed so that Phase 2 creates the state management infrastructure, and Phase 3 populates it with real hardware data.
