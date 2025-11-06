// Fibril Algorithm - Node.js Module
// Bayesian MIDI Note Selection Algorithm

const MIDI_SIZE = 128;
const NUM_ITERATIONS = 3;
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

/**
 * Seeded random number generator for reproducibility
 */
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

/**
 * Generate major key note classes from root note
 * @param {number} rootNote - MIDI number of the root (0-127)
 * @returns {number[]} Array of note classes (0-11) in the major key
 */
function generateMajorKey(rootNote) {
    return MAJOR_SCALE_INTERVALS.map(interval => (rootNote + interval) % 12);
}

/**
 * Check if a MIDI note is in the specified key
 * @param {number} midiNote - MIDI note number (0-127)
 * @param {number[]} majorKey - Array of note classes in key
 * @returns {boolean}
 */
function isInKey(midiNote, majorKey) {
    const noteClass = midiNote % 12;
    return majorKey.includes(noteClass);
}

/**
 * Create a binary mask for in-key notes
 * @param {number} rootNote - MIDI root note
 * @returns {number[]} Array of 0s and 1s
 */
function createInKeyMask(rootNote) {
    const majorKey = generateMajorKey(rootNote);
    const mask = new Array(MIDI_SIZE);
    for (let i = 0; i < MIDI_SIZE; i++) {
        mask[i] = isInKey(i, majorKey) ? 1 : 0;
    }
    return mask;
}

/**
 * COMPUTE function: Calculate harmonic relationship score
 * @param {number} bIndex - POSTERIOR index being calculated
 * @param {number} aIndex - UIN_MAP index being compared
 * @param {number[]} voicingMap - Binary array of voiced notes
 * @param {number[]} inKeyMask - Binary array of in-key notes
 * @returns {number} Harmonic score
 */
function compute(bIndex, aIndex, voicingMap, inKeyMask) {
    // Rule 1: Key filtering
    if (inKeyMask[bIndex] === 0) {
        return 0.0;
    }

    let score = 0.0;
    const intervalWithA = bIndex - aIndex;

    // Rule 2: Perfect fourths (interval = ±5)
    if (Math.abs(intervalWithA) === 5) {
        score += 0.3;
    }

    // Rule 3: Perfect fifths (interval = ±7) with A
    if (Math.abs(intervalWithA) === 7) {
        score += 0.25;
    }

    // Check against all voiced notes
    for (let voicedNote = 0; voicedNote < MIDI_SIZE; voicedNote++) {
        if (voicingMap[voicedNote] === 1) {
            const intervalWithVoiced = bIndex - voicedNote;

            // Rule 2: Perfect fourths with voiced notes
            if (Math.abs(intervalWithVoiced) === 5) {
                score += 0.3;
            }

            // Rule 3: Perfect fifths with voiced notes
            if (Math.abs(intervalWithVoiced) === 7) {
                score += 0.25;
            }

            // Rule 4: Voice leading (interval = ±1 or ±2)
            if (Math.abs(intervalWithVoiced) === 1 || Math.abs(intervalWithVoiced) === 2) {
                score += 0.2;
            }
        }
    }

    return score;
}

/**
 * Perform one iteration of Bayesian update
 * @param {number[]} posterior - Current probability distribution
 * @param {number[]} uinMap - Prior distribution
 * @param {number[]} voicingMap - Voiced notes
 * @param {number[]} inKeyMask - In-key mask
 * @returns {number[]} Updated posterior distribution
 */
