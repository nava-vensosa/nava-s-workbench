#!/usr/bin/env python3
import sys
import json
import numpy as np

def percentage_to_grayscale(percentage):
    """
    Convert percentage to grayscale color.
    1% = white (rgb close to 1,1,1)
    100% = black (rgb close to 0,0,0)
    """
    # Normalize percentage to 0-1 range, then invert (1% -> high value, 100% -> low value)
    gray_value = 1.0 - (percentage / 100.0)
    return gray_value

def calculate_grayscale_data(items):
    """
    Use numpy to calculate grayscale colors for each item.
    Returns enhanced data with grayscale values.
    """
    # Use numpy for color calculations
    percentages = np.array([item['percentage'] for item in items])
    names = [item['name'] for item in items]

    # Calculate grayscale values using numpy
    gray_values = np.array([percentage_to_grayscale(p) for p in percentages])

    # Build output data structure
    output_items = []
    for i, (name, percentage, gray) in enumerate(zip(names, percentages, gray_values)):
        output_items.append({
            'name': name,
            'percentage': float(percentage),
            'gray': float(gray)
        })

    return output_items

def main():
    try:
        # Read JSON data from stdin
        input_data = sys.stdin.read()
        items = json.loads(input_data)

        # Calculate grayscale values with numpy
        enhanced_items = calculate_grayscale_data(items)

        # Output enhanced JSON data
        print(json.dumps(enhanced_items))

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
