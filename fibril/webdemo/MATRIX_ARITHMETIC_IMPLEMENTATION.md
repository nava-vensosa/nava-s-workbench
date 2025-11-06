# Matrix Arithmetic Implementation with NumPy

This document describes how to implement the Fibril algorithm using NumPy's vectorized operations instead of nested for loops. This approach provides significant performance improvements and more concise code.

## Core Principle: Vectorization

Instead of iterating through elements one-by-one, NumPy allows us to perform operations on entire arrays simultaneously using broadcasting and element-wise operations.

## Data Structures as NumPy Arrays

```python
import numpy as np

# Initialize arrays
MIDI_SIZE = 128
INITIAL_PROB = 1.0 / MIDI_SIZE

posterior = np.full(MIDI_SIZE, INITIAL_PROB, dtype=np.float64)
uin_map = np.full(MIDI_SIZE, INITIAL_PROB, dtype=np.float64)
voicing_map = np.zeros(MIDI_SIZE, dtype=np.int8)
```

## Key Filtering (Vectorized)

Instead of checking each note individually:

```python
# Traditional loop approach
for i in range(MIDI_SIZE):
    if not is_in_key(i, key):
        posterior[i] = 0.0

# Vectorized approach
# User specifies root note (e.g., 60 for C, 61 for C#, 62 for D, etc.)
root_note = 60  # MIDI number for the key center

# Major scale intervals from root
MAJOR_SCALE_INTERVALS = np.array([0, 2, 4, 5, 7, 9, 11])

# Generate the major key starting from root_note
MAJOR_KEY = (root_note + MAJOR_SCALE_INTERVALS) % 12

# Get note classes for all MIDI notes
midi_indices = np.arange(MIDI_SIZE)
note_classes = midi_indices % 12

# Create a mask for notes in key
in_key_mask = np.isin(note_classes, MAJOR_KEY)

# Apply mask (zeros out-of-key notes)
posterior = posterior * in_key_mask
```

## Interval Detection (Broadcasting)

The most critical optimization: computing intervals between all pairs of notes.

### Traditional Nested Loop
```python
# O(n²) complexity with explicit loops
for j in range(MIDI_SIZE):
    for i in range(MIDI_SIZE):
        interval = j - i
        # process interval...
```

### Vectorized Approach
```python
# Create meshgrids for all pairwise comparisons
# Shape: (128, 128) where [j, i] = interval from i to j
j_indices = np.arange(MIDI_SIZE).reshape(-1, 1)  # Column vector (128, 1)
i_indices = np.arange(MIDI_SIZE).reshape(1, -1)  # Row vector (1, 128)

# Broadcasting automatically creates (128, 128) matrix
interval_matrix = j_indices - i_indices

# Now interval_matrix[j, i] contains the interval from note i to note j
```

## COMPUTE Function (Vectorized)

The COMPUTE function can be fully vectorized:

```python
def compute_vectorized(posterior_indices, uin_map_indices, voicing_map, in_key_mask):
    """
    Compute harmonic scores for all pairs of notes.

    Returns: (128, 128) matrix where [j, i] = COMPUTE(j, i)
    """
    # Create interval matrix via broadcasting
    j_notes = posterior_indices.reshape(-1, 1)  # (128, 1)
    i_notes = uin_map_indices.reshape(1, -1)    # (1, 128)
    intervals = j_notes - i_notes                # (128, 128)

    # Initialize score matrix
    scores = np.zeros((MIDI_SIZE, MIDI_SIZE), dtype=np.float64)

    # Apply key mask (only j notes in key can have non-zero scores)
    key_mask = in_key_mask.reshape(-1, 1)  # (128, 1)

    # Rule 2: Perfect fourths (interval = ±5)
    fourth_mask = (np.abs(intervals) == 5)
    scores += fourth_mask * 0.3

    # Rule 3: Perfect fifths (interval = ±7)
    fifth_mask = (np.abs(intervals) == 7)
    scores += fifth_mask * 0.25

    # Rule 4: Voice leading (interval = ±1 or ±2)
    voice_leading_mask = (np.abs(intervals) == 1) | (np.abs(intervals) == 2)
    scores += voice_leading_mask * 0.2

    # Apply key filtering
    scores *= key_mask

    # Add boosts for intervals with currently voiced notes
    voiced_indices = np.where(voicing_map == 1)[0]

    if len(voiced_indices) > 0:
        for voiced_note in voiced_indices:
            # Intervals from all j notes to this voiced note
            intervals_to_voiced = j_notes.flatten() - voiced_note

            # Perfect fourths
            fourth_boost = (np.abs(intervals_to_voiced) == 5) * 0.3
            scores += fourth_boost.reshape(-1, 1)

            # Perfect fifths
            fifth_boost = (np.abs(intervals_to_voiced) == 7) * 0.25
            scores += fifth_boost.reshape(-1, 1)

            # Voice leading
            vl_boost = ((np.abs(intervals_to_voiced) == 1) |
                       (np.abs(intervals_to_voiced) == 2)) * 0.2
            scores += vl_boost.reshape(-1, 1)

    return scores
```

