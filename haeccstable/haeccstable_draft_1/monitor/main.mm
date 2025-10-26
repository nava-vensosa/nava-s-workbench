/*
 * Haeccstable Monitor Process
 * Entry point for monitor window subprocess
 */

#import <Cocoa/Cocoa.h>
#import "monitor_window.h"
#import <iostream>

int main(int argc, char *argv[]) {
    if (argc < 3) {
        std::cerr << "Usage: " << argv[0] << " <monitor_name> <port>" << std::endl;
        return 1;
    }

    std::string monitor_name = argv[1];
    int port = std::atoi(argv[2]);

    std::cout << "Starting monitor: " << monitor_name << " on port " << port << std::endl;

    @autoreleasepool {
        // Create application
        NSApplication *app = [NSApplication sharedApplication];
        [app setActivationPolicy:NSApplicationActivationPolicyRegular];

        // Create monitor window
        MonitorWindow *window = [[MonitorWindow alloc] initWithName:@(monitor_name.c_str())
                                                              port:port];

        if (!window) {
            std::cerr << "Failed to create monitor window" << std::endl;
            return 1;
        }

        // Show window and activate app
        [window makeKeyAndOrderFront:nil];
        [app activateIgnoringOtherApps:YES];

        std::cout << "Window created and shown" << std::endl;

        // Run app event loop
        [app run];
    }

    return 0;
}
