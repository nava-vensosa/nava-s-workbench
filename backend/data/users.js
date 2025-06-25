const fs = require('fs');
const path = require('path');
const { uploadBackup, listBackups, deleteBackup, downloadBackup } = require('../s3');

const DATA_FILE = path.join(__dirname, '../users.json');
let users = [];
let io = null;

function setIO(socketio) { io = socketio; }
function getUsers() { return users; }
function setUsers(newUsers) { users = newUsers; saveUsers(users); if (io) io.emit('users_updated'); }
function addUser(user) {
  users.push(user);
  saveUsers(users);
  if (io) io.emit('users_updated');
}
function deleteUserById(userid) {
  const initial = users.length;
  users = users.filter(u => u.userid !== userid);
  if (users.length < initial) {
    saveUsers(users);
    if (io) io.emit('users_updated');
  }
}

// Persistence & S3 logic
async function restoreUsersFromS3IfNeeded() {
  let shouldRestore = false;
  if (!fs.existsSync(DATA_FILE)) {
    shouldRestore = true;
  } else {
    try {
      const fileContents = fs.readFileSync(DATA_FILE, 'utf8');
      if (!fileContents || fileContents.trim() === "" || fileContents.trim() === "[]") {
        shouldRestore = true;
      }
    } catch (e) {
      shouldRestore = true;
    }
  }

  if (shouldRestore) {
    try {
      const data = await listBackups('users-');
      const allObjects = (data.Contents || []);
      const dailyBackups = allObjects
        .filter(obj => /^users-\d{8}\.json$/.test(obj.Key))
        .sort((a, b) => b.Key.localeCompare(a.Key)).reverse();
      let latestKey = null;
      if (dailyBackups.length > 0) {
        latestKey = dailyBackups[0].Key;
      } else {
        const monthlyBackups = allObjects
          .filter(obj => /^users-\d{4}-\d{2}\.json$/.test(obj.Key))
          .sort((a, b) => b.Key.localeCompare(a.Key)).reverse();
        if (monthlyBackups.length > 0) {
          latestKey = monthlyBackups[0].Key;
        }
      }
      if (latestKey) {
        const s3obj = await downloadBackup(latestKey);
        fs.writeFileSync(DATA_FILE, s3obj.Body.toString('utf8'), 'utf8');
        console.log(`Restored users from S3 backup: ${latestKey}`);
      } else {
        console.warn("No S3 user backups found; starting with empty user list.");
      }
    } catch (e) {
      console.error("Failed to restore users from S3:", e);
    }
  }
  try {
    if (fs.existsSync(DATA_FILE)) {
      users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    users = [];
  }
  return users;
}

function saveUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  const now = new Date();
  const dateStr = now.toISOString().slice(0,10).replace(/-/g, '');
  const monthStr = now.toISOString().slice(0,7);
  uploadBackup(`users-${dateStr}.json`, users).catch(()=>{});
  if (now.getDate() === 1) {
    uploadBackup(`users-${monthStr}.json`, users).catch(()=>{});
    listBackups('users-').then(data => {
      const allObjects = data.Contents || [];
      const monthlyBackups = allObjects
        .filter(obj => /^users-\d{4}-\d{2}\.json$/.test(obj.Key))
        .sort((a, b) => b.Key.localeCompare(a.Key));
      const oldMonthly = monthlyBackups.slice(3);
      const today = new Date();
      const dailyBackupsToDelete = allObjects
        .filter(obj => {
          const dailyMatch = obj.Key.match(/^users-(\d{8})\.json$/);
          if (!dailyMatch) return false;
          const datePart = dailyMatch[1];
          const backupDate = new Date(datePart.slice(0,4), datePart.slice(4,6)-1, datePart.slice(6,8));
          const isFirstOfMonth = backupDate.getDate() === 1;
          const ageDays = (today - backupDate) / (1000 * 60 * 60 * 24);
          return !isFirstOfMonth && ageDays >= 7;
        });
      return Promise.all([...oldMonthly, ...dailyBackupsToDelete].map(obj => deleteBackup(obj.Key)));
    }).catch(()=>{});
  } else {
    listBackups('users-').then(data => {
      const allObjects = data.Contents || [];
      const today = new Date();
      const dailyBackupsToDelete = allObjects
        .filter(obj => {
          const dailyMatch = obj.Key.match(/^users-(\d{8})\.json$/);
          if (!dailyMatch) return false;
          const datePart = dailyMatch[1];
          const backupDate = new Date(datePart.slice(0,4), datePart.slice(4,6)-1, datePart.slice(6,8));
          const isFirstOfMonth = backupDate.getDate() === 1;
          const ageDays = (today - backupDate) / (1000 * 60 * 60 * 24);
          return !isFirstOfMonth && ageDays >= 7;
        });
      return Promise.all(dailyBackupsToDelete.map(obj => deleteBackup(obj.Key)));
    }).catch(()=>{});
  }
}

module.exports = {
  getUsers, setUsers, addUser, deleteUserById,
  restoreUsersFromS3IfNeeded, setIO
};