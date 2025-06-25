const { uploadHedgeBackup, downloadHedgeBackup } = require('../s3');

let hedges = [];

// Load hedges from S3 on startup
async function initializeHedges() {
  try {
    const data = await downloadHedgeBackup('hedges.json');
    hedges = JSON.parse(data.Body.toString());
  } catch (err) {
    hedges = [];
  }
}

// Call this at server startup
initializeHedges();

function getHedges() {
  return Promise.resolve(hedges);
}

async function addHedge(hedge) {
  hedges.push(hedge);
  await uploadHedgeBackup('hedges.json', hedges);
  return hedge;
}

module.exports = {
  getHedges,
  addHedge,
  initializeHedges,
};