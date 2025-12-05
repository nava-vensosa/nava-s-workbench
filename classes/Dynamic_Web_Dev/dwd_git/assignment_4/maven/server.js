// use express to serve files on machine port 8080
let express = require('express');
let path = require('path');

let app = express();
let PORT = 8080;

// create dictionary for generating keyboard layout to be displayed
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

// set up EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// connect express app to serve from public / css directories
app.use(express.static('public'));
app.use('/css', express.static('css'));

// set up routes

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/keyboard', (req, res) => {
  res.render('keyboard');
});

// API endpoint for key mappings
app.get('/api/mappings', (req, res) => {
  res.json(keyboard_layout);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  });
