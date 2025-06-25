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