## Bayesian Update (Vectorized)

The main Bayesian update can be expressed as a matrix operation:

```python
def bayesian_update_vectorized(posterior, uin_map, voicing_map, in_key_mask):
    """
    Perform one iteration of Bayesian update.

    Formula: posterior[j] = Σ(i) [uin_map[i] * COMPUTE(j, i) / posterior[j]]
    """
    # Create indices
    indices = np.arange(MIDI_SIZE)

    # Compute all pairwise harmonic scores (128, 128 matrix)
    compute_matrix = compute_vectorized(indices, indices, voicing_map, in_key_mask)

    # Avoid division by zero
    posterior_safe = np.where(posterior > 0, posterior, 1.0)

    # Bayesian formula: P(A) * P(B|A) / P(B)
    # uin_map[i] * compute_matrix[j, i] / posterior[j]

    # Broadcasting:
    # - uin_map shape: (1, 128) - row vector
    # - compute_matrix shape: (128, 128)
    # - posterior_safe shape: (128, 1) - column vector

    likelihood_matrix = (uin_map.reshape(1, -1) * compute_matrix /
                         posterior_safe.reshape(-1, 1))

    # Sum over all i (axis=1) to get new posterior
    new_posterior = np.sum(likelihood_matrix, axis=1)

    # Normalize to sum to 1
    total = np.sum(new_posterior)
    if total > 0:
        new_posterior /= total

    return new_posterior
```

## Complete Vectorized Algorithm

```python
def fibril_algorithm_vectorized(num_voices=4, num_iterations=3, root_note=60):
    """Full vectorized implementation of Fibril algorithm."""

    # Initialize
    MIDI_SIZE = 128
    posterior = np.full(MIDI_SIZE, 1.0/MIDI_SIZE, dtype=np.float64)
    voicing_map = np.zeros(MIDI_SIZE, dtype=np.int8)

    # Create key mask
    # User can specify root_note (e.g., 60 for C, 61 for C#, 62 for D, etc.)
    MAJOR_SCALE_INTERVALS = np.array([0, 2, 4, 5, 7, 9, 11])
    MAJOR_KEY = (root_note + MAJOR_SCALE_INTERVALS) % 12
    note_classes = np.arange(MIDI_SIZE) % 12
    in_key_mask = np.isin(note_classes, MAJOR_KEY)

    # Run comparison loop
    for iteration in range(num_iterations):
        # Copy posterior to uin_map
        uin_map = posterior.copy()

        # Vectorized Bayesian update
        posterior = bayesian_update_vectorized(posterior, uin_map,
                                               voicing_map, in_key_mask)

    # Allocate voices
    voicing_map = allocate_voices_vectorized(posterior, voicing_map, num_voices)

    return posterior, voicing_map


def allocate_voices_vectorized(posterior, voicing_map, num_voices):
    """Allocate voices using vectorized sampling."""

    # Sample from probability distribution
    for _ in range(num_voices):
        # NumPy's random.choice handles probability distributions directly
        selected_note = np.random.choice(len(posterior), p=posterior)
        voicing_map[selected_note] = 1

    return voicing_map
```

## Performance Comparison

### Traditional Nested Loops
- **Complexity**: O(128² × 3) = O(49,152) operations per update
- **Memory**: Minimal (loop variables only)
- **Speed**: Slow due to Python interpreter overhead

### Vectorized NumPy
- **Complexity**: Same O(n²), but executed in optimized C code
- **Memory**: Higher (stores 128×128 matrices temporarily)
- **Speed**: 10-100× faster depending on system

## Key NumPy Operations Used

1. **Broadcasting**: Automatically expand dimensions for element-wise operations
2. **np.where()**: Vectorized conditional operations
3. **np.isin()**: Membership testing across arrays
4. **Boolean indexing**: Filter arrays using boolean masks
5. **np.sum(axis=...)**: Aggregate along specific dimensions
6. **np.random.choice()**: Weighted random sampling

## Memory Optimization Tips

For even better performance:

```python
# Pre-allocate arrays
scores = np.zeros((MIDI_SIZE, MIDI_SIZE), dtype=np.float32)  # Use float32 if precision allows

# Use in-place operations when possible
scores += fourth_mask * 0.3  # Instead of scores = scores + ...

# Reuse interval matrix across rules
intervals = j_notes - i_notes
abs_intervals = np.abs(intervals)  # Compute once, use multiple times
```

## Conclusion

Vectorization with NumPy transforms nested loops into matrix operations, providing:
- **Faster execution** (10-100× speedup)
- **Cleaner code** (fewer lines, clearer intent)
- **Better scalability** (performance scales better with array size)

The trade-off is higher memory usage, but for arrays of size 128, this is negligible on modern systems.
