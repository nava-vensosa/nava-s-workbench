#!/usr/bin/env python3
import sys
import json
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.collections import PatchCollection

def squarify(sizes, x, y, width, height):
    """
    Squarified treemap algorithm.
    Returns list of rectangles as (x, y, width, height) tuples.
    """
    if not sizes:
        return []

    if len(sizes) == 1:
        return [(x, y, width, height)]

    # Normalize sizes to sum to total area
    total = sum(sizes)
    normalized = [s / total for s in sizes]

    rectangles = []

    def layout_row(row_sizes, row_indices, x, y, width, height):
        """Layout a single row of rectangles."""
        row_total = sum(row_sizes)
        is_horizontal = width >= height

        for i, (size, idx) in enumerate(zip(row_sizes, row_indices)):
            if is_horizontal:
                rect_width = width * (size / row_total)
                rect_height = height * row_total
                rect_x = x
                rect_y = y
                x += rect_width
            else:
                rect_width = width * row_total
                rect_height = height * (size / row_total)
                rect_x = x
                rect_y = y
                y += rect_height

            rectangles.append((idx, rect_x, rect_y, rect_width, rect_height))

    # Simple recursive squarify implementation
    total_area = width * height
    areas = [n * total_area for n in normalized]

    def squarify_recursive(sizes_with_idx, x, y, w, h):
        if not sizes_with_idx:
            return

        if len(sizes_with_idx) == 1:
            idx, size = sizes_with_idx[0]
            rectangles.append((idx, x, y, w, h))
            return

        # Split in half
        mid = len(sizes_with_idx) // 2
        first_half = sizes_with_idx[:mid]
        second_half = sizes_with_idx[mid:]

        first_sum = sum(s for _, s in first_half)
        second_sum = sum(s for _, s in second_half)
        total = first_sum + second_sum

        first_ratio = first_sum / total if total > 0 else 0.5

        if w >= h:
            # Split horizontally
            w1 = w * first_ratio
            squarify_recursive(first_half, x, y, w1, h)
            squarify_recursive(second_half, x + w1, y, w - w1, h)
        else:
            # Split vertically
            h1 = h * first_ratio
            squarify_recursive(first_half, x, y, w, h1)
            squarify_recursive(second_half, x, y + h1, w, h - h1)

    sizes_with_idx = list(enumerate(areas))
    squarify_recursive(sizes_with_idx, x, y, width, height)

    return rectangles

def generate_treemap(items, output_path):
    """
    Generate treemap using matplotlib with grayscale colors.
    """
    # Extract data
    names = [item['name'] for item in items]
    percentages = [item['percentage'] for item in items]
    grays = [item['gray'] for item in items]

    # Create figure with square aspect ratio
    fig, ax = plt.subplots(figsize=(10, 10))

    # Generate treemap layout
    rectangles = squarify(percentages, 0, 0, 1, 1)

    # Sort rectangles by original index to match with data
    rectangles.sort(key=lambda r: r[0])

    # Draw rectangles
    for i, (idx, x, y, w, h) in enumerate(rectangles):
        # Create rectangle with grayscale color
        gray_color = str(grays[idx])
        rect = mpatches.Rectangle(
            (x, y), w, h,
            facecolor=gray_color,
            edgecolor='black',
            linewidth=2
        )
        ax.add_patch(rect)

        # Add text label
        cx = x + w / 2
        cy = y + h / 2

        # Determine text color based on background (white text on dark bg, black on light)
        text_color = 'white' if grays[idx] < 0.5 else 'black'

        label = f"{names[idx]}\n{percentages[idx]:.1f}%"
        ax.text(
            cx, cy, label,
            ha='center', va='center',
            fontsize=12, weight='bold',
            color=text_color,
            wrap=True
        )

    # Set limits and aspect
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_aspect('equal')

    # Add thick border around entire treemap
    border = mpatches.Rectangle(
        (0, 0), 1, 1,
        fill=False,
        edgecolor='black',
        linewidth=4
    )
    ax.add_patch(border)

    # Remove axes
    ax.axis('off')

    # Save to file
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def main():
    if len(sys.argv) != 2:
        print("Usage: generate_treemap.py <output_path>", file=sys.stderr)
        sys.exit(1)

    output_path = sys.argv[1]

    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        items = json.loads(input_data)

        # Generate treemap
        generate_treemap(items, output_path)

        print("Success")
        sys.exit(0)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
