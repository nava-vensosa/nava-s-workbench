const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { restoreUsersFromS3IfNeeded, setIO } = require('./data/users');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const hedgeRoutes = require('./routes/hedges');
const { setupSocket } = require('./sockets');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

setIO(io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

restoreUsersFromS3IfNeeded().then(() => {
  console.log('User data loaded/restored');
});

app.use('/api', userRoutes);
app.use('/admin', adminRoutes);
app.use('/hedges', hedgeRoutes);

setupSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));