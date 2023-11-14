function copyToClipboard() {
  return require("clipboardy").writeSync;
}

module.exports = copyToClipboard;
