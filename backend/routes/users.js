const express = require('express');
const router = express.Router();
const { getUsers, addUser } = require('../data/users');

// API: Ping
router.get('/ping', (req, res) => res.json({ status: 'ok' }));

// API: List all users
router.get('/users', (req, res) => res.json(getUsers()));

// API: Sign up
router.post('/signup', (req, res) => {
  const { username, userid } = req.body;
  if (!username || !userid) return res.status(400).json({ error: 'Missing fields' });
  if (getUsers().some(u => u.username === username && u.userid === userid)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  addUser({ username, userid });
  res.json({ success: true });
});

// API: Log in
router.post('/login', (req, res) => {
  const { username, userid } = req.body;
  if (getUsers().some(u => u.username === username && u.userid === userid)) {
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
