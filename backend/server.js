const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { getUsers } = require('./data/users');

const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const { setupSocket } = require('./sockets');
const { restoreUsersFromS3IfNeeded, setIO } = require('./data/users');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

setIO(io); // Make io available to data modules

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Restore users on server start (async)
restoreUsersFromS3IfNeeded().then(() => {
  console.log('User data loaded/restored');
});

app.use('/api', userRoutes);
app.use('/admin', adminRoutes);

// Dark themed homepage showing all server data structures (currently users)
app.get('/', (req, res) => {
  const users = getUsers();
  res.send(`
    <html>
      <head>
        <title>Nava's Workbench (Raw Data View)</title>
        <style>
          body { background: #18181b; color: #fff; font-family: monospace; padding: 24px; }
          .container { max-width: 900px; margin: 0 auto; }
          .block {
            background: #232337;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 32px;
            box-shadow: 0 2px 12px #0004;
          }
          pre {
            background: #18181b;
            color: #fff;
            border-radius: 6px;
            padding: 18px;
            font-size: 16px;
            overflow-x: auto;
          }
          h1, h2, h3 { color: #a5b4fc; }
          a { color: #a5b4fc; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Nava's Workbench: Raw Data Structures</h1>
          <div class="block">
            <h2>Users Data (what the server sees)</h2>
            <pre>${JSON.stringify(users, null, 2)}</pre>
          </div>
          <!-- Add more data sections here (projects, messages, etc.) as you implement them -->
          <a href="/admin">Go to Admin Backchannel</a>
        </div>
      </body>
    </html>
  `);
});

// Set up socket.io
setupSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
