# Visualization Guide - Square Chart Layout

## Overview

The Fibril algorithm visualization uses a **square chart** (also called a treemap layout) to display probability distributions. This is a square variation of a pie chart, where the area of each cell is proportional to the probability of that MIDI note being selected.

**Square Chart**: A recognized visualization technique that presents proportional data in quadratic form rather than circular form. Each section's area directly represents its percentage of the whole. See: [Square Chart Definition](https://latex-cookbook.net/square-chart/)

## Key Concepts

### Square Pie Chart

The visualization is essentially a **pie chart in square form**:
- Just like a pie chart divides a circle into slices proportional to values
- This divides a square into rectangles proportional to probabilities
- If a MIDI note has 8.625% probability → it takes up exactly 8.625% of the square's area
- Zero-probability notes take up 0% area → they're not drawn at all

### Mathematical Principle

```
For each MIDI note i (i = 0 to 127):
  probability[i] after normalization = p[i]

  Cell area[i] = p[i] × Total Square Area

If p[i] = 0 → area = 0 → cell not visible
If p[i] = 0.08625 → area = 8.625% of square
```

All 128 probabilities are normalized to sum to 1, then each gets its exact percentage of the square.

### Treemap Layout Algorithm

A treemap is a space-filling visualization that divides a rectangular area into smaller rectangles, where:
- Each rectangle represents one item (in our case, a MIDI note)
- The **area** of each rectangle equals its **exact probability**
- All rectangles are **contiguous** - they touch each other with no gaps
- The entire square is filled completely (100% of area used)

### Why This Approach?

Unlike a fixed grid layout:
- ✅ **Exact proportionality**: Area directly equals probability (like a pie chart)
- ✅ **Zero-probability notes naturally disappear**: 0% probability = 0 area
- ✅ **Space-efficient**: Every pixel represents probability
- ✅ **Immediate visual comparison**: Larger cells = higher probability
- ✅ **Adapts to any distribution**: Uniform or highly concentrated

## Visual Elements

### Four Stages (2×2 Grid)

Each square shows one stage of the algorithm:

1. **Initial** - Uniform distribution across all in-key notes
2. **Iteration 1** - First Bayesian update based on harmonic rules
3. **Iteration 2** - Second refinement
4. **Iteration 3** - Final distribution with voices allocated

### Cell Colors

- **Light Blue** → Low probability in-key note
- **Dark Blue** → High probability in-key note
- **Green** → Allocated voice (selected by algorithm)

### MIDI Numbers

- Displayed inside cells when space allows
- Font size scales with cell size
- White text on blue cells, black text on green cells

## Reading the Visualization

### Initial State

In the first square (Initial), all in-key notes have equal probability:
- For C major key: 7 note classes × multiple octaves ≈ 37 in-key notes
- Each cell has probability ≈ 1/37 = 2.7%
- All cells appear roughly the same size and color

### After Iteration 1

Probabilities begin to shift based on:
- Harmonic relationships (fourths, fifths)
- Currently voiced notes (none yet in iteration 1)
- Some cells grow larger, others shrink

### After Iteration 2

Concentration increases:
- High-probability notes become more dominant
- Low-probability notes shrink further
- Color gradient becomes more pronounced

### After Iteration 3

Final distribution with voices allocated:
- **Green cells** show which notes were selected
- Distribution is highly concentrated on harmonically favorable notes
- Most probability mass in a few large cells

## Information Display

Below each square:
- **In-key notes**: Count of notes with probability > 0
- **Voiced**: Number of allocated voices

At the bottom:
- **Legend**: Explains colors
- **Note**: Reminds that zero-probability notes are hidden

## Example Interpretation

### Scenario: C Major, 4 Voices, Seed 12345

**Initial Square:**
- ~37 cells of equal size (all in-key notes)
- All light blue
- Uniform distribution

**Iteration 3 Square:**
- Maybe 15-20 visible cells (low-probability notes filtered out visually)
- Few large dark blue cells (high probability)
- 4 green cells (allocated voices)
- The 4 green cells likely among the largest cells
- Cells positioned to show harmonic relationships

## Technical Details

### Squarified Treemap Algorithm

The algorithm:
1. Filters out zero-probability items
2. Sorts items by probability (descending)
3. Recursively subdivides the square:
   - Chooses split direction (vertical/horizontal) based on aspect ratio
   - Finds optimal split point to minimize aspect ratio distortion
   - Creates more "square-like" rectangles (better readability)

### Advantages

- **Space efficient**: Uses 100% of available area
- **Intuitive**: Cell size directly represents probability
- **Adaptive**: Works with any number of notes (7-37 for major keys)
- **Highlights change**: Easy to see probability shifts across iterations

### Canvas Size

- 1200×1200 pixels total
- ~550×550 pixels per square (accounting for padding and labels)
- Responsive to different screen sizes
- Fits on same page as controls (no scrolling needed)

## Comparison to Grid Layout

### Grid Layout (Not Used)
- Fixed 16×8 grid
- Shows all 128 MIDI notes
- Many empty cells (out-of-key notes)
- Probability shown by cell fill within fixed grid

### Treemap Layout (Used)
- Dynamic layout based on active notes
- Only shows in-key notes
- No empty space
- Probability shown by cell area

## Tips for Understanding

1. **Look for size differences** - Large cells = likely to be selected
2. **Follow the evolution** - Watch cells grow/shrink across stages
3. **Check the green cells** - See which high-probability notes got chosen
4. **Compare Initial vs Iteration 3** - Notice the concentration effect
5. **Vary parameters** - Different seeds produce different allocations

## Mathematical Connection

The treemap provides **exact** area-to-probability mapping:

```
Given:
- Total square area = W × H (e.g., 550 × 550 = 302,500 pixels²)
- MIDI note i has normalized probability = p[i]

Then:
- Cell[i] area = p[i] × (W × H)
- Cell[i] width × Cell[i] height = p[i] × (W × H)

Example:
If square is 550×550 pixels and p[60] = 0.08625 (8.625%):
→ Cell 60 area = 0.08625 × 302,500 = 26,090 pixels²
→ Might be drawn as 161 × 162 pixels (26,082 pixels²)

Verification (in code):
Cell Area / Total Area = Probability
26,082 / 302,500 = 0.08622 ≈ 0.08625 ✓
```

This makes the visualization a **direct geometric representation** of the probability distribution!

**Important**: The algorithm includes verification code that warns if any cell's area deviates by more than 1% from its expected probability. This ensures the "square pie chart" property holds accurately.
