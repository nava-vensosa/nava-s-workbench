const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Keyboard layout data
const keyboard_layout = {
  leftGrid: [
    ['q', 'w', 'e', 'r'],
    ['a', 's', 'd', 'f'],
    ['z', 'x', 'c', 'v']
  ],
  rightGrid: [
    ['i', 'o', 'p', '['],
    ['j', 'k', 'l', ';'],
    ['m', 'n', ',', '.']
  ]
};

// Serve static files from public directory
app.use(express.static('public'));

// API endpoint for key mappings
app.get('/api/mappings', (req, res) => {
  res.json(keyboard_layout);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
