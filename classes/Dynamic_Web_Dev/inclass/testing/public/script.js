// Initialize 128 items with equal weights
const NUM_ITEMS = 128;
let weights = new Array(NUM_ITEMS).fill(1.0);

function initializeItems() {
  const container = document.getElementById('itemsContainer');
  container.innerHTML = '';

  for (let i = 0; i < NUM_ITEMS; i++) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-cell';

    itemDiv.innerHTML = `
      <label for="item-${i}">${i + 1}</label>
      <input
        type="number"
        id="item-${i}"
        value="1.0"
        min="0"
        step="0.01"
        onchange="updateStats()"
      >
    `;

    container.appendChild(itemDiv);
  }

  updateStats();
}

function updateStats() {
  // Get all weight values
  let total = 0;
  let nonZeroCount = 0;

  for (let i = 0; i < NUM_ITEMS; i++) {
    const input = document.getElementById(`item-${i}`);
    const value = parseFloat(input.value) || 0;
    weights[i] = value;
    total += value;
    if (value > 0) nonZeroCount++;
  }

  document.getElementById('totalWeight').textContent = total.toFixed(2);
  document.getElementById('nonZeroCount').textContent = nonZeroCount;
}

function resetWeights() {
  for (let i = 0; i < NUM_ITEMS; i++) {
    const input = document.getElementById(`item-${i}`);
    input.value = '1.0';
    weights[i] = 1.0;
  }
  updateStats();
}

function generateTreemap() {
  updateStats();

  // Get weights and normalize
  const total = weights.reduce((sum, w) => sum + w, 0);

  if (total === 0) {
    alert('Total weight cannot be zero. Please set at least one item with a non-zero weight.');
    return;
  }

  // Create items array with normalized percentages
  const items = [];
  for (let i = 0; i < NUM_ITEMS; i++) {
    if (weights[i] > 0) {
      const normalizedPercentage = (weights[i] / total) * 100;
      items.push({
        name: `Item ${i + 1}`,
        percentage: normalizedPercentage
      });
    }
  }

  // Update status
  const statusDiv = document.getElementById('treemapStatus');
  statusDiv.textContent = 'Generating treemap...';
  statusDiv.className = 'status-message loading';

  // Send to server
  fetch('/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: items })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Display treemap image
      const container = document.getElementById('treemapContainer');
      container.innerHTML = `<img src="${data.imageUrl}" alt="Treemap Visualization" style="max-width: 100%; height: auto;">`;

      statusDiv.textContent = 'Treemap generated successfully!';
      statusDiv.className = 'status-message success';
    } else {
      statusDiv.textContent = 'Error: ' + data.error;
      statusDiv.className = 'status-message error';
    }
  })
  .catch(error => {
    console.error('Error:', error);
    statusDiv.textContent = 'Error generating treemap: ' + error.message;
    statusDiv.className = 'status-message error';
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeItems();
});