function bayesianUpdate(posterior, uinMap, voicingMap, inKeyMask) {
    const newPosterior = new Array(MIDI_SIZE);

    // For each element j in POSTERIOR
    for (let j = 0; j < MIDI_SIZE; j++) {
        let sum = 0.0;

        // Sum over all elements i in UIN_MAP
        for (let i = 0; i < MIDI_SIZE; i++) {
            const pA = uinMap[i]; // Prior probability
            const pBGivenA = compute(j, i, voicingMap, inKeyMask); // Likelihood
            const pB = posterior[j]; // Normalizing constant

            // Avoid division by zero
            if (pB > 0) {
                sum += (pA * pBGivenA) / pB;
            }
        }

        newPosterior[j] = sum;
    }

    // Normalize to sum to 1
    let total = 0.0;
    for (let j = 0; j < MIDI_SIZE; j++) {
        total += newPosterior[j];
    }

    if (total > 0) {
        for (let j = 0; j < MIDI_SIZE; j++) {
            newPosterior[j] /= total;
        }
    }

    return newPosterior;
}

/**
 * Sample from probability distribution using seeded random
 * @param {number[]} posterior - Probability distribution
 * @param {SeededRandom} rng - Random number generator
 * @returns {number} Selected MIDI note index
 */
function sampleFromDistribution(posterior, rng) {
    const randValue = rng.next();
    let cumulative = 0.0;

    for (let i = 0; i < MIDI_SIZE; i++) {
        cumulative += posterior[i];
        if (randValue <= cumulative) {
            return i;
        }
    }

    return MIDI_SIZE - 1; // Fallback
}

/**
 * Allocate voices based on probability distribution
 * @param {number[]} posterior - Probability distribution
 * @param {number} numVoices - Number of voices to allocate
 * @param {number} seed - Random seed
 * @returns {number[]} Voicing map (binary array)
 */
function allocateVoices(posterior, numVoices, seed) {
    const voicingMap = new Array(MIDI_SIZE).fill(0);
    const rng = new SeededRandom(seed);

    for (let v = 0; v < numVoices; v++) {
        const selectedNote = sampleFromDistribution(posterior, rng);
        voicingMap[selectedNote] = 1;
    }

    return voicingMap;
}

/**
 * Main Fibril algorithm
 * @param {Object} params - Algorithm parameters
 * @param {number} params.numVoices - Number of voices to allocate
 * @param {number} params.seed - Random seed
 * @param {number} params.rootNote - Root note MIDI number
 * @returns {Object[]} Array of states at each stage
 */
function runFibrilAlgorithm({ numVoices, seed, rootNote }) {
    const inKeyMask = createInKeyMask(rootNote);

    // Initialize POSTERIOR with uniform distribution
    const initialProb = 1.0 / MIDI_SIZE;
    let posterior = new Array(MIDI_SIZE).fill(initialProb);
    let voicingMap = new Array(MIDI_SIZE).fill(0);

    // Store initial state
    const states = [
        { stage: 'Initial', posterior: [...posterior], voicingMap: [...voicingMap] }
    ];

    // Apply in-key mask to initial state
    for (let i = 0; i < MIDI_SIZE; i++) {
        posterior[i] *= inKeyMask[i];
    }

    // Normalize after masking
    let total = 0.0;
    for (let i = 0; i < MIDI_SIZE; i++) {
        total += posterior[i];
    }
    if (total > 0) {
        for (let i = 0; i < MIDI_SIZE; i++) {
            posterior[i] /= total;
        }
    }

    // Run comparison loop (3 iterations)
    for (let iteration = 0; iteration < NUM_ITERATIONS; iteration++) {
        // Copy POSTERIOR to UIN_MAP
        const uinMap = [...posterior];

        // Perform Bayesian update
        posterior = bayesianUpdate(posterior, uinMap, voicingMap, inKeyMask);

        // Store state after this iteration
        states.push({
            stage: `Iteration ${iteration + 1}`,
            posterior: [...posterior],
            voicingMap: [...voicingMap]
        });
    }

    // Allocate voices after all iterations
    voicingMap = allocateVoices(posterior, numVoices, seed);

    // Update final state with allocated voices
    states[states.length - 1].voicingMap = voicingMap;

    return states;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runFibrilAlgorithm,
        MIDI_SIZE,
        NUM_ITERATIONS
    };
}
