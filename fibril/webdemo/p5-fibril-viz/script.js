// Constants
const MIDI_SIZE = 128;
const NUM_ITERATIONS = 3;
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MAX_ROWS = 4;

// Global state
let rows = []; // Stores the 4 states: {stage, posterior, voicingMap}
let useServerAPI = false; // Toggle between client-side and server-side execution
let savedRuns = []; // Store list of saved runs

// Seeded random number generator
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

// Generate major key from root note
function generateMajorKey(rootNote) {
    return MAJOR_SCALE_INTERVALS.map(interval => (rootNote + interval) % 12);
}

// Check if a MIDI note is in the specified key
function isInKey(midiNote, majorKey) {
    const noteClass = midiNote % 12;
    return majorKey.includes(noteClass);
}

// Create in-key mask
function createInKeyMask(rootNote) {
    const majorKey = generateMajorKey(rootNote);
    const mask = new Array(MIDI_SIZE);
    for (let i = 0; i < MIDI_SIZE; i++) {
        mask[i] = isInKey(i, majorKey) ? 1 : 0;
    }
    return mask;
}

// COMPUTE function: Calculate harmonic relationship score
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

    // Check against all voiced notes
    for (let voicedNote = 0; voicedNote < MIDI_SIZE; voicedNote++) {
        if (voicingMap[voicedNote] === 1) {
            const intervalWithVoiced = bIndex - voicedNote;

            // Rule 2: Perfect fourths
            if (Math.abs(intervalWithVoiced) === 5) {
                score += 0.3;
            }

            // Rule 3: Perfect fifths (interval = ±7)
            if (Math.abs(intervalWithVoiced) === 7) {
                score += 0.25;
            }

            // Rule 4: Voice leading (interval = ±1 or ±2)
            if (Math.abs(intervalWithVoiced) === 1 || Math.abs(intervalWithVoiced) === 2) {
                score += 0.2;
            }
        }
    }

    // Rule 3: Perfect fifths with A
    if (Math.abs(intervalWithA) === 7) {
        score += 0.25;
    }

    return score;
}

// Perform one iteration of Bayesian update
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

// Sample from probability distribution using seeded random
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

// Allocate voices based on probability distribution
function allocateVoices(posterior, numVoices, seed) {
    const voicingMap = new Array(MIDI_SIZE).fill(0);
    const rng = new SeededRandom(seed);

    for (let v = 0; v < numVoices; v++) {
        const selectedNote = sampleFromDistribution(posterior, rng);
        voicingMap[selectedNote] = 1;
    }

    return voicingMap;
}

// Main Fibril algorithm
function runFibrilAlgorithm(numVoices, seed, rootNote) {
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

// Toggle between client-side and server-side execution
function toggleServerMode(checked) {
    useServerAPI = checked;
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.style.display = checked ? 'inline-block' : 'none';
    }
    if (checked) {
        loadSavedRuns();
    }
}

// Save current run manually
function saveCurrentRun() {
    if (rows.length === 0) {
        alert('No algorithm run to save. Run the algorithm first.');
        return;
    }

    const numVoices = int(select('#numVoices').value());
    const seed = int(select('#randomSeed').value());
    const rootNote = int(select('#rootNote').value());

    saveRunToServer(rows, { numVoices, seed, rootNote });
}

