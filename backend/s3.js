const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const BUCKET = process.env.S3_BUCKET;

// User backup functions
function uploadBackup(filename, data) {
  return s3.putObject({
    Bucket: BUCKET,
    Key: filename,
    Body: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  }).promise();
}

function listBackups(prefix) {
  return s3.listObjectsV2({
    Bucket: BUCKET,
    Prefix: prefix
  }).promise();
}

function deleteBackup(key) {
  return s3.deleteObject({
    Bucket: BUCKET,
    Key: key
  }).promise();
}

function downloadBackup(key) {
  return s3.getObject({
    Bucket: BUCKET,
    Key: key
  }).promise();
}

// Hedge backup functions
function uploadHedgeBackup(filename, data) {
  return s3.putObject({
    Bucket: BUCKET,
    Key: filename,
    Body: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  }).promise();
}

function listHedgeBackups(prefix) {
  return s3.listObjectsV2({
    Bucket: BUCKET,
    Prefix: prefix
  }).promise();
}

function deleteHedgeBackup(key) {
  return s3.deleteObject({
    Bucket: BUCKET,
    Key: key
  }).promise();
}

function downloadHedgeBackup(key) {
  return s3.getObject({
    Bucket: BUCKET,
    Key: key
  }).promise();
}

module.exports = {
  uploadBackup,
  listBackups,
  deleteBackup,
  downloadBackup,
  uploadHedgeBackup,
  listHedgeBackups,
  deleteHedgeBackup,
  downloadHedgeBackup
};