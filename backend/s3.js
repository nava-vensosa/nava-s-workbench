const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION
});
const BUCKET = process.env.S3_BUCKET_NAME;

function uploadBackup(filename, data) {
  return s3.putObject({
    Bucket: BUCKET,
    Key: filename, // e.g., 'users-20250618.json'
    Body: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  }).promise();
}

module.exports = { uploadBackup };
