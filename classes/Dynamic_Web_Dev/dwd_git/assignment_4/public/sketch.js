const SQUARE_SIZE = 60;
const GAP = 8;
const ROWS = 3;
const COLS = 4;

new p5((p) => {
  let mappings = null;
  let pressedKeys = new Set();
  let showLabels = false;

  p.setup = async function() {
    const gridWidth = COLS * SQUARE_SIZE + (COLS - 1) * GAP;
    const totalWidth = gridWidth * 2 + 40;
    const gridHeight = ROWS * SQUARE_SIZE + (ROWS - 1) * GAP;

    const canvas = p.createCanvas(totalWidth, gridHeight);
    canvas.parent('container');

    const response = await fetch('/api/mappings');
    mappings = await response.json();

    document.getElementById('toggle-btn').addEventListener('click', () => {
      showLabels = !showLabels;
      document.getElementById('toggle-btn').textContent = showLabels ? 'Hide Labels' : 'Show Labels';
    });
  };

  p.draw = function() {
    p.background(26);
    if (!mappings) return;

    const gridWidth = COLS * SQUARE_SIZE + (COLS - 1) * GAP;
    drawGrid(mappings.grid1, 0);
    drawGrid(mappings.grid2, gridWidth + 40);
  };

  function drawGrid(grid, offsetX) {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const key = grid[row][col];
        const x = offsetX + col * (SQUARE_SIZE + GAP);
        const y = row * (SQUARE_SIZE + GAP);

        const isPressed = pressedKeys.has(key.toLowerCase());

        if (isPressed) {
          p.fill(220, 60, 60);
        } else {
          p.fill(60, 100, 180);
        }

        p.noStroke();
        p.rect(x, y, SQUARE_SIZE, SQUARE_SIZE, 4);

        if (showLabels) {
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(20);
          p.text(key.toUpperCase(), x + SQUARE_SIZE / 2, y + SQUARE_SIZE / 2);
        }
      }
    }
  }

  p.keyPressed = function() {
    if (p.key && !p.keyIsDown(p.SHIFT)) {
      pressedKeys.add(p.key.toLowerCase());
    }
    return false;
  };

  p.keyReleased = function() {
    if (p.key) {
      pressedKeys.delete(p.key.toLowerCase());
    }
    return false;
  };
});