// Square Chart layout algorithm - like a pie chart but square
// Reference: https://latex-cookbook.net/square-chart/
// Each cell's area = its exact probability percentage of the total square
// If probability is 8.625%, the cell takes up exactly 8.625% of the square's area
function createTreemapLayout(probabilities, x, y, width, height) {
    const boxes = [];
    const totalArea = width * height;

    // Step 1: Normalize ALL 128 probabilities to sum to 1
    const totalProb = probabilities.reduce((sum, p) => sum + p, 0);

    // Create items with normalized probabilities
    // Filter out zeros (they have 0 area, so naturally not drawn)
    const items = probabilities
        .map((prob, idx) => ({
            index: idx,
            prob: prob / totalProb  // Normalized to sum to 1
        }))
        .filter(item => item.prob > 0)
        .sort((a, b) => b.prob - a.prob);

    if (items.length === 0) return boxes;

    // Squarified treemap: recursively partition space proportional to probability
    function squarify(items, x, y, w, h) {
        if (items.length === 0) return;

        if (items.length === 1) {
            // Base case: single item gets remaining space
            // Its area should equal its probability * total square area
            boxes.push({
                index: items[0].index,
                prob: items[0].prob,
                x, y, w, h
            });
            return;
        }

        // Split along the longer dimension for better aspect ratios
        const splitVertically = w >= h;

        // Calculate what fraction of current space each group should get
        // This is based on the sum of probabilities in this subspace
        const localTotal = items.reduce((sum, item) => sum + item.prob, 0);

        // Find optimal split point
        let bestSplit = 1;
        let bestRatio = Infinity;

        for (let i = 1; i < items.length; i++) {
            const group1Sum = items.slice(0, i).reduce((sum, item) => sum + item.prob, 0);
            const group2Sum = localTotal - group1Sum;
            const ratio = group1Sum / localTotal;

            // Calculate aspect ratios that would result
            let ratio1, ratio2;
            if (splitVertically) {
                const w1 = w * ratio;
                ratio1 = w1 / h;
                ratio2 = (w - w1) / h;
            } else {
                const h1 = h * ratio;
                ratio1 = w / h1;
                ratio2 = w / (h - h1);
            }

            const maxRatio = Math.max(ratio1, 1/ratio1, ratio2, 1/ratio2);

            if (maxRatio < bestRatio) {
                bestRatio = maxRatio;
                bestSplit = i;
            }
        }

        const group1 = items.slice(0, bestSplit);
        const group2 = items.slice(bestSplit);

        // Calculate area fraction for group1
        const group1Sum = group1.reduce((sum, item) => sum + item.prob, 0);
        const areaRatio = group1Sum / localTotal;

        // Partition space proportionally
        if (splitVertically) {
            const w1 = w * areaRatio;
            squarify(group1, x, y, w1, h);
            squarify(group2, x + w1, y, w - w1, h);
        } else {
            const h1 = h * areaRatio;
            squarify(group1, x, y, w, h1);
            squarify(group2, x, y + h1, w, h - h1);
        }
    }

    squarify(items, x, y, width, height);

    // Verify: each box's area should equal its probability * totalArea
    // (This is just for correctness checking - can be removed in production)
    if (boxes.length > 0) {
        const tolerance = 0.01; // 1% tolerance for floating point errors
        for (let box of boxes) {
            const boxArea = box.w * box.h;
            const expectedArea = box.prob * totalArea;
            const error = Math.abs(boxArea - expectedArea) / expectedArea;
            if (error > tolerance) {
                console.warn(`Box ${box.index} area mismatch: expected ${expectedArea.toFixed(2)}, got ${boxArea.toFixed(2)}`);
            }
        }
    }

    return boxes;
}

// p5.js setup
function setup() {
    const canvas = createCanvas(1200, 1200);
    canvas.parent('canvas-container');

    // Button event listener
    select('#runButton').mousePressed(runAlgorithm);

    noLoop(); // Don't continuously redraw
}

// API Functions
async function runAlgorithmServerSide(numVoices, seed, rootNote) {
    try {
        const response = await fetch('/api/run-algorithm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ numVoices, seed, rootNote })
        });

        const data = await response.json();

        if (data.success) {
            console.log(`Server execution time: ${data.executionTime}ms`);
            return data.states;
        } else {
            console.error('Server error:', data.error);
            alert('Server error: ' + data.error);
            return null;
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Running client-side instead.');
        return null;
    }
}

