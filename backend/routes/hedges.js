const express = require('express');
const router = express.Router();
const { addHedge, getHedges } = require('../data/hedges');

// API: Create a new hedge
router.post('/', (req, res) => {
  const { name, hedgemaster, description, teamMembers, date, time } = req.body;
  if (!name || !hedgemaster || !description || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const hedge = {
    name,
    hedgemaster,
    description,
    teamMembers,
    date,
    time,
    createdAt: new Date().toISOString()
  };

  addHedge(hedge)
    .then(() => res.status(201).json({ success: true, hedge }))
    .catch(err => res.status(500).json({ error: 'Failed to create hedge', details: err.message }));
});

// API: Retrieve all hedges
router.get('/', (req, res) => {
  getHedges()
    .then(hedges => res.json(hedges))
    .catch(err => res.status(500).json({ error: 'Failed to retrieve hedges', details: err.message }));
});

module.exports = router;