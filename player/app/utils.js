const path = require('path');

function getRootPath() {
  return path.dirname(require.main.filename || process.mainModule.filename);
}

module.exports = { getRootPath };