# Fibril Algorithm Visualization

An interactive web visualization of the Fibril algorithm - a Bayesian MIDI note selection system that uses harmonic relationships and voice leading principles to generate probability distributions for musical notes.

## Features

- **Square Chart Visualization**: Four large squares (2×2 grid) showing probability distribution at each stage
- **Proportional Area Layout**: Like a pie chart but square - each cell's area equals its exact probability percentage
- **Real-time Evolution**: Watch the probability distribution evolve through 3 iterations of Bayesian updates
- **Interactive Controls**: Adjust number of voices, random seed, and root note (key)
- **Client-side & Server-side Execution**: Toggle between running the algorithm in the browser or on the server
- **Save & Load**: Store algorithm runs with parameters and results
- **Visual Feedback**: MIDI numbers displayed in cells, darker blue = higher probability, green = allocated voices
- **Smart Display**: Out-of-key notes (probability = 0) are not shown; only active notes fill the space

## Algorithm Overview

The Fibril algorithm uses Bayes's theorem to iteratively refine note probabilities based on:
1. **Key filtering** - Only notes in the specified major key are considered
2. **Perfect fourths** - Boost probability for notes a fourth (5 semitones) apart
3. **Perfect fifths** - Boost probability for notes a fifth (7 semitones) apart
4. **Voice leading** - Favor stepwise motion (1-2 semitones) for smooth transitions

See [ALGORITHM_README.md](../ALGORITHM_README.md) and [MATRIX_ARITHMETIC_IMPLEMENTATION.md](../MATRIX_ARITHMETIC_IMPLEMENTATION.md) for detailed algorithm documentation.

For detailed explanation of the treemap visualization, see [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md).

## Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Open in browser**:
   ```
   http://localhost:3000
   ```

### Development Mode (with auto-restart)

```bash
npm run dev
```

## Project Structure

```
p5-fibril-viz/
├── server.js                   # Express server with API routes
├── fibril-algorithm.js         # Core algorithm implementation
├── script.js                   # p5.js visualization with treemap layout
├── index.html                  # Main HTML page
├── styles.css                  # Styling
├── package.json                # Node.js dependencies
├── .env                        # Environment configuration
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── VISUALIZATION_GUIDE.md      # Detailed treemap visualization explanation
├── DEPLOYMENT.md               # Digital Ocean deployment guide
├── start.sh                    # Quick start script (Mac/Linux)
├── start.bat                   # Quick start script (Windows)
└── saved-runs/                 # Directory for saved algorithm runs (created automatically)
```

## API Endpoints

### GET `/`
Serves the main visualization page

### POST `/api/run-algorithm`
Execute the Fibril algorithm server-side

**Request body**:
```json
{
  "numVoices": 4,
  "seed": 12345,
  "rootNote": 60
}
```

**Response**:
```json
{
  "success": true,
  "states": [...],
  "params": {...},
  "timestamp": "2024-01-01T00:00:00.000Z",
  "executionTime": 42
}
```

### POST `/api/save-run`
Save an algorithm run to disk

**Request body**:
```json
{
  "states": [...],
  "params": {...},
  "timestamp": "2024-01-01T00:00:00.000Z",
  "name": "optional-name"
}
```

### GET `/api/runs`
List all saved runs

**Query parameters**:
- `limit` (default: 50) - Number of runs to return
- `offset` (default: 0) - Pagination offset

### GET `/api/runs/:filename`
Retrieve a specific saved run

### DELETE `/api/runs/:filename`
Delete a saved run

### GET `/api/health`
Health check endpoint

## Usage

1. **Set parameters**:
   - **Number of Voices**: How many notes to allocate (1-12)
   - **Random Seed**: Seed for reproducible randomness
   - **Root Note**: MIDI number for the key center (e.g., 60 = C)

2. **Choose execution mode**:
   - Unchecked: Run algorithm in browser (client-side)
   - Checked: Run algorithm on server (server-side)

3. **Click "Run Algorithm"** to execute and visualize

4. **Optional**: Enable "Auto-save runs" to automatically save each execution

5. **Visualization**:
   - Four large squares displayed in 2×2 grid
   - Each square represents one stage (Initial, Iteration 1, 2, 3)
   - Treemap layout: cells fill the entire square proportionally (like a pie chart)
   - Only in-key notes shown (out-of-key notes filtered out)
   - Cell area proportional to probability
   - MIDI numbers displayed in larger cells
   - Blue gradient for in-key notes, green for allocated voices

## Configuration

Environment variables (`.env` file):

```bash
PORT=3000                    # Server port
NODE_ENV=development         # Environment (development/production)
```

## Deployment

For production deployment to Digital Ocean, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deployment summary:
1. Create Ubuntu droplet
2. Install Node.js and PM2
3. Clone/upload code
4. Install dependencies
5. Start with PM2
6. Configure Nginx reverse proxy
7. (Optional) Set up SSL with Let's Encrypt

## Dependencies

- **express** - Web server framework
- **body-parser** - Parse JSON request bodies
- **cors** - Enable CORS
- **dotenv** - Environment variable management
- **p5.js** - Visualization library (loaded from CDN)

## Development

### Adding New Features

1. **Algorithm changes**: Edit `fibril-algorithm.js`
2. **API endpoints**: Add routes in `server.js`
3. **Visualization**: Modify `script.js` and p5.js draw functions
4. **UI**: Update `index.html` and `styles.css`

### Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test algorithm endpoint
curl -X POST http://localhost:3000/api/run-algorithm \
  -H "Content-Type: application/json" \
  -d '{"numVoices":4,"seed":12345,"rootNote":60}'
```

## Performance

- **Client-side**: ~10-50ms per execution (varies by browser)
- **Server-side**: ~20-100ms per execution (varies by server specs)
- Algorithm complexity: O(128² × 3) per execution

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use: `lsof -i :3000`
- Verify Node.js is installed: `node --version`
- Check logs for errors

### Algorithm not running
- Open browser console (F12) for error messages
- Verify server is running if using server-side mode
- Check network tab for failed API requests

### Visualization not updating
- Check browser console for JavaScript errors
- Verify p5.js loaded correctly
- Try refreshing the page

## License

MIT

## Credits

Algorithm design: Fibril Bayesian MIDI Note Selection System
Implementation: p5.js visualization with Express.js backend
