const express = require('express');
const router = express.Router();
const { addHedge, getHedges } = require('../data/hedges');

// API: Create a new hedge
router.post('/', async (req, res) => {
  const { title, date, time, hedgemasters, description, teamMembers, interestedAttendees } = req.body;
  if (!title || !date || !time || !hedgemasters || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const hedge = {
    title,
    date,
    time,
    hedgemasters,
    description,
    teamMembers: teamMembers || [],
    interestedAttendees: interestedAttendees || [],
    createdAt: new Date().toISOString(),
  };
  try {
    await addHedge(hedge);
    res.status(201).json({ success: true, hedge });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create hedge', details: err.message });
  }
});

// API: Retrieve all hedges
router.get('/', async (req, res) => {
  try {
    const hedges = await getHedges();
    res.json(hedges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve hedges', details: err.message });
  }
});

module.exports = router;