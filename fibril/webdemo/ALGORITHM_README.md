# Fibril Algorithm: Bayesian MIDI Note Selection

## Overview

The Fibril algorithm is a probabilistic system for selecting MIDI notes based on harmonic relationships and voice leading principles. It uses Bayes's theorem to iteratively refine the probability distribution of notes, favoring harmonically related pitches according to user-specified preferences.

## Core Data Structures

### POSTERIOR (128-element array)
- **Size**: 128 elements (representing MIDI notes 0-127)
- **Initial values**: Each element = 1/128 (uniform distribution)
- **Structure**: Each element represents a tuple `(MIDI_INDEX, PROBABILITY)`
- **Purpose**: The probability distribution that gets updated through the algorithm

### UIN_MAP (128-element array)
- **Size**: 128 elements
- **Initial values**: Copy of POSTERIOR at the start of each comparison loop
- **Purpose**: Serves as the prior distribution during Bayesian updates
- **Behavior**: Remains unchanged during iterations within a comparison loop

### VOICING_MAP (128-element binary array)
- **Size**: 128 elements
- **Values**: 0 or 1 (binary indicator)
- **Purpose**: Tracks which MIDI notes are currently allocated/voiced
- **Updates**: Modified during voice allocation process

## Algorithm Process

### 1. Initialization
All elements in POSTERIOR are initially set to 1/128, creating a uniform probability distribution across all MIDI notes.

### 2. The Comparison Loop (3 iterations)

For each iteration:

1. **Copy POSTERIOR to UIN_MAP** at the start of the loop
2. **Update each element j in POSTERIOR** using the formula:

```
POSTERIOR[j] = Σ(i in UIN_MAP) [i.PROBABILITY × COMPUTE(j.INDEX, i.INDEX) / j.PROBABILITY]
```

This implements Bayes's theorem: `P(A|B) = P(A) × P(B|A) / P(B)`

Where:
- **A** = MIDI note in UIN_MAP being used for comparison
- **B** = MIDI note in POSTERIOR being calculated for determining voice allocation according to user input 
- **P(B|A)** = COMPUTE() function (harmonic relationship heuristic; in Bayes's Theorem this element is called the PRIOR)
- **P(A)** = i.PROBABILITY (current probability from UIN_MAP; in Bayes's Theorem this element is called the LIKELIHOOD)
- **P(B)** = j.PROBABILITY (coextensive probability of the note under consideration; in Bayes's Theorem this element is used to NORMALIZE)

3. **Evolution across iterations**:
   - **Iteration 1**: COMPUTE() provides rule-based harmonic comparisons
   - **Iterations 2-3**: Previous POSTERIOR values are incorporated as the PRIOR, resulting in a feedback loop which refines the distribution

### 3. Voice Allocation

The number of voices to allocate is specified by the user. The allocation process:

1. **Random selection**: Sample from POSTERIOR's probability distribution using a random seed
2. **Update VOICING_MAP**: Set the selected index to 1
3. **Reallocation logic**:
   - If **new allocation > current allocation**: Add new voices, then free and reroll old voices one at a time
   - If **new allocation ≤ current allocation**: Free voices one at a time while adding the new voices until quota is reached, then free all remaining old voices

VOICING_MAP affects the COMPUTE() function between comparison loop iterations.

## The COMPUTE() Function

The COMPUTE(B_index, A_index) function returns a float value based on harmonic rules:

### Rule 1: Key Filtering
- **Input**: User specifies a key (default: C major)
- **Effect**: If B_index is outside the major scale of the specified key, return 0
- **Result**: No further computation for out-of-key notes

### Rule 2: Perfect Fourths
- **Condition**: Interval of 5 semitones between:
  - B_index and any TRUE (1) element in VOICING_MAP, AND/OR
  - B_index and A_index
- **Boost**: +0.3 for each occurrence
- **Example**: If B=65, key=C, VOICING_MAP[60]=1, A=70:
  - 65-60=5 (fourth with voicing) → +0.3
  - 70-65=5 (fourth with A) → +0.3
  - Total boost: +0.6

### Rule 3: Perfect Fifths
- **Condition**: Interval of 7 semitones (same logic as fourths)
- **Boost**: +0.25 for each occurrence

### Rule 4: Voice Leading
- **Condition**: Distance of 1 or 2 semitones between B_index and any allocated index in VOICING_MAP
- **Additional requirement**: B_index must be in the indicated key
- **Boost**: +0.2

## Bayesian Interpretation

The algorithm implements iterative Bayesian updating:

1. **Prior**: UIN_MAP represents prior beliefs about note probabilities
2. **Likelihood**: COMPUTE() provides likelihood based on harmonic rules
3. **Posterior**: Updated POSTERIOR reflects refined probabilities
4. **Iteration**: Running the loop 3 times allows the distribution to converge toward harmonically favorable notes

## Key Characteristics

- **Adaptive**: Probabilities evolve based on currently voiced notes
- **Context-aware**: Considers both vertical harmony (intervals with current voices) and horizontal voice leading
- **Probabilistic**: Maintains uncertainty while favoring harmonic relationships
- **Musical**: Implements music-theoretic principles (fourths, fifths, stepwise motion, key membership)
