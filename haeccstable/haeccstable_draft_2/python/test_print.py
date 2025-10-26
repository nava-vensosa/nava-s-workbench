#!/usr/bin/env python3
"""Test print/println with printf syntax"""

from dsl_parser import DSLParser

parser = DSLParser()

test_cases = [
    'print("hello world")',
    'println("hello world")',
    'print("x = %d", 42)',
    'print("name: %s, age: %d", "Alice", 30)',
    'print("value: {}", 100)',
    'print("a={}, b={}", 1, 2)',
    'print(123)',
    'print("test", "multiple", "args")',
]

for test in test_cases:
    print(f"\n=== Testing: {test} ===")
    result = parser.parse(test)
    print(f"Result: {result}")
