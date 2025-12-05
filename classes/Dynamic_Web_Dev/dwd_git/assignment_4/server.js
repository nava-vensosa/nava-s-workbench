const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const MAPPINGS = {
  grid1: [
    ['q', 'w', 'e', 'r'],
    ['a', 's', 'd', 'f'],
    ['z', 'x', 'c', 'v']
  ],
  grid2: [
    ['i', 'o', 'p', '['],
    ['j', 'k', 'l', ';'],
    ['n', 'm', ',', '.']
  ]
};

// Serve static files from public directory
app.use(express.static('public'));

// Route: homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.ejs'));
});

// Route: keyboard interface
app.get('/keyboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'keyboard.ejs'));
});

// API endpoint for key mappings
app.get('/api/mappings', (req, res) => {
  res.json(MAPPINGS);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
