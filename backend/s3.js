const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION
});
const BUCKET = process.env.S3_BUCKET_NAME;

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

module.exports = {
  uploadBackup,
  listBackups,
  deleteBackup,
  downloadBackup
};