async function saveRunToServer(states, params) {
    try {
        const response = await fetch('/api/save-run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                states,
                params,
                timestamp: new Date().toISOString()
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('Run saved:', data.filename);
            alert('Run saved successfully!');
            loadSavedRuns(); // Refresh the list
        } else {
            console.error('Save error:', data.error);
            alert('Failed to save run: ' + data.error);
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Could not save run.');
    }
}

async function loadSavedRuns() {
    try {
        const response = await fetch('/api/runs');
        const data = await response.json();

        if (data.success) {
            savedRuns = data.runs;
            updateSavedRunsList();
        }
    } catch (error) {
        console.error('Error loading saved runs:', error);
    }
}

function updateSavedRunsList() {
    const listElement = select('#savedRunsList');
    if (!listElement) return;

    if (savedRuns.length === 0) {
        listElement.html('<p>No saved runs yet.</p>');
        return;
    }

    let html = '<ul>';
    for (let run of savedRuns) {
        html += `<li>${run.timestamp} - Voices: ${run.params.numVoices}, Seed: ${run.params.seed}, Root: ${run.params.rootNote}</li>`;
    }
    html += '</ul>';
    listElement.html(html);
}

// Run algorithm and update visualization
async function runAlgorithm() {
    const numVoices = int(select('#numVoices').value());
    const seed = int(select('#randomSeed').value());
    const rootNote = int(select('#rootNote').value());

    let states;

    // Check if we should use server-side execution
    if (useServerAPI) {
        states = await runAlgorithmServerSide(numVoices, seed, rootNote);
        if (!states) {
            // Fallback to client-side
            states = runFibrilAlgorithm(numVoices, seed, rootNote);
        }
    } else {
        // Client-side execution
        const startTime = Date.now();
        states = runFibrilAlgorithm(numVoices, seed, rootNote);
        const endTime = Date.now();
        console.log(`Client execution time: ${endTime - startTime}ms`);
    }

    // Store the states (keep last 4 for display)
    rows = states;

    redraw();

    // Optionally save to server
    const autoSave = select('#autoSave');
    if (autoSave && autoSave.checked() && useServerAPI) {
        await saveRunToServer(states, { numVoices, seed, rootNote });
    }
}

// p5.js draw - Large square visualization with treemap layout
function draw() {
    background(245);

    if (rows.length === 0) {
        // Draw instructions
        fill(100);
        textAlign(CENTER, CENTER);
        textSize(20);
        text('Click "Run Algorithm" to start visualization', width / 2, height / 2);
        return;
    }

    // Calculate layout for 2x2 grid of perfectly square containers
    const padding = 30;
    const labelHeight = 40;
    const gridCols = 2;
    const gridRows = 2;

    // Calculate square size - must be equal width and height
    const availableWidth = width - padding * (gridCols + 1);
    const availableHeight = height - padding * (gridRows + 1) - labelHeight * gridRows;
    const squareSize = Math.min(availableWidth / gridCols, availableHeight / gridRows);

    // Draw each stage in a separate square (4 stages total)
    for (let i = 0; i < rows.length && i < 4; i++) {
        const state = rows[i];
        const gridX = i % gridCols;
        const gridY = Math.floor(i / gridCols);

        const x = padding + gridX * (squareSize + padding);
        const y = padding + labelHeight + gridY * (squareSize + padding + labelHeight);

        // Draw stage label
        fill(50);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(18);
        textStyle(BOLD);
        text(state.stage, x, y - 30);

        // Draw outer border
        stroke(80);
        strokeWeight(3);
        noFill();
        rectMode(CORNER);
        rect(x, y, squareSize, squareSize);

        // Use treemap layout - only non-zero probability cells
        const boxes = createTreemapLayout(state.posterior, x, y, squareSize, squareSize);

        // Find max probability for color scaling
        const maxProb = Math.max(...state.posterior.filter(p => p > 0));

        // Draw each box in the treemap
        for (let box of boxes) {
            const isVoiced = state.voicingMap[box.index] === 1;

            // Calculate color based on probability
            if (isVoiced) {
                // Voiced notes - bright green
                fill(80, 255, 80);
                stroke(0, 180, 0);
            } else {
                // In-key notes - blue gradient based on probability
                const intensity = map(box.prob, 0, maxProb, 80, 255);
                fill(intensity * 0.6, intensity * 0.6, intensity);
                stroke(0, 0, 180);
            }

            strokeWeight(2);
            rectMode(CORNER);
            rect(box.x, box.y, box.w, box.h);

            // Draw MIDI number if box is large enough
            const minDimension = Math.min(box.w, box.h);
            if (minDimension > 20) {
                fill(isVoiced ? 0 : 255);
                noStroke();
                textAlign(CENTER, CENTER);

                // Scale text size based on box size
                let textSizeValue = constrain(minDimension / 3, 8, 16);
                textSize(textSizeValue);
                textStyle(BOLD);

                const centerX = box.x + box.w / 2;
                const centerY = box.y + box.h / 2;
                text(box.index, centerX, centerY);
            }
        }

        // Count voiced and in-key notes
        const voicedCount = state.voicingMap.filter(v => v === 1).length;
        const inKeyCount = state.posterior.filter(p => p > 0).length;

        // Draw info below square
        fill(100);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(11);
        textStyle(NORMAL);
        text(`In-key notes: ${inKeyCount} | Voiced: ${voicedCount}`, x, y + squareSize + 5);
    }

    // Draw legend
    drawLegend(padding, height - 100);
}

// Draw legend explaining colors
function drawLegend(x, y) {
    textAlign(LEFT, CENTER);
    textSize(13);
    textStyle(NORMAL);

    // Background
    fill(255, 255, 255, 230);
    stroke(100);
    strokeWeight(1);
    rectMode(CORNER);
    rect(x, y, 400, 70);

    noStroke();

    // Legend items
    let legendY = y + 20;

    // In key (low prob)
    fill(100, 100, 180);
    rect(x + 10, legendY - 8, 20, 16);
    fill(50);
    text('In-key notes (darker blue = higher probability)', x + 40, legendY);

    legendY += 25;

    // Voiced
    fill(80, 255, 80);
    rect(x + 10, legendY - 8, 20, 16);
    fill(50);
    text('Allocated voices (green)', x + 40, legendY);

    legendY += 25;

    // Note about zero probability
    fill(50);
    textSize(11);
    textStyle(ITALIC);
    text('Note: Out-of-key notes (probability = 0) are not displayed', x + 10, legendY - 5);
}

// Helper function to find max value in array
function max(arr) {
    return Math.max(...arr);
}

// Helper function to find min value in array
function min(arr) {
    return Math.min(...arr);
}
