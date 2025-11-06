// Fibril Algorithm Visualization Server
// Express server for hosting p5.js visualization and running algorithm server-side

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { runFibrilAlgorithm } = require('./fibril-algorithm.js');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const SAVED_RUNS_DIR = path.join(__dirname, 'saved-runs');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Create saved-runs directory if it doesn't exist
if (!fs.existsSync(SAVED_RUNS_DIR)) {
    fs.mkdirSync(SAVED_RUNS_DIR, { recursive: true });
    console.log('Created saved-runs directory');
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET / - Serve main page
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * POST /api/run-algorithm
 * Run the Fibril algorithm server-side
 *
 * Request body:
 * {
 *   numVoices: number,
 *   seed: number,
 *   rootNote: number
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   states: array of algorithm states,
 *   params: input parameters,
 *   timestamp: ISO timestamp
 * }
 */
app.post('/api/run-algorithm', (req, res) => {
    try {
        const { numVoices, seed, rootNote } = req.body;

        // Validate inputs
        if (typeof numVoices !== 'number' || numVoices < 1 || numVoices > 12) {
            return res.status(400).json({
                success: false,
                error: 'numVoices must be a number between 1 and 12'
            });
        }

        if (typeof seed !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'seed must be a number'
            });
        }

        if (typeof rootNote !== 'number' || rootNote < 0 || rootNote > 127) {
            return res.status(400).json({
                success: false,
                error: 'rootNote must be a MIDI number between 0 and 127'
            });
        }

        // Run algorithm
        const startTime = Date.now();
        const states = runFibrilAlgorithm({ numVoices, seed, rootNote });
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        console.log(`Algorithm executed in ${executionTime}ms`);

        res.json({
            success: true,
            states,
            params: { numVoices, seed, rootNote },
            timestamp: new Date().toISOString(),
            executionTime
        });

    } catch (error) {
        console.error('Error running algorithm:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/save-run
 * Save an algorithm run to disk
 *
 * Request body:
 * {
 *   states: array,
 *   params: object,
 *   timestamp: string,
 *   name: string (optional)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   filename: string,
 *   path: string
 * }
 */
app.post('/api/save-run', (req, res) => {
    try {
        const { states, params, timestamp, name } = req.body;

        if (!states || !params) {
            return res.status(400).json({
                success: false,
                error: 'states and params are required'
            });
        }

        // Generate filename
        const date = new Date(timestamp || Date.now());
        const dateStr = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const customName = name ? `-${name.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
        const filename = `run-${dateStr}${customName}.json`;
        const filepath = path.join(SAVED_RUNS_DIR, filename);

        // Prepare data to save
        const runData = {
            states,
            params,
            timestamp: timestamp || date.toISOString(),
            name: name || null,
            savedAt: new Date().toISOString()
        };

        // Write to file
        fs.writeFileSync(filepath, JSON.stringify(runData, null, 2), 'utf8');

        console.log(`Saved run to ${filename}`);

        res.json({
            success: true,
            filename,
            path: filepath
        });

    } catch (error) {
        console.error('Error saving run:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/runs
 * Get list of all saved runs
 *
 * Query params:
 * - limit: number of runs to return (default: 50)
 * - offset: pagination offset (default: 0)
 *
 * Response:
 * {
 *   success: boolean,
 *   runs: array of run metadata,
 *   total: total number of runs
 * }
 */
app.get('/api/runs', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        // Read all files in saved-runs directory
        const files = fs.readdirSync(SAVED_RUNS_DIR)
            .filter(file => file.endsWith('.json'))
            .sort()
            .reverse(); // Most recent first

        const total = files.length;

        // Get paginated files
        const paginatedFiles = files.slice(offset, offset + limit);

        // Read metadata from each file
        const runs = paginatedFiles.map(filename => {
            try {
                const filepath = path.join(SAVED_RUNS_DIR, filename);
                const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

                // Return metadata only (not full states)
                return {
                    filename,
                    params: data.params,
                    timestamp: data.timestamp,
                    name: data.name,
                    savedAt: data.savedAt,
                    stateCount: data.states ? data.states.length : 0
                };
            } catch (error) {
                console.error(`Error reading ${filename}:`, error);
                return null;
            }
        }).filter(run => run !== null);

        res.json({
            success: true,
            runs,
            total,
            limit,
            offset
        });

    } catch (error) {
        console.error('Error listing runs:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/runs/:filename
 * Get a specific saved run by filename
 *
 * Response:
 * {
 *   success: boolean,
 *   run: full run data including states
 * }
 */
app.get('/api/runs/:filename', (req, res) => {
    try {
        const filename = req.params.filename;

        // Security: prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid filename'
            });
        }

        const filepath = path.join(SAVED_RUNS_DIR, filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({
                success: false,
                error: 'Run not found'
            });
        }

        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

        res.json({
            success: true,
            run: data
        });

    } catch (error) {
        console.error('Error reading run:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/runs/:filename
 * Delete a saved run
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
app.delete('/api/runs/:filename', (req, res) => {
    try {
        const filename = req.params.filename;

        // Security: prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid filename'
            });
        }

        const filepath = path.join(SAVED_RUNS_DIR, filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({
                success: false,
                error: 'Run not found'
            });
        }

        fs.unlinkSync(filepath);

        console.log(`Deleted run: ${filename}`);

        res.json({
            success: true,
            message: 'Run deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting run:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('Fibril Algorithm Visualization Server');
    console.log('='.repeat(60));
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Saved runs directory: ${SAVED_RUNS_DIR}`);
    console.log('='.repeat(60));
});
