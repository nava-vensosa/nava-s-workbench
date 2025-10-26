#!/usr/bin/env python3
"""
Test script for DSL Parser

Tests parsing of various DSL constructs including:
- Variable declarations
- Process calls with $ prefix
- Method calls and property assignments
- Function definitions
"""

from dsl_parser import DSLParser
import json

def test_parser():
    """Run parser tests"""
    parser = DSLParser()

    test_cases = [
        # Variable declarations
        ("video_invar webcam = capture(0)", "Variable declaration"),
        ("window_var win1 = window(\"Output\", 1920, 1080)", "Window variable"),
        ("layer_obj mainLayer = layer(\"Main\", 1920, 1080)", "Layer object"),
        ("var x = 3", "Generic variable"),

        # Function definition
        ("func ratio(x, y) = x / y", "Function definition"),

        # Process definition
        ("process $ascii_filter(input) { return input }", "Process definition"),

        # Process calls with $ prefix
        ("$sobel(webcam, threshold=0.15)", "Process call with named arg"),
        ("$gaussian_blur(video, sigma=1.0, direction=\"horizontal\")", "Process call multiple args"),

        # Method calls
        ("layer.cast(webcam)", "Method call"),
        ("win1.project(mainLayer)", "Method call with different object"),

        # Property assignment
        ("freq1.mix = (100, 0)", "Property assignment with tuple"),
        ("tone.frequency = 440", "Property assignment with number"),
    ]

    print("=" * 60)
    print("DSL Parser Tests")
    print("=" * 60)
    print()

    passed = 0
    failed = 0

    for source, description in test_cases:
        print(f"Test: {description}")
        print(f"Input: {source}")

        result = parser.parse(source)

        if result.get("status") == "success":
            print(f"✓ PASSED")
            print(f"  Type: {result.get('type')}")
            if "message" in result:
                print(f"  Message: {result['message']}")
            passed += 1
        else:
            print(f"✗ FAILED")
            print(f"  Error: {result.get('error')}")
            failed += 1

        print()

    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)

    # Test process name validation (should fail without $)
    print("\nTesting process name validation:")
    print("Input: process ascii_filter(input) { return input }")
    result = parser.parse("process ascii_filter(input) { return input }")
    if "error" in result and "$" in result["error"]:
        print("✓ PASSED - Correctly rejected process without $ prefix")
    else:
        print("✗ FAILED - Should have rejected process without $ prefix")

if __name__ == "__main__":
    test_parser()
