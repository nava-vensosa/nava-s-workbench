const express = require('express');
const router = express.Router();
const { getHedges, addHedge } = require('../data/hedges');

// ADMIN PANEL: Direct Access Channel for Hedges
router.get('/hedges', (req, res) => {
  const hedges = getHedges();
  res.send(`
    <html>
      <head>
        <title>Admin Panel - Hedges</title>
        <style>
          body { background: #18181b; color: #fff; font-family: monospace; padding: 24px; }
          table { background: #232337; border-radius: 8px; padding: 12px; }
          th, td { padding: 8px; }
          button { background: #ef4444; color: #fff; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Admin: Hedges</h1>
        <table>
          <tr><th>Name</th><th>Description</th><th>Date</th><th>Hedgemasters</th><th>Team Members</th><th>Delete</th></tr>
          ${hedges.map(h => `
            <tr>
              <td>${h.title}</td>
              <td>${h.description}</td>
              <td>${h.calendar[0].date} ${h.calendar[0].start}–${h.calendar[0].end}</td>
              <td>${h.hedgemasters.join(', ')}</td>
              <td>${h.team_members.join(', ')}</td>
              <td>
                <form method="POST" action="/admin/delete-hedge" style="display:inline;">
                  <input type="hidden" name="hedgeId" value="${h.id}" />
                  <button type="submit">Delete</button>
                </form>
              </td>
            </tr>
          `).join('')}
        </table>
        <br>
        <h2>Add New Hedge</h2>
        <form method="POST" action="/admin/add-hedge">
          <input type="text" name="title" placeholder="Hedge Name" required />
          <textarea name="description" placeholder="Brief Description" required></textarea>
          <input type="text" name="hedgemasters" placeholder="Hedgemaster(s) (comma-separated)" required />
          <input type="text" name="team_members" placeholder="Team Members (comma-separated)" required />
          <input type="date" name="date" required />
          <input type="time" name="start" required />
          <input type="time" name="end" required />
          <button type="submit">Add Hedge</button>
        </form>
        <br>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

// POST route to add a hedge
router.post('/add-hedge', (req, res) => {
  const { title, description, hedgemasters, team_members, date, start, end } = req.body;
  const hedge = {
    title,
    description,
    hedgemasters: hedgemasters.split(',').map(h => h.trim()),
    team_members: team_members.split(',').map(m => m.trim()),
    calendar: [{ date, start, end }]
  };
  addHedge(hedge);
  res.redirect('/admin/hedges');
});

// POST route to delete a hedge
router.post('/delete-hedge', (req, res) => {
  const { hedgeId } = req.body;
  deleteHedgeById(hedgeId);
  res.redirect('/admin/hedges');
});

module.exports = router;