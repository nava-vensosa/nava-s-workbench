const fs = require('fs');
const path = require('path');
const { uploadBackup, listBackups, deleteBackup, downloadBackup } = require('../s3');

const DATA_FILE = path.join(__dirname, '../hedges.json');
let hedges = [];

function getHedges() {
  return hedges;
}

function setHedges(newHedges) {
  hedges = newHedges;
  saveHedges(hedges);
}

function addHedge(hedge) {
  hedges.push(hedge);
  saveHedges(hedges);
}

function deleteHedgeById(hedgeId) {
  hedges = hedges.filter(h => h.id !== hedgeId);
  saveHedges(hedges);
}

async function restoreHedgesFromS3IfNeeded() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      hedges = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } else {
      hedges = [];
    }
  } catch (e) {
    hedges = [];
  }
}

function saveHedges(hedges) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(hedges, null, 2), 'utf8');
  uploadBackup('hedges.json', hedges).catch(() => {});
}

module.exports = {
  getHedges,
  setHedges,
  addHedge,
  deleteHedgeById,
  restoreHedgesFromS3IfNeeded
};