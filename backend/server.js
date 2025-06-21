const express = require('express');
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const bodyParser = require('body-parser');
const stream = require('stream');
const app = express();
const PORT = process.env.PORT || 3001;

// === S3 CONFIGURATION ===
const S3_BUCKET = 'your-bucket-name'; // <-- replace with your bucket name
const S3_KEY = 'users.json';          // file in your bucket
const REGION = 'your-region';         // e.g. 'us-east-1'

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,     // set these in your Render environment
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

app.use(bodyParser.json());
app.use('/admin', express.static(__dirname + '/public'));

// Helper to read users from S3
async function readUsers() {
  try {
    const data = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: S3_KEY }));
    const chunks = [];
    for await (const chunk of data.Body) chunks.push(chunk);
    const json = Buffer.concat(chunks).toString('utf8');
    return JSON.parse(json);
  } catch (err) {
    // If file doesn't exist, return empty array
    if (err.name === 'NoSuchKey') return [];
    throw err;
  }
}

// Helper to write users to S3
async function writeUsers(users) {
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: S3_KEY,
    Body: JSON.stringify(users, null, 2),
    ContentType: 'application/json'
  }));
}

// === API ENDPOINTS ===

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// Create user
app.post('/api/users', async (req, res) => {
  const { name, id } = req.body;
  if (!name || !id) return res.status(400).json({ error: 'Missing name or id' });
  let users = await readUsers();
  if (users.find(u => u.id === id)) return res.status(409).json({ error: 'User ID exists' });
  users.push({ name, id });
  await writeUsers(users);
  res.status(201).json({ success: true });
});

// List users
app.get('/api/users', async (req, res) => {
  const users = await readUsers();
  res.json(users);
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  let users = await readUsers();
  const before = users.length;
  users = users.filter(u => u.id !== req.params.id);
  await writeUsers(users);
  res.json({ deleted: before - users.length });
});

// Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});