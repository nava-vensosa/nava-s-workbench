const squareSize = 60;
const gap = 8;
const rows = 3;
const cols = 4;

new p5((p) => {
  let mappings = null;
  let pressedKeys = new Set();

  p.setup = async function() {
    const gridWidth = cols * squareSize + (cols - 1) * gap;
    const totalWidth = gridWidth * 2 + 40;
    const gridHeight = rows * squareSize + (rows - 1) * gap;

    const canvas = p.createCanvas(totalWidth, gridHeight);
    canvas.parent('container');

    // Fetch keyboard mappings from API
    const response = await fetch('/api/mappings');
    mappings = await response.json();
  };

  p.draw = function() {
    p.background(26);
    if (!mappings) return;

    const gridWidth = cols * squareSize + (cols - 1) * gap;
    drawGrid(mappings.leftGrid, 0);
    drawGrid(mappings.rightGrid, gridWidth + 40);
  };

  function drawGrid(grid, offset_x) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = grid[row][col];
        const x = offset_x + col * (squareSize + gap);
        const y = row * (squareSize + gap);
        const isPressed = pressedKeys.has(key.toLowerCase());

        if (isPressed) {
          p.fill(200, 60, 60);
        } else {
          p.fill(60, 60, 200);
        }

        p.noStroke();
        p.rect(x, y, squareSize, squareSize, 4);
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
