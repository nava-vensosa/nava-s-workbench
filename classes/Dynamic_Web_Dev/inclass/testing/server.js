const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/generate', (req, res) => {
  let items = req.body.items; // Array of {name, percentage}

  if (!items || items.length === 0) {
    return res.status(400).send('No items provided');
  }

  // Normalize percentages to ensure they sum to 100
  const total = items.reduce((sum, item) => sum + item.percentage, 0);
  if (total > 0) {
    items = items.map(item => ({
      name: item.name,
      percentage: (item.percentage / total) * 100
    }));
  }

  // Step 1: Calculate grayscale colors with Python + numpy
  const pythonCalc = spawn('python3', ['generate_pie.py']);

  let enhancedData = '';
  let calcError = '';

  pythonCalc.stdout.on('data', (data) => {
    enhancedData += data.toString();
  });

  pythonCalc.stderr.on('data', (data) => {
    calcError += data.toString();
  });

  pythonCalc.on('close', (code) => {
    if (code !== 0) {
      console.error('Python calculation error:', calcError);
      return res.status(500).send('Error calculating colors: ' + calcError);
    }

    enhancedData = enhancedData.trim();

    // Step 2: Generate treemap with Python + matplotlib
    const outputDir = path.join(__dirname, 'public', 'generated');
    const timestamp = Date.now();
    const imageFilename = `treemap_${timestamp}.png`;
    const outputPath = path.join(outputDir, imageFilename);

    const pythonTreemap = spawn('python3', ['generate_treemap.py', outputPath]);

    let treemapOutput = '';
    let treemapError = '';

    pythonTreemap.stdout.on('data', (data) => {
      treemapOutput += data.toString();
    });

    pythonTreemap.stderr.on('data', (data) => {
      treemapError += data.toString();
    });

    pythonTreemap.on('close', (treemapCode) => {
      if (treemapCode !== 0) {
        console.error('Python treemap generation failed:', treemapError);
        // Return error as JSON
        return res.json({
          success: false,
          error: 'Treemap generation failed. Error: ' + treemapError
        });
      }

      // Success - return JSON with image URL
      res.json({
        success: true,
        imageUrl: `/generated/${imageFilename}`,
        items: items
      });
    });

    // Send enhanced data to treemap script
    pythonTreemap.stdin.write(enhancedData);
    pythonTreemap.stdin.end();
  });

  // Send data to Python script
  pythonCalc.stdin.write(JSON.stringify(items));
  pythonCalc.stdin.end();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
